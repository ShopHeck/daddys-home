import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamRole } from '@/lib/teams';

export const runtime = 'nodejs';

// GET: Team details + members + pending invites
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!membership) {
    return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
  }

  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      members: {
        select: {
          id: true,
          role: true,
          userId: true,
          createdAt: true,
          user: { select: { name: true, email: true, image: true } }
        }
      },
      invites: {
        where: { acceptedAt: null },
        select: {
          id: true,
          email: true,
          role: true,
          expiresAt: true,
          createdAt: true
        }
      },
      _count: { select: { members: true } }
    }
  });

  if (!team) {
    return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
  }

  return NextResponse.json({
    id: team.id,
    name: team.name,
    personal: team.personal,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    memberCount: team._count.members,
    myRole: membership.role,
    members: team.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      joinedAt: m.createdAt.toISOString()
    })),
    invites: team.invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt.toISOString(),
      createdAt: i.createdAt.toISOString()
    }))
  });
}

// PUT: Update team name
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require OWNER or ADMIN to rename
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER', 'ADMIN']);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim() ?? '';

  if (!name || name.length < 1 || name.length > 50) {
    return NextResponse.json({ error: 'Team name must be 1-50 characters.' }, { status: 400 });
  }

  // Check if team is personal (cannot rename personal teams)
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    select: { personal: true }
  });

  if (!team) {
    return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
  }

  if (team.personal) {
    return NextResponse.json({ error: 'Cannot rename personal workspace.' }, { status: 400 });
  }

  const updated = await prisma.team.update({
    where: { id: params.id },
    data: { name }
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    personal: updated.personal,
    updatedAt: updated.updatedAt.toISOString()
  });
}

// DELETE: Delete team
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require OWNER to delete
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER']);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if team is personal (cannot delete personal teams)
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    select: { personal: true }
  });

  if (!team) {
    return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
  }

  if (team.personal) {
    return NextResponse.json({ error: 'Cannot delete personal workspace.' }, { status: 400 });
  }

  // Clear activeTeamId for all members before deleting
  await prisma.user.updateMany({
    where: { activeTeamId: params.id },
    data: { activeTeamId: null }
  });

  await prisma.team.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
