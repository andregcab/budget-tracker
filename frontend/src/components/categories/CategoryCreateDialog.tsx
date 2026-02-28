import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseKeywords } from '@/lib/format-utils';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Category } from '@/types';

type CategoryCreateDialogProps = {
  createMutation: UseMutationResult<
    Category,
    Error,
    { name: string; isFixed?: boolean; keywords?: string[] },
    unknown
  >;
  budgetMutation: UseMutationResult<
    unknown,
    Error,
    { categoryId: string; amount: number },
    unknown
  >;
  onSuccess?: () => void;
  trigger: React.ReactNode;
};

export function CategoryCreateDialog({
  createMutation,
  budgetMutation,
  onSuccess,
  trigger,
}: CategoryCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [budget, setBudget] = useState('');

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('');
      setIsFixed(false);
      setKeywords('');
      setBudget('');
    }
    setOpen(nextOpen);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedBudget = budget.trim();
    const parsedBudget =
      trimmedBudget === '' ? NaN : parseFloat(trimmedBudget);
    const hasBudget =
      trimmedBudget !== '' &&
      !isNaN(parsedBudget) &&
      parsedBudget >= 0;

    createMutation.mutate(
      {
        name,
        isFixed,
        keywords: parseKeywords(keywords),
      },
      {
        onSuccess: (category) => {
          handleOpenChange(false);
          onSuccess?.();
          if (hasBudget && category?.id) {
            budgetMutation.mutate({
              categoryId: category.id,
              amount: parsedBudget,
            });
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-fixed"
                  checked={isFixed}
                  onChange={(e) => setIsFixed(e.target.checked)}
                />
                <Label htmlFor="create-fixed">Fixed monthly cost</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-budget">Monthly budget (optional)</Label>
              <Input
                id="create-budget"
                type="number"
                step="0.01"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-keywords">
                Import keywords (optional)
              </Label>
              <Input
                id="create-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="dining, Food & Drink"
              />
              <p className="text-xs text-muted-foreground">
                The category name is always used for matching. Add extras
                here to map bank categories or match descriptions (e.g.
                &quot;dining&quot; for Eating Out, &quot;Food &amp;
                Drink&quot; for common bank types).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
