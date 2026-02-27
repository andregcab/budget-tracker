import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Account } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit card' },
] as const;

type AccountFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Account | null;
  createMutation: UseMutationResult<
    unknown,
    Error,
    {
      name: string;
      type: string;
      institution?: string;
      isDefault?: boolean;
    },
    unknown
  >;
  updateMutation: UseMutationResult<
    unknown,
    Error,
    {
      id: string;
      body: {
        name?: string;
        type?: string;
        institution?: string;
        isDefault?: boolean;
      };
    },
    unknown
  >;
};

export function AccountFormDialog({
  open,
  onOpenChange,
  editing,
  createMutation,
  updateMutation,
}: AccountFormDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [institution, setInstitution] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        const matched = ACCOUNT_TYPES.find(
          (t) =>
            t.value === editing.type ||
            t.label.toLowerCase() === (editing.type ?? '').toLowerCase(),
        );
        setType(matched?.value ?? 'checking');
        setInstitution(editing.institution ?? '');
        setIsDefault(editing.isDefault ?? false);
      } else {
        setName('');
        setType('checking');
        setInstitution('');
        setIsDefault(false);
      }
    }
  }, [open, editing]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setName('');
      setType('checking');
      setInstitution('');
      setIsDefault(false);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          body: {
            name,
            type,
            institution: institution || undefined,
            isDefault,
          },
        },
        { onSuccess: () => handleOpenChange(false) },
      );
    } else {
      createMutation.mutate(
        {
          name,
          type,
          institution: institution || undefined,
          isDefault,
        },
        { onSuccess: () => handleOpenChange(false) },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit account' : 'New account'}
            </DialogTitle>
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
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Your Bank"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <Label htmlFor="default">Default for imports</Label>
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
            <Button
              type="submit"
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              {editing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
