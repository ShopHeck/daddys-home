import puppeteer, { type Browser, type PDFOptions } from 'puppeteer';

import { compileTemplate } from '@/lib/templates';
import { renderLogger } from '@/lib/logger';
import type { RenderOptions } from '@/types';

/**
 * Puppeteer PDF Renderer — Production Hardened
 *
 * Security & reliability measures:
 * 1. Concurrency limiter — prevents OOM from too many simultaneous pages
 * 2. Page timeout — kills hung renders after configurable deadline
 * 3. Request interception — blocks external network requests from templates
 * 4. Browser auto-restart — recycles after N renders to prevent memory leaks
 * 5. Error isolation — each render gets a fresh page, failures don't cascade
 */

// --- Configuration ---
const MAX_CONCURRENT_RENDERS = parseInt(process.env.MAX_CONCURRENT_RENDERS || '5', 10);
const PAGE_TIMEOUT_MS = parseInt(process.env.RENDER_TIMEOUT_MS || '30000', 10);
const BROWSER_MAX_RENDERS = parseInt(process.env.BROWSER_MAX_RENDERS || '200', 10);

// --- State ---
let browserInstance: Browser | null = null;
let browserPromise: Promise<Browser> | null = null;
let renderCount = 0;
let activeRenders = 0;

// --- Concurrency Semaphore ---
const waitQueue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeRenders < MAX_CONCURRENT_RENDERS) {
    activeRenders++;
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    waitQueue.push(() => {
      activeRenders++;
      resolve();
    });
  });
}

function releaseSlot(): void {
  activeRenders--;
  const next = waitQueue.shift();
  if (next) {
    next();
  }
}

// --- Browser Lifecycle ---
async function launchBrowser(): Promise<Browser> {
  renderLogger.info(
    { maxConcurrent: MAX_CONCURRENT_RENDERS, maxRenders: BROWSER_MAX_RENDERS },
    'Launching Puppeteer browser'
  );

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      // Memory constraints
      '--js-flags=--max-old-space-size=256',
      '--disable-features=site-per-process', // reduces memory per tab
    ],
  });

  // Handle unexpected browser disconnection
  browser.on('disconnected', () => {
    renderLogger.warn('Browser disconnected unexpectedly, will relaunch on next render');
    browserInstance = null;
    browserPromise = null;
  });

  return browser;
}

async function getBrowser(): Promise<Browser> {
  // Check if browser needs restart (render count exceeded)
  if (browserInstance && renderCount >= BROWSER_MAX_RENDERS) {
    renderLogger.info({ renderCount }, 'Browser render limit reached, recycling');
    const oldBrowser = browserInstance;
    browserInstance = null;
    browserPromise = null;
    renderCount = 0;

    // Close old browser in background
    void oldBrowser.close().catch((err) => {
      renderLogger.error({ err }, 'Error closing old browser during recycle');
    });
  }

  if (!browserPromise) {
    browserPromise = launchBrowser().then((browser) => {
      browserInstance = browser;
      renderCount = 0;
      return browser;
    });
  }

  return browserPromise;
}

/**
 * Gracefully shutdown the browser (called during process exit).
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    renderLogger.info('Closing Puppeteer browser for shutdown');
    await browserInstance.close().catch(() => {});
    browserInstance = null;
    browserPromise = null;
  }
}

// --- PDF Rendering ---
function buildPdfOptions(options?: RenderOptions): PDFOptions {
  return {
    format: options?.format ?? 'A4',
    landscape: options?.landscape ?? false,
    margin: options?.margin,
    printBackground: true,
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
}): Promise<Buffer> {
  // Wait for a concurrency slot
  await acquireSlot();

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
      // Set page-level timeout
      page.setDefaultTimeout(PAGE_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MS);

      // Block all external network requests (prevent SSRF via templates)
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const url = request.url();
        // Allow data: URIs and about:blank (needed for setContent)
        if (url.startsWith('data:') || url === 'about:blank') {
          request.continue();
        } else {
          // Block all external HTTP/HTTPS requests from template content
          request.abort('blockedbyclient');
        }
      });

      // Compile template
      let html = compileTemplate(params.template, params.data);

      if (params.css) {
        html = injectCss(html, params.css);
      }

      // Set content with timeout (waitUntil: 'load' is safer than 'networkidle0'
      // since we block network requests anyway)
      await page.setContent(html, { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS });

      // Generate PDF
      const pdf = await page.pdf(buildPdfOptions(params.options));

      renderCount++;

      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => {});
    }
  } finally {
    releaseSlot();
  }
}

/**
 * Get renderer health/stats for monitoring.
 */
export function getRendererStats() {
  return {
    activeRenders,
    maxConcurrent: MAX_CONCURRENT_RENDERS,
    queueLength: waitQueue.length,
    totalRendered: renderCount,
    browserMaxRenders: BROWSER_MAX_RENDERS,
    browserAlive: browserInstance !== null,
  };
}
