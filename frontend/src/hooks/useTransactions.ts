import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions, getMonthRangeFor } from '@/api/transactions';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export function useTransactions(userId: string | undefined) {
  const {
    transactionsPerPage: limit,
    setTransactionsPerPage,
    dashboardMonth,
  } = useUserPreferences();

  const [accountId, setAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!userId || fromDate || toDate || !dashboardMonth) return;
    const { from, to } = getMonthRangeFor(dashboardMonth.year, dashboardMonth.month);
    queueMicrotask(() => {
      setFromDate(from);
      setToDate(to);
    });
  }, [userId, fromDate, toDate, dashboardMonth]);

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
    setTransactionsPerPage(next);
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
