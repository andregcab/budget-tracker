import { RevenueService } from './revenue.service';
import { UpsertRevenueDto } from './dto/upsert-revenue.dto';
type UserPayload = {
    id: string;
    email: string;
};
export declare class RevenueController {
    private readonly revenueService;
    constructor(revenueService: RevenueService);
    getForMonth(user: UserPayload, year?: string, month?: string): Promise<{
        amount: number;
    } | null> | null;
    upsert(user: UserPayload, dto: UpsertRevenueDto): Promise<{
        amount: number;
    }>;
    remove(user: UserPayload, year: string, month: string): Promise<void>;
}
export {};
