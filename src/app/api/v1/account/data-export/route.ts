import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

/**
 * GET /api/v1/account/data-export
 *
 * GDPR Article 20 — Right to data portability.
 * Returns all user data in a structured JSON format.
 */
export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      tier: true,
      createdAt: true,
      updatedAt: true,
      teamMembers: {
        select: {
          role: true,
          team: { select: { id: true, name: true } },
        },
      },
      apiKeys: {
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          lastUsedAt: true,
          createdAt: true,
        },
      },
      templates: {
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
          css: true,
          currentVersion: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      usageRecords: {
        select: {
          id: true,
          status: true,
          durationMs: true,
          fileSizeBytes: true,
          templateId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1000, // Last 1000 records
      },
      webhookEndpoints: {
        select: {
          id: true,
          url: true,
          events: true,
          active: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    format: 'DocForge GDPR Export v1',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      tier: user.tier,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    teams: user.teamMembers.map((m) => ({
      id: m.team.id,
      name: m.team.name,
      role: m.role,
    })),
    apiKeys: user.apiKeys,
    templates: user.templates,
    usageRecords: user.usageRecords,
    webhookEndpoints: user.webhookEndpoints,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="docforge-export-${user.id}.json"`,
    },
  });
}
