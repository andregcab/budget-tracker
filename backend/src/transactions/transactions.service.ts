import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: string;
  maxAmount?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, filters: TransactionFilters) {
    const where: Prisma.TransactionWhereInput = { userId };
    if (filters.accountId) where.accountId = filters.accountId;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.fromDate || filters.toDate) {
      where.date = {};
      if (filters.fromDate) where.date.gte = new Date(filters.fromDate);
      if (filters.toDate) where.date.lte = new Date(filters.toDate);
    }
    if (filters.minAmount != null || filters.maxAmount != null) {
      where.amount = {};
      if (filters.minAmount != null)
        where.amount.gte = new Prisma.Decimal(filters.minAmount);
      if (filters.maxAmount != null)
        where.amount.lte = new Prisma.Decimal(filters.maxAmount);
    }

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: [{ date: 'desc' }, { id: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: items.map((t) => ({
        ...t,
        amount: t.amount.toString(),
        balanceAfter: t.balanceAfter?.toString() ?? null,
      })),
      total,
      page,
      limit,
    };
  }

  async remove(userId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    await this.prisma.transaction.delete({ where: { id } });
  }

  async removeMany(userId: string, ids: string[]) {
    const result = await this.prisma.transaction.deleteMany({
      where: { id: { in: ids }, userId },
    });
    return { deleted: result.count };
  }

  async removeByDateRange(userId: string, fromDate: string, toDate: string) {
    const result = await this.prisma.transaction.deleteMany({
      where: {
        userId,
        date: {
          gte: new Date(fromDate),
          lte: new Date(toDate),
        },
      },
    });
    return { deleted: result.count };
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.isExcluded !== undefined && { isExcluded: dto.isExcluded }),
      },
      include: { category: { select: { id: true, name: true } } },
    });
    return {
      ...updated,
      amount: updated.amount.toString(),
      balanceAfter: updated.balanceAfter?.toString() ?? null,
    };
  }
}
