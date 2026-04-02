import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    token?: string;
    password?: string;
  } | null;

  const token = body?.token ?? '';
  const password = body?.password ?? '';

  // Validate password
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 }
    );
  }

  // Hash the token with SHA-256
  const hashedToken = createHash('sha256').update(token).digest('hex');

  // Look up password reset token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: { select: { id: true } } }
  });

  // Validate token exists, hasn't been used, and hasn't expired
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Invalid or expired reset link.' },
      { status: 400 }
    );
  }

  // Hash new password with bcrypt (cost 12)
  const { hash } = await import('bcryptjs');
  const passwordHash = await hash(password, 12);

  // Update user's password
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: passwordHash }
  });

  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() }
  });

  return NextResponse.json({ success: true });
}
