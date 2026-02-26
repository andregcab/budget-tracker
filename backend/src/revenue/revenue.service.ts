import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertRevenueDto } from './dto/upsert-revenue.dto';

@Injectable()
export class RevenueService {
  constructor(private readonly prisma: PrismaService) {}

  async getForMonth(userId: string, year: number, month: number) {
    const revenue = await this.prisma.revenue.findUnique({
      where: {
        userId_year_month: { userId, year, month },
      },
    });
    return revenue ? { amount: Number(revenue.amount) } : null;
  }

  async getAdditionalIncome(userId: string, year: number, month: number) {
    const items = await this.prisma.additionalIncome.findMany({
      where: { userId, year, month },
      orderBy: { id: 'asc' },
    });
    return items.map((i) => ({
      id: i.id,
      amount: Number(i.amount),
      description: i.description,
    }));
  }

  async createAdditionalIncome(
    userId: string,
    year: number,
    month: number,
    amount: number,
    description?: string,
  ) {
    const item = await this.prisma.additionalIncome.create({
      data: { userId, year, month, amount, description: description || null },
    });
    return {
      id: item.id,
      amount: Number(item.amount),
      description: item.description,
    };
  }

  async deleteAdditionalIncome(userId: string, id: string) {
    await this.prisma.additionalIncome.deleteMany({
      where: { id, userId },
    });
  }

  async upsert(userId: string, dto: UpsertRevenueDto) {
    const revenue = await this.prisma.revenue.upsert({
      where: {
        userId_year_month: { userId, year: dto.year, month: dto.month },
      },
      create: {
        userId,
        year: dto.year,
        month: dto.month,
        amount: dto.amount,
      },
      update: { amount: dto.amount },
    });
    return { amount: Number(revenue.amount) };
  }

  async remove(userId: string, year: number, month: number) {
    await this.prisma.revenue.deleteMany({
      where: { userId, year, month },
    });
  }
}
