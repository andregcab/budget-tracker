import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const mockPrisma = {
    category: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('findAllActive returns active global and user categories', async () => {
    mockPrisma.category.count.mockResolvedValue(1);
    mockPrisma.category.findMany
      .mockResolvedValueOnce([]) // migrateTransactionsFromGlobalToUser: no globals
      .mockResolvedValue([
        { id: 'cat-1', name: 'Groceries', userId: 'user-1' },
      ]);
    const result = await service.findAllActive('user-1');
    expect(result).toHaveLength(1);
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isActive: true },
      orderBy: { name: 'asc' },
    });
  });

  it('create adds user-scoped category', async () => {
    mockPrisma.category.create.mockResolvedValue({
      id: 'cat-1',
      userId: 'user-1',
      name: 'Custom',
      isDefault: false,
      isActive: true,
    });
    const result = await service.create('user-1', { name: 'Custom' });
    expect(result.name).toBe('Custom');
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        name: 'Custom',
        isDefault: false,
        isActive: true,
        isFixed: false,
        keywords: [],
      },
    });
  });

  it('update throws when category not found', async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);
    await expect(
      service.update('user-1', 'bad-id', { isActive: false }),
    ).rejects.toThrow(NotFoundException);
  });
});
