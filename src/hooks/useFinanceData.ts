import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTransactions(limit?: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id, limit],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from("transactions").select("*").eq("user_id", user!.id).order("occurred_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useGoals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpcoming() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["upcoming", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("upcoming_transactions").select("*").eq("user_id", user!.id).order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
