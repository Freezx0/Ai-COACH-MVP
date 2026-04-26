import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function GoalQuickCreate() {
  const { user, preferredCurrency } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(preferredCurrency);
  const [deadline, setDeadline] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !title.trim() || !amount) return;
    setBusy(true);
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: title.trim(),
      target_amount: Number(amount),
      currency,
      deadline: deadline || null,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Goal created! 🎯");
      setTitle(""); setAmount(""); setDeadline("");
      qc.invalidateQueries({ queryKey: ["goals"] });
    }
  }

  return (
    <Card className="p-5 rounded-2xl shadow-card border-border/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-5 rounded-full blur-3xl" />
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="font-display font-bold">Set a Savings Goal</h3>
      </div>
      <form onSubmit={create} className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">What are you saving for?</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Emergency fund" maxLength={80} required />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">I want to save</Label>
          <div className="flex gap-2">
            <Input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2,000,000" required className="flex-1" />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">By when (optional)</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow">
          Start Goal
        </Button>
      </form>
    </Card>
  );
}
