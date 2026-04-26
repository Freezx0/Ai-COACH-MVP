import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Settings() {
  const { user, preferredCurrency, setPreferredCurrency, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.user_metadata?.full_name || "");
  const [busy, setBusy] = useState(false);

  async function saveName() {
    setBusy(true);
    await supabase.auth.updateUser({ data: { full_name: name } });
    await supabase.from("profiles").update({ full_name: name }).eq("id", user!.id);
    setBusy(false);
    toast.success("Saved");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences.</p>
      </div>

      <Card className="p-6 rounded-2xl shadow-card border-border/50 space-y-4">
        <h2 className="font-display font-bold">Profile</h2>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div className="space-y-1.5">
          <Label>Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </div>
        <Button onClick={saveName} disabled={busy} className="gradient-primary text-primary-foreground rounded-xl">Save</Button>
      </Card>

      <Card className="p-6 rounded-2xl shadow-card border-border/50 space-y-4">
        <h2 className="font-display font-bold">Preferences</h2>
        <div className="space-y-1.5">
          <Label>Preferred currency</Label>
          <Select value={preferredCurrency} onValueChange={async (v) => { await setPreferredCurrency(v); toast.success("Currency updated"); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name} ({c.symbol})</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Used as the default for new transactions and dashboards.</p>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl shadow-card border-border/50">
        <Button variant="outline" onClick={async () => { await signOut(); navigate("/auth"); }} className="rounded-xl">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </Card>
    </div>
  );
}
