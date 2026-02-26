import { AnalyticsService } from './analytics.service';
type UserPayload = {
    id: string;
    email: string;
};
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    monthly(user: UserPayload, year?: string, month?: string): Promise<{
        year: number;
        month: number;
        totalSpend: number;
        totalRevenue: number;
        savings: number;
        byCategory: {
            id: string;
            name: string;
            total: number;
            budget: number;
        }[];
    }>;
}
export {};
