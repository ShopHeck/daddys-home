import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

const allowedSortFields = ['createdAt', 'durationMs', 'fileSizeBytes'] as const;

function parseDateParam(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  return new Date(value);
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const page = Math.max(parseInt(url.searchParams.get('page') ?? '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(url.searchParams.get('pageSize') ?? '20', 10), 1), 100);
  const status = url.searchParams.get('status');
  const templateId = url.searchParams.get('templateId');
  const fromValue = url.searchParams.get('from');
  const toValue = url.searchParams.get('to');
  const from = parseDateParam(url.searchParams.get('from'));
  const to = parseDateParam(url.searchParams.get('to'));
  const sortBy = url.searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

  if ((fromValue && (!from || Number.isNaN(from.getTime()))) || (toValue && (!to || Number.isNaN(to.getTime())))) {
    return NextResponse.json({ error: 'Invalid date filter.' }, { status: 400 });
  }

  const where: Prisma.UsageRecordWhereInput = { teamId };

  if (status === 'SUCCESS' || status === 'FAILED') {
    where.status = status;
  }

  if (templateId) {
    where.templateId = templateId;
  }

  if (from || to) {
    const createdAt: Prisma.DateTimeFilter = {};

    if (from) {
      createdAt.gte = from;
    }

    if (to) {
      const endOfDay = new Date(to);
      endOfDay.setUTCHours(23, 59, 59, 999);
      createdAt.lte = endOfDay;
    }

    where.createdAt = createdAt;
  }

  const safeSortBy = allowedSortFields.includes(sortBy as (typeof allowedSortFields)[number]) ? sortBy : 'createdAt';

  const [records, total] = await Promise.all([
    prisma.usageRecord.findMany({
      where,
      select: {
        id: true,
        status: true,
        durationMs: true,
        fileSizeBytes: true,
        errorMessage: true,
        createdAt: true,
        template: {
          select: { id: true, name: true }
        },
        templateVersion: {
          select: { version: true }
        },
        apiKey: {
          select: { id: true, name: true, keyPrefix: true }
        }
      },
      orderBy: [
        { [safeSortBy]: sortOrder } as Prisma.UsageRecordOrderByWithRelationInput,
        { id: 'asc' }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.usageRecord.count({ where })
  ]);

  return NextResponse.json({
    records: records.map((record) => ({
      id: record.id,
      status: record.status,
      durationMs: record.durationMs,
      fileSizeBytes: record.fileSizeBytes,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt.toISOString(),
      templateName: record.template?.name ?? null,
      templateId: record.template?.id ?? null,
      templateVersion: record.templateVersion?.version ?? null,
      apiKeyName: record.apiKey?.name ?? null,
      apiKeyPrefix: record.apiKey?.keyPrefix ?? null
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
}
