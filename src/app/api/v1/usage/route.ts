import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/api-key';
import { getUsageSummary } from '@/lib/usage';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await getUsageSummary(userId);

  return NextResponse.json({
    ...summary,
    periodStart: summary.periodStart.toISOString(),
    periodEnd: summary.periodEnd.toISOString()
  });
}
