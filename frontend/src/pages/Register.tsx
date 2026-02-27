import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!PASSWORD_REGEX.test(password)) {
    return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
  }
  return null;
}

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr =
      password !== passwordConfirm ? "Passwords do not match" : null;

    if (emailErr || passwordErr || confirmErr) {
      setFieldErrors({
        email: emailErr ?? undefined,
        password: passwordErr ?? undefined,
        passwordConfirm: confirmErr ?? undefined,
      });
      return;
    }

    setLoading(true);
    try {
      await register(email, password, passwordConfirm);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 text-foreground shadow-sm">
        <h1 className="text-center text-2xl font-semibold">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
              }}
              className={cn(
                "w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                fieldErrors.email && "border-destructive"
              )}
              required
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                if (fieldErrors.passwordConfirm && e.target.value !== passwordConfirm) {
                  setFieldErrors((f) => ({ ...f, passwordConfirm: "Passwords do not match" }));
                } else if (fieldErrors.passwordConfirm && e.target.value === passwordConfirm) {
                  setFieldErrors((f) => ({ ...f, passwordConfirm: undefined }));
                }
              }}
              className={cn(
                "w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                fieldErrors.password && "border-destructive"
              )}
              required
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              At least 8 characters, with one uppercase, one lowercase, and one number
            </p>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.password}</p>
            )}
          </div>
          <div>
            <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-foreground">
              Confirm password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                if (fieldErrors.passwordConfirm) setFieldErrors((f) => ({ ...f, passwordConfirm: undefined }));
              }}
              className={cn(
                "w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                fieldErrors.passwordConfirm && "border-destructive"
              )}
              required
              autoComplete="new-password"
            />
            {fieldErrors.passwordConfirm && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.passwordConfirm}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
