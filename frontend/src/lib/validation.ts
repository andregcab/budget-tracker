/** Username: letters, numbers, and . _ @ + - (so email can be used as username) */
export const USERNAME_REGEX = /^[a-zA-Z0-9._@+-]+$/;

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validates username. Returns error message or null if valid.
 */
export function validateUsername(username: string): string | null {
  if (!username.trim()) return 'Username is required';
  if (!USERNAME_REGEX.test(username))
    return 'Username can only contain letters, numbers, and . _ @ + -';
  return null;
}

/**
 * Validates password strength. Returns error message or null if valid.
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8)
    return 'Password must be at least 8 characters';
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  return null;
}
