import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Settings() {
  const { user, updateUser } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState(
    user?.monthlyIncome != null ? String(user.monthlyIncome) : ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMonthlyIncome(
      user?.monthlyIncome != null ? String(user.monthlyIncome) : ""
    );
  }, [user?.monthlyIncome]);

  function handleSaveIncome(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const val = parseFloat(monthlyIncome);
    if (monthlyIncome !== "" && (isNaN(val) || val < 0)) {
      setError("Enter a valid amount");
      return;
    }
    setSaving(true);
    api<{ id: string; email: string; monthlyIncome: number | null }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        monthlyIncome: monthlyIncome === "" ? null : val,
      }),
    })
      .then((updated) => {
        updateUser({
          id: updated.id,
          email: updated.email,
          monthlyIncome: updated.monthlyIncome,
        });
        setMessage("Saved.");
      })
      .catch((err) => setError(err?.message ?? "Failed to save"))
      .finally(() => setSaving(false));
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
          <form onSubmit={handleSaveIncome} className="space-y-4">
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
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mt-4 max-w-md">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Change password is not implemented yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
