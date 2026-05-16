import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { BODY_LIMITS, parseJsonBodyWithLimit } from '@/lib/body-limit';
import {
  listMarketplaceTemplates,
  MARKETPLACE_CATEGORIES,
  publishTemplate,
  type MarketplaceCategory,
} from '@/lib/marketplace';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

/**
 * GET /api/v1/marketplace
 *
 * Browse published marketplace templates. No authentication required for browsing.
 *
 * Query params:
 * - category: filter by category (invoice, contract, report, etc.)
 * - search: text search in name, description, tags
 * - sort: "newest" (default) or "popular"
 * - page: page number (default 1)
 * - pageSize: items per page (default 20, max 100)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') as MarketplaceCategory | null;
  const search = url.searchParams.get('search') ?? undefined;
  const sortBy = url.searchParams.get('sort') === 'popular' ? 'popular' : 'newest';
  const rawPage = parseInt(url.searchParams.get('page') ?? '1', 10);
  const rawPageSize = parseInt(url.searchParams.get('pageSize') ?? '20', 10);
  const page = Number.isFinite(rawPage) ? Math.max(rawPage, 1) : 1;
  const pageSize = Number.isFinite(rawPageSize) ? Math.min(Math.max(rawPageSize, 1), 100) : 20;

  if (category && !MARKETPLACE_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `Invalid category. Valid: ${MARKETPLACE_CATEGORIES.join(', ')}` },
      { status: 400 }
    );
  }

  const result = await listMarketplaceTemplates({
    category: category ?? undefined,
    search,
    page,
    pageSize,
    sortBy,
  });

  return NextResponse.json(result);
}

/**
 * POST /api/v1/marketplace
 *
 * Publish a template to the marketplace. Requires OWNER or ADMIN role.
 *
 * Body: { templateId, category, tags: string[] }
 */
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

  const parsed = await parseJsonBodyWithLimit<{
    templateId?: string;
    category?: string;
    tags?: string[];
  }>(request, BODY_LIMITS.DEFAULT_JSON);

  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 413 });
  }

  const body = parsed.data;
  const templateId = body?.templateId?.trim();
  const category = body?.category?.trim() as MarketplaceCategory | undefined;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : [];

  if (!templateId) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
  }

  if (!category || !MARKETPLACE_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: `category is required. Valid: ${MARKETPLACE_CATEGORIES.join(', ')}` },
      { status: 400 }
    );
  }

  const result = await publishTemplate({ templateId, teamId, category, tags });

  if (!result) {
    return NextResponse.json({ error: 'Template not found in your team' }, { status: 404 });
  }

  return NextResponse.json(result, { status: 200 });
}
