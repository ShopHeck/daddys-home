import { prisma } from '@/lib/prisma';
import { getCurrentUsagePeriod, TIER_LIMITS } from '@/lib/usage';
import { getTeamTier } from '@/lib/teams';
import type { Tier } from '@/types';

/**
 * Analytics module for DocForge.
 *
 * Provides render latency percentiles, error rates, template popularity,
 * daily usage breakdown, and usage projections.
 */

export type AnalyticsSummary = {
  period: { start: string; end: string };
  tier: Tier;
  usage: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  };
  renders: {
    total: number;
    succeeded: number;
    failed: number;
    errorRate: number;
  };
  latency: {
    p50: number | null;
    p75: number | null;
    p95: number | null;
    p99: number | null;
    avg: number | null;
  };
  dailyBreakdown: DailyUsage[];
  topTemplates: TemplateUsage[];
  projection: UsageProjection;
};

export type DailyUsage = {
  date: string;
  renders: number;
  errors: number;
};

export type TemplateUsage = {
  templateId: string;
  templateName: string;
  renders: number;
  avgDurationMs: number;
  errorRate: number;
};

export type UsageProjection = {
  estimatedEndOfMonth: number;
  projectedOverage: boolean;
  daysRemaining: number;
  dailyAverage: number;
};

/**
 * Compute latency percentiles from an array of durations.
 */
function computePercentiles(durations: number[]): AnalyticsSummary['latency'] {
  if (durations.length === 0) {
    return { p50: null, p75: null, p95: null, p99: null, avg: null };
  }

  const sorted = [...durations].sort((a, b) => a - b);
  const len = sorted.length;

  const percentile = (p: number) => {
    const idx = Math.ceil((p / 100) * len) - 1;
    return sorted[Math.max(0, Math.min(idx, len - 1))];
  };

  const avg = Math.round(sorted.reduce((sum, d) => sum + d, 0) / len);

  return {
    p50: percentile(50),
    p75: percentile(75),
    p95: percentile(95),
    p99: percentile(99),
    avg,
  };
}

/**
 * Get comprehensive analytics for a team's current billing period.
 */
