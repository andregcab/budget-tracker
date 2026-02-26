import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  let service: AccountsService;
  const mockPrisma = {
    account: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AccountsService>(AccountsService);
  });

  it('create calls prisma with userId', async () => {
    mockPrisma.account.create.mockResolvedValue({
      id: 'acc-1',
      userId: 'user-1',
      name: 'Chase',
      type: 'checking',
    });
    const result = await service.create('user-1', {
      name: 'Chase',
      type: 'checking',
    });
    expect(result.name).toBe('Chase');
    expect(mockPrisma.account.create).toHaveBeenCalledTimes(1);
    const createArg = (
      mockPrisma.account.create.mock.calls[0] as unknown[]
    )[0] as {
      data: {
        userId: string;
        name: string;
        type: string;
        institution?: string;
        isDefault: boolean;
      };
    };
    expect(createArg.data).toMatchObject({
      userId: 'user-1',
      name: 'Chase',
      type: 'checking',
      isDefault: false,
    });
  });

  it('findAll scopes by userId', async () => {
    mockPrisma.account.findMany.mockResolvedValue([]);
    await service.findAll('user-1');
    expect(mockPrisma.account.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findOne throws when account not found', async () => {
    mockPrisma.account.findFirst.mockResolvedValue(null);
    await expect(service.findOne('user-1', 'bad-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deletes after findOne', async () => {
    mockPrisma.account.findFirst.mockResolvedValue({ id: 'acc-1' });
    mockPrisma.account.delete.mockResolvedValue({ id: 'acc-1' });
    await service.remove('user-1', 'acc-1');
    expect(mockPrisma.account.delete).toHaveBeenCalledWith({
      where: { id: 'acc-1' },
    });
  });
});
