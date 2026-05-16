import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';
import { getTeamTier } from '@/lib/teams';
import type { Tier } from '@/types';

export const TIER_LIMITS: Record<Tier, number> = {
  FREE: 50,
  PRO: 5000,
  BUSINESS: 50000
};

export const TIER_BATCH_LIMITS: Record<Tier, number> = {
  FREE: 5,
  PRO: 50,
  BUSINESS: 200
};

export function getCurrentUsagePeriod(referenceDate = new Date()) {
  const periodStart = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1, 0, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return { periodStart, periodEnd };
}

/**
 * Build the Redis key for a team's monthly usage counter.
 * Key expires at the end of the billing period to auto-reset.
 */
function usageCounterKey(teamId: string, periodStart: Date): string {
  const month = `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, '0')}`;
  return `docforge:usage:${teamId}:${month}`;
}

export async function getUsageSummary(teamId: string) {
  const tier = await getTeamTier(teamId);
  const { periodStart, periodEnd } = getCurrentUsagePeriod();
  const limit = TIER_LIMITS[tier];

  // Try Redis counter first (fast path)
  const redis = getRedis();
  if (redis) {
    const key = usageCounterKey(teamId, periodStart);
    let count = await redis.get<number>(key);

    // Cold start: initialize Redis counter from DB on first miss
    if (count === null) {
      const dbCount = await prisma.usageRecord.count({
        where: {
          teamId,
          createdAt: { gte: periodStart, lte: periodEnd }
        }
      });
      const ttlSeconds = Math.ceil((periodEnd.getTime() - Date.now()) / 1000) + 86400;
      await redis.set(key, dbCount, { ex: ttlSeconds });
      count = dbCount;
    }

    const used = count;

    return {
      tier,
      limit,
      used,
      remaining: Math.max(limit - used, 0),
      periodStart,
      periodEnd
    };
  }

  // Fallback: count from database
  const used = await prisma.usageRecord.count({
    where: {
      teamId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd
      }
    }
  });

  return {
    tier,
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    periodStart,
    periodEnd
  };
}

/**
 * Atomically check usage limit and reserve a slot.
 *
 * With Redis: uses INCR which is atomic — if the incremented value exceeds
 * the limit, we decrement back and reject.
 *
 * Without Redis: uses a Prisma transaction to count and insert atomically,
 * preventing concurrent requests from exceeding the limit.
 */
export async function assertUsageWithinLimit(teamId: string) {
  const tier = await getTeamTier(teamId);
  const { periodStart, periodEnd } = getCurrentUsagePeriod();
  const limit = TIER_LIMITS[tier];

  const redis = getRedis();

  if (redis) {
    const key = usageCounterKey(teamId, periodStart);

    // Atomic increment — this is the reservation
    const newCount = await redis.incr(key);

    // If this is a fresh key (first INCR returns 1), seed from DB
    if (newCount === 1) {
      const dbCount = await prisma.usageRecord.count({
        where: {
          teamId,
          createdAt: { gte: periodStart, lte: periodEnd }
        }
      });
      if (dbCount > 0) {
        // Set to DB count (our INCR already added 1, so set to dbCount + 1)
        await redis.set(key, dbCount + 1);
      }
      const ttlSeconds = Math.ceil((periodEnd.getTime() - Date.now()) / 1000) + 86400;
      await redis.expire(key, ttlSeconds);

      const effectiveCount = dbCount + 1;
      if (effectiveCount > limit) {
        await redis.decr(key);
        const error = new Error('Usage limit exceeded') as Error & {
          status: number;
          payload: { error: string; limit: number; used: number; tier: Tier };
        };
        error.status = 402;
        error.payload = { error: 'Usage limit exceeded', limit, used: effectiveCount - 1, tier };
        throw error;
      }
      return { tier, limit, used: effectiveCount, remaining: Math.max(limit - effectiveCount, 0), periodStart, periodEnd };
    }

    if (newCount > limit) {
      // Over limit — roll back the increment
      await redis.decr(key);

      const error = new Error('Usage limit exceeded') as Error & {
        status: number;
        payload: { error: string; limit: number; used: number; tier: Tier };
      };
      error.status = 402;
      error.payload = {
        error: 'Usage limit exceeded',
        limit,
        used: newCount - 1, // the actual count before our failed attempt
        tier
      };
      throw error;
    }

    return { tier, limit, used: newCount, remaining: Math.max(limit - newCount, 0), periodStart, periodEnd };
  }

  // Fallback without Redis: use PostgreSQL advisory lock per team to serialize checks.
  const teamHash = Buffer.from(teamId).reduce((acc, byte) => acc * 31 + byte, 0) & 0x7fffffff;

  const used = await prisma.$transaction(async (tx) => {
    // Acquire an advisory lock scoped to this team's usage check
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(${teamHash})`;

    const count = await tx.usageRecord.count({
      where: {
        teamId,
        createdAt: { gte: periodStart, lte: periodEnd }
      }
    });

    return count;
  });

  if (used >= limit) {
    const error = new Error('Usage limit exceeded') as Error & {
      status: number;
      payload: { error: string; limit: number; used: number; tier: Tier };
    };
    error.status = 402;
    error.payload = { error: 'Usage limit exceeded', limit, used, tier };
    throw error;
  }

  return { tier, limit, used, remaining: Math.max(limit - used, 0), periodStart, periodEnd };
}

/**
 * Record a usage entry. If Redis is configured, the counter was already
 * incremented by assertUsageWithinLimit, so we only write to the database.
 */
export async function recordUsage(params: {
  teamId: string;
  userId: string;
  templateId?: string;
  templateVersionId?: string;
  status?: 'SUCCESS' | 'FAILED';
  durationMs?: number;
  fileSizeBytes?: number;
  errorMessage?: string;
  apiKeyId?: string;
}) {
  return prisma.usageRecord.create({
    data: {
      teamId: params.teamId,
      userId: params.userId,
      templateId: params.templateId,
      templateVersionId: params.templateVersionId,
      status: params.status ?? 'SUCCESS',
      durationMs: params.durationMs,
      fileSizeBytes: params.fileSizeBytes,
      errorMessage: params.errorMessage,
      apiKeyId: params.apiKeyId
    }
  });
}

/**
 * Decrement the Redis usage counter (e.g., when a render fails and shouldn't
 * count against the limit). No-op if Redis is not configured.
 */
export async function releaseUsageSlot(teamId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const { periodStart } = getCurrentUsagePeriod();
  const key = usageCounterKey(teamId, periodStart);
  await redis.decr(key);
}
