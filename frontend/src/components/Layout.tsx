import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { GettingStartedCard } from '@/components/GettingStartedCard';
import { cn } from '@/lib/utils';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 shrink-0"
      aria-label={
        theme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      }
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/accounts', label: 'Accounts' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/import', label: 'Import' },
  { to: '/categories', label: 'Categories' },
  { to: '/settings', label: 'Settings' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <header className="border-b border-border bg-card text-card-foreground">
        <div className="flex h-14 items-center gap-2 px-4 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 shrink-0"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
          <Link
            to="/"
            className="inline-flex items-baseline shrink-0 -translate-y-1 text-[var(--brand-piggy)] hover:text-[var(--brand-piggy)]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-3xl font-semibold">Pigg</span>
            <span className="font-piggy-tail text-5xl font-bold leading-none" style={{ marginBottom: '-0.2em' }}>y</span>
          </Link>
          <nav className="hidden flex-1 gap-2 md:flex">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <span className="hidden text-muted-foreground text-sm sm:inline truncate max-w-[120px] md:max-w-[180px]">
            {user?.email}
          </span>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-border bg-transparent text-card-foreground hover:bg-accent hover:text-accent-foreground shrink-0"
          >
            Logout
          </Button>
        </div>
        {mobileMenuOpen && (
          <nav className="flex flex-col border-t border-border px-4 py-3 md:hidden">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1 p-3 sm:p-4 text-foreground min-w-0">
        <GettingStartedCard />
        <Outlet />
      </main>
    </div>
  );
}
