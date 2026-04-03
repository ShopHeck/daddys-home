import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import {
  deleteWebhookEndpoint,
  getWebhookEndpoint,
  isValidWebhookUrl,
  parseWebhookEvents,
  updateWebhookEndpoint
} from '@/lib/webhook-management';
import { requireTeamAccess } from '@/lib/teams';
import type { WebhookEvent } from '@/types';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const member = await requireTeamAccess(teamId, session.user.id, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const endpoint = await getWebhookEndpoint(params.id, teamId);

  if (!endpoint) {
    return NextResponse.json({ error: 'Webhook endpoint not found.' }, { status: 404 });
  }

  return NextResponse.json(endpoint);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const member = await requireTeamAccess(teamId, session.user.id, ['OWNER', 'ADMIN']);
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    url?: string;
    events?: unknown;
    active?: boolean;
  } | null;
  const data: {
    url?: string;
    events?: WebhookEvent[];
    active?: boolean;
  } = {};

  if (typeof body?.url !== 'undefined') {
    const url = body.url.trim();

    if (!url || !isValidWebhookUrl(url)) {
      return NextResponse.json({ error: 'A valid HTTPS URL is required.' }, { status: 400 });
    }

    data.url = url;
  }

  if (typeof body?.events !== 'undefined') {
    const events = parseWebhookEvents(body.events);

    if (!events) {
      return NextResponse.json({ error: 'At least one valid webhook event is required.' }, { status: 400 });
    }

    data.events = events;
  }

  if (typeof body?.active !== 'undefined') {
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'active must be a boolean.' }, { status: 400 });
    }

    data.active = body.active;
  }

  const endpoint = await updateWebhookEndpoint({
    id: params.id,
    teamId,
    data
  });

  if (!endpoint) {
    return NextResponse.json({ error: 'Webhook endpoint not found.' }, { status: 404 });
  }

  return NextResponse.json(endpoint);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const member = await requireTeamAccess(teamId, session.user.id, ['OWNER', 'ADMIN']);
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const deleted = await deleteWebhookEndpoint(params.id, teamId);

  if (!deleted) {
    return NextResponse.json({ error: 'Webhook endpoint not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
