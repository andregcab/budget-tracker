import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryBudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const budgets = await this.prisma.categoryBudget.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true } } },
    });
    return budgets.map((b) => ({
      categoryId: b.categoryId,
      categoryName: b.category.name,
      amount: Number(b.amount),
    }));
  }

  async upsert(userId: string, categoryId: string, amount: number) {
    const budget = await this.prisma.categoryBudget.upsert({
      where: {
        userId_categoryId: { userId, categoryId },
      },
      create: { userId, categoryId, amount },
      update: { amount },
      include: { category: { select: { id: true, name: true } } },
    });
    return {
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      amount: Number(budget.amount),
    };
  }

  async remove(userId: string, categoryId: string) {
    await this.prisma.categoryBudget.deleteMany({
      where: { userId, categoryId },
    });
  }
}
