import { describe, it, expect } from 'vitest';
import { getMutationErrorMessage } from './error-utils';

describe('getMutationErrorMessage', () => {
  it('returns error message when err is Error', () => {
    const err = new Error('Something failed');
    expect(getMutationErrorMessage(err, 'Fallback')).toBe(
      'Something failed',
    );
  });

  it('returns fallback when err is not an Error', () => {
    expect(getMutationErrorMessage(undefined, 'Fallback')).toBe(
      'Fallback',
    );
    expect(getMutationErrorMessage('string', 'Fallback')).toBe(
      'Fallback',
    );
    expect(getMutationErrorMessage(null, 'Fallback')).toBe(
      'Fallback',
    );
  });

  it('returns error message even when empty for Error instance', () => {
    const err = new Error('');
    expect(getMutationErrorMessage(err, 'Fallback')).toBe('');
  });
});
