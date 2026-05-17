import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { BODY_LIMITS, parseJsonBodyWithLimit } from '@/lib/body-limit';
import { forkTemplate } from '@/lib/marketplace';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

/**
 * POST /api/v1/marketplace/:templateId/fork
 *
 * Fork (copy) a published marketplace template into the authenticated team.
 * Creates a full, independent copy that the team owns.
 *
 * Optional body: { name?: string } — custom name for the forked template.
 */
export async function POST(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const parsed = await parseJsonBodyWithLimit<{ name?: string }>(
    request,
    BODY_LIMITS.DEFAULT_JSON
  );

  // Body is optional — if parsing fails, just use defaults
  const customName = 'error' in parsed ? undefined : parsed.data?.name?.trim();

  const result = await forkTemplate({
    templateId: params.templateId,
    targetTeamId: teamId,
    targetUserId: userId,
    customName: customName || undefined,
  });

  if (!result) {
    return NextResponse.json(
      { error: 'Template not found or not published' },
      { status: 404 }
    );
  }

  return NextResponse.json(result, { status: 201 });
}
