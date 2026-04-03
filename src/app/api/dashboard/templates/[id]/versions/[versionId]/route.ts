import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamAccess } from '@/lib/teams';
import type { VariableSchema } from '@/lib/template-variables';
import { createTemplateVersion } from '@/lib/template-versions';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string; versionId: string } }) {
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

  const template = await prisma.template.findFirst({
    where: { id: params.id, teamId },
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
      css: true,
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

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const member = await requireTeamAccess(teamId, session.user.id, ['OWNER', 'ADMIN']);
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const template = await prisma.template.findFirst({
    where: { id: params.id, teamId },
    select: { id: true }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const version = await prisma.templateVersion.findFirst({
    where: { id: params.versionId, templateId: params.id },
    select: { name: true, description: true, content: true, css: true, variableSchema: true }
  });

  if (!version) {
    return NextResponse.json({ error: 'Version not found.' }, { status: 404 });
  }

  const newVersion = await prisma.$transaction(async (tx) => {
    await tx.template.update({
      where: { id: params.id },
      data: {
        name: version.name,
        description: version.description,
        content: version.content,
        css: version.css,
        variableSchema: version.variableSchema as any
      }
    });

    return createTemplateVersion(
      {
        templateId: params.id,
        name: version.name,
        description: version.description,
        content: version.content,
        css: version.css,
        variableSchema: version.variableSchema as VariableSchema | null
      },
      tx
    );
  });

  return NextResponse.json({
    id: newVersion.id,
    version: newVersion.version,
    message: 'Template restored successfully.'
  });
}
