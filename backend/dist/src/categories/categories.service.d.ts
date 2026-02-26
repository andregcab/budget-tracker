import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllActive(userId: string): Promise<{
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }[]>;
    private createDefaultCategoriesForUser;
    create(userId: string, dto: CreateCategoryDto): Promise<{
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }>;
    update(userId: string, id: string, dto: UpdateCategoryDto): Promise<{
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }>;
    findOneWithCount(userId: string, id: string): Promise<{
        transactionCount: number;
        userId: string | null;
        name: string;
        isDefault: boolean;
        id: string;
        createdAt: Date;
        isActive: boolean;
    }>;
    remove(userId: string, id: string, migrateToId?: string): Promise<void>;
}
