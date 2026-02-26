import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-center text-2xl font-semibold">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
