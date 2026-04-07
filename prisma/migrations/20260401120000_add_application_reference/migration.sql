ALTER TABLE "Application"
ADD COLUMN "reference" TEXT;

UPDATE "Application"
SET "reference" = 'DSH-' || TO_CHAR(COALESCE("createdAt", CURRENT_TIMESTAMP), 'YYYY') || '-' || UPPER(SUBSTRING(REPLACE("id", '-', '') FROM 1 FOR 6))
WHERE "reference" IS NULL;

ALTER TABLE "Application"
ALTER COLUMN "reference" SET NOT NULL;

CREATE UNIQUE INDEX "Application_reference_key" ON "Application"("reference");
