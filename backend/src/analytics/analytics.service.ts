import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlySummary(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const [transactions, revenueOverride, user] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: start, lte: end },
          amount: { lt: 0 },
          isExcluded: false,
        },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.revenue.findUnique({
        where: {
          userId_year_month: { userId, year, month },
        },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { monthlyIncome: true },
      }),
    ]);

    const budgets = await this.prisma.categoryBudget.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true } } },
    });
    const budgetByCategory: Record<string, number> = {};
    for (const b of budgets) {
      budgetByCategory[b.categoryId] = Number(b.amount);
    }

    const byCategory: Record<
      string,
      { name: string; total: number; budget: number }
    > = {};
    let totalSpend = 0;
    for (const tx of transactions) {
      const amt = Number(tx.amount);
      totalSpend += Math.abs(amt);
      const key = tx.category?.id ?? 'uncategorized';
      const name = tx.category?.name ?? 'Uncategorized';
      if (!byCategory[key]) {
        byCategory[key] = {
          name,
          total: 0,
          budget: budgetByCategory[key] ?? 0,
        };
      }
      byCategory[key].total += Math.abs(amt);
    }
    for (const [catId, budget] of Object.entries(budgetByCategory)) {
      if (!byCategory[catId]) {
        const cat = budgets.find((b) => b.categoryId === catId)?.category;
        byCategory[catId] = {
          name: cat?.name ?? 'Unknown',
          total: 0,
          budget,
        };
      }
    }

    const totalRevenue = revenueOverride
      ? Number(revenueOverride.amount)
      : user?.monthlyIncome != null
        ? Number(user.monthlyIncome)
        : 0;
    const savings = totalRevenue - totalSpend;

    return {
      year,
      month,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      byCategory: Object.entries(byCategory).map(
        ([id, { name, total, budget }]) => ({
          id,
          name,
          total: Math.round(total * 100) / 100,
          budget: Math.round(budget * 100) / 100,
        }),
      ),
    };
  }
}
