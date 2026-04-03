-- Step 1: Add nullable columns
ALTER TABLE "Template" ADD COLUMN "teamId" TEXT;
ALTER TABLE "ApiKey" ADD COLUMN "teamId" TEXT;
ALTER TABLE "WebhookEndpoint" ADD COLUMN "teamId" TEXT;
ALTER TABLE "UsageRecord" ADD COLUMN "teamId" TEXT;
ALTER TABLE "UsageAlert" ADD COLUMN "teamId" TEXT;

-- Step 2: Backfill from user's active team or personal team
UPDATE "Template" t SET "teamId" = COALESCE(
  (SELECT u."activeTeamId" FROM "User" u WHERE u.id = t."userId"),
  (SELECT tm."teamId" FROM "TeamMember" tm JOIN "Team" team ON team.id = tm."teamId" WHERE tm."userId" = t."userId" AND team.personal = true LIMIT 1)
);

UPDATE "ApiKey" a SET "teamId" = COALESCE(
  (SELECT u."activeTeamId" FROM "User" u WHERE u.id = a."userId"),
  (SELECT tm."teamId" FROM "TeamMember" tm JOIN "Team" team ON team.id = tm."teamId" WHERE tm."userId" = a."userId" AND team.personal = true LIMIT 1)
);

UPDATE "WebhookEndpoint" w SET "teamId" = COALESCE(
  (SELECT u."activeTeamId" FROM "User" u WHERE u.id = w."userId"),
  (SELECT tm."teamId" FROM "TeamMember" tm JOIN "Team" team ON team.id = tm."teamId" WHERE tm."userId" = w."userId" AND team.personal = true LIMIT 1)
);

UPDATE "UsageRecord" r SET "teamId" = COALESCE(
  (SELECT u."activeTeamId" FROM "User" u WHERE u.id = r."userId"),
  (SELECT tm."teamId" FROM "TeamMember" tm JOIN "Team" team ON team.id = tm."teamId" WHERE tm."userId" = r."userId" AND team.personal = true LIMIT 1)
);

UPDATE "UsageAlert" a SET "teamId" = COALESCE(
  (SELECT u."activeTeamId" FROM "User" u WHERE u.id = a."userId"),
  (SELECT tm."teamId" FROM "TeamMember" tm JOIN "Team" team ON team.id = tm."teamId" WHERE tm."userId" = a."userId" AND team.personal = true LIMIT 1)
);

-- Step 3: Make NOT NULL
ALTER TABLE "Template" ALTER COLUMN "teamId" SET NOT NULL;
ALTER TABLE "ApiKey" ALTER COLUMN "teamId" SET NOT NULL;
ALTER TABLE "WebhookEndpoint" ALTER COLUMN "teamId" SET NOT NULL;
ALTER TABLE "UsageRecord" ALTER COLUMN "teamId" SET NOT NULL;
ALTER TABLE "UsageAlert" ALTER COLUMN "teamId" SET NOT NULL;

-- Step 4: Add foreign keys
ALTER TABLE "Template" ADD CONSTRAINT "Template_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsageAlert" ADD CONSTRAINT "UsageAlert_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Add indexes
CREATE INDEX "Template_teamId_idx" ON "Template"("teamId");
CREATE INDEX "ApiKey_teamId_idx" ON "ApiKey"("teamId");
CREATE INDEX "WebhookEndpoint_teamId_idx" ON "WebhookEndpoint"("teamId");
CREATE INDEX "UsageRecord_teamId_createdAt_idx" ON "UsageRecord"("teamId", "createdAt");
CREATE INDEX "UsageAlert_teamId_idx" ON "UsageAlert"("teamId");

-- Step 6: Update UsageAlert unique constraint
DROP INDEX "UsageAlert_userId_threshold_period_key";
CREATE UNIQUE INDEX "UsageAlert_teamId_threshold_period_key" ON "UsageAlert"("teamId", "threshold", "period");
