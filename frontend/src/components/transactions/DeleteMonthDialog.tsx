import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getMonthRange } from '@/api/transactions';
import type { UseMutationResult } from '@tanstack/react-query';

type DeleteMonthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteMonthMutation: UseMutationResult<
    unknown,
    Error,
    { from: string; to: string },
    unknown
  >;
};

export function DeleteMonthDialog({
  open,
  onOpenChange,
  deleteMonthMutation,
}: DeleteMonthDialogProps) {
  const handleDelete = () => {
    const { from, to } = getMonthRange();
    deleteMonthMutation.mutate(
      { from, to },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-destructive/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete all for this month
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Delete all transactions in{' '}
          {new Date().toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
          ? This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMonthMutation.isPending}
          >
            Delete all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
