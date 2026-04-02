import { NextResponse } from 'next/server';

import { getAuthenticatedApiKeyId, getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { renderPdfFromTemplate } from '@/lib/renderer';
import { checkAndSendUsageAlerts } from '@/lib/usage-alerts';
import { getUsageSummary, recordUsage, assertUsageWithinLimit } from '@/lib/usage';
import type { RenderRequestBody } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const apiKeyId = getAuthenticatedApiKeyId(request);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as RenderRequestBody | null;

  if (!body?.templateId || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    await assertUsageWithinLimit(userId);
  } catch (error) {
    const usageError = error as Error & { status?: number; payload?: unknown };

    if (usageError.status === 402 && usageError.payload) {
      return NextResponse.json(usageError.payload, { status: 402 });
    }

    throw error;
  }

  const template = await prisma.template.findFirst({
    where: {
      id: body.templateId,
      userId
    },
    select: {
      id: true,
      content: true
    }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const startTime = performance.now();

  try {
    const pdf = await renderPdfFromTemplate({
      template: template.content,
      data: body.data,
      options: body.options
    });
    const durationMs = Math.round(performance.now() - startTime);

    await recordUsage({
      userId,
      templateId: template.id,
      status: 'SUCCESS',
      durationMs,
      fileSizeBytes: pdf.length,
      apiKeyId: apiKeyId ?? undefined
    });

    void (async () => {
      try {
        const [summary, user] = await Promise.all([
          getUsageSummary(userId),
          prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
          })
        ]);

        if (!user) {
          return;
        }

        await checkAndSendUsageAlerts({
          userId,
          used: summary.used,
          limit: summary.limit,
          tier: summary.tier,
          userEmail: user.email,
          userName: user.name
        });
      } catch (error) {
        console.error('Usage alert check failed:', error);
      }
    })();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"'
      }
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await recordUsage({
      userId,
      templateId: template.id,
      status: 'FAILED',
      durationMs,
      errorMessage,
      apiKeyId: apiKeyId ?? undefined
    });

    if (error instanceof Error && /(Parse error|Expecting|got)/i.test(error.message)) {
      return NextResponse.json({ error: 'Invalid template data' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Render failed' }, { status: 500 });
  }
}
