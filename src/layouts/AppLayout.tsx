import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCog, ShieldCheck, Building2, Megaphone, Send, CheckSquare,
  Radio, FileBarChart, Wallet, LogOut, ChevronLeft, ChevronRight, UserCircle2, Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { load, KEYS } from "@/lib/storage";
import { Button } from "@/components/ui/button";

const ADMIN_MENU = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, key: "dashboard", end: true },
  { section: "Master Data" },
  { to: "/app/staff", label: "Staff", icon: UserCog, key: "staff" },
  { to: "/app/affiliates", label: "Data Affiliate", icon: Users, key: "affiliates" },
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
];

const AFFILIATE_MENU = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, key: "dashboard", end: true },
  { section: "Campaign" },
  { to: "/app/blast", label: "Campaign Tersedia", icon: Send, key: "blast" },
  { to: "/app/running", label: "Campaign Saya", icon: Radio, key: "running" },
  { to: "/app/reports", label: "Report Saya", icon: FileBarChart, key: "reports" },
  { section: "Pembayaran" },
  { to: "/app/payments", label: "Pembayaran", icon: Wallet, key: "payments" },
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
  const allow = perms[user.role] || {};
  const menu = (user.role === "admin" ? ADMIN_MENU : AFFILIATE_MENU).filter((m: any) => m.section || allow[m.key]);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "glass-strong sticky top-0 h-screen shrink-0 transition-all duration-300 flex flex-col border-r border-white/40",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="flex items-center gap-2.5 px-3 h-16 border-b border-teal-light/30">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-primary to-teal-dark shrink-0 shadow-md flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display font-semibold text-[15px] text-teal-dark">
                Afiliasi<span className="text-teal-primary">Hub</span>
              </div>
              <div className="text-[10px] text-[#6B7280] capitalize font-sans">{user.role} panel</div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menu.map((m: any, i) =>
            m.section ? (
              !collapsed && (
                <div key={i} className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-[#6B7280] font-display font-semibold">
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
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-all font-sans",
                    isActive
                      ? "bg-gradient-to-r from-teal-primary to-teal-cadet text-white shadow-md shadow-teal-primary/25"
                      : "text-teal-dark hover:bg-teal-pale/60"
                  )
                }
                title={m.label}
              >
                <m.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate font-medium">{m.label}</span>}
              </NavLink>
            )
          )}
        </nav>

        <div className="p-2 border-t border-teal-light/30 space-y-1">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] font-medium",
                isActive
                  ? "bg-gradient-to-r from-teal-primary to-teal-cadet text-white"
                  : "text-teal-dark hover:bg-teal-pale/60"
              )
            }
          >
            <UserCircle2 className="h-4 w-4" />
            {!collapsed && <span>Profil Saya</span>}
          </NavLink>
          <button
            onClick={() => { logout(); nav("/login"); }}
            className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] text-teal-dark hover:bg-teal-pale/80 font-medium border border-transparent hover:border-teal-cadet/30"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass-soft sticky top-0 z-10 h-14 flex items-center px-4 gap-3 border-b border-white/40">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-teal-dark hover:bg-teal-pale/60"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <div className="text-xs text-[#6B7280] font-sans">
            Halo, <span className="font-semibold text-teal-dark">{user.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-pale/60 border border-teal-light/40 text-[10.5px] font-sans text-teal-dark capitalize">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-primary" />
              {user.role}
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-primary to-teal-dark text-white flex items-center justify-center text-xs font-display font-semibold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
