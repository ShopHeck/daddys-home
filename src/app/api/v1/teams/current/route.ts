import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET: Get current active team for API-authenticated user
export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user with active team
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeTeamId: true }
  });

  if (!user?.activeTeamId) {
    return NextResponse.json({ error: 'No active team' }, { status: 404 });
  }

  // Verify membership and get team details
  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: user.activeTeamId, userId } },
    include: {
      team: {
        include: {
          _count: { select: { members: true } }
        }
      }
    }
  });

  if (!membership) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: membership.team.id,
    name: membership.team.name,
    personal: membership.team.personal,
    createdAt: membership.team.createdAt.toISOString(),
    updatedAt: membership.team.updatedAt.toISOString(),
    memberCount: membership.team._count.members,
    myRole: membership.role
  });
}
