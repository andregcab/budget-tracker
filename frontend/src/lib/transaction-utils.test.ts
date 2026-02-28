import { describe, it, expect } from 'vitest';
import {
  formatAmount,
  formatCurrency,
  formatSignedCurrency,
  formatTransactionAmount,
  getMyShareDisplay,
} from './transaction-utils';

describe('formatAmount', () => {
  it('returns positive amount as-is', () => {
    expect(formatAmount('123.45')).toBe('123.45');
  });

  it('formats negative amount in parentheses', () => {
    expect(formatAmount('-50.00')).toBe('(50.00)');
  });
});

describe('formatCurrency', () => {
  it('formats positive number as $X.XX', () => {
    expect(formatCurrency(123.45)).toBe('$123.45');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatSignedCurrency', () => {
  it('formats negative value as (X.XX)', () => {
    expect(formatSignedCurrency(-50.5)).toBe('(50.50)');
  });

  it('uses absolute value for display', () => {
    expect(formatSignedCurrency(-100)).toBe('(100.00)');
  });
});

describe('formatTransactionAmount', () => {
  it('returns full amount when no myShare', () => {
    expect(
      formatTransactionAmount({ amount: '100.00', myShare: null }),
    ).toBe('100.00');
  });

  it('returns my share for negative amount when myShare set', () => {
    expect(
      formatTransactionAmount({ amount: '-80.00', myShare: '40.00' }),
    ).toBe('(40.00)');
  });

  it('returns my share for positive amount when myShare set', () => {
    expect(
      formatTransactionAmount({ amount: '80.00', myShare: '40.00' }),
    ).toBe('$40.00');
  });
});

describe('getMyShareDisplay', () => {
  it('returns null myShareVal and false isHalfSplit when no myShare', () => {
    const result = getMyShareDisplay({ amount: '100', myShare: null });
    expect(result.myShareVal).toBeNull();
    expect(result.isHalfSplit).toBe(false);
  });

  it('returns myShareVal when myShare set', () => {
    const result = getMyShareDisplay({ amount: '100', myShare: '50' });
    expect(result.myShareVal).toBe(50);
  });

  it('returns isHalfSplit true when myShare is half of amount', () => {
    const result = getMyShareDisplay({ amount: '100', myShare: '50' });
    expect(result.isHalfSplit).toBe(true);
  });

  it('returns isHalfSplit false when myShare is not half', () => {
    const result = getMyShareDisplay({ amount: '100', myShare: '40' });
    expect(result.isHalfSplit).toBe(false);
  });

  it('handles negative amount for half split', () => {
    const result = getMyShareDisplay({ amount: '-80', myShare: '40' });
    expect(result.myShareVal).toBe(40);
    expect(result.isHalfSplit).toBe(true);
  });
});
