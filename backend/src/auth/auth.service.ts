import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_CATEGORIES } from '../categories/default-categories';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        categories: {
          create: DEFAULT_CATEGORIES.map((c) => ({
            name: c.name,
            isDefault: true,
            isActive: true,
            isFixed: c.isFixed,
            keywords: c.keywords,
          })),
        },
      },
      select: { id: true, email: true, monthlyIncome: true },
    });
    const token = this.jwtService.sign({ sub: user.id });
    return {
      user: {
        id: user.id,
        email: user.email,
        monthlyIncome:
          user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        monthlyIncome: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.jwtService.sign({ sub: user.id });
    return {
      user: {
        id: user.id,
        email: user.email,
        monthlyIncome:
          user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
      },
      token,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, monthlyIncome: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      monthlyIncome:
        user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async updateMe(userId: string, dto: { monthlyIncome?: number }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.monthlyIncome !== undefined && {
          monthlyIncome: dto.monthlyIncome,
        }),
      },
      select: { id: true, email: true, monthlyIncome: true },
    });
    return {
      id: user.id,
      email: user.email,
      monthlyIncome:
        user.monthlyIncome != null ? Number(user.monthlyIncome) : null,
    };
  }
}
