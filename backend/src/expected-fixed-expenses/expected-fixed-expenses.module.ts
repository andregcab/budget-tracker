import { Module } from '@nestjs/common';
import { ExpectedFixedExpensesController } from './expected-fixed-expenses.controller';
import { ExpectedFixedExpensesService } from './expected-fixed-expenses.service';

@Module({
  controllers: [ExpectedFixedExpensesController],
  providers: [ExpectedFixedExpensesService],
  exports: [ExpectedFixedExpensesService],
})
export class ExpectedFixedExpensesModule {}
