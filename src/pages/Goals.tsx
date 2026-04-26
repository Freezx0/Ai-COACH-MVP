import { useGoals } from "@/hooks/useFinanceData";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, Plus, Trash2, Trophy } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GoalQuickCreate } from "@/components/GoalQuickCreate";
import { useState } from "react";

export default function Goals() {
  const { data: goals = [] } = useGoals();
  const qc = useQueryClient();
  const [contributing, setContributing] = useState<any | null>(null);
  const [amount, setAmount] = useState("");

  async function remove(id: string) {
    const existingStr = localStorage.getItem("goals");
    let existing = existingStr ? JSON.parse(existingStr) : [];
    existing = existing.filter((g: any) => g.id !== id);
    localStorage.setItem("goals", JSON.stringify(existing));
    
    toast.success("Goal removed");
    qc.invalidateQueries({ queryKey: ["goals"] });
  }

  async function contribute(e: React.FormEvent) {
    e.preventDefault();
    if (!contributing) return;
    const newAmt = Number(contributing.current_amount) + Number(amount);
    const status = newAmt >= Number(contributing.target_amount) ? "completed" : "active";
    
    const existingStr = localStorage.getItem("goals");
    let existing = existingStr ? JSON.parse(existingStr) : [];
    existing = existing.map((g: any) => {
      if (g.id === contributing.id) {
        return { ...g, current_amount: newAmt, status };
      }
      return g;
    });
    localStorage.setItem("goals", JSON.stringify(existing));
    
    toast.success(status === "completed" ? "Goal completed! 🏆" : "Added!");
    qc.invalidateQueries({ queryKey: ["goals"] });
    setContributing(null); setAmount("");
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Your Goals</h1>
        <p className="text-muted-foreground mt-1">Stay focused on what matters most.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1"><GoalQuickCreate /></div>

        <div className="lg:col-span-2 space-y-3">
          {goals.length === 0 ? (
            <Card className="p-12 text-center rounded-2xl border-dashed">
              <Target className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">No goals yet. Create one to get started!</p>
            </Card>
          ) : goals.map((g: any) => {
            const pct = Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100));
            const completed = g.status === "completed";
            return (
              <Card key={g.id} className="p-5 rounded-2xl shadow-card border-border/50 hover:shadow-elevated transition-all animate-fade-in-up">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${completed ? "gradient-primary" : "bg-accent"}`}>
                      {completed ? <Trophy className="w-5 h-5 text-primary-foreground" /> : <Target className="w-5 h-5 text-accent-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display font-bold truncate">{g.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatMoney(Number(g.current_amount), g.currency, { compact: true })} of {formatMoney(Number(g.target_amount), g.currency, { compact: true })}
                        {g.deadline && ` · by ${new Date(g.deadline).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(g.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                <div className="mt-4 space-y-2">
                  <Progress value={pct} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-primary">{pct}% complete</span>
                    {!completed && (
                      <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs" onClick={() => setContributing(g)}>
                        <Plus className="w-3 h-3 mr-1" /> Add funds
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!contributing} onOpenChange={(v) => !v && setContributing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Add to "{contributing?.title}"</DialogTitle></DialogHeader>
          <form onSubmit={contribute} className="space-y-3 pt-2">
            <Input type="number" min="1" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount in ${contributing?.currency}`} />
            <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-semibold">Contribute</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
