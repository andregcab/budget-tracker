import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/api/accounts';
import { useAccounts } from '@/hooks/useAccounts';
import type { Account } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit card' },
] as const;

function getTypeLabel(type: string): string {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function Accounts() {
  const queryClient = useQueryClient();
  const { data: accounts = [], isLoading } = useAccounts();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [institution, setInstitution] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to create account',
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
      setEditing(null);
      resetForm();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to update account',
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['accounts'] }),
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to delete account',
      );
    },
  });

  function resetForm() {
    setName('');
    setType('checking');
    setInstitution('');
    setIsDefault(false);
  }

  function openEdit(acc: Account) {
    setEditing(acc);
    setName(acc.name);
    const matched = ACCOUNT_TYPES.find(
      (t) =>
        t.value === acc.type ||
        t.label.toLowerCase() === (acc.type ?? '').toLowerCase(),
    );
    setType(matched?.value ?? 'checking');
    setInstitution(acc.institution ?? '');
    setIsDefault(acc.isDefault ?? false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        body: {
          name,
          type,
          institution: institution || undefined,
          isDefault,
        },
      });
    } else {
      createMutation.mutate({
        name,
        type,
        institution: institution || undefined,
        isDefault,
      });
    }
  }

  if (isLoading)
    return <LoadingSpinner message="Loading accounts..." />;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              setEditing(null);
              resetForm();
            }
          }}
        >
          <Button onClick={() => setOpen(true)}>Add account</Button>
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
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v)}
                  >
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
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {editing ? 'Save' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Your accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">
              No accounts yet. Add one to get started.
            </p>
          ) : (
            <Table className="min-w-[480px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.name}</TableCell>
                    <TableCell>
                      {getTypeLabel(acc.type ?? 'checking')}
                    </TableCell>
                    <TableCell>{acc.institution ?? '—'}</TableCell>
                    <TableCell>
                      {acc.isDefault ? 'Yes' : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            openEdit(acc);
                            setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this account?'))
                              deleteMutation.mutate(acc.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
