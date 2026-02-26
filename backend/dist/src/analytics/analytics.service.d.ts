import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMonthlySummary(userId: string, year: number, month: number): Promise<{
        year: number;
        month: number;
        totalSpend: number;
        totalRevenue: number;
        savings: number;
        byCategory: {
            id: string;
            name: string;
            total: number;
            budget: number;
        }[];
    }>;
}
