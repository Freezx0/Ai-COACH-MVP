import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/hooks/useFinanceData";

const ICON_MAP: Record<string, any> = {
  warning: { Icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  suggestion: { Icon: Lightbulb, color: "text-warning", bg: "bg-warning/10" },
  achievement: { Icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  focus: { Icon: Target, color: "text-destructive", bg: "bg-destructive/10" },
};

interface Insight { type: string; title: string; description: string; value?: string; }

export function AIInsightsPanel() {
  const { preferredCurrency } = useAuth();
  const { data: txns = [], isLoading } = useTransactions(60);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (txns.length === 0) return;
    setLoading(true);
    try {
      // Mocked AI insights
      await new Promise(r => setTimeout(r, 1000));
      const income = txns.filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
      const expense = txns.filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);
      
      const mockInsights = [
        { type: "achievement", title: "Great tracking!", description: `You have logged ${txns.length} transactions so far.` },
        { type: "suggestion", title: "Savings tip", description: `You spent ${expense} and earned ${income}. Consider saving a portion of your income!` },
      ];
      
      setInsights(mockInsights);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading && txns.length > 0 && insights.length === 0) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, txns.length]);

  return (
    <Card className="p-5 rounded-2xl shadow-card border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold">AI Insights</h3>
        </div>
        {insights.length > 0 && (
          <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="text-xs">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
          </Button>
        )}
      </div>

      {txns.length === 0 ? (
        <div className="text-center py-10">
          <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Add transactions to unlock AI insights.</p>
        </div>
      ) : loading && insights.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((ins, i) => {
            const meta = ICON_MAP[ins.type] || ICON_MAP.suggestion;
            const { Icon } = meta;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{ins.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ins.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
