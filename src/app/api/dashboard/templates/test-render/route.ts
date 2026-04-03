import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { renderPdfFromTemplate } from '@/lib/renderer';
import type { RenderOptions } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    content?: string;
    data?: Record<string, unknown>;
    options?: RenderOptions;
    css?: string;
  } | null;

  if (!body?.content?.trim()) {
    return NextResponse.json({ error: 'Template content is required' }, { status: 400 });
  }

  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return NextResponse.json({ error: 'Render data must be a JSON object' }, { status: 400 });
  }

  try {
    const pdf = await renderPdfFromTemplate({
      template: body.content,
      data: body.data,
      options: body.options,
      css: body.css ?? undefined
    });

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="test-render.pdf"'
      }
    });
  } catch (error) {
    if (error instanceof Error && /(Parse error|Expecting|got)/i.test(error.message)) {
      return NextResponse.json({ error: `Invalid template: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json({ error: 'Render failed' }, { status: 500 });
  }
}
