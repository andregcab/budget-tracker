import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api/client";
import { AuthContext, type User } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [fetchedUser, setFetchedUser] = useState<User | null | undefined>(
    undefined
  );

  const user = token ? (fetchedUser ?? null) : null;
  const loading = token !== null && fetchedUser === undefined;

  const setAuth = useCallback((u: User, t: string) => {
    setToken(t);
    setFetchedUser(u);
    localStorage.setItem("token", t);
  }, []);

  const updateUser = useCallback((u: User) => {
    setFetchedUser(u);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setFetchedUser(null);
    localStorage.removeItem("token");
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuth(res.user, res.token);
  }, [setAuth]);

  const register = useCallback(async (email: string, password: string) => {
    const res = await api<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuth(res.user, res.token);
  }, [setAuth]);

  useEffect(() => {
    if (!token) return;
    void Promise.resolve().then(() => {
      setFetchedUser(undefined);
    });
    api<User>("/auth/me")
      .then(setFetchedUser)
      .catch(() => {
        logout();
      });
  }, [token, logout]);
  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setAuth, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
