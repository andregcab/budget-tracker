import { Module } from '@nestjs/common';
import { CategoryBudgetController } from './category-budget.controller';
import { CategoryBudgetService } from './category-budget.service';

@Module({
  controllers: [CategoryBudgetController],
  providers: [CategoryBudgetService],
  exports: [CategoryBudgetService],
})
export class CategoryBudgetModule {}
