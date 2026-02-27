import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { TransactionRow } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';

type DeleteTransactionDialogProps = {
  target: TransactionRow | null;
  onClose: () => void;
  deleteMutation: UseMutationResult<
    unknown,
    Error,
    string,
    unknown
  >;
};

export function DeleteTransactionDialog({
  target,
  onClose,
  deleteMutation,
}: DeleteTransactionDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-destructive/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete transaction
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Delete &quot;{target?.description}&quot;? This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (target) {
                deleteMutation.mutate(target.id, { onSuccess: onClose });
              }
            }}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
