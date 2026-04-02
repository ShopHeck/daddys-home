-- AlterTable
ALTER TABLE "Template" ADD COLUMN "currentVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "UsageRecord" ADD COLUMN "templateVersionId" TEXT;

-- CreateTable
CREATE TABLE "TemplateVersion" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TemplateVersion_templateId_version_key" ON "TemplateVersion"("templateId", "version");

-- CreateIndex
CREATE INDEX "TemplateVersion_templateId_createdAt_idx" ON "TemplateVersion"("templateId", "createdAt");

-- Backfill existing templates with an initial immutable version snapshot
INSERT INTO "TemplateVersion" ("id", "templateId", "version", "name", "description", "content", "createdAt")
SELECT
  'tmplver_' || md5("id" || clock_timestamp()::text || random()::text),
  "id",
  1,
  "name",
  "description",
  "content",
  "updatedAt"
FROM "Template";

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
