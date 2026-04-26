import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Video, Brain, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function Premium() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  const features = [
    { icon: Brain, text: "Deep Financial Calculation & AI Analytics" },
    { icon: Video, text: "Exclusive Video Tutorials & Guides" },
    { icon: Zap, text: "Unlimited Goals & Transactions" },
    { icon: Sparkles, text: "Early Access to New Features" },
  ];

  const handleSubscribe = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("Welcome to Premium! Your subscription is active.");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-4">
          <Crown className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl lg:text-5xl font-display font-bold">
          Upgrade to <span className="text-amber-500">Premium</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Take full control of your finances with advanced AI calculations, exclusive educational video content, and unlimited tracking.
        </p>
      </div>

      <div className="flex justify-center mt-8">
        <div className="bg-muted p-1 rounded-xl flex items-center gap-1">
          <button 
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBilling("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billing === "yearly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Yearly <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-1">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12 items-center">
        {/* Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-display">What's included?</h2>
          <div className="space-y-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-medium">{f.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Card */}
        <Card className="p-8 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-card to-amber-500/5 relative overflow-hidden shadow-2xl">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="text-amber-500 font-bold mb-2 tracking-wide uppercase text-sm">Pro Plan</div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-display">
                {billing === "monthly" ? "40,000" : "380,000"}
              </span>
              <span className="text-muted-foreground font-medium">UZS / {billing === "monthly" ? "mo" : "yr"}</span>
            </div>
            
            {billing === "yearly" && (
              <div className="text-sm text-muted-foreground mt-2">
                Billed annually. Save 100,000 UZS compared to monthly.
              </div>
            )}

            <div className="mt-8 space-y-4">
              <Button 
                onClick={handleSubscribe} 
                disabled={loading}
                className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-glow border-0"
              >
                {loading ? "Processing..." : "Subscribe Now"}
              </Button>
              <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Secure fake payment via processing gateway
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
