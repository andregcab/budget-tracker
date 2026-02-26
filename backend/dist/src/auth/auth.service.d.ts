import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            monthlyIncome: number | null;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            monthlyIncome: number | null;
        };
        token: string;
    }>;
    me(userId: string): Promise<{
        id: string;
        email: string;
        monthlyIncome: number | null;
    }>;
    updateMe(userId: string, dto: {
        monthlyIncome?: number;
    }): Promise<{
        id: string;
        email: string;
        monthlyIncome: number | null;
    }>;
}
