import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { validatePassword } from '@/lib/validation';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    const newErr = validatePassword(newPassword);
    const confirmErr =
      newPassword !== newPasswordConfirm
        ? 'Passwords do not match'
        : null;
    if (newErr || confirmErr) {
      setPasswordError(newErr ?? confirmErr ?? '');
      return;
    }
    setChangingPassword(true);
    api('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      }),
    })
      .then(() => {
        setPasswordMessage('Password changed.');
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      })
      .catch((err) => {
        const msg = err?.message ?? 'Failed to change password';
        setPasswordError(msg);
        toast.error(msg);
      })
      .finally(() => setChangingPassword(false));
  }

  return (
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
          At least 8 characters, with one uppercase, one lowercase,
          and one number
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="newPasswordConfirm">
          Confirm new password
        </Label>
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
        <p className="text-sm text-[var(--positive)]">
          {passwordMessage}
        </p>
      )}
      <Button
        type="submit"
        variant="outline"
        disabled={changingPassword}
      >
        {changingPassword ? 'Changing...' : 'Change password'}
      </Button>
    </form>
  );
}
