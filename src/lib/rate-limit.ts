import type { Tier } from '@/types';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const CLEANUP_INTERVAL_MS = 60_000;
const WINDOW_MS = 10_000;

const TIER_RATE_LIMITS: Record<Tier, number> = {
  FREE: 100,
  PRO: 500,
  BUSINESS: 2000
};

type RateLimitGlobals = typeof globalThis & {
  __docforgeRateLimitStore?: Map<string, RateLimitEntry>;
  __docforgeRateLimitCleanupStarted?: boolean;
};

const globalState = globalThis as RateLimitGlobals;
const store = globalState.__docforgeRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalState.__docforgeRateLimitStore) {
  globalState.__docforgeRateLimitStore = store;
}

if (!globalState.__docforgeRateLimitCleanupStarted) {
  setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of store.entries()) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  globalState.__docforgeRateLimitCleanupStarted = true;
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;

    store.set(key, {
      count: 1,
      resetAt
    });

    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt: Math.ceil(resetAt / 1000)
    };
  }

  const updatedCount = entry.count + 1;
  const allowed = updatedCount <= limit;

  store.set(key, {
    count: updatedCount,
    resetAt: entry.resetAt
  });

  return {
    allowed,
    limit,
    remaining: allowed ? limit - updatedCount : 0,
    resetAt: Math.ceil(entry.resetAt / 1000)
  };
}

export function checkApiKeyRateLimit(apiKeyId: string, tier: Tier): RateLimitResult {
  const limit = TIER_RATE_LIMITS[tier];

  return checkRateLimit(`key:${apiKeyId}`, limit, WINDOW_MS);
}

export function checkIpRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`ip:${ip}`, 300, WINDOW_MS);
}
