import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DEFAULT_CATEGORIES } from './default-categories';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(userId: string) {
    const userCategoryCount = await this.prisma.category.count({
      where: { userId },
    });
    if (userCategoryCount === 0) {
      await this.createDefaultCategoriesForUser(userId);
    }
    const categories = await this.prisma.category.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return categories;
  }

  private async createDefaultCategoriesForUser(userId: string) {
    const globals = await this.prisma.category.findMany({
      where: { userId: null },
      select: { id: true, name: true },
    });
    const names =
      globals.length > 0 ? globals.map((g) => g.name) : DEFAULT_CATEGORIES;
    await this.prisma.category.createMany({
      data: names.map((name) => ({
        userId,
        name,
        isDefault: true,
        isActive: true,
      })),
    });
    if (globals.length > 0) {
      const userCats = await this.prisma.category.findMany({
        where: { userId },
        select: { id: true, name: true },
      });
      const nameToNewId = Object.fromEntries(
        userCats.map((c) => [c.name, c.id]),
      );
      for (const g of globals) {
        const newId = nameToNewId[g.name];
        if (newId) {
          await this.prisma.transaction.updateMany({
            where: { userId, categoryId: g.id },
            data: { categoryId: newId },
          });
        }
      }
    }
  }

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        isDefault: false,
        isActive: true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async findOneWithCount(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const transactionCount = await this.prisma.transaction.count({
      where: { userId, categoryId: id },
    });
    return { ...category, transactionCount };
  }

  async remove(userId: string, id: string, migrateToId?: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (migrateToId && migrateToId !== id) {
      const target = await this.prisma.category.findFirst({
        where: { id: migrateToId, userId },
      });
      if (!target) {
        throw new NotFoundException('Migration target category not found');
      }
      await this.prisma.transaction.updateMany({
        where: { userId, categoryId: id },
        data: { categoryId: migrateToId },
      });
    }
    await this.prisma.category.delete({ where: { id } });
  }
}
