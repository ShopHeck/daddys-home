import { createHash } from 'crypto';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// POST: Accept an invite
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const rawToken = body?.token;

  if (!rawToken) {
    return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
  }

  // Hash the token
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');

  // Find the invite
  const invite = await prisma.teamInvite.findUnique({
    where: { token: hashedToken },
    select: {
      id: true,
      teamId: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true
    }
  });

  if (!invite) {
    return NextResponse.json({ error: 'Invalid or expired invite.' }, { status: 400 });
  }

  if (invite.acceptedAt) {
    return NextResponse.json({ error: 'Invite already accepted.' }, { status: 400 });
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invite has expired.' }, { status: 400 });
  }

  // Verify the invite is for the current user's email
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true }
  });

  if (user?.email !== invite.email) {
    return NextResponse.json(
      { error: 'This invite is for a different email address.' },
      { status: 403 }
    );
  }

  // Check if already a member
  const existingMember = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: invite.teamId, userId: session.user.id } }
  });

  if (existingMember) {
    return NextResponse.json({ error: 'You are already a member.' }, { status: 409 });
  }

  // Add member and mark invite as accepted
  const [member, team] = await prisma.$transaction([
    prisma.teamMember.create({
      data: {
        teamId: invite.teamId,
        userId: session.user.id,
        role: invite.role
      }
    }),
    prisma.teamInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() }
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { activeTeamId: invite.teamId }
    })
  ]).then(([, ,]) =>
    Promise.all([
      prisma.teamMember.findFirst({
        where: { teamId: invite.teamId, userId: session.user.id }
      }),
      prisma.team.findUnique({ where: { id: invite.teamId } })
    ])
  );

  return NextResponse.json({
    success: true,
    team: {
      id: team?.id,
      name: team?.name,
      personal: team?.personal
    },
    role: member?.role
  });
}
