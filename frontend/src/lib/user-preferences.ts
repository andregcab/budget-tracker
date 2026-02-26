const STORAGE_KEY = "budget-tracker-preferences";

const DEFAULT_TRANSACTIONS_PER_PAGE = 25;
const VALID_LIMITS = [25, 50, 100] as const;

export type TransactionsPerPage = (typeof VALID_LIMITS)[number];

export const SPENDING_CHART_TYPES = ['bar', 'pie'] as const;
export type SpendingChartType = (typeof SPENDING_CHART_TYPES)[number];

const DEFAULT_SPENDING_CHART_TYPE: SpendingChartType = 'bar';

type UserPrefs = {
  transactionsPerPage?: number;
  spendingChartType?: string;
  gettingStartedDismissed?: boolean;
  gettingStartedConfettiShown?: boolean;
};

function getAllPreferences(): Record<string, UserPrefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function setUserPrefs(userId: string, updater: (prefs: UserPrefs) => void) {
  if (typeof window === "undefined") return;
  try {
    const all = getAllPreferences();
    const user = (all[userId] ?? {}) as UserPrefs;
    updater(user);
    all[userId] = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function getUserPrefs(userId: string | null | undefined): UserPrefs {
  if (!userId) return {};
  return (getAllPreferences()[userId] ?? {}) as UserPrefs;
}

export function getTransactionsPerPage(userId: string | null | undefined): TransactionsPerPage {
  const prefs = getUserPrefs(userId);
  const val = prefs.transactionsPerPage;
  if (typeof val === "number" && VALID_LIMITS.includes(val as TransactionsPerPage)) {
    return val as TransactionsPerPage;
  }
  return DEFAULT_TRANSACTIONS_PER_PAGE;
}

export function setTransactionsPerPage(
  userId: string | null | undefined,
  limit: TransactionsPerPage,
) {
  if (!userId) return;
  setUserPrefs(userId, (p) => {
    p.transactionsPerPage = limit;
  });
}

export function getSpendingChartType(userId: string | null | undefined): SpendingChartType {
  const prefs = getUserPrefs(userId);
  const val = prefs.spendingChartType;
  if (typeof val === 'string' && SPENDING_CHART_TYPES.includes(val as SpendingChartType)) {
    return val as SpendingChartType;
  }
  return DEFAULT_SPENDING_CHART_TYPE;
}

export function setSpendingChartType(
  userId: string | null | undefined,
  type: SpendingChartType,
) {
  if (!userId) return;
  setUserPrefs(userId, (p) => {
    p.spendingChartType = type;
  });
}

export function getGettingStartedDismissed(userId: string | null | undefined): boolean {
  return getUserPrefs(userId).gettingStartedDismissed === true;
}

export function setGettingStartedDismissed(
  userId: string | null | undefined,
  dismissed: boolean,
) {
  if (!userId) return;
  setUserPrefs(userId, (p) => {
    p.gettingStartedDismissed = dismissed;
  });
}

export function getGettingStartedConfettiShown(userId: string | null | undefined): boolean {
  return getUserPrefs(userId).gettingStartedConfettiShown === true;
}

export function setGettingStartedConfettiShown(
  userId: string | null | undefined,
  shown: boolean,
) {
  if (!userId) return;
  setUserPrefs(userId, (p) => {
    p.gettingStartedConfettiShown = shown;
  });
}
