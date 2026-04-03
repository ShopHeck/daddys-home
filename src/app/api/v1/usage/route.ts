import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { getUsageSummary } from '@/lib/usage';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

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

  const summary = await getUsageSummary(teamId);

  return NextResponse.json({
    ...summary,
    periodStart: summary.periodStart.toISOString(),
    periodEnd: summary.periodEnd.toISOString()
  });
}
