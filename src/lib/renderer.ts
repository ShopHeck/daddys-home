import puppeteer, { type PDFOptions } from 'puppeteer';

import { compileTemplate } from '@/lib/templates';
import type { RenderOptions } from '@/types';

let browserPromise: ReturnType<typeof puppeteer.launch> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  return browserPromise;
}

function buildPdfOptions(options?: RenderOptions): PDFOptions {
  return {
    format: options?.format ?? 'A4',
    landscape: options?.landscape ?? false,
    margin: options?.margin,
    printBackground: true
  };
}

export async function renderPdfFromTemplate(params: {
  template: string;
  data: Record<string, unknown>;
  options?: RenderOptions;
}) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const html = compileTemplate(params.template, params.data);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf(buildPdfOptions(params.options));

    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
