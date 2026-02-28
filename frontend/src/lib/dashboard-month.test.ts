import { describe, it, expect } from 'vitest';
import { getInitialMonth } from './dashboard-month';

describe('getInitialMonth', () => {
  const currentYear = 2025;
  const currentMonth = 6;

  it('returns current year/month when no stored preference', () => {
    const result = getInitialMonth(
      {
        dashboardMonth: null,
        dashboardSelectionIsFromPreviousMonth: () => false,
      },
      currentYear,
      currentMonth,
    );
    expect(result).toEqual({ year: 2025, month: 6 });
  });

  it('returns current year/month when selection is from previous month', () => {
    const result = getInitialMonth(
      {
        dashboardMonth: { year: 2025, month: 3 },
        dashboardSelectionIsFromPreviousMonth: () => true,
      },
      currentYear,
      currentMonth,
    );
    expect(result).toEqual({ year: 2025, month: 6 });
  });

  it('returns stored month when selection is not from previous month', () => {
    const result = getInitialMonth(
      {
        dashboardMonth: { year: 2025, month: 3 },
        dashboardSelectionIsFromPreviousMonth: () => false,
      },
      currentYear,
      currentMonth,
    );
    expect(result).toEqual({ year: 2025, month: 3 });
  });

  it('returns stored year when different from current', () => {
    const result = getInitialMonth(
      {
        dashboardMonth: { year: 2024, month: 12 },
        dashboardSelectionIsFromPreviousMonth: () => false,
      },
      currentYear,
      currentMonth,
    );
    expect(result).toEqual({ year: 2024, month: 12 });
  });
});
