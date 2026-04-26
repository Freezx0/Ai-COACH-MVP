import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function CSVImporter() {
  const { user, preferredCurrency } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!user) return;
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) throw new Error("No rows detected in CSV.");
      const inserts = rows.map(r => ({
        id: Math.random().toString(36).slice(2),
        user_id: user.id,
        amount: Math.abs(r.amount),
        type: r.amount < 0 ? "expense" as const : "income" as const,
        category: r.category || null,
        description: r.description || null,
        currency: r.currency || preferredCurrency,
        occurred_at: r.date || new Date().toISOString(),
      }));
      
      const existingStr = localStorage.getItem("transactions");
      const existing = existingStr ? JSON.parse(existingStr) : [];
      localStorage.setItem("transactions", JSON.stringify([...existing, ...inserts]));
      
      toast.success(`Imported ${inserts.length} transactions! ✨`);
      qc.invalidateQueries({ queryKey: ["transactions"] });
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function loadDemo() {
    if (!user) return;
    setBusy(true);
    const cats = ["Food & Dining", "Transport", "Shopping", "Entertainment", "Other"];
    const inserts: any[] = [];
    const now = new Date();
    inserts.push({ id: Math.random().toString(36).slice(2), user_id: user.id, amount: 5000000, type: "income", category: "Salary", description: "Monthly salary", currency: preferredCurrency, occurred_at: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() });
    for (let i = 0; i < 40; i++) {
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 60));
      inserts.push({
        id: Math.random().toString(36).slice(2),
        user_id: user.id,
        amount: Math.floor(Math.random() * 200000) + 20000,
        type: "expense",
        category: cats[Math.floor(Math.random() * cats.length)],
        description: "Sample transaction",
        currency: preferredCurrency,
        occurred_at: d.toISOString(),
      });
    }
    // Upcoming bills
    const upcomings = [
      { title: "Electricity Bill", amount: 150000, icon: "zap", days: 5 },
      { title: "Internet Bill", amount: 120000, icon: "wifi", days: 7 },
      { title: "Salary", amount: 5000000, icon: "briefcase", days: 12, type: "income" },
      { title: "Water Bill", amount: 80000, icon: "droplet", days: 14 },
    ];
    const upInserts = upcomings.map(u => {
      const d = new Date(); d.setDate(d.getDate() + u.days);
      return { id: Math.random().toString(36).slice(2), user_id: user.id, title: u.title, amount: u.amount, currency: preferredCurrency, due_date: d.toISOString().slice(0, 10), icon: u.icon, type: (u.type as any) || "expense" };
    });
    try {
      localStorage.setItem("transactions", JSON.stringify(inserts));
      localStorage.setItem("upcoming_transactions", JSON.stringify(upInserts));
      
      toast.success("Demo data loaded!");
      await qc.invalidateQueries({ queryKey: ["transactions"] });
      await qc.invalidateQueries({ queryKey: ["upcoming"] });
      await qc.invalidateQueries({ queryKey: ["goals"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to load demo data");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5 lg:p-6 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
      <div className="grid md:grid-cols-3 gap-4 items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Upload your transactions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Upload a CSV from your bank or e-wallet to get AI-powered insights.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Button onClick={() => fileRef.current?.click()} disabled={busy} className="gradient-primary text-primary-foreground rounded-xl shadow-glow w-full md:w-auto px-6">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Upload CSV File
          </Button>
          <div className="flex items-center gap-2 text-xs">
            <button onClick={loadDemo} disabled={busy} className="text-primary hover:underline font-semibold">
              Load demo data
            </button>
            <span className="text-muted-foreground">•</span>
            <button onClick={() => {
              const csv = "Date,Amount,Category,Description,Currency\n2023-10-01,-150.00,Food,Groceries,USD\n2023-10-02,-50.00,Transport,Taxi,USD\n2023-10-05,2000.00,Salary,Monthly Salary,USD";
              navigator.clipboard.writeText(csv).then(() => {
                toast.success("Sample CSV copied to clipboard! You can paste it into a text file and save it as .csv");
              }).catch(() => {
                toast.error("Failed to copy sample CSV to clipboard.");
              });
            }} disabled={busy} className="text-primary hover:underline font-semibold">
              Copy sample CSV
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Your data is safe and secure.</p>
            <p className="text-xs text-muted-foreground">We never share your data with anyone.</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function parseCSV(text: string): { date?: string; amount: number; category?: string; description?: string; currency?: string }[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const dateIdx = findIdx(headers, ["date", "datetime", "time", "transaction date"]);
  const amountIdx = findIdx(headers, ["amount", "value", "sum", "total"]);
  const catIdx = findIdx(headers, ["category", "type", "tag"]);
  const descIdx = findIdx(headers, ["description", "memo", "note", "merchant", "details"]);
  const curIdx = findIdx(headers, ["currency", "ccy"]);

  if (amountIdx === -1) throw new Error("CSV must include an 'amount' column.");

  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const rawAmt = (cols[amountIdx] || "").replace(/[^\d.,-]/g, "").replace(/,/g, "");
    const amt = parseFloat(rawAmt);
    if (isNaN(amt)) continue;
    const dateStr = dateIdx >= 0 ? cols[dateIdx] : undefined;
    let isoDate: string | undefined;
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) isoDate = d.toISOString();
    }
    rows.push({
      date: isoDate,
      amount: amt,
      category: catIdx >= 0 ? cols[catIdx] : undefined,
      description: descIdx >= 0 ? cols[descIdx] : undefined,
      currency: curIdx >= 0 ? cols[curIdx]?.toUpperCase() : undefined,
    });
  }
  return rows;
}

function findIdx(headers: string[], names: string[]) {
  for (const n of names) {
    const i = headers.indexOf(n);
    if (i >= 0) return i;
  }
  return -1;
}

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
}
