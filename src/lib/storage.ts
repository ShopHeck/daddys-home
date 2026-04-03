import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.STORAGE_BUCKET;
const REGION = process.env.STORAGE_REGION || 'auto';
const ENDPOINT = process.env.STORAGE_ENDPOINT;

function getClient(): S3Client | null {
  if (!BUCKET || !process.env.STORAGE_ACCESS_KEY_ID || !process.env.STORAGE_SECRET_ACCESS_KEY) {
    return null;
  }
  
  return new S3Client({
    region: REGION,
    endpoint: ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    },
    forcePathStyle: !!ENDPOINT, // needed for R2/MinIO
  });
}

/**
 * Upload a PDF buffer to storage. Returns the storage key on success, null if storage is not configured.
 * 
 * Tier-based retention (stored as metadata, TTL cleanup not yet implemented):
 * - FREE: 7 days
 * - PRO: 30 days
 * - BUSINESS: 90 days
 */
export async function uploadPdf(params: {
  teamId: string;
  recordId: string;
  buffer: Buffer;
}): Promise<string | null> {
  const client = getClient();
  if (!client || !BUCKET) return null;

  const key = `teams/${params.teamId}/renders/${params.recordId}.pdf`;
  
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: params.buffer,
    ContentType: 'application/pdf',
  }));
  
  return key;
}

/**
 * Generate a presigned download URL for a stored PDF. Expires in 1 hour.
 */
export async function getDownloadUrl(storageKey: string): Promise<string | null> {
  const client = getClient();
  if (!client || !BUCKET) return null;

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: BUCKET, Key: storageKey }),
    { expiresIn: 3600 }
  );
  
  return url;
}

/**
 * Returns true if storage is configured and available.
 */
export function isStorageConfigured(): boolean {
  return !!(BUCKET && process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY);
}
