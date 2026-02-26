import { PrismaService } from '../prisma/prisma.service';
import { UpsertRevenueDto } from './dto/upsert-revenue.dto';
export declare class RevenueService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getForMonth(userId: string, year: number, month: number): Promise<{
        amount: number;
    } | null>;
    upsert(userId: string, dto: UpsertRevenueDto): Promise<{
        amount: number;
    }>;
    remove(userId: string, year: number, month: number): Promise<void>;
}
