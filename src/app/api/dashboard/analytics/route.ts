import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { getTeamAnalytics } from '@/lib/analytics';
import { requireTeamAccess } from '@/lib/teams';

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

  try {
    const analytics = await getTeamAnalytics(teamId);
    return NextResponse.json(analytics);
  } catch (err) {
    console.error('Analytics fetch failed:', err);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
