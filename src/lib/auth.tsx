import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "staf.auth.v1";

export interface AuthUser {
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  activate: (email: string, password: string) => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!email || !password) throw new Error("Identifiants requis");
    const u: AuthUser = {
      email,
      first_name: "Amina",
      last_name: "Adjovi",
    };
    persist(u);
  };

  const activate = async (email: string, password: string) => {
    if (!email || password.length < 6) throw new Error("Mot de passe trop court");
    await login(email, password);
  };

  const logout = () => persist(null);

  return (
    <Ctx.Provider value={{ user, ready, login, logout, activate }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
