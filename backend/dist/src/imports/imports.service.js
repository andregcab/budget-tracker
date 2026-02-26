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
exports.ImportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chase_csv_parser_1 = require("./chase-csv.parser");
let ImportsService = class ImportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importFromCsv(userId, accountId, filename, buffer) {
        const account = await this.prisma.account.findFirst({
            where: { id: accountId, userId },
        });
        if (!account) {
            throw new common_1.BadRequestException('Account not found');
        }
        let rows;
        try {
            rows = (0, chase_csv_parser_1.parseChaseCsv)(buffer.toString('utf-8'));
        }
        catch (e) {
            throw new common_1.BadRequestException(e instanceof Error ? e.message : 'Invalid CSV format');
        }
        const job = await this.prisma.importJob.create({
            data: {
                userId,
                accountId,
                filename,
                status: 'processing',
            },
        });
        let imported = 0;
        let skipped = 0;
        let errors = 0;
        const uncategorizedId = await this.prisma.category
            .findFirst({
            where: { name: 'Uncategorized', userId: null, isActive: true },
            select: { id: true },
        })
            .then((c) => c?.id ?? null);
        const categoryByName = new Map();
        const loadCategories = async () => {
            const list = await this.prisma.category.findMany({
                where: {
                    isActive: true,
                    OR: [{ userId: null }, { userId }],
                },
                select: { id: true, name: true },
            });
            list.forEach((c) => categoryByName.set(c.name.toLowerCase(), c.id));
        };
        await loadCategories();
        try {
            for (const row of rows) {
                const extId = (0, chase_csv_parser_1.externalId)(accountId, row);
                const existing = await this.prisma.transaction.findUnique({
                    where: { accountId_externalId: { accountId, externalId: extId } },
                });
                if (existing) {
                    skipped++;
                    continue;
                }
                let categoryId = null;
                if (row.category) {
                    categoryId =
                        categoryByName.get(row.category.toLowerCase()) ?? uncategorizedId;
                }
                else {
                    categoryId = uncategorizedId;
                }
                try {
                    await this.prisma.transaction.create({
                        data: {
                            userId,
                            accountId,
                            date: row.date,
                            description: row.description,
                            amount: row.amount,
                            type: row.type || (parseFloat(row.amount) >= 0 ? 'credit' : 'debit'),
                            balanceAfter: row.balance ? parseAmount(row.balance) : null,
                            categoryId,
                            externalId: extId,
                        },
                    });
                    imported++;
                }
                catch {
                    errors++;
                }
            }
            await this.prisma.importJob.update({
                where: { id: job.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    summary: {
                        imported,
                        skipped,
                        errors,
                        total: rows.length,
                    },
                },
            });
        }
        catch (e) {
            await this.prisma.importJob.update({
                where: { id: job.id },
                data: {
                    status: 'failed',
                    completedAt: new Date(),
                    summary: { imported, skipped, errors, total: rows.length },
                },
            });
            throw e;
        }
        return {
            jobId: job.id,
            imported,
            skipped,
            errors,
        };
    }
    async listJobs(userId) {
        return this.prisma.importJob.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                account: { select: { id: true, name: true } },
            },
        });
    }
};
exports.ImportsService = ImportsService;
exports.ImportsService = ImportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImportsService);
function parseAmount(value) {
    const cleaned = value.replace(/[$,]/g, '').trim();
    const num = parseFloat(cleaned);
    return Number.isNaN(num) ? '0' : num.toFixed(2);
}
//# sourceMappingURL=imports.service.js.map