/**
 * Returns a user-facing error message for mutation/request failures.
 * Uses the error message when it's an Error instance; otherwise the fallback.
 */
export function getMutationErrorMessage(
  err: unknown,
  fallback: string,
): string {
  return err instanceof Error ? err.message : fallback;
}
