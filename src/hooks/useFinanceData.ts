import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export function useTransactions(limit?: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id, limit],
    enabled: !!user,
    queryFn: async () => {
      const dataStr = localStorage.getItem("transactions");
      let data = dataStr ? JSON.parse(dataStr) : [];
      data.sort((a: any, b: any) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
      if (limit) data = data.slice(0, limit);
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
      const dataStr = localStorage.getItem("goals");
      return dataStr ? JSON.parse(dataStr) : [];
    },
  });
}

export function useUpcoming() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["upcoming", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const dataStr = localStorage.getItem("upcoming_transactions");
      let data = dataStr ? JSON.parse(dataStr) : [];
      data.sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      return data;
    },
  });
}
