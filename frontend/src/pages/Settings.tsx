import { useAuth } from '@/hooks/useAuth';
import { api } from '@/api/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MonthlyIncomeForm } from '@/components/settings/MonthlyIncomeForm';
import { ChangePasswordForm } from '@/components/settings/ChangePasswordForm';

export function Settings() {
  const { user, updateUser } = useAuth();

  async function handleSaveIncome(value: number | null) {
    const updated = await api<{
      id: string;
      email: string;
      monthlyIncome: number | null;
    }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ monthlyIncome: value }),
    });
    updateUser({
      id: updated.id,
      email: updated.email,
      monthlyIncome: updated.monthlyIncome,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card className="mt-4 max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Email: {user?.email}
          </p>
        </CardContent>
      </Card>
      <Card className="mt-4 max-w-md">
        <CardHeader>
          <CardTitle>Default monthly income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Set your typical monthly income. This is used for savings
            calculations on the Dashboard. You can override it for
            specific months from the Dashboard.
          </p>
          <MonthlyIncomeForm
            key={user?.id ?? 'loading'}
            initialValue={user?.monthlyIncome ?? null}
            onSave={handleSaveIncome}
          />
        </CardContent>
      </Card>
      <Card className="mt-4 max-w-md">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
