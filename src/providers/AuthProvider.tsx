"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContext {
  token: string | null;
  email: string | null;
  isLoggedIn: boolean;
  sendCode: (email: string) => Promise<void>;
  login: (email: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContext | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Hydrate from localStorage, clearing expired tokens
  useEffect(() => {
    const stored = localStorage.getItem("inp_token");
    const storedEmail = localStorage.getItem("inp_email");
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split(".")[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("inp_token");
          localStorage.removeItem("inp_email");
          return;
        }
      } catch {
        localStorage.removeItem("inp_token");
        localStorage.removeItem("inp_email");
        return;
      }
      setToken(stored);
      if (storedEmail) setEmail(storedEmail);
    }
  }, []);

  const sendCode = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Failed to send code" }));
      throw new Error(err.message ?? "Failed to send code");
    }
  }, []);

  const login = useCallback(async (email: string, code: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(err.message ?? "Login failed");
    }
    const { token } = await res.json();
    setToken(token);
    setEmail(email);
    localStorage.setItem("inp_token", token);
    localStorage.setItem("inp_email", email);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("inp_token");
    localStorage.removeItem("inp_email");
  }, []);

  const value = useMemo(
    () => ({ token, email, isLoggedIn: !!token, sendCode, login, logout }),
    [token, email, sendCode, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
