-- AlterTable
ALTER TABLE "UsageRecord" ADD COLUMN     "apiKeyId" TEXT,
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "fileSizeBytes" INTEGER;

-- CreateIndex
CREATE INDEX "UsageRecord_userId_createdAt_idx" ON "UsageRecord"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;
