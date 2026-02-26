"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const default_categories_1 = require("./default-categories");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllActive(userId) {
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
    async createDefaultCategoriesForUser(userId) {
        const globals = await this.prisma.category.findMany({
            where: { userId: null },
            select: { id: true, name: true },
        });
        const names = globals.length > 0 ? globals.map((g) => g.name) : default_categories_1.DEFAULT_CATEGORIES;
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
            const nameToNewId = Object.fromEntries(userCats.map((c) => [c.name, c.id]));
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
    async create(userId, dto) {
        return this.prisma.category.create({
            data: {
                userId,
                name: dto.name,
                isDefault: false,
                isActive: true,
            },
        });
    }
    async update(userId, id, dto) {
        const category = await this.prisma.category.findFirst({
            where: { id, userId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return this.prisma.category.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
            },
        });
    }
    async findOneWithCount(userId, id) {
        const category = await this.prisma.category.findFirst({
            where: { id, userId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const transactionCount = await this.prisma.transaction.count({
            where: { userId, categoryId: id },
        });
        return { ...category, transactionCount };
    }
    async remove(userId, id, migrateToId) {
        const category = await this.prisma.category.findFirst({
            where: { id, userId },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (migrateToId && migrateToId !== id) {
            const target = await this.prisma.category.findFirst({
                where: { id: migrateToId, userId },
            });
            if (!target) {
                throw new common_1.NotFoundException('Migration target category not found');
            }
            await this.prisma.transaction.updateMany({
                where: { userId, categoryId: id },
                data: { categoryId: migrateToId },
            });
        }
        await this.prisma.category.delete({ where: { id } });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map