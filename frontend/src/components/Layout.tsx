import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/accounts", label: "Accounts" },
  { to: "/transactions", label: "Transactions" },
  { to: "/import", label: "Import" },
  { to: "/categories", label: "Categories" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="flex h-14 items-center gap-4 px-4">
          <Link to="/" className="font-semibold">
            Budget Tracker
          </Link>
          <nav className="flex flex-1 gap-2">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <span className="text-muted-foreground text-sm">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
