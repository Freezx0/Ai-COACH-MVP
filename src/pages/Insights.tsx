import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import mascot from "@/assets/mascot.png";
import { useState } from "react";
import { CoachChat } from "@/components/CoachChat";

export default function Insights() {
  const [chat, setChat] = useState(false);
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">AI Insights</h1>
        <p className="text-muted-foreground mt-1">Personalized analysis from your AI Coach.</p>
      </div>

      <Card className="p-6 rounded-2xl gradient-mascot border-border/50 flex flex-col sm:flex-row items-center gap-6">
        <img src={mascot} alt="" className="w-28 h-28 animate-float" width={112} height={112} loading="lazy" />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display font-bold text-xl">Need a deeper analysis?</h2>
          <p className="text-sm text-muted-foreground mt-1">Chat with your AI Coach for personalized strategies, savings tips, and budget breakdowns.</p>
        </div>
        <Button onClick={() => setChat(true)} className="gradient-primary text-primary-foreground rounded-xl shadow-glow">
          <MessageCircle className="w-4 h-4 mr-2" /> Ask AI Coach
        </Button>
      </Card>

      <AIInsightsPanel />
      <CoachChat open={chat} onOpenChange={setChat} />
    </div>
  );
}
