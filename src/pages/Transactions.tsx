import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useFinanceData";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Search, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { formatMoney } from "@/lib/currency";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const DEFAULT_CATS = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Bills", "Salary", "Health", "Other"];

export default function Transactions() {
  const { user, preferredCurrency } = useAuth();
  const { data: txns = [], isLoading } = useTransactions();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return txns.filter((t: any) => {
      if (filter !== "all" && t.type !== filter) return false;
      if (search && !`${t.description || ""} ${t.category || ""}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [txns, search, filter]);

  async function remove(id: string) {
    const existingStr = localStorage.getItem("transactions");
    let existing = existingStr ? JSON.parse(existingStr) : [];
    existing = existing.filter((t: any) => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(existing));
    toast.success("Deleted"); 
    qc.invalidateQueries({ queryKey: ["transactions"] });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">{txns.length} total</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground rounded-xl shadow-glow">
              <Plus className="w-4 h-4 mr-2" /> Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Transaction</DialogTitle></DialogHeader>
            <TransactionForm onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["transactions"] }); }} defaultCurrency={preferredCurrency} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 rounded-2xl shadow-card border-border/50 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search description or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="rounded-2xl shadow-card border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No transactions yet. Add one or upload a CSV from the dashboard!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t: any) => (
              <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                  {t.type === "income" ? <ArrowUpRight className="w-5 h-5 text-primary" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{t.description || t.category || "Transaction"}</div>
                  <div className="text-xs text-muted-foreground">{t.category || "Uncategorized"} · {new Date(t.occurred_at).toLocaleDateString()}</div>
                </div>
                <div className={`text-sm font-bold ${t.type === "income" ? "text-primary" : "text-destructive"}`}>
                  {t.type === "income" ? "+" : "−"}{formatMoney(Number(t.amount), t.currency, { compact: true })}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function TransactionForm({ onDone, defaultCurrency }: { onDone: () => void; defaultCurrency: string }) {
  const { user } = useAuth();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATS[0]);
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    
    const newTxn = {
      id: Math.random().toString(36).slice(2),
      user_id: user.id, 
      amount: Number(amount), 
      type, 
      category, 
      description, 
      currency,
      occurred_at: new Date(date).toISOString(),
    };
    
    const existingStr = localStorage.getItem("transactions");
    const existing = existingStr ? JSON.parse(existingStr) : [];
    localStorage.setItem("transactions", JSON.stringify([...existing, newTxn]));
    
    setBusy(false);
    toast.success("Added!"); 
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setType("expense")} className={`rounded-xl py-2.5 text-sm font-semibold border transition-all ${type === "expense" ? "bg-destructive/10 border-destructive text-destructive" : "border-border"}`}>Expense</button>
        <button type="button" onClick={() => setType("income")} className={`rounded-xl py-2.5 text-sm font-semibold border transition-all ${type === "income" ? "bg-primary/10 border-primary text-primary" : "border-border"}`}>Income</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 space-y-1.5">
          <Label className="text-xs">Amount</Label>
          <Input type="number" step="0.01" min="0" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DEFAULT_CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Description (optional)</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Button type="submit" disabled={busy} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-semibold">
        {busy ? "Saving…" : "Save Transaction"}
      </Button>
    </form>
  );
}
