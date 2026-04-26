import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Sparkles,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Sparkle,
  Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import mascot from "@/assets/mascot.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CoachChat } from "@/components/CoachChat";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/insights", icon: Sparkles, label: "Insights" },
  { to: "/predictions", icon: TrendingUp, label: "Predictions" },
  { to: "/analytics", icon: Sparkles, label: "SME Analytics" },
  { to: "/premium", icon: Crown, label: "Premium" },
];

export function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const { t } = useTranslation();

  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Friend";

  return (
    <div className="min-h-screen flex w-full gradient-soft">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border p-4 gap-2 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Sparkle className="text-primary-foreground w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-sm">AI Financial</div>
            <div className="font-display font-bold text-sm">Coach</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 mt-4">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setChatOpen(true)}
            className="w-full text-left rounded-2xl gradient-mascot p-4 hover:shadow-glow transition-all group"
          >
            <img
              src={mascot}
              alt="Mascot"
              className="w-20 h-20 mx-auto group-hover:animate-wave"
              width={80}
              height={80}
              loading="lazy"
            />
            <div className="mt-2 text-xs">
              <div className="font-semibold">Your personal</div>
              <div className="font-semibold">AI financial coach</div>
              <div className="text-muted-foreground mt-1">
                making your money work smarter.
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-border/50 px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Sparkle className="text-primary-foreground w-4 h-4" />
            </div>
            <span className="font-display font-bold text-sm">AI Coach</span>
          </div>

          <div className="hidden lg:block flex-1" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-muted transition-colors">
                  <Avatar className="w-9 h-9 ring-2 ring-primary/20">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="w-4 h-4 mr-2" /> {t("Settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate("/auth");
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> {t("Log Out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border/50 flex items-center overflow-x-auto hide-scrollbar px-1 py-1.5">
          {navItems.filter(item => item.to !== '/insights').map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center flex-shrink-0 w-[4.5rem] gap-0.5 py-1.5 rounded-lg text-[10px] transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="truncate w-full text-center px-0.5">{t(label)}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <CoachChat open={chatOpen} onOpenChange={setChatOpen} />

      {/* Floating coach button (mobile) */}
      <button
        onClick={() => setChatOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-2xl gradient-primary shadow-glow flex items-center justify-center animate-pulse-glow"
        aria-label="Open AI coach"
      >
        <Sparkles className="text-primary-foreground w-6 h-6" />
      </button>
    </div>
  );
}
