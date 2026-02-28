import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/api/accounts';
import { toast } from 'sonner';
import { getMutationErrorMessage } from '@/lib/error-utils';

export function useAccountMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (err) => {
      toast.error(
        getMutationErrorMessage(err, 'Failed to create account'),
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
        getMutationErrorMessage(err, 'Failed to update account'),
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
        getMutationErrorMessage(err, 'Failed to delete account'),
      );
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
