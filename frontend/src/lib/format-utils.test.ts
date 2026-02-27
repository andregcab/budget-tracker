import { describe, it, expect } from 'vitest';
import { parseKeywords } from './format-utils';

describe('parseKeywords', () => {
  it('splits by comma', () => {
    expect(parseKeywords('a, b, c')).toEqual(['a', 'b', 'c']);
  });

  it('splits by semicolon', () => {
    expect(parseKeywords('a; b; c')).toEqual(['a', 'b', 'c']);
  });

  it('trims whitespace', () => {
    expect(parseKeywords('  foo  ,  bar  ')).toEqual(['foo', 'bar']);
  });

  it('filters empty strings', () => {
    expect(parseKeywords('a,,b')).toEqual(['a', 'b']);
    expect(parseKeywords('a; ;b')).toEqual(['a', 'b']);
  });

  it('returns empty array for empty string', () => {
    expect(parseKeywords('')).toEqual([]);
  });
});
