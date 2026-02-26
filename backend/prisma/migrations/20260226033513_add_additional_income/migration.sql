-- CreateTable
CREATE TABLE "AdditionalIncome" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "AdditionalIncome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdditionalIncome_userId_year_month_idx" ON "AdditionalIncome"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "AdditionalIncome" ADD CONSTRAINT "AdditionalIncome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
