import type { TransactionRow } from '@/types';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Trash2 } from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';

type UpdateMutation = UseMutationResult<
  unknown,
  Error,
  {
    id: string;
    body: {
      categoryId?: string | null;
      notes?: string | null;
      isExcluded?: boolean;
    };
  },
  unknown
>;

type TransactionCardProps = {
  transaction: TransactionRow;
  categories: Category[];
  onDelete: (tx: TransactionRow) => void;
  updateMutation: UpdateMutation;
};

export function TransactionCard({
  transaction,
  categories,
  onDelete,
  updateMutation,
}: TransactionCardProps) {
  return (
    <Card
      className={transaction.isExcluded ? 'opacity-50 bg-muted/30' : ''}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className="font-medium truncate"
              title={transaction.description}
            >
              {transaction.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString()} ·{' '}
              {parseFloat(transaction.amount) >= 0
                ? transaction.amount
                : `(${transaction.amount})`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(transaction)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={transaction.isExcluded}
              onChange={() =>
                updateMutation.mutate({
                  id: transaction.id,
                  body: { isExcluded: !transaction.isExcluded },
                })
              }
              title="Exclude from budget"
              className="h-4 w-4 rounded border-input shrink-0"
            />
            <span className="text-xs text-muted-foreground">
              Exclude from budget
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Combobox
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={transaction.category?.id ?? null}
              onValueChange={(v) =>
                updateMutation.mutate({
                  id: transaction.id,
                  body: { categoryId: v },
                })
              }
              placeholder="Category"
              searchPlaceholder="Type to search..."
              allowEmpty
              emptyOption={{ value: null, label: '—' }}
              triggerClassName="w-full"
            />
            <Input
              className="w-full"
              placeholder="Notes"
              defaultValue={transaction.notes ?? ''}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v !== (transaction.notes ?? '')) {
                  updateMutation.mutate({
                    id: transaction.id,
                    body: { notes: v || null },
                  });
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
