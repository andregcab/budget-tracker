import { describe, it, expect } from 'vitest';
import { polarToCartesian } from './chart-utils';

describe('polarToCartesian', () => {
  it('converts angle 0 to positive x', () => {
    const result = polarToCartesian(0, 0, 10, 0);
    expect(result.x).toBeCloseTo(10);
    expect(result.y).toBeCloseTo(0);
  });

  it('converts angle 90 to positive y', () => {
    const result = polarToCartesian(0, 0, 10, 90);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(-10);
  });

  it('uses center offset', () => {
    const result = polarToCartesian(100, 50, 5, 0);
    expect(result.x).toBeCloseTo(105);
    expect(result.y).toBeCloseTo(50);
  });

  it('handles different radii', () => {
    const result = polarToCartesian(0, 0, 1, 0);
    expect(result.x).toBeCloseTo(1);
    expect(result.y).toBeCloseTo(0);
  });
});
