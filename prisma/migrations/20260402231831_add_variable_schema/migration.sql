-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "variableSchema" JSONB;

-- AlterTable
ALTER TABLE "TemplateVersion" ADD COLUMN     "variableSchema" JSONB;
