import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET: List teams for API-authenticated user
export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: {
        select: {
          id: true,
          role: true,
          userId: true
        }
      },
      _count: { select: { members: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json(
    teams.map((team) => ({
      id: team.id,
      name: team.name,
      personal: team.personal,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      memberCount: team._count.members,
      myRole: team.members.find((m) => m.userId === userId)?.role
    }))
  );
}
