import { TransactionsService } from './transactions.service';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
type UserPayload = {
    id: string;
    email: string;
};
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(user: UserPayload, accountId?: string, categoryId?: string, fromDate?: string, toDate?: string, minAmount?: string, maxAmount?: string, page?: string, limit?: string): Promise<{
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
    update(user: UserPayload, id: string, dto: UpdateTransactionDto): Promise<{
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
    remove(user: UserPayload, id: string): Promise<void>;
    bulkDelete(user: UserPayload, body: {
        ids: string[];
    }): Promise<{
        deleted: number;
    }>;
    removeByDateRange(user: UserPayload, fromDate: string, toDate: string): Promise<{
        deleted: number;
    }>;
}
export {};
