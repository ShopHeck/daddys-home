import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamRole } from '@/lib/teams';

export const runtime = 'nodejs';

// DELETE: Cancel/revoke an invite
export async function DELETE(
  _: Request,
  { params }: { params: { id: string; inviteId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require OWNER or ADMIN to revoke invites
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER', 'ADMIN']);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify the invite belongs to this team
  const invite = await prisma.teamInvite.findFirst({
    where: { id: params.inviteId, teamId: params.id, acceptedAt: null }
  });

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found.' }, { status: 404 });
  }

  await prisma.teamInvite.delete({ where: { id: params.inviteId } });

  return NextResponse.json({ success: true });
}
