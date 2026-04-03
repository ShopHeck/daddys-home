import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET: List all teams the user is a member of
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: {
        select: {
          id: true,
          role: true,
          userId: true,
          user: { select: { name: true, email: true, image: true } }
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
      members: team.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image
      })),
      myRole: team.members.find((m) => m.userId === session.user.id)?.role
    }))
  );
}

// POST: Create a new team
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim() ?? '';

  if (!name || name.length < 1 || name.length > 50) {
    return NextResponse.json({ error: 'Team name must be 1-50 characters.' }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name,
      personal: false,
      members: {
        create: {
          userId: session.user.id,
          role: 'OWNER'
        }
      }
    }
  });

  // Set as active team
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeTeamId: team.id }
  });

  return NextResponse.json(
    {
      id: team.id,
      name: team.name,
      personal: team.personal,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      myRole: 'OWNER'
    },
    { status: 201 }
  );
}
