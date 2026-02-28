-- Drop email column; auth uses username only
ALTER TABLE "User" DROP COLUMN "email";
