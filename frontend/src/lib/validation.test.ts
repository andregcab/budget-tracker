import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validatePassword,
  USERNAME_REGEX,
  PASSWORD_REGEX,
} from './validation';

describe('validateUsername', () => {
  it('returns error for empty username', () => {
    expect(validateUsername('')).toBe('Username is required');
    expect(validateUsername('   ')).toBe('Username is required');
  });

  it('returns error for invalid characters', () => {
    expect(validateUsername('user name')).toBe(
      'Username can only contain letters, numbers, and . _ @ + -',
    );
    expect(validateUsername('bad#char')).toBe(
      'Username can only contain letters, numbers, and . _ @ + -',
    );
  });

  it('returns null for valid usernames', () => {
    expect(validateUsername('alice')).toBeNull();
    expect(validateUsername('user_123')).toBeNull();
    expect(validateUsername('a@b.com')).toBeNull();
    expect(validateUsername('user+tag')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('returns error for short password', () => {
    expect(validatePassword('Ab1')).toBe(
      'Password must be at least 8 characters',
    );
    expect(validatePassword('short')).toBe(
      'Password must be at least 8 characters',
    );
  });

  it('returns error for password without uppercase', () => {
    expect(validatePassword('lowercase1')).toBe(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    );
  });

  it('returns error for password without lowercase', () => {
    expect(validatePassword('UPPERCASE1')).toBe(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    );
  });

  it('returns error for password without number', () => {
    expect(validatePassword('NoNumbers')).toBe(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    );
  });

  it('returns null for valid passwords', () => {
    expect(validatePassword('ValidPass1')).toBeNull();
    expect(validatePassword('Abcdefg1')).toBeNull();
    expect(validatePassword('P@ssw0rd')).toBeNull();
  });
});

describe('USERNAME_REGEX', () => {
  it('matches valid username patterns', () => {
    expect(USERNAME_REGEX.test('alice')).toBe(true);
    expect(USERNAME_REGEX.test('a@b.co')).toBe(true);
    expect(USERNAME_REGEX.test('user_123')).toBe(true);
  });

  it('rejects invalid patterns', () => {
    expect(USERNAME_REGEX.test('')).toBe(false);
    expect(USERNAME_REGEX.test('user name')).toBe(false);
    expect(USERNAME_REGEX.test('bad#char')).toBe(false);
  });
});

describe('PASSWORD_REGEX', () => {
  it('matches valid password patterns', () => {
    expect(PASSWORD_REGEX.test('ValidPass1')).toBe(true);
    expect(PASSWORD_REGEX.test('Abcdefg1')).toBe(true);
  });

  it('rejects invalid patterns', () => {
    expect(PASSWORD_REGEX.test('nouppercase1')).toBe(false);
    expect(PASSWORD_REGEX.test('NOLOWERCASE1')).toBe(false);
    expect(PASSWORD_REGEX.test('NoNumbers')).toBe(false);
    expect(PASSWORD_REGEX.test('short1A')).toBe(false);
  });
});
