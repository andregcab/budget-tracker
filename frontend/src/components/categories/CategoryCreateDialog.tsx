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

type CategoryCreateDialogProps = {
  createMutation: UseMutationResult<
    unknown,
    Error,
    { name: string; isFixed?: boolean; keywords?: string[] },
    unknown
  >;
  onSuccess?: () => void;
  trigger: React.ReactNode;
};

export function CategoryCreateDialog({
  createMutation,
  onSuccess,
  trigger,
}: CategoryCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [keywords, setKeywords] = useState('');

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('');
      setIsFixed(false);
      setKeywords('');
    }
    setOpen(nextOpen);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        name,
        isFixed,
        keywords: parseKeywords(keywords),
      },
      {
        onSuccess: () => {
          handleOpenChange(false);
          onSuccess?.();
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
          <div className="grid gap-4 py-4">
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
