import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { getTeamAnalytics, getTeamAnalyticsForRange } from '@/lib/analytics';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

/**
 * GET /api/v1/analytics
 *
 * Returns comprehensive analytics for the team's current billing period.
 *
 * Optional query params:
 * - start: ISO date string for custom range start
 * - end: ISO date string for custom range end
 *
 * Response includes:
 * - usage: current usage vs. plan limit with percentage
 * - renders: total/success/failed counts and error rate
 * - latency: p50, p75, p95, p99 percentiles and average (ms)
 * - dailyBreakdown: array of { date, renders, errors }
 * - topTemplates: top 10 templates by usage with avg latency
 * - projection: estimated end-of-month usage and overage warning
 */
export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const url = new URL(request.url);
  const startParam = url.searchParams.get('start');
  const endParam = url.searchParams.get('end');

  // If custom date range is specified, use it
  if (startParam && endParam) {
    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 (e.g., 2026-01-01T00:00:00Z).' },
        { status: 400 }
      );
    }

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'start must be before end.' },
        { status: 400 }
      );
    }

    // Limit range to 90 days
    const maxRange = 90 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > maxRange) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 90 days.' },
        { status: 400 }
      );
    }

    const analytics = await getTeamAnalyticsForRange(teamId, startDate, endDate);
    return NextResponse.json(analytics);
  }

  // Default: current billing period
  const analytics = await getTeamAnalytics(teamId);
  return NextResponse.json(analytics);
}
