import { api } from '@/api/client';
import type { TransactionRow, TransactionsResponse } from '@/types';

export async function getTransactions(params: {
  accountId?: string;
  categoryId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}): Promise<TransactionsResponse> {
  const sp = new URLSearchParams();
  if (params.accountId) sp.set('accountId', params.accountId);
  if (params.categoryId) sp.set('categoryId', params.categoryId);
  if (params.fromDate) sp.set('fromDate', params.fromDate);
  if (params.toDate) sp.set('toDate', params.toDate);
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  return api<TransactionsResponse>(`/transactions?${sp}`);
}

export async function updateTransaction(
  id: string,
  body: {
    categoryId?: string | null;
    notes?: string | null;
    isExcluded?: boolean;
    amount?: number;
    myShare?: number | null;
  },
) {
  return api<TransactionRow>(`/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteTransaction(id: string) {
  return api(`/transactions/${id}`, { method: 'DELETE' });
}

export async function createTransaction(body: {
  accountId: string;
  date: string;
  description: string;
  amount: number;
  myShare?: number;
  type: 'debit' | 'credit';
  categoryId?: string | null;
  notes?: string | null;
}) {
  return api<TransactionRow>('/transactions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function deleteTransactionsByDateRange(
  fromDate: string,
  toDate: string,
) {
  return api<{ deleted: number }>(
    `/transactions?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`,
    { method: 'DELETE' },
  );
}

/** Returns the current month's date range in YYYY-MM-DD format */
export function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate().toString().padStart(2, '0')}`,
  };
}
