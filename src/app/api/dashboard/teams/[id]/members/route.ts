import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamRole } from '@/lib/teams';

export const runtime = 'nodejs';

// GET: List members of a team
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require any membership to view members
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!membership) {
    return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId: params.id },
    select: {
      id: true,
      role: true,
      userId: true,
      createdAt: true,
      user: { select: { name: true, email: true, image: true } }
    },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
      joinedAt: m.createdAt.toISOString()
    }))
  );
}

// DELETE: Remove a member
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { userId?: string } | null;
  const targetUserId = body?.userId;

  if (!targetUserId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  }

  // Require OWNER or ADMIN to remove members
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER', 'ADMIN']);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Cannot remove self via this endpoint (use leave instead)
  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: 'Use the leave endpoint to remove yourself.' }, { status: 400 });
  }

  // Find the target member
  const targetMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: params.id, userId: targetUserId } }
  });

  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
  }

  // ADMIN cannot remove OWNER
  if (membership.role === 'ADMIN' && targetMember.role === 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if this is the last owner
  if (targetMember.role === 'OWNER') {
    const ownerCount = await prisma.teamMember.count({
      where: { teamId: params.id, role: 'OWNER' }
    });
    if (ownerCount <= 1) {
      return NextResponse.json({ error: 'Cannot remove the last owner.' }, { status: 400 });
    }
  }

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId: params.id, userId: targetUserId } }
  });

  return NextResponse.json({ success: true });
}
