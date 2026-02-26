import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountsModule } from './accounts/accounts.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CategoryBudgetModule } from './category-budget/category-budget.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ImportsModule } from './imports/imports.module';
import { PrismaModule } from './prisma/prisma.module';
import { ExpectedFixedExpensesModule } from './expected-fixed-expenses/expected-fixed-expenses.module';
import { RevenueModule } from './revenue/revenue.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AccountsModule,
    CategoriesModule,
    CategoryBudgetModule,
    TransactionsModule,
    ImportsModule,
    RevenueModule,
    ExpectedFixedExpensesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
