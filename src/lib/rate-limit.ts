import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from '@/lib/redis';
import type { Tier } from '@/types';

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // unix seconds
};

const TIER_RATE_LIMITS: Record<Tier, number> = {
  FREE: 100,
  PRO: 500,
  BUSINESS: 2000,
};

type MemEntry = { count: number; resetAt: number };
const memStore = new Map<string, MemEntry>();
const WINDOW_MS = 10_000;
const CLEANUP_INTERVAL_MS = 60_000;

if (typeof globalThis !== 'undefined') {
  // Only run in non-edge environments where setInterval is available
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of memStore.entries()) {
        if (entry.resetAt * 1000 <= now) {
          memStore.delete(key);
        }
      }
    }, CLEANUP_INTERVAL_MS);
  }
}

function memRateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const entry = memStore.get(key);
  const resetAt = Math.ceil((now + WINDOW_MS) / 1000);

  if (!entry || entry.resetAt * 1000 <= now) {
    memStore.set(key, { count: 1, resetAt });
    return { allowed: true, limit, remaining: limit - 1, resetAt };
  }

  const count = entry.count + 1;
  memStore.set(key, { count, resetAt: entry.resetAt });
  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(limit - count, 0),
    resetAt: entry.resetAt,
  };
}

const rlCache = new Map<string, Ratelimit>();

function getRatelimiter(limit: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${limit}:10s`;
  if (!rlCache.has(key)) {
    rlCache.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, '10 s'),
        analytics: false,
        prefix: 'docforge:rl',
      }),
    );
  }
  return rlCache.get(key)!;
}

async function redisRateLimit(identifier: string, limit: number): Promise<RateLimitResult | null> {
  const rl = getRatelimiter(limit);
  if (!rl) return null;

  try {
    const { success, limit: lim, remaining, reset } = await rl.limit(identifier);
    return {
      allowed: success,
      limit: lim,
      remaining,
      resetAt: Math.ceil(reset / 1000),
    };
  } catch {
    return null;
  }
}

export async function checkRateLimit(key: string, limit: number): Promise<RateLimitResult> {
  const result = await redisRateLimit(key, limit);
  return result ?? memRateLimit(key, limit);
}

export async function checkApiKeyRateLimit(apiKeyId: string, tier: Tier): Promise<RateLimitResult> {
  return checkRateLimit(`key:${apiKeyId}`, TIER_RATE_LIMITS[tier]);
}

export async function checkIpRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit(`ip:${ip}`, 300);
}
