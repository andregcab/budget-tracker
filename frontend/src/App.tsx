import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ScrollRestoration } from "@/components/ScrollRestoration";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { Accounts } from "@/pages/Accounts";
import { Categories } from "@/pages/Categories";
import { Transactions } from "@/pages/Transactions";
import { Import } from "@/pages/Import";
import { Settings } from "@/pages/Settings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="bottom-center" />
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
        <BrowserRouter>
          <ScrollRestoration />
          <AuthProvider>
            <UserPreferencesProvider>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="import" element={<Import />} />
              <Route path="categories" element={<Categories />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </UserPreferencesProvider>
          </AuthProvider>
        </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
