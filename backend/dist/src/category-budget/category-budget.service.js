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
exports.CategoryBudgetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoryBudgetService = class CategoryBudgetService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
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
    async upsert(userId, categoryId, amount) {
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
    async remove(userId, categoryId) {
        await this.prisma.categoryBudget.deleteMany({
            where: { userId, categoryId },
        });
    }
};
exports.CategoryBudgetService = CategoryBudgetService;
exports.CategoryBudgetService = CategoryBudgetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoryBudgetService);
//# sourceMappingURL=category-budget.service.js.map