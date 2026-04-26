import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  preferredCurrency: string;
  setPreferredCurrency: (c: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrencyState] = useState<string>("USD");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid: string) {
    const { data } = await supabase.from("profiles").select("preferred_currency").eq("id", uid).maybeSingle();
    if (data?.preferred_currency) setPreferredCurrencyState(data.preferred_currency);
  }

  async function setPreferredCurrency(c: string) {
    setPreferredCurrencyState(c);
    if (user) {
      await supabase.from("profiles").update({ preferred_currency: c }).eq("id", user.id);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  return <Ctx.Provider value={{ user, session, loading, preferredCurrency, setPreferredCurrency, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
