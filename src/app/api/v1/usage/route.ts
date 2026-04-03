import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId } from '@/lib/api-key';
import { getUsageSummary } from '@/lib/usage';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const teamId = getAuthenticatedTeamId(request);

  if (!teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await getUsageSummary(teamId);

  return NextResponse.json({
    ...summary,
    periodStart: summary.periodStart.toISOString(),
    periodEnd: summary.periodEnd.toISOString()
  });
}
