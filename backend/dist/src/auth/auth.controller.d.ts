import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateMeDto } from './dto/update-me.dto';
type UserPayload = {
    id: string;
    email: string;
};
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            monthlyIncome: number | null;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            monthlyIncome: number | null;
        };
        token: string;
    }>;
    me(user: UserPayload): Promise<{
        id: string;
        email: string;
        monthlyIncome: number | null;
    }>;
    updateMe(user: UserPayload, dto: UpdateMeDto): Promise<{
        id: string;
        email: string;
        monthlyIncome: number | null;
    }>;
}
export {};
