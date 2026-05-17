/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the server starts. Used for:
 * - Graceful shutdown handling (SIGTERM/SIGINT)
 * - Environment validation
 * - One-time initialization
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('@/lib/logger');
    const { validateEnv } = await import('@/lib/env');

    // Validate environment on startup
    validateEnv();

    logger.info({ pid: process.pid, nodeVersion: process.version }, 'DocForge server starting');

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal, cleaning up...');

      try {
        // Close Puppeteer browser
        const { closeBrowser } = await import('@/lib/renderer');
        await closeBrowser();

        // Disconnect Prisma
        const { prisma } = await import('@/lib/prisma');
        await prisma.$disconnect();

        logger.info('Graceful shutdown complete');
      } catch (err) {
        logger.error({ err }, 'Error during graceful shutdown');
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  }
}
