export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validates email. Returns error message or null if valid.
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email))
    return 'Please enter a valid email address';
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
