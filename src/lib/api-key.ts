import { createHash, randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';
import type { Tier } from '@/types';

export type ValidatedApiKey = {
  apiKeyId: string;
  userId: string;
  teamId: string;
  tier: Tier;
};

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = randomBytes(32).toString('hex');
  const key = `df_live_${raw}`;
  const hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 16);

  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Debounce interval for lastUsedAt updates (in seconds).
 * We only write to the DB at most once per this interval per API key.
 */
const LAST_USED_DEBOUNCE_SECONDS = 60;

/**
 * Redis key for tracking when we last persisted lastUsedAt for a given API key.
 */
function lastUsedRedisKey(apiKeyId: string): string {
  return `docforge:key-last-used:${apiKeyId}`;
}

// In-memory fallback for debouncing without Redis
const lastUsedMemory = new Map<string, number>();

/**
 * Update lastUsedAt in a debounced manner to reduce DB write load.
 * With Redis: uses SET NX with TTL to ensure at most one write per interval.
 * Without Redis: uses in-memory timestamp tracking.
 */
async function updateLastUsedDebounced(apiKeyId: string): Promise<void> {
  const redis = getRedis();

  if (redis) {
    // SET NX: only sets if the key doesn't exist (i.e., hasn't been set recently)
    const wasSet = await redis.set(lastUsedRedisKey(apiKeyId), '1', {
      nx: true,
      ex: LAST_USED_DEBOUNCE_SECONDS,
    });

    // If the key already existed (wasSet is null/false), skip the DB write
    if (!wasSet) return;
  } else {
    // In-memory debounce fallback
    const now = Date.now();
    const lastWritten = lastUsedMemory.get(apiKeyId) ?? 0;

    if (now - lastWritten < LAST_USED_DEBOUNCE_SECONDS * 1000) {
      return;
    }

    lastUsedMemory.set(apiKeyId, now);

    // Prevent memory leaks: cap the map size
    if (lastUsedMemory.size > 10000) {
      const oldestKey = lastUsedMemory.keys().next().value;
      if (oldestKey) lastUsedMemory.delete(oldestKey);
    }
  }

  // Perform the actual DB write (non-blocking, fire-and-forget)
  void prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { lastUsedAt: new Date() },
  }).catch(() => {
    // Silently ignore — lastUsedAt is informational, not critical
  });
}

export async function validateApiKey(key: string): Promise<ValidatedApiKey | null> {
  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      userId: true,
      teamId: true,
      user: {
        select: {
          tier: true
        }
      }
    }
  });

  if (!apiKey) {
    return null;
  }

  // Debounced lastUsedAt update (non-blocking)
  void updateLastUsedDebounced(apiKey.id);

  return {
    apiKeyId: apiKey.id,
    userId: apiKey.userId,
    teamId: apiKey.teamId,
    tier: apiKey.user.tier
  };
}

export function getAuthenticatedUserId(request: Request | NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export function getAuthenticatedApiKeyId(request: Request | NextRequest): string | null {
  return request.headers.get('x-api-key-id');
}

export function getAuthenticatedTeamId(request: Request | NextRequest): string | null {
  return request.headers.get('x-team-id');
}
