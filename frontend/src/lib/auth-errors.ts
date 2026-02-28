/** User-facing messages we want to show as-is from the API */
const KNOWN_AUTH_MESSAGES = [
  'Email already registered',
  'Invalid email or password',
] as const;

const GENERIC_AUTH_ERROR =
  "Oops, the numbers didn't add up—something went wrong. Please try again.";

/**
 * Returns a user-friendly error message for auth flows.
 * Uses the API message when it's one we recognize; otherwise a budget-themed generic.
 */
export function getAuthErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : '';
  if (!message) return GENERIC_AUTH_ERROR;
  if (KNOWN_AUTH_MESSAGES.some((known) => message === known)) return message;
  // Technical or unknown: show generic
  if (/^HTTP \d{3}/.test(message) || /failed to fetch|network error/i.test(message)) {
    return GENERIC_AUTH_ERROR;
  }
  return GENERIC_AUTH_ERROR;
}
