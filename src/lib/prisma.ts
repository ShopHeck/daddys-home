import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton with production-ready configuration.
 *
 * Connection pooling:
 * - Configured via DATABASE_URL params: ?connection_limit=10&pool_timeout=30
 * - Or use PgBouncer/Neon pooler as a connection proxy
 *
 * The singleton pattern prevents exhausting connections during development
 * hot reloads while ensuring a single pool in production.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    // datasources are configured via DATABASE_URL which should include:
    // ?connection_limit=10&pool_timeout=30&connect_timeout=10
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
