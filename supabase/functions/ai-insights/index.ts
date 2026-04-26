import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Txn { amount: number; type: string; category?: string | null; occurred_at: string; }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transactions, currency } = await req.json() as { transactions: Txn[]; currency: string };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ insights: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate
    const totals: Record<string, number> = {};
    let income = 0, expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += Number(t.amount);
      else {
        expense += Number(t.amount);
        const cat = t.category || "Other";
        totals[cat] = (totals[cat] || 0) + Number(t.amount);
      }
    }

    const summary = { income, expense, byCategory: totals, currency, transactionCount: transactions.length };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a financial coach. Generate 4 short, actionable insights based on the user's spending. Return STRICT JSON only." },
          { role: "user", content: `Generate 4 insights from this data:\n${JSON.stringify(summary)}\n\nReturn an array of 4 objects.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_insights",
            description: "Return financial insights",
            parameters: {
              type: "object",
              properties: {
                insights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["warning", "suggestion", "achievement", "focus"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      value: { type: "string" },
                    },
                    required: ["type", "title", "description"],
                  },
                },
              },
              required: ["insights"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429 || response.status === 402) {
        return new Response(JSON.stringify({ error: response.status === 429 ? "Rate limit" : "Credits exhausted" }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error ${response.status}`);
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { insights: [] };

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
