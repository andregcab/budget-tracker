import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  EMAIL_REGEX,
  PASSWORD_REGEX,
} from './validation';

describe('validateEmail', () => {
  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('returns error for invalid email formats', () => {
    expect(validateEmail('invalid')).toBe(
      'Please enter a valid email address',
    );
    expect(validateEmail('missing@domain')).toBe(
      'Please enter a valid email address',
    );
    expect(validateEmail('@nodomain.com')).toBe(
      'Please enter a valid email address',
    );
    expect(validateEmail('noatsign.com')).toBe(
      'Please enter a valid email address',
    );
  });

  it('returns null for valid emails', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('test.user@domain.co')).toBeNull();
    expect(validateEmail('a@b.co')).toBeNull();
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

describe('EMAIL_REGEX', () => {
  it('matches valid email patterns', () => {
    expect(EMAIL_REGEX.test('a@b.co')).toBe(true);
    expect(EMAIL_REGEX.test('user@example.com')).toBe(true);
  });

  it('rejects invalid patterns', () => {
    expect(EMAIL_REGEX.test('')).toBe(false);
    expect(EMAIL_REGEX.test('no-at')).toBe(false);
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
