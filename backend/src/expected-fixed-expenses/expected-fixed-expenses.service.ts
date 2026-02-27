import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpectedFixedExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async getForMonth(userId: string, year: number, month: number) {
    const items = await this.prisma.expectedFixedExpense.findMany({
      where: {
        userId,
        year,
        month,
        category: { isActive: true },
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { id: 'asc' },
    });
    const byCategory = new Map(
      items.map((i) => [
        i.categoryId,
        {
          id: i.id,
          categoryId: i.categoryId,
          categoryName: i.category.name,
          amount: Number(i.amount),
        },
      ]),
    );

    // Inherit from most recent previous month for categories user configured before
    const prevItems = await this.prisma.expectedFixedExpense.findMany({
      where: {
        userId,
        category: { isActive: true },
        OR: [
          { year: { lt: year } },
          { year: { equals: year }, month: { lt: month } },
        ],
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: { category: { select: { id: true, name: true } } },
    });
    const seen = new Set(byCategory.keys());
    for (const prev of prevItems) {
      if (seen.has(prev.categoryId)) continue;
      seen.add(prev.categoryId);
      byCategory.set(prev.categoryId, {
        id: `inherited-${prev.categoryId}`,
        categoryId: prev.categoryId,
        categoryName: prev.category.name,
        amount: Number(prev.amount),
      });
    }

    return Array.from(byCategory.values());
  }

  async create(
    userId: string,
    year: number,
    month: number,
    categoryId: string,
    amount: number,
  ) {
    const item = await this.prisma.expectedFixedExpense.upsert({
      where: {
        userId_categoryId_year_month: { userId, categoryId, year, month },
      },
      create: { userId, year, month, categoryId, amount },
      update: { amount },
      include: { category: { select: { id: true, name: true } } },
    });
    return {
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      amount: Number(item.amount),
    };
  }

  async delete(userId: string, id: string) {
    await this.prisma.expectedFixedExpense.deleteMany({
      where: { id, userId },
    });
  }
}
