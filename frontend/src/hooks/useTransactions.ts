import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getTransactions,
  getMonthRangeFor,
} from '@/api/transactions';
import {
  getDashboardMonth,
  getTransactionsPerPage,
  setTransactionsPerPage,
} from '@/lib/user-preferences';

export function useTransactions(userId: string | undefined) {
  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    if (!userId) return;
    const stored = getTransactionsPerPage(userId);
    queueMicrotask(() => setLimit(stored));
  }, [userId]);

  useEffect(() => {
    if (!userId || fromDate || toDate) return;
    const stored = getDashboardMonth(userId);
    if (!stored) return;
    const { from, to } = getMonthRangeFor(stored.year, stored.month);
    setFromDate(from);
    setToDate(to);
  }, [userId, fromDate, toDate]);

  const { data, isLoading } = useQuery({
    queryKey: [
      'transactions',
      accountId,
      categoryId,
      fromDate,
      toDate,
      page,
      limit,
    ],
    queryFn: () =>
      getTransactions({
        accountId: accountId || undefined,
        categoryId: categoryId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit,
      }),
  });

  const handleLimitChange = (next: 25 | 50 | 100) => {
    setLimit(next);
    if (userId) setTransactionsPerPage(userId, next);
    setPage(1);
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    accountId,
    setAccountId,
    categoryId,
    setCategoryId,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    page,
    setPage,
    limit,
    setLimit: handleLimitChange,
    isLoading,
    items,
    total,
    totalPages,
  };
}
