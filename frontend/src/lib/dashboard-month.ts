/**
 * Resolves the initial dashboard year/month from stored preferences.
 * If nothing is stored or the user has "entered" a new calendar month, returns current.
 */
export function getInitialMonth(
  prefs: {
    dashboardMonth: { year: number; month: number } | null;
    dashboardSelectionIsFromPreviousMonth: () => boolean;
  },
  currentYear: number,
  currentMonth: number,
): { year: number; month: number } {
  const stored = prefs.dashboardMonth;

  if (!stored) return { year: currentYear, month: currentMonth };
  if (prefs.dashboardSelectionIsFromPreviousMonth()) {
    return { year: currentYear, month: currentMonth };
  }

  return { year: stored.year, month: stored.month };
}
