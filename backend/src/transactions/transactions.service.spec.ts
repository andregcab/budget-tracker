import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  const mockPrisma = {
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<TransactionsService>(TransactionsService);
  });

  it('findAll applies userId and pagination', async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);
    await service.findAll('user-1', { page: 2, limit: 10 });
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        skip: 10,
        take: 10,
      }),
    );
  });

  it('findAll filters by accountId and date range', async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.transaction.count.mockResolvedValue(0);
    await service.findAll('user-1', {
      accountId: 'acc-1',
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
    });
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          accountId: 'acc-1',
          date: { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') },
        },
      }),
    );
  });

  it('update throws when transaction not found', async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue(null);
    await expect(
      service.update('user-1', 'tx-1', { notes: 'test' }),
    ).rejects.toThrow(NotFoundException);
  });
});
