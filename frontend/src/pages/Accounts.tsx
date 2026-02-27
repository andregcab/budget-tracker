import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useAccountMutations } from '@/hooks/useAccountMutations';
import type { Account } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AccountFormDialog } from '@/components/accounts/AccountFormDialog';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit_card', label: 'Credit card' },
] as const;

function getTypeLabel(type: string): string {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function Accounts() {
  const { data: accounts = [], isLoading } = useAccounts();
  const {
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAccountMutations();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setEditing(null);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading accounts..." />;
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Button onClick={() => setOpen(true)}>Add account</Button>
      </div>
      <AccountFormDialog
        open={open}
        onOpenChange={handleOpenChange}
        editing={editing}
        createMutation={createMutation}
        updateMutation={updateMutation}
      />
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
                            setEditing(acc);
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
