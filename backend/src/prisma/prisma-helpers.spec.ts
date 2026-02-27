import { NotFoundException } from '@nestjs/common';
import { findOneOrThrow } from './prisma-helpers';

describe('findOneOrThrow', () => {
  it('returns value when fn returns non-null', async () => {
    const result = await findOneOrThrow(() => Promise.resolve({ id: '1' }));
    expect(result).toEqual({ id: '1' });
  });

  it('throws NotFoundException when fn returns null', async () => {
    await expect(findOneOrThrow(() => Promise.resolve(null))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('uses custom message', async () => {
    await expect(
      findOneOrThrow(() => Promise.resolve(null), 'Account not found'),
    ).rejects.toThrow('Account not found');
  });
});
