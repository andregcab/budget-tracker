import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates user and returns token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        passwordHash: 'hashed',
      });

      const result = await service.register('a@b.com', 'password123');
      expect(result.user).toEqual({ id: 'user-1', email: 'a@b.com' });
      expect(result.token).toBe('mock-token');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: 'a@b.com', passwordHash: 'hashed' },
      });
    });

    it('throws ConflictException if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register('a@b.com', 'password123')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns user and token when password is valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('a@b.com', 'password123');
      expect(result.user).toEqual({ id: 'user-1', email: 'a@b.com' });
      expect(result.token).toBe('mock-token');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('a@b.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        passwordHash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('me', () => {
    it('returns user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
      });
      const result = await service.me('user-1');
      expect(result).toEqual({ id: 'user-1', email: 'a@b.com' });
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.me('missing')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
