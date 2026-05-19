import { prisma } from '@/lib/prisma';
import { createInitialVersion } from '@/lib/template-versions';
import { extractVariables } from '@/lib/template-variables';
import { dispatchWebhooks } from '@/lib/webhooks';

export const MARKETPLACE_CATEGORIES = [
  'invoice',
  'contract',
  'report',
  'certificate',
  'letter',
  'proposal',
  'receipt',
  'statement',
  'other',
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

const marketplaceSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  tags: true,
  thumbnailUrl: true,
  forkCount: true,
  variableSchema: true,
  currentVersion: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { name: true } },
  team: { select: { name: true } },
  forkedFromId: true,
} as const;

export type MarketplaceListing = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[];
  thumbnailUrl: string | null;
  forkCount: number;
  variableSchema: unknown;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  author: string | null;
  forkedFromId: string | null;
};

function toMarketplaceListing(raw: {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[];
  thumbnailUrl: string | null;
  forkCount: number;
  variableSchema: unknown;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  user: { name: string | null };
  forkedFromId: string | null;
}): MarketplaceListing {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    category: raw.category,
    tags: raw.tags,
    thumbnailUrl: raw.thumbnailUrl,
    forkCount: raw.forkCount,
    variableSchema: raw.variableSchema,
    currentVersion: raw.currentVersion,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    author: raw.user.name,
    forkedFromId: raw.forkedFromId,
  };
}

/**
 * List published marketplace templates with optional filtering and pagination.
 */
export async function listMarketplaceTemplates(params: {
  category?: MarketplaceCategory;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'popular';
}) {
  const { category, search, sortBy = 'newest' } = params;
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 20, 1), 100);

  const where = {
    published: true,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { tags: { has: search.toLowerCase() } },
          ],
        }
      : {}),
  };

  const orderBy = sortBy === 'popular' ? { forkCount: 'desc' as const } : { createdAt: 'desc' as const };

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      select: marketplaceSelect,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.template.count({ where }),
  ]);

  return {
    data: templates.map(toMarketplaceListing),
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

/**
 * Get a single published marketplace template with its content (for preview/fork).
 */
export async function getMarketplaceTemplate(templateId: string) {
  const template = await prisma.template.findFirst({
    where: { id: templateId, published: true },
    select: {
      ...marketplaceSelect,
      content: true,
      css: true,
    },
  });

  if (!template) return null;

  return {
    ...toMarketplaceListing(template),
    content: template.content,
    css: template.css,
  };
}

/**
 * Publish a team-owned template to the marketplace.
 * Requires OWNER or ADMIN role in the team.
 */
export async function publishTemplate(params: {
  templateId: string;
  teamId: string;
  category: MarketplaceCategory;
  tags: string[];
}) {
  const template = await prisma.template.findFirst({
    where: { id: params.templateId, teamId: params.teamId },
    select: { id: true },
  });

  if (!template) return null;

  return prisma.template.update({
    where: { id: template.id },
    data: {
      published: true,
      category: params.category,
      tags: params.tags
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean)
        .slice(0, 10),
    },
    select: marketplaceSelect,
  });
}

/**
 * Unpublish a template from the marketplace.
 */
export async function unpublishTemplate(templateId: string, teamId: string) {
  const template = await prisma.template.findFirst({
    where: { id: templateId, teamId },
    select: { id: true },
  });

  if (!template) return null;

  return prisma.template.update({
    where: { id: template.id },
    data: { published: false },
    select: { id: true, published: true },
  });
}

/**
 * Fork a published marketplace template into the given team.
 * Creates a full copy of the template content owned by the target team.
 */
export async function forkTemplate(params: {
  templateId: string;
  targetTeamId: string;
  targetUserId: string;
  customName?: string;
}) {
  const { templateId, targetTeamId, targetUserId, customName } = params;

  const source = await prisma.template.findFirst({
    where: { id: templateId, published: true },
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
      css: true,
      variableSchema: true,
      category: true,
      tags: true,
    },
  });

  if (!source) return null;

  const schema = extractVariables(source.content);

  const forked = await prisma.$transaction(async (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => {
    const newTemplate = await tx.template.create({
      data: {
        userId: targetUserId,
        teamId: targetTeamId,
        name: customName ?? `${source.name} (fork)`,
        description: source.description,
        content: source.content,
        css: source.css,
        variableSchema: schema as any,
        category: source.category,
        tags: source.tags,
        forkedFromId: source.id,
        published: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        variableSchema: true,
        currentVersion: true,
        createdAt: true,
      },
    });

    await createInitialVersion(
      {
        templateId: newTemplate.id,
        name: newTemplate.name,
        description: newTemplate.description,
        content: source.content,
        css: source.css,
        variableSchema: schema,
      },
      tx
    );

    return newTemplate;
  });

  // Increment fork count on the source (non-blocking)
  void prisma.template
    .update({
      where: { id: source.id },
      data: { forkCount: { increment: 1 } },
    })
    .catch(() => {});

  // Dispatch webhook for the team that owns the forked template
  void dispatchWebhooks({
    teamId: targetTeamId,
    event: 'template.created',
    data: {
      templateId: forked.id,
      name: forked.name,
      forkedFrom: templateId,
    },
  });

  return forked;
}
