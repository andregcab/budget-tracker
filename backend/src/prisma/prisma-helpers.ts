import { NotFoundException } from '@nestjs/common';

/**
 * Awaits a function that returns T | null and throws NotFoundException if null.
 */
export async function findOneOrThrow<T>(
  fn: () => Promise<T | null>,
  message = 'Resource not found',
): Promise<T> {
  const result = await fn();
  if (!result) {
    throw new NotFoundException(message);
  }
  return result;
}
