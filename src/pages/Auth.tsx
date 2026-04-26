import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import mascot from "@/assets/mascot.png";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (user) return <Navigate to="/" replace />;

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back!"); navigate("/", { replace: true }); }
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else if (data?.session) {
      toast.success("Hisob muvaffaqiyatli yaratildi!");
      navigate("/", { replace: true });
    } else {
      toast.success("Tasdiqlash linki yuborildi! Agar xat kelmasa, Supabase Dashboard -> Authentication -> Providers -> Email bo'limidan 'Confirm email' ni o'chirib qo'ying va qayta kiring.");
    }
  }


  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center animate-fade-in">
        {/* Left brand panel */}
        <div className="hidden md:flex flex-col items-start gap-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="text-primary-foreground w-6 h-6" />
            </div>
            <span className="text-2xl font-display font-bold">AI Financial Coach</span>
          </div>
          <h1 className="text-5xl font-display font-bold leading-tight">
            Your money, <span className="text-gradient">smarter.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Track every transaction, set savings goals, and let AI uncover patterns you'd miss. Works with any bank, any currency.
          </p>
          <div className="relative gradient-mascot rounded-3xl p-6 w-full shadow-card">
            <img src={mascot} alt="AI Coach mascot" className="w-32 h-32 mx-auto animate-float" width={128} height={128} />
            <p className="text-center font-semibold mt-2">Hi! I'm your personal AI coach.</p>
          </div>
        </div>

        {/* Right form */}
        <Card className="p-8 shadow-elevated rounded-3xl border-border/50">
          <div className="md:hidden flex items-center justify-center gap-2 mb-6">
            <Sparkles className="text-primary" />
            <span className="font-display font-bold text-lg">AI Financial Coach</span>
          </div>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
                </div>
                <Button type="submit" disabled={busy} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:shadow-elevated transition-all">
                  {busy ? <Loader2 className="animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" maxLength={80} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 chars" minLength={6} />
                </div>
                <Button type="submit" disabled={busy} className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-glow hover:shadow-elevated transition-all">
                  {busy ? <Loader2 className="animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>


        </Card>
      </div>
    </div>
  );
}
