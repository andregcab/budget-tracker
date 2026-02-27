import { Prisma } from '@prisma/client';

/**
 * Converts a Prisma Decimal to string for JSON serialization. Returns null for null/undefined.
 * Accepts unknown to avoid type-resolution issues with Prisma client generics.
 */
export function decimalToString(value: unknown): string | null {
  if (value == null) return null;
  // Prisma Decimal and objects with toString stringify correctly
  if (typeof value === 'object') {
    return (value as { toString: () => string }).toString();
  }
  // Primitives: number, string, boolean, bigint, symbol
  const prim = value as string | number | boolean | bigint;
  return String(prim);
}

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
