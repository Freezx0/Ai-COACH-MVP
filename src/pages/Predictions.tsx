import { useMemo } from "react";
import { useTransactions } from "@/hooks/useFinanceData";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

export default function Predictions() {
  const { data: txns = [] } = useTransactions();
  const { preferredCurrency } = useAuth();

  const forecast = useMemo(() => {
    const monthly: Record<string, { income: number; expense: number }> = {};
    for (const t of txns) {
      const d = new Date(t.occurred_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = monthly[key] || { income: 0, expense: 0 };
      if (t.type === "income") monthly[key].income += Number(t.amount);
      else monthly[key].expense += Number(t.amount);
    }
    const keys = Object.keys(monthly).sort();
    const last3 = keys.slice(-3);
    const avgIncome = last3.reduce((s, k) => s + monthly[k].income, 0) / Math.max(1, last3.length);
    const avgExpense = last3.reduce((s, k) => s + monthly[k].expense, 0) / Math.max(1, last3.length);
    const avgSavings = avgIncome - avgExpense;

    const data: { month: string; actual?: number; predicted?: number }[] = [];
    keys.slice(-6).forEach(k => {
      const [y, m] = k.split("-").map(Number);
      data.push({
        month: new Date(y, m - 1).toLocaleDateString("en-US", { month: "short" }),
        actual: monthly[k].expense,
      });
    });
    for (let i = 1; i <= 3; i++) {
      const d = new Date(); d.setMonth(d.getMonth() + i);
      data.push({ month: d.toLocaleDateString("en-US", { month: "short" }), predicted: avgExpense });
    }
    return { avgIncome, avgExpense, avgSavings, data, yearlyProjection: avgSavings * 12 };
  }, [txns]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Predictions</h1>
        <p className="text-muted-foreground mt-1">Where your money is heading, based on your trends.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Avg Monthly Income", value: forecast.avgIncome, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Avg Monthly Spend", value: forecast.avgExpense, icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Projected Yearly Savings", value: forecast.yearlyProjection, icon: Calendar, color: "text-info", bg: "bg-info/10" },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="p-5 rounded-2xl shadow-card border-border/50 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 ${m.color}`} /></div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="text-2xl font-display font-bold mt-1">{formatMoney(m.value, preferredCurrency, { compact: true })}</div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 rounded-2xl shadow-card border-border/50">
        <h3 className="font-display font-bold mb-4">Spending Forecast (next 3 months)</h3>
        {txns.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Add transactions to see predictions.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast.data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatMoney(v, preferredCurrency, { compact: true })} />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary-glow))" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4 }} name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
