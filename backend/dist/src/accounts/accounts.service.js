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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AccountsService = class AccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
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
    async findAll(userId) {
        return this.prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const account = await this.prisma.account.findFirst({
            where: { id, userId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    async update(userId, id, dto) {
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
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.account.delete({ where: { id } });
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map