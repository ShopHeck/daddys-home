import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTemplateVersion } from '@/lib/template-versions';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const template = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
      currentVersion: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

  const existing = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const trimmedName = body.name.trim();
  const trimmedDescription = body.description?.trim() || null;
  const content = body.content;

  const { template, version } = await prisma.$transaction(async (tx) => {
    const updatedTemplate = await tx.template.update({
      where: { id: existing.id },
      data: {
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
        updatedAt: true,
        content: true
      }
    });

    const createdVersion = await createTemplateVersion({
      templateId: existing.id,
      name: trimmedName,
      description: trimmedDescription,
      content,
      tx
    });

    return {
      template: updatedTemplate,
      version: createdVersion
    };
  });

  return NextResponse.json({
    ...template,
    currentVersion: version.version
  });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  await prisma.template.delete({
    where: { id: existing.id }
  });

  return NextResponse.json({ success: true });
}
