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
    return items.map((i) => ({
      id: i.id,
      categoryId: i.categoryId,
      categoryName: i.category.name,
      amount: Number(i.amount),
    }));
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
