import { prisma } from '@/lib/prisma';
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

export async function getUsageSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { periodStart, periodEnd } = getCurrentUsagePeriod();
  const used = await prisma.usageRecord.count({
    where: {
      userId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd
      }
    }
  });
  const limit = TIER_LIMITS[user.tier as Tier];

  return {
    tier: user.tier,
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    periodStart,
    periodEnd
  };
}

export async function assertUsageWithinLimit(userId: string) {
  const summary = await getUsageSummary(userId);

  if (summary.used >= summary.limit) {
    const error = new Error('Usage limit exceeded') as Error & {
      status: number;
      payload: {
        error: string;
        limit: number;
        used: number;
        tier: Tier;
      };
    };

    error.status = 402;
    error.payload = {
      error: 'Usage limit exceeded',
      limit: summary.limit,
      used: summary.used,
      tier: summary.tier as Tier
    };

    throw error;
  }

  return summary;
}

export async function recordUsage(params: {
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
