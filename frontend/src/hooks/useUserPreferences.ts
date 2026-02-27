import { useContext } from 'react';
import { UserPreferencesContext } from '@/contexts/user-preferences-context';

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return ctx;
}
