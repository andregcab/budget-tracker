import { createContext } from "react";

export type User = { id: string; email: string; monthlyIncome: number | null };

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
