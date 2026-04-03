import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { dispatchWebhooks } from '@/lib/webhooks';
import { prisma } from '@/lib/prisma';
import { extractVariables, mergeSchemas, type VariableSchema } from '@/lib/template-variables';
import { createInitialVersion } from '@/lib/template-versions';

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

  const templates = await prisma.template.findMany({
    where: { teamId },
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
    variableSchema?: VariableSchema | null;
  } | null;

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  if (!body?.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'Name and content are required.' }, { status: 400 });
  }

  const schema = mergeSchemas(extractVariables(body.content), body.variableSchema ?? null);

  const template = await prisma.$transaction(async (tx) => {
    const createdTemplate = await tx.template.create({
      data: {
        userId: session.user.id,
        teamId,
        name: body.name!.trim(),
        description: body.description?.trim() || null,
        content: body.content!,
        variableSchema: schema as any
      },
      select: {
        id: true,
        name: true,
        description: true,
        variableSchema: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true
      }
    });

    await createInitialVersion(
      {
        templateId: createdTemplate.id,
        name: body.name!.trim(),
        description: body.description?.trim() || null,
        content: body.content!,
        variableSchema: schema
      },
      tx
    );

    return createdTemplate;
  });

  void dispatchWebhooks({
    userId: session.user.id,
    event: 'template.created',
    data: { templateId: template.id, name: template.name }
  });

  return NextResponse.json(template, { status: 201 });
}
