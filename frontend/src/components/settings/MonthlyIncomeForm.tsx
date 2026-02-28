import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getMutationErrorMessage } from '@/lib/error-utils';

interface MonthlyIncomeFormProps {
  initialValue: number | null;
  onSave: (value: number | null) => Promise<void>;
}

export function MonthlyIncomeForm({
  initialValue,
  onSave,
}: MonthlyIncomeFormProps) {
  const [monthlyIncome, setMonthlyIncome] = useState(
    initialValue != null ? String(initialValue) : '',
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    const val = parseFloat(monthlyIncome);
    if (monthlyIncome !== '' && (isNaN(val) || val < 0)) {
      setError('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await onSave(monthlyIncome === '' ? null : val);
      setMessage('Saved.');
    } catch (err) {
      setError(getMutationErrorMessage(err, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="monthlyIncome">Monthly income</Label>
        <Input
          id="monthlyIncome"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(e.target.value)}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
      <Button type="submit" variant="outline" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
