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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMonthlySummary(userId, year, month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const [transactions, revenueOverride, user] = await Promise.all([
            this.prisma.transaction.findMany({
                where: {
                    userId,
                    date: { gte: start, lte: end },
                    amount: { lt: 0 },
                    isExcluded: false,
                },
                include: { category: { select: { id: true, name: true } } },
            }),
            this.prisma.revenue.findUnique({
                where: {
                    userId_year_month: { userId, year, month },
                },
            }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { monthlyIncome: true },
            }),
        ]);
        const budgets = await this.prisma.categoryBudget.findMany({
            where: { userId },
            include: { category: { select: { id: true, name: true } } },
        });
        const budgetByCategory = {};
        for (const b of budgets) {
            budgetByCategory[b.categoryId] = Number(b.amount);
        }
        const byCategory = {};
        let totalSpend = 0;
        for (const tx of transactions) {
            const amt = Number(tx.amount);
            totalSpend += Math.abs(amt);
            const key = tx.category?.id ?? 'uncategorized';
            const name = tx.category?.name ?? 'Uncategorized';
            if (!byCategory[key]) {
                byCategory[key] = {
                    name,
                    total: 0,
                    budget: budgetByCategory[key] ?? 0,
                };
            }
            byCategory[key].total += Math.abs(amt);
        }
        for (const [catId, budget] of Object.entries(budgetByCategory)) {
            if (!byCategory[catId]) {
                const cat = budgets.find((b) => b.categoryId === catId)?.category;
                byCategory[catId] = {
                    name: cat?.name ?? 'Unknown',
                    total: 0,
                    budget,
                };
            }
        }
        const totalRevenue = revenueOverride
            ? Number(revenueOverride.amount)
            : user?.monthlyIncome != null
                ? Number(user.monthlyIncome)
                : 0;
        const savings = totalRevenue - totalSpend;
        return {
            year,
            month,
            totalSpend: Math.round(totalSpend * 100) / 100,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            byCategory: Object.entries(byCategory).map(([id, { name, total, budget }]) => ({
                id,
                name,
                total: Math.round(total * 100) / 100,
                budget: Math.round(budget * 100) / 100,
            })),
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map