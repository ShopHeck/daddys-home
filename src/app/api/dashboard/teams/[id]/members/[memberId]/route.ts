import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamRole } from '@/lib/teams';
import type { TeamRole } from '@prisma/client';

export const runtime = 'nodejs';

// PATCH: Update member role
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require OWNER to change roles
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER']);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { role?: TeamRole } | null;
  const newRole = body?.role;

  if (!newRole || !['OWNER', 'ADMIN', 'MEMBER'].includes(newRole)) {
    return NextResponse.json({ error: 'Valid role is required.' }, { status: 400 });
  }

  // Find the target member
  const targetMember = await prisma.teamMember.findUnique({
    where: { id: params.memberId },
    select: { id: true, userId: true, role: true }
  });

  if (!targetMember || targetMember.userId === session.user.id) {
    return NextResponse.json({ error: 'Member not found.' }, { status: 404 });
  }

  // Check if this is the last owner being demoted
  if (targetMember.role === 'OWNER' && newRole !== 'OWNER') {
    const ownerCount = await prisma.teamMember.count({
      where: { teamId: params.id, role: 'OWNER' }
    });
    if (ownerCount <= 1) {
      return NextResponse.json({ error: 'Cannot demote the last owner.' }, { status: 400 });
    }
  }

  const updated = await prisma.teamMember.update({
    where: { id: params.memberId },
    data: { role: newRole },
    select: { id: true, role: true, user: { select: { name: true, email: true } } }
  });

  return NextResponse.json({
    id: updated.id,
    role: updated.role,
    name: updated.user.name,
    email: updated.user.email
  });
}
