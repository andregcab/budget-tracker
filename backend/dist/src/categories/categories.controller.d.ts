import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
type UserPayload = {
    id: string;
    email: string;
};
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(user: UserPayload): Promise<{
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }[]>;
    findOne(user: UserPayload, id: string): Promise<{
        transactionCount: number;
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }>;
    create(user: UserPayload, dto: CreateCategoryDto): Promise<{
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }>;
    update(user: UserPayload, id: string, dto: UpdateCategoryDto): Promise<{
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }>;
    remove(user: UserPayload, id: string, migrateTo?: string): Promise<void>;
}
export {};
