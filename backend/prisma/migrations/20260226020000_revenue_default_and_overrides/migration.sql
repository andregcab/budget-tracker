-- AlterTable
ALTER TABLE "User" ADD COLUMN "monthlyIncome" DECIMAL(12,2);

-- DropTable
DROP TABLE "Revenue";

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Revenue_userId_year_month_key" ON "Revenue"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "Revenue_userId_year_month_idx" ON "Revenue"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
