import { Prisma } from '@prisma/client';
import { fromDecimal, toDecimal } from './decimal-utils';

describe('fromDecimal', () => {
  it('converts Decimal to number', () => {
    expect(fromDecimal(new Prisma.Decimal(42.5))).toBe(42.5);
  });

  it('returns null for null', () => {
    expect(fromDecimal(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(fromDecimal(undefined)).toBeNull();
  });
});

describe('toDecimal', () => {
  it('converts number to Prisma Decimal', () => {
    const d = toDecimal(100.5);
    expect(d).toBeInstanceOf(Prisma.Decimal);
    expect(Number(d)).toBe(100.5);
  });
});
