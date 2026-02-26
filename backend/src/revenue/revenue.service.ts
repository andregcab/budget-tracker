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
