import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Category } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';

type UpdateCategoryMutation = UseMutationResult<
  unknown,
  Error,
  {
    id: string;
    body: {
      name?: string;
      isActive?: boolean;
      isFixed?: boolean;
      keywords?: string[];
    };
  },
  unknown
>;

type CategoryDeactivateDialogProps = {
  target: Category | null;
  onClose: () => void;
  updateMutation: UpdateCategoryMutation;
};

export function CategoryDeactivateDialog({
  target,
  onClose,
  updateMutation,
}: CategoryDeactivateDialogProps) {
  return (
    <Dialog open={target != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-destructive/30">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Deactivate &quot;{target?.name}&quot;?
          </DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Deactivating hides this category from dropdowns. Transactions
          keep their category. You can reactivate anytime.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (target) {
                updateMutation.mutate(
                  {
                    id: target.id,
                    body: { isActive: false },
                  },
                  { onSuccess: onClose },
                );
              }
            }}
            disabled={updateMutation.isPending}
          >
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
