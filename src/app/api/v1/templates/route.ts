import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { name?: string; description?: string; content?: string } | null;

  if (!body?.name?.trim() || !body?.content?.trim()) {
    return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
  }

  const template = await prisma.template.create({
    data: {
      userId,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      content: body.content
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true
    }
  });

  return NextResponse.json(template, { status: 201 });
}
