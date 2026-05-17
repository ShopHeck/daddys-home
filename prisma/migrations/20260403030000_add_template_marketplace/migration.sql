-- AlterTable: Add marketplace fields to Template
ALTER TABLE "Template" ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Template" ADD COLUMN "category" TEXT;
ALTER TABLE "Template" ADD COLUMN "tags" TEXT[];
ALTER TABLE "Template" ADD COLUMN "thumbnailUrl" TEXT;
ALTER TABLE "Template" ADD COLUMN "forkCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Template" ADD COLUMN "forkedFromId" TEXT;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_forkedFromId_fkey" FOREIGN KEY ("forkedFromId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Template_published_category_idx" ON "Template"("published", "category");

-- CreateIndex
CREATE INDEX "Template_published_createdAt_idx" ON "Template"("published", "createdAt");
