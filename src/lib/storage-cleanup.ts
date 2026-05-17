import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { prisma } from '@/lib/prisma';
import { storageLogger } from '@/lib/logger';
import type { Tier } from '@/types';

/**
 * Storage TTL Cleanup
 *
 * Implements tier-based PDF retention:
 * - FREE: 7 days
 * - PRO: 30 days
 * - BUSINESS: 90 days
 *
 * Designed to run as a cron job (e.g., daily via Railway cron or external scheduler).
 */

const TIER_RETENTION_DAYS: Record<Tier, number> = {
  FREE: 7,
  PRO: 30,
  BUSINESS: 90,
};

const BUCKET = process.env.STORAGE_BUCKET;
const REGION = process.env.STORAGE_REGION || 'auto';
const ENDPOINT = process.env.STORAGE_ENDPOINT;

function getS3Client(): S3Client | null {
  if (!BUCKET || !process.env.STORAGE_ACCESS_KEY_ID || !process.env.STORAGE_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: REGION,
    endpoint: ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: !!ENDPOINT,
  });
}

/**
 * Clean up expired PDFs based on team tier retention policies.
 *
 * Strategy:
 * 1. Query UsageRecords with storageKey that are older than their tier's retention
 * 2. Delete the S3 objects
 * 3. Clear the storageKey field in the database
 *
 * Returns the number of objects cleaned up.
 */
export async function cleanupExpiredPdfs(batchSize = 100): Promise<{ deleted: number; errors: number }> {
  const client = getS3Client();
  if (!client || !BUCKET) {
    storageLogger.info('Storage not configured, skipping cleanup');
    return { deleted: 0, errors: 0 };
  }

  let totalDeleted = 0;
  let totalErrors = 0;

  // Process each tier separately
  for (const tier of ['FREE', 'PRO', 'BUSINESS'] as Tier[]) {
    const retentionDays = TIER_RETENTION_DAYS[tier];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Find records with storage keys that are past retention
    const expiredRecords = await prisma.usageRecord.findMany({
      where: {
        storageKey: { not: null },
        createdAt: { lt: cutoffDate },
        team: {
          members: {
            some: {
              role: 'OWNER',
              user: { tier },
            },
          },
        },
      },
      select: {
        id: true,
        storageKey: true,
        teamId: true,
      },
      take: batchSize,
    });

    if (expiredRecords.length === 0) continue;

    storageLogger.info({ tier, retentionDays, count: expiredRecords.length }, 'Cleaning up expired PDFs');

    for (const record of expiredRecords) {
      try {
        // Delete from S3
        await client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: record.storageKey!,
          })
        );

        // Clear the storageKey in DB
        await prisma.usageRecord.update({
          where: { id: record.id },
          data: { storageKey: null },
        });

        totalDeleted++;
      } catch (err) {
        storageLogger.error(
          { err, recordId: record.id, storageKey: record.storageKey },
          'Failed to delete expired PDF'
        );
        totalErrors++;
      }
    }
  }

  storageLogger.info({ deleted: totalDeleted, errors: totalErrors }, 'Storage cleanup completed');
  return { deleted: totalDeleted, errors: totalErrors };
}
