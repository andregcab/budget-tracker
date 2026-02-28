-- Add username column (nullable first so we can backfill)
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill: existing users keep their email as username so login still works
UPDATE "User" SET "username" = "email" WHERE "username" IS NULL;

-- Make username required and unique
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Make email optional (existing users keep it; new users don't need it).
-- Unique on email is kept so non-null emails stay unique (Postgres allows multiple NULLs).
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
