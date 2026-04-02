import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const template = await prisma.template.update({
    where: { id: existing.id },
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      content: body.content
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      content: true
    }
  });

  return NextResponse.json(template);
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
