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
exports.RevenueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RevenueService = class RevenueService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getForMonth(userId, year, month) {
        const revenue = await this.prisma.revenue.findUnique({
            where: {
                userId_year_month: { userId, year, month },
            },
        });
        return revenue ? { amount: Number(revenue.amount) } : null;
    }
    async upsert(userId, dto) {
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
    async remove(userId, year, month) {
        await this.prisma.revenue.deleteMany({
            where: { userId, year, month },
        });
    }
};
exports.RevenueService = RevenueService;
exports.RevenueService = RevenueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RevenueService);
//# sourceMappingURL=revenue.service.js.map