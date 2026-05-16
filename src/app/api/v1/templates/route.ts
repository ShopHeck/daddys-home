import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { BODY_LIMITS, parseJsonBodyWithLimit } from '@/lib/body-limit';
import { prisma } from '@/lib/prisma';
import { extractVariables } from '@/lib/template-variables';
import { createInitialVersion } from '@/lib/template-versions';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const url = new URL(request.url);
  const rawPage = parseInt(url.searchParams.get('page') ?? '1', 10);
  const rawPageSize = parseInt(url.searchParams.get('pageSize') ?? '50', 10);
  const page = Number.isFinite(rawPage) ? Math.max(rawPage, 1) : 1;
  const pageSize = Number.isFinite(rawPageSize) ? Math.min(Math.max(rawPageSize, 1), 100) : 50;

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where: { teamId },
      select: {
        id: true,
        name: true,
        description: true,
        variableSchema: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.template.count({ where: { teamId } })
  ]);

  return NextResponse.json({
    data: templates,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const parsed = await parseJsonBodyWithLimit<{ name?: string; description?: string; content?: string; css?: string }>(
    request,
    BODY_LIMITS.TEMPLATE_CONTENT
  );

  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 413 });
  }

  const body = parsed.data;

  if (!body?.name?.trim() || !body?.content?.trim()) {
    return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
  }

  const schema = extractVariables(body.content);

  const template = await prisma.$transaction(async (tx) => {
    const createdTemplate = await tx.template.create({
      data: {
        userId,
        teamId,
        name: body.name!.trim(),
        description: body.description?.trim() || null,
        content: body.content!,
        css: body.css?.trim() || null,
        variableSchema: schema as any
      },
      select: {
        id: true,
        name: true,
        description: true,
        variableSchema: true,
        currentVersion: true,
        createdAt: true
      }
    });

    await createInitialVersion(
      {
        templateId: createdTemplate.id,
        name: body.name!.trim(),
        description: body.description?.trim() || null,
        content: body.content!,
        css: body.css?.trim() || null,
        variableSchema: schema
      },
      tx
    );

    return createdTemplate;
  });

  return NextResponse.json(template, { status: 201 });
}
