import { NextResponse } from 'next/server';

import { getAuthenticatedApiKeyId, getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { renderPdfFromTemplate } from '@/lib/renderer';
import { validateDataAgainstSchema, type VariableSchema } from '@/lib/template-variables';
import { checkAndSendUsageAlerts } from '@/lib/usage-alerts';
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
  const apiKeyId = getAuthenticatedApiKeyId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, email: true, name: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const batchLimit = TIER_BATCH_LIMITS[user.tier as Tier];

  if (body.items.length > batchLimit) {
    return NextResponse.json({
      error: 'Batch size exceeds tier limit',
      limit: batchLimit,
      requested: body.items.length,
      tier: user.tier
    }, { status: 400 });
  }

  const summary = await getUsageSummary(userId);

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
      userId
    },
    select: {
      id: true,
      content: true,
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

    let pdf: Buffer | undefined;
    let renderError: Error | undefined;

    try {
      pdf = await renderPdfFromTemplate({
        template: template.content,
        data: item.data,
        options: item.options
      });
    } catch (error) {
      renderError = error instanceof Error ? error : new Error('Unknown error');
    }

    const durationMs = Math.round(performance.now() - startTime);

    try {
      if (pdf !== undefined) {
        await recordUsage({
          userId,
          templateId: template.id,
          templateVersionId: currentVersion?.id,
          status: 'SUCCESS',
          durationMs,
          fileSizeBytes: pdf.length,
          apiKeyId: apiKeyId ?? undefined
        });
      } else {
        await recordUsage({
          userId,
          templateId: template.id,
          templateVersionId: currentVersion?.id,
          status: 'FAILED',
          durationMs,
          errorMessage: renderError?.message ?? 'Unknown error',
          apiKeyId: apiKeyId ?? undefined
        });
      }
    } catch (usageError) {
      const result: BatchRenderResultItem = {
        index,
        status: 'FAILED',
        error: 'Usage recording failed',
        durationMs
      };

      if (schemaWarnings.length > 0) {
        result.schemaWarnings = schemaWarnings;
      }

      results.push(result);
      return;
    }

    if (pdf !== undefined) {
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
    } else {
      const errorMessage = renderError instanceof Error && /(Parse error|Expecting|got)/i.test(renderError.message)
        ? 'Invalid template data'
        : 'Render failed';

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
    }

    // TODO: dispatch render.completed / render.failed webhooks when webhook system is available
  });

  results.sort((a, b) => a.index - b.index);

  void (async () => {
    try {
      const updatedSummary = await getUsageSummary(userId);

      await checkAndSendUsageAlerts({
        userId,
        used: updatedSummary.used,
        limit: updatedSummary.limit,
        tier: updatedSummary.tier,
        userEmail: user.email,
        userName: user.name
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
