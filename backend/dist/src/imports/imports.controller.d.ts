import { ImportsService } from './imports.service';
type UserPayload = {
    id: string;
    email: string;
};
export declare class ImportsController {
    private readonly importsService;
    constructor(importsService: ImportsService);
    upload(user: UserPayload, file: {
        buffer?: Buffer;
        originalname?: string;
    }, accountId: string): Promise<import("./imports.service").ImportResult | {
        error: string;
    }>;
    list(user: UserPayload): Promise<({
        account: {
            name: string;
            id: string;
        };
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        accountId: string;
        filename: string;
        status: string;
        summary: import("@prisma/client/runtime/client").JsonValue | null;
        completedAt: Date | null;
    })[]>;
}
export {};
