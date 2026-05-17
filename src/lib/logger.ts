import pino from 'pino';

/**
 * Structured logger for DocForge.
 *
 * Uses pino for high-performance JSON logging in production.
 * In development, logs are formatted for human readability.
 *
 * Log levels: fatal, error, warn, info, debug, trace
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info({ teamId, templateId }, 'Render completed');
 *   logger.error({ err, teamId }, 'Render failed');
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: 'docforge',
    env: process.env.NODE_ENV || 'development',
  },
  // In development, use pino's pretty transport-compatible formatting
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino/file',
          options: { destination: 1 }, // stdout
        },
      }),
  // Redact sensitive fields from logs
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["x-api-key"]',
      'req.headers["x-internal-auth"]',
      'password',
      'apiKey',
      'secret',
      'token',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Create a child logger with request context for correlation.
 */
export function createRequestLogger(context: {
  requestId?: string;
  teamId?: string;
  userId?: string;
  apiKeyId?: string;
  path?: string;
}) {
  return logger.child(context);
}

/**
 * Create a child logger for a specific module/component.
 */
export function createModuleLogger(module: string) {
  return logger.child({ module });
}

// Pre-built module loggers for common subsystems
export const renderLogger = createModuleLogger('render');
export const webhookLogger = createModuleLogger('webhook');
export const usageLogger = createModuleLogger('usage');
export const storageLogger = createModuleLogger('storage');
export const authLogger = createModuleLogger('auth');
export const stripeLogger = createModuleLogger('stripe');
