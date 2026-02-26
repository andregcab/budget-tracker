-- CreateTable
CREATE TABLE "ExpectedFixedExpense" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ExpectedFixedExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExpectedFixedExpense_userId_year_month_idx" ON "ExpectedFixedExpense"("userId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ExpectedFixedExpense_userId_categoryId_year_month_key" ON "ExpectedFixedExpense"("userId", "categoryId", "year", "month");

-- AddForeignKey
ALTER TABLE "ExpectedFixedExpense" ADD CONSTRAINT "ExpectedFixedExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpectedFixedExpense" ADD CONSTRAINT "ExpectedFixedExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
