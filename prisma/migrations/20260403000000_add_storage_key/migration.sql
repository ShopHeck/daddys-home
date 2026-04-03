-- Add storageKey column to UsageRecord for S3-compatible PDF storage
ALTER TABLE "UsageRecord" ADD COLUMN "storageKey" TEXT;

-- Add index for efficient lookups by storage key
CREATE INDEX "UsageRecord_storageKey_idx" ON "UsageRecord"("storageKey") WHERE "storageKey" IS NOT NULL;
