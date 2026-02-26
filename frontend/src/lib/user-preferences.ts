const STORAGE_KEY = "budget-tracker-preferences";

const DEFAULT_TRANSACTIONS_PER_PAGE = 25;
const VALID_LIMITS = [25, 50, 100] as const;

export type TransactionsPerPage = (typeof VALID_LIMITS)[number];

export const SPENDING_CHART_TYPES = ['bar', 'pie'] as const;
export type SpendingChartType = (typeof SPENDING_CHART_TYPES)[number];

const DEFAULT_SPENDING_CHART_TYPE: SpendingChartType = 'bar';

function getStoredPreferences(): Record<string, unknown> {
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

function setStoredPreferences(prefs: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function getTransactionsPerPage(): TransactionsPerPage {
  const prefs = getStoredPreferences();
  const val = prefs.transactionsPerPage;
  if (typeof val === "number" && VALID_LIMITS.includes(val as TransactionsPerPage)) {
    return val as TransactionsPerPage;
  }
  return DEFAULT_TRANSACTIONS_PER_PAGE;
}

export function setTransactionsPerPage(limit: TransactionsPerPage) {
  const prefs = getStoredPreferences();
  prefs.transactionsPerPage = limit;
  setStoredPreferences(prefs);
}

export function getSpendingChartType(): SpendingChartType {
  const prefs = getStoredPreferences();
  const val = prefs.spendingChartType;
  if (typeof val === 'string' && SPENDING_CHART_TYPES.includes(val as SpendingChartType)) {
    return val as SpendingChartType;
  }
  return DEFAULT_SPENDING_CHART_TYPE;
}

export function setSpendingChartType(type: SpendingChartType) {
  const prefs = getStoredPreferences();
  prefs.spendingChartType = type;
  setStoredPreferences(prefs);
}
