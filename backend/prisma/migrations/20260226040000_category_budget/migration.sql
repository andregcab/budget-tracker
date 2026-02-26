-- CreateTable
CREATE TABLE "CategoryBudget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "CategoryBudget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryBudget_userId_categoryId_key" ON "CategoryBudget"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "CategoryBudget_userId_idx" ON "CategoryBudget"("userId");

-- AddForeignKey
ALTER TABLE "CategoryBudget" ADD CONSTRAINT "CategoryBudget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryBudget" ADD CONSTRAINT "CategoryBudget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
