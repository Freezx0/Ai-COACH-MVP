import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions, useGoals, useUpcoming } from "@/hooks/useFinanceData";
import { formatMoney } from "@/lib/currency";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingDown, PiggyBank, Percent, ArrowUpRight, ArrowDownRight, Sparkles, Target as TargetIcon, Zap, Wifi, Droplet, Briefcase } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import mascot from "@/assets/mascot.png";
import { useTranslation } from "react-i18next";
import { CSVImporter } from "@/components/CSVImporter";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { GoalQuickCreate } from "@/components/GoalQuickCreate";
import { Link } from "react-router-dom";

const CAT_COLORS = ["hsl(var(--cat-food))", "hsl(var(--cat-shopping))", "hsl(var(--cat-transport))", "hsl(var(--cat-entertainment))", "hsl(var(--cat-other))"];

const ICON_MAP: Record<string, any> = { zap: Zap, wifi: Wifi, droplet: Droplet, briefcase: Briefcase };

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, preferredCurrency } = useAuth();
  const { data: txns = [] } = useTransactions();
  const { data: goals = [] } = useGoals();
  const { data: upcoming = [] } = useUpcoming();

  const displayName = (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Friend").split(" ")[0];
  const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const stats = useMemo(() => {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrev = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    let income = 0, expense = 0, prevIncome = 0, prevExpense = 0;
    const byCat: Record<string, number> = {};
    const trend: Record<string, number> = {};

    for (const t of txns) {
      const d = new Date(t.occurred_at);
      const a = Number(t.amount);
      if (d >= startMonth) {
        if (t.type === "income") income += a;
        else { expense += a; const c = t.category || "Other"; byCat[c] = (byCat[c] || 0) + a; }
      } else if (d >= startPrev && d <= endPrev) {
        if (t.type === "income") prevIncome += a; else prevExpense += a;
      }
      // 6-month trend
      if (t.type === "expense") {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const sixMo = new Date(); sixMo.setMonth(sixMo.getMonth() - 5); sixMo.setDate(1);
        if (d >= sixMo) trend[key] = (trend[key] || 0) + a;
      }
    }

    const saved = income - expense;
    const prevSaved = prevIncome - prevExpense;
    const savingRate = income > 0 ? Math.round((saved / income) * 100) : 0;
    const prevSavingRate = prevIncome > 0 ? Math.round((prevSaved / prevIncome) * 100) : 0;

    const pct = (cur: number, prev: number) => prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100);

    const trendData: { month: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      trendData.push({ month: d.toLocaleDateString("en-US", { month: "short" }), value: trend[key] || 0 });
    }

    const catEntries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const catData = catEntries.map(([name, value]) => ({ name, value, pct: expense > 0 ? Math.round((value / expense) * 100) : 0 }));

    return {
      income, expense, saved, savingRate,
      incomeChange: pct(income, prevIncome),
      expenseChange: pct(expense, prevExpense),
      savedChange: pct(saved, prevSaved),
      rateChange: savingRate - prevSavingRate,
      catData, trendData,
    };
  }, [txns]);

  const metrics = [
    { label: t("Total Income", "Total Income"), value: stats.income, icon: Wallet, change: stats.incomeChange, positive: true, color: "category-food" },
    { label: t("Total Spent", "Total Spent"), value: stats.expense, icon: TrendingDown, change: stats.expenseChange, positive: false, color: "category-other" },
    { label: t("Saved", "Saved"), value: stats.saved, icon: PiggyBank, change: stats.savedChange, positive: true, color: "category-transport" },
    { label: t("Saving Rate", "Saving Rate"), value: stats.savingRate, icon: Percent, change: stats.rateChange, positive: true, color: "category-entertainment", isPercent: true },
  ];

  const hasData = txns.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-display font-bold flex items-center gap-2">
          Hello, {displayName}! <span className="inline-block animate-wave origin-bottom">👋</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is your financial overview for <span className="text-primary font-medium">{monthLabel}</span>
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          const ChangeIcon = m.change >= 0 ? ArrowUpRight : ArrowDownRight;
          const changeGood = m.positive ? m.change >= 0 : m.change < 0;
          return (
            <Card key={i} className="p-4 lg:p-5 rounded-2xl shadow-soft hover:shadow-card transition-all border-border/50 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${m.color}/10 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${m.color}`} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium">{m.label}</div>
              <div className="text-xl lg:text-2xl font-display font-bold mt-1">
                {m.isPercent ? `${m.value}%` : formatMoney(m.value, preferredCurrency, { compact: true })}
              </div>
              {hasData && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${changeGood ? "text-primary" : "text-destructive"}`}>
                  <ChangeIcon className="w-3 h-3" />
                  {Math.abs(m.change)}{m.isPercent ? "pp" : "%"} vs last month
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Donut */}
        <Card className="p-5 lg:p-6 rounded-2xl shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">{t("Expense Breakdown", "Expense Breakdown")}</h3>
            <span className="text-xs px-3 py-1 rounded-lg bg-muted text-muted-foreground">{t("This Month", "This Month")}</span>
          </div>
          {stats.catData.length === 0 ? (
            <EmptyChart label="Add expenses to see your breakdown" />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <div className="relative h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.catData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                      {stats.catData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wide">Total Spent</div>
                  <div className="font-display font-bold text-lg">{formatMoney(stats.expense, preferredCurrency, { compact: true })}</div>
                </div>
              </div>
              <div className="space-y-2">
                {stats.catData.slice(0, 5).map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatMoney(c.value, preferredCurrency, { compact: true })}</div>
                      <div className="text-[10px] text-muted-foreground">{c.pct}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Link to="/transactions" className="block text-center text-sm font-medium text-primary mt-4 hover:underline">View full report →</Link>
        </Card>

        {/* Trend */}
        <Card className="p-5 lg:p-6 rounded-2xl shadow-card border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">{t("Spending Trend", "Spending Trend")}</h3>
            <span className="text-xs px-3 py-1 rounded-lg bg-muted text-muted-foreground">{t("Last 6 Months", "Last 6 Months")}</span>
          </div>
          {stats.trendData.every(d => d.value === 0) ? (
            <EmptyChart label="Track expenses over time" />
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trendData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                      formatter={(v: number) => formatMoney(v, preferredCurrency, { compact: true })}
                    />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {stats.expenseChange !== 0 && (
                <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                  {stats.expenseChange < 0
                    ? <ArrowDownRight className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
                    : <ArrowUpRight className="text-destructive w-5 h-5 flex-shrink-0 mt-0.5" />}
                  <div className="text-sm">
                    <div className="font-semibold">You spent {Math.abs(stats.expenseChange)}% {stats.expenseChange < 0 ? "less" : "more"} than last month</div>
                    <div className="text-muted-foreground text-xs mt-0.5">{stats.expenseChange < 0 ? "Great job! Keep it up. 🎉" : "Let's review what changed."}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* AI Insights + Goal + Upcoming */}
      <div className="grid lg:grid-cols-2 gap-4">
        <AIInsightsPanel />

        <div className="space-y-4">
          <GoalQuickCreate />

          <Card className="p-5 rounded-2xl shadow-card border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold">{t("Upcoming Bills", "Upcoming Transactions")}</h3>
              <Link to="/transactions" className="text-xs text-primary font-medium hover:underline">{t("View All", "View All")}</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No upcoming bills. You're all caught up! ✨</p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map((u: any) => {
                  const Ico = ICON_MAP[u.icon || "zap"] || Zap;
                  return (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                          <Ico className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{u.title}</div>
                          <div className="text-xs text-muted-foreground">{new Date(u.due_date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${u.type === "income" ? "text-primary" : "text-destructive"}`}>
                        {u.type === "income" ? "+" : "−"}{formatMoney(Number(u.amount), u.currency, { compact: true })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* CSV uploader */}
      <CSVImporter />
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-center gap-3">
      <img src={mascot} alt="" className="w-20 h-20 opacity-80 animate-float" width={80} height={80} loading="lazy" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
