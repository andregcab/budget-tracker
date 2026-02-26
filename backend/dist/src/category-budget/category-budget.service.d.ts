import { PrismaService } from '../prisma/prisma.service';
export declare class CategoryBudgetService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        categoryId: string;
        categoryName: string;
        amount: number;
    }[]>;
    upsert(userId: string, categoryId: string, amount: number): Promise<{
        categoryId: string;
        categoryName: string;
        amount: number;
    }>;
    remove(userId: string, categoryId: string): Promise<void>;
}
