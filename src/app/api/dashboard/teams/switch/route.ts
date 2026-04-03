import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTeamMembership } from '@/lib/teams';

export const runtime = 'nodejs';

// POST: Switch active team
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { teamId?: string } | null;
  const teamId = body?.teamId;

  if (!teamId) {
    return NextResponse.json({ error: 'teamId is required.' }, { status: 400 });
  }

  // Verify user is a member
  const membership = await getTeamMembership(teamId, session.user.id);
  if (!membership) {
    return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
  }

  // Update active team
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeTeamId: teamId }
  });

  // Return team info
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, name: true, personal: true }
  });

  return NextResponse.json({
    id: team?.id,
    name: team?.name,
    personal: team?.personal,
    role: membership.role
  });
}
