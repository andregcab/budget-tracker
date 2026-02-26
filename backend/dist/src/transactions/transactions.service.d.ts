import { PrismaService } from '../prisma/prisma.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export interface TransactionFilters {
    accountId?: string;
    categoryId?: string;
    fromDate?: string;
    toDate?: string;
    minAmount?: string;
    maxAmount?: string;
    page?: number;
    limit?: number;
}
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, filters: TransactionFilters): Promise<{
        items: {
            amount: string;
            balanceAfter: string | null;
            category: {
                id: string;
                name: string;
            } | null;
            id: string;
            userId: string;
            accountId: string;
            date: Date;
            description: string;
            type: string;
            categoryId: string | null;
            notes: string | null;
            externalId: string | null;
            isExcluded: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    remove(userId: string, id: string): Promise<void>;
    removeMany(userId: string, ids: string[]): Promise<{
        deleted: number;
    }>;
    removeByDateRange(userId: string, fromDate: string, toDate: string): Promise<{
        deleted: number;
    }>;
    update(userId: string, id: string, dto: UpdateTransactionDto): Promise<{
        amount: string;
        balanceAfter: string | null;
        category: {
            id: string;
            name: string;
        } | null;
        id: string;
        userId: string;
        accountId: string;
        date: Date;
        description: string;
        type: string;
        categoryId: string | null;
        notes: string | null;
        externalId: string | null;
        isExcluded: boolean;
        createdAt: Date;
    }>;
}
