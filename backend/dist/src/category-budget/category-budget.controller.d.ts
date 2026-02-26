import { CategoryBudgetService } from './category-budget.service';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
type UserPayload = {
    id: string;
    email: string;
};
export declare class CategoryBudgetController {
    private readonly categoryBudgetService;
    constructor(categoryBudgetService: CategoryBudgetService);
    findAll(user: UserPayload): Promise<{
        categoryId: string;
        categoryName: string;
        amount: number;
    }[]>;
    upsert(user: UserPayload, dto: UpsertBudgetDto): Promise<{
        categoryId: string;
        categoryName: string;
        amount: number;
    }>;
    remove(user: UserPayload, categoryId: string): Promise<void>;
}
export {};
