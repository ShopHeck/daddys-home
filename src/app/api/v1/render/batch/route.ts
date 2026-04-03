import { NextResponse } from 'next/server';

import { getAuthenticatedApiKeyId, getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { renderPdfFromTemplate } from '@/lib/renderer';
import { validateDataAgainstSchema, type VariableSchema } from '@/lib/template-variables';
import { checkAndSendUsageAlerts } from '@/lib/usage-alerts';
import { dispatchWebhooks } from '@/lib/webhooks';
import { getTeamTier, requireApiTeamAccess } from '@/lib/teams';
import { getUsageSummary, recordUsage, TIER_BATCH_LIMITS } from '@/lib/usage';
import type { BatchRenderRequestBody, BatchRenderResultItem, Tier } from '@/types';

export const runtime = 'nodejs';

const MAX_CONCURRENCY = 5;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function processWithPool<T>(
  items: T[],
  maxConcurrency: number,
  processor: (item: T, index: number) => Promise<void>
) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      await processor(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(maxConcurrency, items.length) },
    () => worker()
  );

  await Promise.all(workers);
}

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);
  const apiKeyId = getAuthenticatedApiKeyId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as BatchRenderRequestBody | null;

  if (
    !body
    || typeof body.templateId !== 'string'
    || body.templateId.trim().length === 0
    || !Array.isArray(body.items)
    || body.items.length === 0
    || body.items.some((item) => !isObjectRecord(item?.data))
  ) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const tier = await getTeamTier(teamId);
  const batchLimit = TIER_BATCH_LIMITS[tier];

  if (body.items.length > batchLimit) {
    return NextResponse.json({
      error: 'Batch size exceeds tier limit',
      limit: batchLimit,
      requested: body.items.length,
      tier
    }, { status: 400 });
  }

  const summary = await getUsageSummary(teamId);

  if (summary.remaining < body.items.length) {
    return NextResponse.json({
      error: 'Insufficient usage quota for batch',
      remaining: summary.remaining,
      requested: body.items.length,
      tier: summary.tier,
      limit: summary.limit,
      used: summary.used
    }, { status: 402 });
  }

  const template = await prisma.template.findFirst({
    where: {
      id: body.templateId,
      teamId
    },
    select: {
      id: true,
      content: true,
      css: true,
      currentVersion: true,
      variableSchema: true
    }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const currentVersion = await prisma.templateVersion.findUnique({
    where: {
      templateId_version: {
        templateId: template.id,
        version: template.currentVersion
      }
    },
    select: { id: true }
  });

  const results: BatchRenderResultItem[] = [];

  await processWithPool(body.items, MAX_CONCURRENCY, async (item, index) => {
    const startTime = performance.now();
    let schemaWarnings: Array<{ path: string; message: string; severity: 'warning' }> = [];

    if (body.validateSchema && template.variableSchema) {
      schemaWarnings = validateDataAgainstSchema(
        item.data,
        template.variableSchema as VariableSchema
      );
    }

    try {
      const pdf = await renderPdfFromTemplate({
        template: template.content,
        data: item.data,
        options: item.options,
        css: template.css ?? undefined
      });
      const durationMs = Math.round(performance.now() - startTime);

      try {
        await recordUsage({
          teamId,
          userId,
          templateId: template.id,
          templateVersionId: currentVersion?.id,
          status: 'SUCCESS',
          durationMs,
          fileSizeBytes: pdf.length,
          apiKeyId: apiKeyId ?? undefined
        });
      } catch (error) {
        console.error('Failed to record usage:', error);
      }

      const result: BatchRenderResultItem = {
        index,
        status: 'SUCCESS',
        pdf: pdf.toString('base64'),
        durationMs,
        fileSizeBytes: pdf.length
      };

      if (schemaWarnings.length > 0) {
        result.schemaWarnings = schemaWarnings;
      }

      results.push(result);

      void dispatchWebhooks({
        teamId,
        event: 'render.completed',
        data: {
          templateId: template.id,
          durationMs,
          fileSizeBytes: pdf.length,
          templateVersion: template.currentVersion
        }
      });
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);
      const rawMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage = error instanceof Error && /(Parse error|Expecting|got)/i.test(error.message)
        ? 'Invalid template data'
        : 'Render failed';

      try {
        await recordUsage({
          teamId,
          userId,
          templateId: template.id,
          templateVersionId: currentVersion?.id,
          status: 'FAILED',
          durationMs,
          errorMessage: rawMessage,
          apiKeyId: apiKeyId ?? undefined
        });
      } catch (recordUsageError) {
        console.error('Failed to record usage:', recordUsageError);
      }

      const result: BatchRenderResultItem = {
        index,
        status: 'FAILED',
        error: errorMessage,
        durationMs
      };

      if (schemaWarnings.length > 0) {
        result.schemaWarnings = schemaWarnings;
      }

      results.push(result);

      void dispatchWebhooks({
        teamId,
        event: 'render.failed',
        data: {
          templateId: template.id,
          durationMs,
          errorMessage: rawMessage
        }
      });
    }
  });

  results.sort((a, b) => a.index - b.index);

  void (async () => {
    try {
      const updatedSummary = await getUsageSummary(teamId);

      await checkAndSendUsageAlerts({
        teamId,
        used: updatedSummary.used,
        limit: updatedSummary.limit,
        tier: updatedSummary.tier
      });
    } catch (error) {
      console.error('Usage alert check failed:', error);
    }
  })();

  const successCount = results.filter((result) => result.status === 'SUCCESS').length;
  const failedCount = results.filter((result) => result.status === 'FAILED').length;

  return NextResponse.json({
    templateId: template.id,
    totalItems: body.items.length,
    successCount,
    failedCount,
    results
  });
}
