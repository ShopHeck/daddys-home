import puppeteer, { type PDFOptions } from 'puppeteer';

import { compileTemplate } from '@/lib/templates';
import type { RenderOptions } from '@/types';

let browserPromise: ReturnType<typeof puppeteer.launch> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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

function injectCss(html: string, css: string): string {
  if (!css.trim()) return html;
  const styleBlock = `<style>\n${css}\n</style>`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${styleBlock}\n</head>`);
  }
  if (html.includes('<body')) {
    return html.replace(/<body([^>]*)>/, `<body$1>\n${styleBlock}`);
  }
  return `${styleBlock}\n${html}`;
}

export async function renderPdfFromTemplate(params: {
  template: string;
  data: Record<string, unknown>;
  options?: RenderOptions;
  css?: string;
}) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    let html = compileTemplate(params.template, params.data);

    if (params.css) {
      html = injectCss(html, params.css);
    }

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf(buildPdfOptions(params.options));

    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
