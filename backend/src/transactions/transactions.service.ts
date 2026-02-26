import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
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

  async create(userId: string, dto: CreateTransactionDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const amount =
      dto.type === 'debit'
        ? -Math.abs(dto.amount)
        : Math.abs(dto.amount);

    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        date: new Date(dto.date),
        description: dto.description.trim(),
        amount: new Prisma.Decimal(amount),
        type: dto.type,
        categoryId: dto.categoryId || null,
        notes: dto.notes?.trim() || null,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return {
      ...tx,
      amount: tx.amount.toString(),
      balanceAfter: tx.balanceAfter?.toString() ?? null,
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

  async reApplyCategories(
    userId: string,
    year: number,
    month: number,
  ): Promise<{ updated: number }> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const categoriesWithKeywords: { id: string; keywords: string[] }[] = [];
    const list = await this.prisma.category.findMany({
      where: {
        isActive: true,
        OR: [{ userId: null }, { userId }],
      },
      select: { id: true, name: true, keywords: true },
      orderBy: { userId: 'desc' },
    });
    list.forEach((c) => {
      const explicit = c.keywords?.filter((k) => k?.trim()) ?? [];
      const nameLower = c.name.toLowerCase().trim();
      const effective = [
        ...new Set([
          nameLower,
          ...explicit.map((k) => k.toLowerCase().trim()),
        ]),
      ].filter(Boolean);
      categoriesWithKeywords.push({ id: c.id, keywords: effective });
    });

    function matchCategoryByKeyword(text: string): string | null {
      if (!text?.trim()) return null;
      const textLower = text.toLowerCase();
      for (const cat of categoriesWithKeywords) {
        for (const kw of cat.keywords) {
          if (!kw?.trim()) continue;
          const kwLower = kw.toLowerCase();
          const matches =
            textLower.includes(kwLower) || kwLower.includes(textLower);
          if (matches) return cat.id;
        }
      }
      return null;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
        isExcluded: false,
      },
      select: { id: true, description: true, categoryId: true },
    });

    let updated = 0;
    for (const tx of transactions) {
      const matchedId = matchCategoryByKeyword(tx.description);
      // Only update when we have a positive keyword match that differs from current.
      // Do NOT overwrite with Uncategorized - preserve manual/CSV-assigned categories.
      if (matchedId != null && matchedId !== (tx.categoryId ?? null)) {
        await this.prisma.transaction.update({
          where: { id: tx.id },
          data: { categoryId: matchedId },
        });
        updated++;
      }
    }

    return { updated };
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
