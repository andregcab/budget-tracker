import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  DEFAULT_CATEGORIES,
  isDefaultCategoryFixed,
} from './default-categories';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Ensures user has default categories (creates if missing). Call before import so transactions use user category IDs. */
  async ensureUserCategories(userId: string): Promise<void> {
    const userCategoryCount = await this.prisma.category.count({
      where: { userId },
    });
    if (userCategoryCount === 0) {
      await this.createDefaultCategoriesForUser(userId);
    }
  }

  async findAllActive(userId: string) {
    await this.ensureUserCategories(userId);
    return this.prisma.category.findMany({
      where: { userId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  private async createDefaultCategoriesForUser(userId: string) {
    const globals = await this.prisma.category.findMany({
      where: { userId: null },
      select: { id: true, name: true, isFixed: true, keywords: true },
    });
    const data =
      globals.length > 0
        ? globals.map((g) => ({
            userId,
            name: g.name,
            isDefault: true,
            isActive: true,
            isFixed: g.isFixed,
            keywords: g.keywords ?? [],
          }))
        : DEFAULT_CATEGORIES.map((c) => ({
            userId,
            name: c.name,
            isDefault: true,
            isActive: true,
            isFixed: c.isFixed,
            keywords: c.keywords,
          }));
    await this.prisma.category.createMany({ data });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        userId,
        name: dto.name,
        isDefault: false,
        isActive: true,
        isFixed: dto.isFixed ?? false,
        keywords: dto.keywords ?? [],
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
    const data: Prisma.CategoryUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.isFixed !== undefined) data.isFixed = dto.isFixed;
    if (dto.keywords !== undefined) {
      data.keywords = Array.isArray(dto.keywords) ? [...dto.keywords] : [];
    }
    return this.prisma.category.update({ where: { id }, data });
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
