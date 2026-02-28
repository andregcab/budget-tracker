type AuthPageLayoutProps = {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthPageLayout({
  title,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-6 text-foreground shadow-sm">
        <h1 className="text-center text-2xl font-semibold">
          {title}
        </h1>
        {children}
        {footer}
      </div>
    </div>
  );
}
