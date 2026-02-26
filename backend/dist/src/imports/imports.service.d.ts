import { PrismaService } from '../prisma/prisma.service';
export interface ImportResult {
    jobId: string;
    imported: number;
    skipped: number;
    errors: number;
    message?: string;
}
export declare class ImportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    importFromCsv(userId: string, accountId: string, filename: string, buffer: Buffer): Promise<ImportResult>;
    listJobs(userId: string): Promise<({
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
