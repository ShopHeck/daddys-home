import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTeamMembership } from '@/lib/teams';

export const runtime = 'nodejs';

// POST: Leave a team
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await getTeamMembership(params.id, session.user.id);
  if (!membership) {
    return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
  }

  // Check if team is personal (cannot leave personal teams)
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    select: { personal: true }
  });

  if (team?.personal) {
    return NextResponse.json({ error: 'Cannot leave personal workspace.' }, { status: 400 });
  }

  // If owner, check if there are other owners
  if (membership.role === 'OWNER') {
    const ownerCount = await prisma.teamMember.count({
      where: { teamId: params.id, role: 'OWNER' }
    });
    if (ownerCount <= 1) {
      return NextResponse.json(
        { error: 'Transfer ownership before leaving as the sole owner.' },
        { status: 400 }
      );
    }
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId: params.id, userId: session.user.id } }
  });

  // Clear active team if it was this team
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeTeamId: true }
  });

  if (user?.activeTeamId === params.id) {
    // Find another team to set as active
    const otherMembership = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      select: { teamId: true },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeTeamId: otherMembership?.teamId ?? null }
    });
  }

  return NextResponse.json({ success: true });
}
