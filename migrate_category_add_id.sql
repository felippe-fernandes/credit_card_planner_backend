-- Migration script to add id column to Category table with existing data
-- Step 1: Add id column as nullable first
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "id" TEXT;

-- Step 2: Populate id for existing rows using gen_random_uuid or similar
UPDATE "Category" SET "id" = 'c' || substr(md5(random()::text || clock_timestamp()::text), 1, 24) WHERE "id" IS NULL;

-- Step 3: Make id column required and set as primary key
ALTER TABLE "Category" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "Category" ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");
