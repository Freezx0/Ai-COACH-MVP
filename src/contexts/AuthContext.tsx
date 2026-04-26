import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthCtx {
  user: any | null;
  session: any | null;
  loading: boolean;
  preferredCurrency: string;
  setPreferredCurrency: (c: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrencyState] = useState<string>("UZS");

  useEffect(() => {
    // Mock user login automatically
    const mockUser = {
      id: "mock-user-123",
      email: "guest@example.com",
      user_metadata: { full_name: "Demo User" }
    };
    const mockSession = { user: mockUser };
    
    setSession(mockSession);
    setUser(mockUser);
    
    const savedCurrency = localStorage.getItem("preferredCurrency") || "UZS";
    setPreferredCurrencyState(savedCurrency);
    
    setLoading(false);
  }, []);

  async function setPreferredCurrency(c: string) {
    setPreferredCurrencyState(c);
    localStorage.setItem("preferredCurrency", c);
  }

  async function signOut() {
    setUser(null);
    setSession(null);
    localStorage.clear();
    window.location.href = "/auth";
  }

  return <Ctx.Provider value={{ user, session, loading, preferredCurrency, setPreferredCurrency, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
