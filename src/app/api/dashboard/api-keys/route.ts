import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { generateApiKey, hashApiKey } from '@/lib/api-key';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

export async function GET() {
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

  const keys = await prisma.apiKey.findMany({
    where: { teamId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(keys);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: 'API key name is required.' }, { status: 400 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const member = await requireTeamAccess(teamId, session.user.id, ['OWNER', 'ADMIN']);
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const generated = generateApiKey();
  const keyHash = hashApiKey(generated.key);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      teamId,
      name,
      keyHash,
      keyPrefix: generated.prefix
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true
    }
  });

  return NextResponse.json({ ...apiKey, key: generated.key }, { status: 201 });
}
