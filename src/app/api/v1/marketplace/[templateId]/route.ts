import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { getMarketplaceTemplate, unpublishTemplate } from '@/lib/marketplace';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

/**
 * GET /api/v1/marketplace/:templateId
 *
 * Get a single published marketplace template with full content for preview.
 * No authentication required for public templates.
 */
export async function GET(
  _request: Request,
  { params }: { params: { templateId: string } }
) {
  const template = await getMarketplaceTemplate(params.templateId);

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  return NextResponse.json(template);
}

/**
 * DELETE /api/v1/marketplace/:templateId
 *
 * Unpublish a template from the marketplace.
 * Requires OWNER or ADMIN role in the owning team.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const result = await unpublishTemplate(params.templateId, teamId);

  if (!result) {
    return NextResponse.json({ error: 'Template not found in your team' }, { status: 404 });
  }

  return NextResponse.json({ id: result.id, published: false });
}
