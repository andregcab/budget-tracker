import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
export declare class AccountsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateAccountDto): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
    findAll(userId: string): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }[]>;
    findOne(userId: string, id: string): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
    update(userId: string, id: string, dto: UpdateAccountDto): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
    remove(userId: string, id: string): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
}
