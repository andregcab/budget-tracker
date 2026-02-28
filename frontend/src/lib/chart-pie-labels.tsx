import { formatCurrency } from '@/lib/transaction-utils';

type PieSliceForSummary = {
  name: string;
  total: number;
  _otherCategories?: { name: string }[];
};

export function PieSelectedSliceSummary({
  slice,
}: {
  slice: PieSliceForSummary;
}) {
  return (
    <div
      className="rounded-md border border-border/50 bg-background px-3 py-2 text-sm shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span className="font-medium">{slice.name}</span>
      <span className="ml-2 text-muted-foreground">
        {formatCurrency(slice.total)}
      </span>
      {slice._otherCategories &&
        slice._otherCategories.length > 0 && (
          <div className="mt-1 text-xs text-muted-foreground">
            {slice._otherCategories.map((c) => c.name).join(', ')}
          </div>
        )}
      <span className="ml-1 text-xs text-muted-foreground">
        (tap again to dismiss)
      </span>
    </div>
  );
}