export async function getTeamAnalytics(teamId: string): Promise<AnalyticsSummary> {
  const tier = await getTeamTier(teamId);
  const { periodStart, periodEnd } = getCurrentUsagePeriod();
  const limit = TIER_LIMITS[tier];

  // Fetch all usage records for the period
  const records = await prisma.usageRecord.findMany({
    where: {
      teamId,
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    select: {
      status: true,
      durationMs: true,
      createdAt: true,
      templateId: true,
      template: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const total = records.length;
  const succeeded = records.filter((r) => r.status === 'SUCCESS').length;
  const failed = total - succeeded;
  const errorRate = total > 0 ? Math.round((failed / total) * 10000) / 100 : 0;

  // Latency percentiles (only successful renders with duration data)
  const durations = records
    .filter((r) => r.status === 'SUCCESS' && r.durationMs != null)
    .map((r) => r.durationMs as number);
  const latency = computePercentiles(durations);

  // Daily breakdown
  const dailyMap = new Map<string, { renders: number; errors: number }>();
  for (const record of records) {
    const date = record.createdAt.toISOString().split('T')[0];
    const entry = dailyMap.get(date) ?? { renders: 0, errors: 0 };
    entry.renders++;
    if (record.status === 'FAILED') entry.errors++;
    dailyMap.set(date, entry);
  }

  const dailyBreakdown: DailyUsage[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  // Top templates
  const templateMap = new Map<string, { name: string; renders: number; totalDuration: number; errors: number }>();
  for (const record of records) {
    if (!record.templateId) continue;
    const entry = templateMap.get(record.templateId) ?? {
      name: record.template?.name ?? 'Unknown',
      renders: 0,
      totalDuration: 0,
      errors: 0,
    };
    entry.renders++;
    if (record.durationMs) entry.totalDuration += record.durationMs;
    if (record.status === 'FAILED') entry.errors++;
    templateMap.set(record.templateId, entry);
  }

  const topTemplates: TemplateUsage[] = Array.from(templateMap.entries())
    .map(([templateId, data]) => ({
      templateId,
      templateName: data.name,
      renders: data.renders,
      avgDurationMs: data.renders > 0 ? Math.round(data.totalDuration / data.renders) : 0,
      errorRate: data.renders > 0 ? Math.round((data.errors / data.renders) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.renders - a.renders)
    .slice(0, 10);

  // Usage projection
  const now = new Date();
  const daysElapsed = Math.max(1, Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)));
  const daysInMonth = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, daysInMonth - daysElapsed);
  const dailyAverage = Math.round(total / daysElapsed);
  const estimatedEndOfMonth = total + dailyAverage * daysRemaining;

  const projection: UsageProjection = {
    estimatedEndOfMonth,
    projectedOverage: estimatedEndOfMonth > limit,
    daysRemaining,
    dailyAverage,
  };

  return {
    period: { start: periodStart.toISOString(), end: periodEnd.toISOString() },
    tier,
    usage: {
      used: total,
      limit,
      remaining: Math.max(limit - total, 0),
      percentUsed: total > 0 ? Math.round((total / limit) * 10000) / 100 : 0,
    },
    renders: { total, succeeded, failed, errorRate },
    latency,
    dailyBreakdown,
    topTemplates,
    projection,
  };
}

/**
 * Get analytics for a specific time range (custom period).
 */
export async function getTeamAnalyticsForRange(
  teamId: string,
  startDate: Date,
  endDate: Date
): Promise<Omit<AnalyticsSummary, 'usage' | 'projection'>> {
  const tier = await getTeamTier(teamId);

  const records = await prisma.usageRecord.findMany({
    where: {
      teamId,
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      status: true,
      durationMs: true,
      createdAt: true,
      templateId: true,
      template: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const total = records.length;
  const succeeded = records.filter((r) => r.status === 'SUCCESS').length;
  const failed = total - succeeded;
  const errorRate = total > 0 ? Math.round((failed / total) * 10000) / 100 : 0;

  const durations = records
    .filter((r) => r.status === 'SUCCESS' && r.durationMs != null)
    .map((r) => r.durationMs as number);
  const latency = computePercentiles(durations);

  const dailyMap = new Map<string, { renders: number; errors: number }>();
  for (const record of records) {
    const date = record.createdAt.toISOString().split('T')[0];
    const entry = dailyMap.get(date) ?? { renders: 0, errors: 0 };
    entry.renders++;
    if (record.status === 'FAILED') entry.errors++;
    dailyMap.set(date, entry);
  }

  const dailyBreakdown: DailyUsage[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  const templateMap = new Map<string, { name: string; renders: number; totalDuration: number; errors: number }>();
  for (const record of records) {
    if (!record.templateId) continue;
    const entry = templateMap.get(record.templateId) ?? {
      name: record.template?.name ?? 'Unknown',
      renders: 0,
      totalDuration: 0,
      errors: 0,
    };
    entry.renders++;
    if (record.durationMs) entry.totalDuration += record.durationMs;
    if (record.status === 'FAILED') entry.errors++;
    templateMap.set(record.templateId, entry);
  }

  const topTemplates: TemplateUsage[] = Array.from(templateMap.entries())
    .map(([templateId, data]) => ({
      templateId,
      templateName: data.name,
      renders: data.renders,
      avgDurationMs: data.renders > 0 ? Math.round(data.totalDuration / data.renders) : 0,
      errorRate: data.renders > 0 ? Math.round((data.errors / data.renders) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.renders - a.renders)
    .slice(0, 10);

  return {
    period: { start: startDate.toISOString(), end: endDate.toISOString() },
    tier,
    renders: { total, succeeded, failed, errorRate },
    latency,
    dailyBreakdown,
    topTemplates,
  };
}
