import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import mascot from "@/assets/mascot.png";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function CoachChat({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, preferredCurrency } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: "Hi! 👋 I'm your AI Financial Coach. Ask me anything about your spending, savings, or how to reach your goals faster." }]);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function buildContext() {
    if (!user) return null;
    const since = new Date(); since.setDate(since.getDate() - 60);
    const [{ data: txns }, { data: goals }] = await Promise.all([
      supabase.from("transactions").select("amount,type,category,occurred_at").eq("user_id", user.id).gte("occurred_at", since.toISOString()).order("occurred_at", { ascending: false }).limit(100),
      supabase.from("goals").select("title,target_amount,current_amount,deadline,status").eq("user_id", user.id),
    ]);
    let income = 0, expense = 0;
    const byCat: Record<string, number> = {};
    (txns || []).forEach((t: any) => {
      const a = Number(t.amount);
      if (t.type === "income") income += a;
      else { expense += a; const c = t.category || "Other"; byCat[c] = (byCat[c] || 0) + a; }
    });
    return { currency: preferredCurrency, last60Days: { income, expense, savings: income - expense, byCategory: byCat, count: txns?.length || 0 }, goals };
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const context = await buildContext();
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: next, context }),
      });

      if (resp.status === 429) { toast.error("Rate limit reached. Try again in a moment."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add funds in workspace settings."); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistant } : m));
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't reach the coach. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b gradient-mascot">
          <SheetTitle className="flex items-center gap-3">
            <img src={mascot} alt="" className="w-10 h-10" width={40} height={40} />
            <div>
              <div className="font-display">AI Coach</div>
              <div className="text-xs text-muted-foreground font-normal">Always here to help</div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
              }`}>
                {m.role === "assistant"
                  ? <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1"><ReactMarkdown>{m.content || "…"}</ReactMarkdown></div>
                  : m.content}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex"><div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-sm"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div></div>
          )}
        </div>

        <div className="border-t p-3 flex gap-2 bg-card">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about your finances..."
            disabled={loading}
            className="rounded-xl"
            maxLength={500}
          />
          <Button onClick={send} disabled={loading || !input.trim()} className="rounded-xl gradient-primary text-primary-foreground">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
