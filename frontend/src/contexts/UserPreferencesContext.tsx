import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  dashboardSelectionIsFromPreviousMonth,
  getDashboardMonth,
  getGettingStartedConfettiShown,
  getGettingStartedDismissed,
  getSpendingChartType,
  getTransactionsPerPage,
  setDashboardMonth,
  setGettingStartedConfettiShown,
  setGettingStartedDismissed,
  setSpendingChartType,
  setTransactionsPerPage,
} from '@/lib/user-preferences';
import type {
  SpendingChartType,
  TransactionsPerPage,
} from '@/lib/user-preferences';
import {
  UserPreferencesContext,
  type UserPreferencesContextValue,
  type UserPreferencesState,
} from '@/contexts/user-preferences-context';

function readPrefs(userId: string): UserPreferencesState {
  return {
    transactionsPerPage: getTransactionsPerPage(userId),
    dashboardMonth: getDashboardMonth(userId),
    spendingChartType: getSpendingChartType(userId),
    gettingStartedDismissed: getGettingStartedDismissed(userId),
    gettingStartedConfettiShown: getGettingStartedConfettiShown(userId),
  };
}

function getDefaultPrefs(): UserPreferencesState {
  return {
    transactionsPerPage: 25,
    dashboardMonth: null,
    spendingChartType: 'bar',
    gettingStartedDismissed: false,
    gettingStartedConfettiShown: false,
  };
}

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [prefs, setPrefs] = useState<UserPreferencesState>(() =>
    userId ? readPrefs(userId) : getDefaultPrefs(),
  );

  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => setPrefs(getDefaultPrefs()));
      return;
    }
    queueMicrotask(() => setPrefs(readPrefs(userId)));
  }, [userId]);

  const setTransactionsPerPagePref = useCallback(
    (limit: TransactionsPerPage) => {
      if (!userId) return;
      setTransactionsPerPage(userId, limit);
      setPrefs((p) => ({ ...p, transactionsPerPage: limit }));
    },
    [userId],
  );

  const setDashboardMonthPref = useCallback(
    (year: number, month: number) => {
      if (!userId) return;
      setDashboardMonth(userId, year, month);
      setPrefs((p) => ({
        ...p,
        dashboardMonth: { year, month, lastSelectedAt: Date.now() },
      }));
    },
    [userId],
  );

  const dashboardSelectionIsFromPreviousMonthFn = useCallback(() => {
    return dashboardSelectionIsFromPreviousMonth(userId);
  }, [userId]);

  const setSpendingChartTypePref = useCallback(
    (type: SpendingChartType) => {
      if (!userId) return;
      setSpendingChartType(userId, type);
      setPrefs((p) => ({ ...p, spendingChartType: type }));
    },
    [userId],
  );

  const setGettingStartedDismissedPref = useCallback(
    (dismissed: boolean) => {
      if (!userId) return;
      setGettingStartedDismissed(userId, dismissed);
      setPrefs((p) => ({ ...p, gettingStartedDismissed: dismissed }));
    },
    [userId],
  );

  const setGettingStartedConfettiShownPref = useCallback(
    (shown: boolean) => {
      if (!userId) return;
      setGettingStartedConfettiShown(userId, shown);
      setPrefs((p) => ({ ...p, gettingStartedConfettiShown: shown }));
    },
    [userId],
  );

  const value: UserPreferencesContextValue = {
    ...prefs,
    setTransactionsPerPage: setTransactionsPerPagePref,
    setDashboardMonth: setDashboardMonthPref,
    dashboardSelectionIsFromPreviousMonth: dashboardSelectionIsFromPreviousMonthFn,
    setSpendingChartType: setSpendingChartTypePref,
    setGettingStartedDismissed: setGettingStartedDismissedPref,
    setGettingStartedConfettiShown: setGettingStartedConfettiShownPref,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
