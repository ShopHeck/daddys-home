import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createInitialVersion } from '@/lib/template-versions';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      description: true,
      currentVersion: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    description?: string;
    content?: string;
  } | null;

  if (!body?.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Name and content are required.' }, { status: 400 });
  }

  const trimmedName = body.name.trim();
  const trimmedDescription = body.description?.trim() || null;
  const content = body.content;

  const template = await prisma.$transaction(async (tx) => {
    const createdTemplate = await tx.template.create({
      data: {
        userId: session.user.id,
        name: trimmedName,
        description: trimmedDescription,
        content
      },
      select: {
        id: true,
        name: true,
        description: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await createInitialVersion({
      templateId: createdTemplate.id,
      name: trimmedName,
      description: trimmedDescription,
      content,
      tx
    });

    return createdTemplate;
  });

  return NextResponse.json(template, { status: 201 });
}
