import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAccountDto) {
    if (dto.isDefault) {
      await this.prisma.account.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.account.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        institution: dto.institution,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(userId, id);
    if (dto.isDefault === true) {
      await this.prisma.account.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.institution !== undefined && { institution: dto.institution }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.account.delete({ where: { id } });
  }
}
