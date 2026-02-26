import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
type UserPayload = {
    id: string;
    email: string;
};
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    create(user: UserPayload, dto: CreateAccountDto): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
    findAll(user: UserPayload): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }[]>;
    findOne(user: UserPayload, id: string): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
    update(user: UserPayload, id: string, dto: UpdateAccountDto): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
    remove(user: UserPayload, id: string): Promise<{
        userId: string;
        name: string;
        type: string;
        institution: string | null;
        isDefault: boolean;
        id: string;
        createdAt: Date;
    }>;
}
export {};
