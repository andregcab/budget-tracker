import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthPageLayout } from '@/components/AuthPageLayout';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { cn } from '@/lib/utils';
import { validateEmail, validatePassword } from '@/lib/validation';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
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
    setError('');
    setFieldErrors({});

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr =
      password !== passwordConfirm ? 'Passwords do not match' : null;

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
      navigate('/', { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout
      title="Create account"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email)
                setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            className={cn('bg-muted', fieldErrors.email && 'border-destructive')}
            required
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password)
                setFieldErrors((f) => ({ ...f, password: undefined }));
              if (
                fieldErrors.passwordConfirm &&
                e.target.value !== passwordConfirm
              ) {
                setFieldErrors((f) => ({
                  ...f,
                  passwordConfirm: 'Passwords do not match',
                }));
              } else if (
                fieldErrors.passwordConfirm &&
                e.target.value === passwordConfirm
              ) {
                setFieldErrors((f) => ({
                  ...f,
                  passwordConfirm: undefined,
                }));
              }
            }}
            className={cn('bg-muted', fieldErrors.password && 'border-destructive')}
            required
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            At least 8 characters, with one uppercase, one
            lowercase, and one number
          </p>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.password}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="passwordConfirm"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Confirm password
          </label>
          <Input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              if (fieldErrors.passwordConfirm)
                setFieldErrors((f) => ({
                  ...f,
                  passwordConfirm: undefined,
                }));
            }}
            className={cn('bg-muted', fieldErrors.passwordConfirm && 'border-destructive')}
            required
            autoComplete="new-password"
          />
          {fieldErrors.passwordConfirm && (
            <p className="mt-1 text-xs text-destructive">
              {fieldErrors.passwordConfirm}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>
    </AuthPageLayout>
  );
}
