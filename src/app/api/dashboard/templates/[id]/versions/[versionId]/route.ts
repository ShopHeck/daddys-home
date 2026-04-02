import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTemplateVersion } from '@/lib/template-versions';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string; versionId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const template = await prisma.template.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const version = await prisma.templateVersion.findFirst({
    where: { id: params.versionId, templateId: params.id },
    select: {
      id: true,
      version: true,
      name: true,
      description: true,
      content: true,
      createdAt: true
    }
  });

  if (!version) {
    return NextResponse.json({ error: 'Version not found.' }, { status: 404 });
  }

  return NextResponse.json({
    ...version,
    createdAt: version.createdAt.toISOString()
  });
}

export async function POST(_: Request, { params }: { params: { id: string; versionId: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const template = await prisma.template.findFirst({
    where: { id: params.id, userId: session.user.id },
    select: { id: true }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const version = await prisma.templateVersion.findFirst({
    where: { id: params.versionId, templateId: params.id },
    select: { name: true, description: true, content: true }
  });

  if (!version) {
    return NextResponse.json({ error: 'Version not found.' }, { status: 404 });
  }

  await prisma.template.update({
    where: { id: params.id },
    data: {
      name: version.name,
      description: version.description,
      content: version.content
    }
  });

  const newVersion = await createTemplateVersion({
    templateId: params.id,
    name: version.name,
    description: version.description,
    content: version.content
  });

  return NextResponse.json({
    id: newVersion.id,
    version: newVersion.version,
    message: 'Template restored successfully.'
  });
}
