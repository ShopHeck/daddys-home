import { NextResponse } from 'next/server';

import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Simple in-memory rate limiter: max 5 registrations per IP per hour
type RateLimitEntry = {
  count: number;
  resetAt: number;
};
const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_CLEANUP_THRESHOLD = 1000;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    const ip = parts[parts.length - 1]?.trim();
    if (ip) return ip;
  }
  return 'unknown';
}

function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // Lazily evict expired entries to prevent unbounded memory growth
    if (rateLimitMap.size > RATE_LIMIT_CLEANUP_THRESHOLD) {
      for (const [key, val] of rateLimitMap) {
        if (val.resetAt <= now) {
          rateLimitMap.delete(key);
        }
      }
    }
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!checkSignupRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    password?: string;
  } | null;

  const name = body?.name?.trim() ?? '';
  const email = body?.email?.trim().toLowerCase() ?? '';
  const password = body?.password ?? '';

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true }
  });

  if (existingUser) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
  }

  const { hash } = await import('bcryptjs');
  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  // Create personal team for new user
  const team = await prisma.team.create({
    data: {
      name: `${name}'s Workspace`,
      personal: true,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER'
        }
      }
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { activeTeamId: team.id }
  });

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  sendEmail({
    to: email,
    subject: 'Welcome to DocForge!',
    html: welcomeEmail({
      name,
      dashboardUrl: `${baseUrl}/dashboard`,
      docsUrl: `${baseUrl}/docs`
    })
  }).catch((error) => {
    console.error('Welcome email failed:', error);
  });

  return NextResponse.json({ success: true, user }, { status: 201 });
}
