import { describe, it, expect } from 'vitest';
import { collapseForPie, polarToCartesian } from './chart-utils';

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

describe('collapseForPie', () => {
  it('returns all when under threshold', () => {
    const data = [
      { name: 'A', total: 100 },
      { name: 'B', total: 50 },
    ];
    expect(collapseForPie(data)).toHaveLength(2);
    expect(collapseForPie(data)[0].name).toBe('A');
  });

  it('collapses smallest into Other when over threshold', () => {
    const data = [
      { name: 'A', total: 100 },
      { name: 'B', total: 80 },
      { name: 'C', total: 60 },
      { name: 'D', total: 40 },
      { name: 'E', total: 30 },
      { name: 'F', total: 20 },
      { name: 'G', total: 10 },
    ];
    const result = collapseForPie(data);
    expect(result).toHaveLength(7);
    expect(result[6].name).toBe('Other');
    expect(result[6].total).toBe(10);
    expect((result[6] as { _otherCategories?: unknown[] })._otherCategories).toHaveLength(1);
  });

  it('sorts by total descending before collapsing', () => {
    const data = [
      { name: 'Small', total: 5 },
      { name: 'Big', total: 95 },
      { name: 'Med', total: 50 },
      { name: 'Tiny', total: 1 },
      { name: 'X', total: 10 },
      { name: 'Y', total: 20 },
      { name: 'Z', total: 15 },
    ];
    const result = collapseForPie(data, 4);
    expect(result.map((c) => c.name)).toEqual(['Big', 'Med', 'Y', 'Z', 'Other']);
    expect(result[4].total).toBe(5 + 1 + 10); // Small + Tiny + X
  });
});
