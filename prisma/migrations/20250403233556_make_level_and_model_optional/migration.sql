-- AlterTable
ALTER TABLE "TextSummary" ALTER COLUMN "level" DROP NOT NULL,
ALTER COLUMN "level" DROP DEFAULT,
ALTER COLUMN "model" DROP NOT NULL,
ALTER COLUMN "model" DROP DEFAULT;
