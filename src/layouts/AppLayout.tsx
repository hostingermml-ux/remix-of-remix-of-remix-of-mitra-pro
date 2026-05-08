import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCog, ShieldCheck, Building2, Megaphone, Send, CheckSquare,
  Radio, FileBarChart, Wallet, LogOut, ChevronLeft, ChevronRight, UserCircle2, Sparkles, Bell,
  UserCheck, UserPlus, Trophy, HandCoins, Briefcase,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { load, KEYS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import BackupControls from "@/components/BackupControls";

const ADMIN_MENU = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, key: "dashboard", end: true },
  { section: "Master Data" },
  { to: "/app/staff", label: "Staff", icon: UserCog, key: "staff" },
  { to: "/app/screening", label: "Data Screening Affiliate", icon: UserPlus, key: "screening" },
  { to: "/app/accept-reject", label: "Accept/Reject Affiliate", icon: UserCheck, key: "acceptReject" },
  { to: "/app/affiliates", label: "Data Affiliate", icon: Users, key: "affiliates" },
  { to: "/app/referrals", label: "Referral", icon: HandCoins, key: "referrals" },
  { to: "/app/customers", label: "Customer", icon: Building2, key: "customers" },
  { to: "/app/permissions", label: "Hak Akses", icon: ShieldCheck, key: "permissions" },
  { section: "Campaign" },
  { to: "/app/campaigns", label: "List Campaign", icon: Megaphone, key: "campaigns" },
  { to: "/app/blast", label: "Blast Campaign", icon: Send, key: "blast" },
  { to: "/app/approval", label: "Approval Affiliate", icon: CheckSquare, key: "approval" },
  { to: "/app/running", label: "Running Campaign", icon: Radio, key: "running" },
  { to: "/app/reports", label: "Report Campaign", icon: FileBarChart, key: "reports" },
  { section: "Pembayaran" },
  { to: "/app/payments", label: "Payment Affiliate", icon: Wallet, key: "payments" },
  { to: "/app/payment-referrals", label: "Payment Referral", icon: Wallet, key: "paymentReferrals" },
  { section: "Challenge" },
  { to: "/app/challenge", label: "Challenge", icon: Trophy, key: "challenge" },
  { to: "/app/challenge-winners", label: "Pilih Pemenang", icon: Trophy, key: "challengeWinners" },
  { to: "/app/payment-challenges", label: "Payment Challenge", icon: Wallet, key: "paymentChallenges" },
];

const AFFILIATE_MENU = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, key: "dashboard", end: true },
  { section: "Campaign" },
  { to: "/app/blast", label: "Campaign Tersedia", icon: Send, key: "blast" },
  { to: "/app/running", label: "Campaign Saya", icon: Radio, key: "running" },
  { to: "/app/reports", label: "Report Saya", icon: FileBarChart, key: "reports" },
  { section: "Pembayaran" },
  { to: "/app/payments", label: "Pembayaran", icon: Wallet, key: "payments" },
  { section: "Challenge" },
  { to: "/app/challenge", label: "Challenge", icon: Trophy, key: "challenge" },
];

const REFERRAL_MENU = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, key: "dashboard", end: true },
  { section: "Affiliate" },
  { to: "/app/screening", label: "Data Screening", icon: UserPlus, key: "screening" },
  { to: "/app/affiliates", label: "Affiliate Disetujui", icon: Users, key: "affiliates" },
  { section: "Pembayaran" },
  { to: "/app/payment-referrals", label: "Payment Referral", icon: Wallet, key: "paymentReferrals" },
];

const CUSTOMER_MENU = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, key: "dashboard", end: true },
  { section: "Operasional" },
  { to: "/app/customer/campaigns", label: "Campaign Saya", icon: Megaphone, key: "customerCampaigns" },
  { to: "/app/customer/affiliates", label: "Affiliate Aktif", icon: Users, key: "customerAffiliates" },
  { to: "/app/customer/reports", label: "Report Campaign", icon: FileBarChart, key: "customerReports" },
  { to: "/app/customer/challenges", label: "Challenge", icon: Trophy, key: "customerChallenges" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    nav("/login", { replace: true });
    return null;
  }

  const perms = load<any>(KEYS.permissions, {});
  const staffPerms = load<any>(KEYS.staffPerms, {});
  let allow = perms[user.role] || {};
  if (user.role === "admin" && staffPerms[user.id]) allow = staffPerms[user.id];

  const menuSrc =
    user.role === "admin" ? ADMIN_MENU :
    user.role === "referral" ? REFERRAL_MENU :
    user.role === "customer" ? CUSTOMER_MENU :
    AFFILIATE_MENU;
  const menu = menuSrc.filter((m: any) => m.section || allow[m.key]);

  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={cn(
          "sticky top-0 h-screen shrink-0 transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
        style={{
          background: "linear-gradient(180deg, #FFE100 0%, #F5C400 100%)",
          boxShadow: "8px 0 32px rgba(5, 5, 5, 0.18)",
          color: "#050505",
        }}
      >
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-black/10">
          <div className="h-9 w-9 rounded-xl bg-black/90 border border-black/20 shrink-0 flex items-center justify-center shadow-md">
            <Sparkles className="h-4 w-4" style={{ color: "#FFE100" }} />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display font-bold text-[16px] tracking-tight text-black">
                VAPE<span className="ml-1 px-1.5 rounded bg-black text-[#FFE100]">HUB</span>
              </div>
              <div className="text-[10px] text-black/60 capitalize font-sans">{user.role} panel</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menu.map((m: any, i) =>
            m.section ? (
              !collapsed && (
                <div key={i} className="px-2 pt-4 pb-1.5 text-[10px] uppercase tracking-[0.12em] text-black/55 font-display font-semibold">
                  {m.section}
                </div>
              )
            ) : (
              <NavLink
                key={m.to}
                to={m.to}
                end={m.end}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-sans font-medium transition-all",
                    isActive
                      ? "bg-black text-[#FFE100] shadow-[0_8px_20px_rgba(0,0,0,0.28)]"
                      : "text-black/85 hover:bg-black/10 hover:text-black"
                  )
                }
                title={m.label}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r" style={{ background: "#FFE100" }} />
                    )}
                    <m.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{m.label}</span>}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="p-2 border-t border-black/10 space-y-1">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-sans font-medium",
                isActive ? "bg-black text-[#FFE100]" : "text-black/85 hover:bg-black/10"
              )
            }
          >
            <UserCircle2 className="h-4 w-4" />
            {!collapsed && <span>Profil Saya</span>}
          </NavLink>
          <button
            onClick={() => { logout(); nav("/login"); }}
            className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-sans font-medium text-black/85 hover:bg-black hover:text-[#FFE100] transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass-soft sticky top-0 z-10 h-14 flex items-center px-4 gap-3 border-b border-border/70">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground hover:bg-[#FFE100]/30 hover:text-black"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <div className="text-xs text-muted-foreground font-sans">
            Halo, <span className="font-semibold text-foreground font-display">{user.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <BackupControls />
            <button className="relative h-8 w-8 rounded-full bg-white border border-border flex items-center justify-center text-foreground hover:text-black hover:border-[#FFE100] transition">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white" style={{ background: "#FFE100" }} />
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10.5px] font-sans capitalize font-semibold"
              style={{ background: "rgba(255,225,0,0.18)", borderColor: "rgba(245,196,0,0.5)", color: "#050505" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#F5C400" }} />
              {user.role}
            </div>
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-display font-bold shadow-md"
              style={{ background: "linear-gradient(135deg, #050505 0%, #2B2B2B 100%)", color: "#FFE100" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-7 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
