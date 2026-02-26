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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, filters) {
        const where = { userId };
        if (filters.accountId)
            where.accountId = filters.accountId;
        if (filters.categoryId)
            where.categoryId = filters.categoryId;
        if (filters.fromDate || filters.toDate) {
            where.date = {};
            if (filters.fromDate)
                where.date.gte = new Date(filters.fromDate);
            if (filters.toDate)
                where.date.lte = new Date(filters.toDate);
        }
        if (filters.minAmount != null || filters.maxAmount != null) {
            where.amount = {};
            if (filters.minAmount != null)
                where.amount.gte = new client_1.Prisma.Decimal(filters.minAmount);
            if (filters.maxAmount != null)
                where.amount.lte = new client_1.Prisma.Decimal(filters.maxAmount);
        }
        const page = Math.max(1, filters.page ?? 1);
        const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: { category: { select: { id: true, name: true } } },
                orderBy: { date: 'desc' },
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
    async remove(userId, id) {
        const tx = await this.prisma.transaction.findFirst({
            where: { id, userId },
        });
        if (!tx) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        await this.prisma.transaction.delete({ where: { id } });
    }
    async removeMany(userId, ids) {
        const result = await this.prisma.transaction.deleteMany({
            where: { id: { in: ids }, userId },
        });
        return { deleted: result.count };
    }
    async removeByDateRange(userId, fromDate, toDate) {
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
    async update(userId, id, dto) {
        const tx = await this.prisma.transaction.findFirst({
            where: { id, userId },
        });
        if (!tx) {
            throw new common_1.NotFoundException('Transaction not found');
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
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map