import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }
  return null;
}

function MonthlyIncomeForm({
  initialValue,
  onSave,
}: {
  initialValue: number | null;
  onSave: (value: number | null) => Promise<void>;
}) {
  const [monthlyIncome, setMonthlyIncome] = useState(
    initialValue != null ? String(initialValue) : ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const val = parseFloat(monthlyIncome);
    if (monthlyIncome !== "" && (isNaN(val) || val < 0)) {
      setError("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await onSave(monthlyIncome === "" ? null : val);
      setMessage("Saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
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
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
      <Button type="submit" variant="outline" disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

export function Settings() {
  const { user, updateUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleSaveIncome(value: number | null) {
    const updated = await api<{ id: string; email: string; monthlyIncome: number | null }>(
      "/auth/me",
      {
        method: "PATCH",
        body: JSON.stringify({ monthlyIncome: value }),
      }
    );
    updateUser({
      id: updated.id,
      email: updated.email,
      monthlyIncome: updated.monthlyIncome,
    });
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    const newErr = validatePassword(newPassword);
    const confirmErr =
      newPassword !== newPasswordConfirm ? "Passwords do not match" : null;
    if (newErr || confirmErr) {
      setPasswordError(newErr ?? confirmErr ?? "");
      return;
    }
    setChangingPassword(true);
    api("/auth/me/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      }),
    })
      .then(() => {
        setPasswordMessage("Password changed.");
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
      })
      .catch((err) => {
        const msg = err?.message ?? "Failed to change password";
        setPasswordError(msg);
        toast.error(msg);
      })
      .finally(() => setChangingPassword(false));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card className="mt-4 max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-sm">Email: {user?.email}</p>
        </CardContent>
      </Card>
      <Card className="mt-4 max-w-md">
        <CardHeader>
          <CardTitle>Default monthly income</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            Set your typical monthly income. This is used for savings calculations
            on the Dashboard. You can override it for specific months from the
            Dashboard.
          </p>
          <MonthlyIncomeForm
            key={user?.id ?? "loading"}
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
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters, with one uppercase, one lowercase, and one number
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPasswordConfirm">Confirm new password</Label>
              <Input
                id="newPasswordConfirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            {passwordMessage && (
              <p className="text-sm text-[var(--positive)]">{passwordMessage}</p>
            )}
            <Button type="submit" variant="outline" disabled={changingPassword}>
              {changingPassword ? "Changing..." : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
