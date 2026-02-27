import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateTransaction,
  deleteTransaction,
  createTransaction,
  deleteTransactionsByDateRange,
} from '@/api/transactions';
import { toast } from 'sonner';

export function useTransactionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['analytics', 'monthly'] });
  };

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        categoryId?: string | null;
        notes?: string | null;
        isExcluded?: boolean;
      };
    }) => updateTransaction(id, body),
    onSuccess: invalidate,
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update transaction',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: invalidate,
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete transaction',
      );
    },
  });

  const deleteMonthMutation = useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      deleteTransactionsByDateRange(from, to),
    onSuccess: invalidate,
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete transactions',
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: invalidate,
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to add transaction',
      );
    },
  });

  return {
    updateMutation,
    deleteMutation,
    deleteMonthMutation,
    createMutation,
  };
}
