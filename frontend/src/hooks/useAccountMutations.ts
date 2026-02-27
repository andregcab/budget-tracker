import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/api/accounts';
import { toast } from 'sonner';

export function useAccountMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create account',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof updateAccount>[1];
    }) => updateAccount(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update account',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete account',
      );
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
