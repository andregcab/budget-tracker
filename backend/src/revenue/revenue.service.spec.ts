import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RevenueService } from './revenue.service';

describe('RevenueService', () => {
  let service: RevenueService;

  const mockPrisma = {
    revenue: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    additionalIncome: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<RevenueService>(RevenueService);
  });

  describe('getForMonth', () => {
    it('returns null when no revenue', async () => {
      mockPrisma.revenue.findUnique.mockResolvedValue(null);
      const result = await service.getForMonth('user-1', 2025, 2);
      expect(result).toBeNull();
    });

    it('returns amount when revenue exists', async () => {
      mockPrisma.revenue.findUnique.mockResolvedValue({
        amount: 5000,
      });
      const result = await service.getForMonth('user-1', 2025, 2);
      expect(result).toEqual({ amount: 5000 });
    });
  });

  describe('upsert', () => {
    it('creates or updates revenue', async () => {
      mockPrisma.revenue.upsert.mockResolvedValue({
        amount: 6000,
      });
      const result = await service.upsert('user-1', {
        year: 2025,
        month: 2,
        amount: 6000,
      });
      expect(result).toEqual({ amount: 6000 });
      expect(mockPrisma.revenue.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_year_month: { userId: 'user-1', year: 2025, month: 2 },
          },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Jest expect.objectContaining returns any in nested matchers
          create: expect.objectContaining({ amount: 6000 }),
          update: { amount: 6000 },
        }),
      );
    });
  });

  describe('remove', () => {
    it('deletes revenue for month', async () => {
      mockPrisma.revenue.deleteMany.mockResolvedValue({ count: 1 });
      await service.remove('user-1', 2025, 2);
      expect(mockPrisma.revenue.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', year: 2025, month: 2 },
      });
    });
  });
});
