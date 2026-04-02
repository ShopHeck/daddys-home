import { randomBytes, createHash } from 'crypto';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { passwordResetEmail } from '@/lib/email-templates';

export const runtime = 'nodejs';

// Simple in-memory rate limiter: max 3 requests per email per 15 minutes
type RateLimitEntry = {
  count: number;
  resetAt: number;
};
const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
  } | null;

  const email = body?.email?.trim().toLowerCase() ?? '';

  if (!email) {
    return NextResponse.json({ success: true });
  }

  // Check rate limit silently (don't leak that we track this)
  if (!checkRateLimit(email)) {
    // Still return success to prevent email enumeration
    return NextResponse.json({ success: true });
  }

  // Look up user by email (case-insensitive)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, password: true }
  });

  // If user doesn't exist or has no password (OAuth-only), STILL return success
  // This prevents email enumeration attacks
  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  // Generate secure random token
  const rawToken = randomBytes(32).toString('hex');

  // Hash token with SHA-256 before storing (same pattern as API keys)
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');

  // Invalidate any previous unused tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null }
  });

  // Create password reset token with 1 hour expiry
  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    }
  });

  // Build reset URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/auth/reset-password?token=${rawToken}`;

  // Send email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your DocForge password',
      html: passwordResetEmail({ name: user.name ?? '', resetUrl })
    });
  } catch {
    // Log error but still return success to user
    console.error('Failed to send password reset email to:', user.email);
  }

  return NextResponse.json({ success: true });
}
