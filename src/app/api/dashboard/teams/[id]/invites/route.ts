import { createHash, randomBytes } from 'crypto';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { teamInviteEmail } from '@/lib/email-templates';
import { prisma } from '@/lib/prisma';
import { requireTeamRole } from '@/lib/teams';
import type { TeamRole } from '@prisma/client';

export const runtime = 'nodejs';

// GET: List pending invites
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require OWNER or ADMIN to view invites
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER', 'ADMIN']);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invites = await prisma.teamInvite.findMany({
    where: { teamId: params.id, acceptedAt: null },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(
    invites.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      expiresAt: i.expiresAt.toISOString(),
      createdAt: i.createdAt.toISOString()
    }))
  );
}

// POST: Create an invite
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Require OWNER or ADMIN to invite
  const membership = await requireTeamRole(params.id, session.user.id, ['OWNER', 'ADMIN']);
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    role?: TeamRole;
  } | null;

  const email = body?.email?.trim().toLowerCase() ?? '';
  const role = body?.role ?? 'MEMBER';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }

  // Only OWNER can invite as OWNER or ADMIN
  if (membership.role !== 'OWNER' && (role === 'OWNER' || role === 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: params.id, userId: existingUser.id } }
    });
    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member.' }, { status: 409 });
    }
  }

  // Check for existing pending invite
  const existingInvite = await prisma.teamInvite.findFirst({
    where: { teamId: params.id, email, acceptedAt: null }
  });

  if (existingInvite) {
    return NextResponse.json({ error: 'Pending invite already exists.' }, { status: 409 });
  }

  // Generate token
  const rawToken = randomBytes(32).toString('hex');
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');

  // Create invite with 7 day expiry
  const invite = await prisma.teamInvite.create({
    data: {
      teamId: params.id,
      email,
      role,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // Send email
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    select: { name: true }
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const acceptUrl = `${baseUrl}/dashboard/teams/invite?token=${rawToken}`;

  const inviter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true }
  });

  sendEmail({
    to: email,
    subject: `You've been invited to join ${team?.name || 'a team'} on DocForge`,
    html: teamInviteEmail({
      inviterName: inviter?.name || 'Someone',
      teamName: team?.name || 'DocForge Team',
      role,
      acceptUrl
    })
  }).catch((error) => {
    console.error('Invite email failed:', error);
  });

  return NextResponse.json(
    {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString()
    },
    { status: 201 }
  );
}
