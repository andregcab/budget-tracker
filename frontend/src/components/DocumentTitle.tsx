import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/login': 'Sign in – Piggy',
  '/register': 'Create account – Piggy',
  '/': 'Dashboard – Piggy',
  '/accounts': 'Accounts – Piggy',
  '/transactions': 'Transactions – Piggy',
  '/import': 'Import – Piggy',
  '/categories': 'Categories – Piggy',
  '/settings': 'Settings – Piggy',
};

const DEFAULT_TITLE = 'Piggy';

export function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = ROUTE_TITLES[pathname] ?? DEFAULT_TITLE;
    document.title = title;
  }, [pathname]);

  return null;
}
