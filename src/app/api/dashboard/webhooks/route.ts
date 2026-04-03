import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createWebhookEndpoint,
  isValidWebhookUrl,
  listWebhookEndpoints,
  parseWebhookEvents
} from '@/lib/webhook-management';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const endpoints = await listWebhookEndpoints(session.user.id);

  return NextResponse.json(endpoints);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    url?: string;
    events?: unknown;
  } | null;
  const url = body?.url?.trim() ?? '';
  const events = parseWebhookEvents(body?.events);

  if (!url || !isValidWebhookUrl(url)) {
    return NextResponse.json({ error: 'A valid HTTPS URL is required.' }, { status: 400 });
  }

  if (!events) {
    return NextResponse.json({ error: 'At least one valid webhook event is required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  try {
    const endpoint = await createWebhookEndpoint({
      userId: session.user.id,
      tier: user.tier,
      url,
      events
    });

    return NextResponse.json(endpoint, { status: 201 });
  } catch (error) {
    const webhookError = error as Error & { status?: number; payload?: unknown };

    if (webhookError.status && webhookError.payload) {
      return NextResponse.json(webhookError.payload, { status: webhookError.status });
    }

    throw error;
  }
}
