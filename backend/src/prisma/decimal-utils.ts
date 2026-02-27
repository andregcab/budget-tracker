import { Prisma } from '@prisma/client';

/**
 * Converts a Prisma Decimal to number. Returns null for null/undefined.
 */
export function fromDecimal(
  value: Prisma.Decimal | null | undefined,
): number | null {
  if (value == null) return null;
  return Number(value);
}

/**
 * Converts a number to Prisma Decimal for use in queries/mutations.
 */
export function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}
