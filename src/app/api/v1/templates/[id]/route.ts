import { NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const template = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId
    }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const template = await prisma.template.findFirst({
    where: {
      id: params.id,
      userId
    },
    select: { id: true }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  await prisma.template.delete({
    where: { id: template.id }
  });

  return NextResponse.json({ success: true });
}
