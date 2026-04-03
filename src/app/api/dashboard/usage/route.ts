import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamAccess } from '@/lib/teams';
import { getUsageSummary } from '@/lib/usage';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const member = await requireTeamAccess(teamId, session.user.id, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const summary = await getUsageSummary(teamId);
  const records = await prisma.usageRecord.findMany({
    where: {
      teamId,
      createdAt: {
        gte: summary.periodStart,
        lte: summary.periodEnd
      }
    },
    select: {
      createdAt: true,
      status: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const buckets = new Map<string, number>();
  const current = new Date(summary.periodStart);

  while (current <= summary.periodEnd) {
    const key = current.toISOString().slice(0, 10);
    buckets.set(key, 0);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  for (const record of records) {
    const key = record.createdAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return NextResponse.json({
    ...summary,
    periodStart: summary.periodStart.toISOString(),
    periodEnd: summary.periodEnd.toISOString(),
    daily: Array.from(buckets.entries()).map(([date, count]) => ({ date, count }))
  });
}
