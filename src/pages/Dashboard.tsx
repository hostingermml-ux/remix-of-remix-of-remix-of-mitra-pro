import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { KEYS, load } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Users, Megaphone, Wallet, FileBarChart, UserCog, Building2,
  Eye, Heart, MessageCircle, TrendingUp, Activity, CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Legend,
} from "recharts";

const BRAND = ["#0B3FBF", "#062A80", "#144DDB", "#6B8AE8", "#B8C8F2"];
const BRAND_RED = "#E60000";

function StatCard({ label, value, icon: Icon, hint }: any) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition-shadow">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-teal-primary to-teal-dark text-white shadow-md flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] text-[#6B7280] uppercase tracking-wide font-display font-semibold">{label}</div>
        <div className="text-xl font-display font-bold text-teal-dark leading-tight">{value}</div>
        {hint && <div className="text-[10.5px] text-[#6B7280] truncate">{hint}</div>}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }: any) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <div className="mb-3">
        <h3 className="font-display text-teal-dark text-[15px]">{title}</h3>
        {subtitle && <div className="text-[11px] text-[#6B7280] font-sans">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  background: "rgba(255,255,255,0.98)",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 11,
  color: "#111827",
  boxShadow: "0 10px 30px rgba(11,63,191,0.12)",
};

export default function Dashboard() {
  const { user } = useAuth();
  const staff = load<any[]>(KEYS.staff, []);
  const affiliates = load<any[]>(KEYS.affiliates, []);
  const customers = load<any[]>(KEYS.customers, []);
  const campaignsAll = load<any[]>(KEYS.campaigns, []);
  const reportsAll = load<any[]>(KEYS.reports, []);
  const paymentsAll = load<any[]>(KEYS.payments, []);
  const blastsAll = load<any[]>(KEYS.blasts, []);

  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  // Customer scope: only their data, no finance
  const customerCampaignIds = isCustomer ? new Set(campaignsAll.filter((c) => c.customerId === user?.customerId).map((c) => c.id)) : new Set<string>();
  const campaigns = isCustomer ? campaignsAll.filter((c) => customerCampaignIds.has(c.id)) : campaignsAll;
  const reports = isCustomer ? reportsAll.filter((r) => customerCampaignIds.has(r.campaignId)) : reportsAll;
  const payments = isCustomer ? [] : paymentsAll;
  const blasts = isCustomer ? blastsAll.filter((b) => customerCampaignIds.has(b.campaignId)) : blastsAll;

  const myApplications = !isAdmin && !isCustomer ? blasts.filter((b) => b.affiliateId === user?.affiliateId) : [];
  const myReports = !isAdmin && !isCustomer ? reports.filter((r) => r.affiliateId === user?.affiliateId) : [];
  const myPayments = !isAdmin && !isCustomer ? payments.filter((p) => p.affiliateId === user?.affiliateId) : [];

  // Aggregations
  const campaignByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    campaigns.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [campaigns]);

  const reportStatus = useMemo(() => {
    const src = isAdmin ? reports : myReports;
    const map: Record<string, number> = {};
    src.forEach((r) => { map[r.status] = (map[r.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [reports, myReports, isAdmin]);

  const paymentSummary = useMemo(() => {
    const src = isAdmin ? payments : myPayments;
    const totalPaid = src.filter((p) => p.status === "DIBAYAR").reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const totalPending = src.filter((p) => p.status !== "DIBAYAR").reduce((a, b) => a + (Number(b.amount) || 0), 0);
    return { totalPaid, totalPending };
  }, [payments, myPayments, isAdmin]);

  const topCampaignsByEngagement = useMemo(() => {
    const acc: Record<string, { name: string; views: number; likes: number; comments: number }> = {};
    (isAdmin ? reports : myReports).forEach((r) => {
      const cname = campaigns.find((c) => c.id === r.campaignId)?.name || "—";
      if (!acc[r.campaignId]) acc[r.campaignId] = { name: cname, views: 0, likes: 0, comments: 0 };
      acc[r.campaignId].views += Number(r.views) || 0;
      acc[r.campaignId].likes += Number(r.likes) || 0;
      acc[r.campaignId].comments += Number(r.comments) || 0;
    });
    return Object.values(acc).sort((a, b) => b.views - a.views).slice(0, 5);
  }, [reports, myReports, campaigns, isAdmin]);

  const trend = useMemo(() => {
    // last 7 days, count reports submitted
    const days: { day: string; reports: number; payments: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      const repCount = (isAdmin ? reports : myReports).filter((r) => (r.submittedAt || "").slice(0, 10) === key).length;
      const payCount = (isAdmin ? payments : myPayments).filter((p) => (p.createdAt || "").slice(0, 10) === key).length;
      days.push({ day: label, reports: repCount, payments: payCount });
    }
    return days;
  }, [reports, myReports, payments, myPayments, isAdmin]);

  const totalEngagement = useMemo(() => {
    const src = isAdmin ? reports : myReports;
    return src.reduce(
      (acc, r) => ({
        views: acc.views + (Number(r.views) || 0),
        likes: acc.likes + (Number(r.likes) || 0),
        comments: acc.comments + (Number(r.comments) || 0),
      }),
      { views: 0, likes: 0, comments: 0 }
    );
  }, [reports, myReports, isAdmin]);

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Selamat datang, ${user?.name}`}
        subtitle={isAdmin ? "Ringkasan operasional kampanye, affiliate, dan pembayaran" : "Pantau performa kampanye dan pembayaran Anda"}
      />

      {/* Stats */}
      {isAdmin ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Staff" value={staff.length} icon={UserCog} />
          <StatCard label="Affiliate" value={affiliates.length} icon={Users} hint={`${affiliates.filter((a) => a.status === "Aktif").length} aktif`} />
          <StatCard label="Customer" value={customers.length} icon={Building2} />
          <StatCard label="Kampanye" value={campaigns.length} icon={Megaphone} hint={`${campaigns.filter((c) => c.status === "RUNNING").length} berjalan`} />
          <StatCard label="Laporan" value={reports.length} icon={FileBarChart} hint={`${reports.filter((r) => r.status === "PENDING").length} pending`} />
          <StatCard label="Pembayaran" value={payments.length} icon={Wallet} hint={`${payments.filter((p) => p.status === "DIBAYAR").length} dibayar`} />
        </div>
      ) : isCustomer ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Campaign Saya" value={campaigns.length} icon={Megaphone} hint={`${campaigns.filter((c) => c.status === "RUNNING").length} berjalan`} />
          <StatCard label="Affiliate Aktif" value={new Set(blasts.filter(b => b.status === "DITERIMA").map(b => b.affiliateId)).size} icon={Users} />
          <StatCard label="Total Laporan" value={reports.length} icon={FileBarChart} />
          <StatCard label="Selesai" value={campaigns.filter((c) => c.status === "DONE").length} icon={CheckCircle2} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Aplikasi Saya" value={myApplications.length} icon={Megaphone} />
          <StatCard label="Diterima" value={myApplications.filter(a => a.status === "DITERIMA").length} icon={CheckCircle2} />
          <StatCard label="Laporan Saya" value={myReports.length} icon={FileBarChart} />
          <StatCard label="Pembayaran" value={myPayments.length} icon={Wallet} hint={`${myPayments.filter(p => p.status === "DIBAYAR").length} dibayar`} />
        </div>
      )}

      {/* Engagement totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Total Views" value={totalEngagement.views.toLocaleString("id-ID")} icon={Eye} />
        <StatCard label="Total Likes" value={totalEngagement.likes.toLocaleString("id-ID")} icon={Heart} />
        <StatCard label="Total Comments" value={totalEngagement.comments.toLocaleString("id-ID")} icon={MessageCircle} />
      </div>

      {/* Payment summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #062A80 0%, #0B3FBF 100%)", boxShadow: "0 18px 40px rgba(11,63,191,0.22)" }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-white/75 font-display font-semibold">Total Dibayarkan</div>
              <div className="font-display text-2xl font-bold text-white mt-1">{fmt(paymentSummary.totalPaid)}</div>
              <div className="text-[11px] text-white/70 mt-0.5">Akumulasi pembayaran berhasil</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-brand-red/30 blur-3xl pointer-events-none" />
        </div>
        <div className="glass p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-display font-semibold">Outstanding</div>
            <div className="font-display text-2xl font-bold text-foreground mt-1">{fmt(paymentSummary.totalPending)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Menunggu / sedang diproses</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-red-soft border border-brand-red/20 flex items-center justify-center">
            <Activity className="h-6 w-6 text-brand-red" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Tren 7 Hari Terakhir" subtitle="Laporan & pembayaran masuk per hari" className="lg:col-span-2">
          {trend.every((t) => t.reports === 0 && t.payments === 0) ? (
            <EmptyChart text="Belum ada aktivitas dalam 7 hari terakhir." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B3FBF" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#0B3FBF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#144DDB" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#144DDB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#111827" }} />
                <Area type="monotone" dataKey="reports" name="Laporan" stroke="#0B3FBF" fill="url(#gReports)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="payments" name="Pembayaran" stroke="#144DDB" fill="url(#gPay)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Distribusi Status Laporan" subtitle="Komposisi status saat ini">
          {reportStatus.length === 0 ? (
            <EmptyChart text="Belum ada laporan." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={reportStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {reportStatus.map((entry, i) => {
                    const isNeg = ["DITOLAK", "REVISI", "BELUM DIBAYAR", "CANCEL"].includes(entry.name);
                    return (
                      <Cell key={i} fill={isNeg ? BRAND_RED : BRAND[i % BRAND.length]} stroke="#FFFFFF" strokeWidth={2} />
                    );
                  })}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#1F2937" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Status Kampanye" subtitle="Berdasarkan pipeline">
            {campaignByStatus.length === 0 ? (
              <EmptyChart text="Belum ada kampanye." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={campaignByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(11,63,191,0.05)" }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {campaignByStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.name === "CANCEL" ? BRAND_RED : BRAND[i % BRAND.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Top 5 Kampanye (Views)" subtitle="Berdasarkan engagement laporan" className="lg:col-span-2">
            {topCampaignsByEngagement.length === 0 ? (
              <EmptyChart text="Belum ada data engagement." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topCampaignsByEngagement} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={11} width={120} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(11,63,191,0.05)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="views" fill="#0B3FBF" name="Views" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="likes" fill="#144DDB" name="Likes" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="comments" fill="#6B8AE8" name="Comments" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}

      {/* Recent campaigns + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-teal-dark text-[15px]">Kampanye Terbaru</h3>
            <TrendingUp className="h-4 w-4 text-teal-primary" />
          </div>
          {campaigns.length === 0 ? (
            <p className="text-xs text-[#6B7280]">Belum ada kampanye.</p>
          ) : (
            <div className="space-y-2">
              {campaigns.slice(-5).reverse().map((c) => (
                <div key={c.id} className="flex items-center justify-between glass-soft rounded-lg px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium text-teal-dark truncate">{c.name}</div>
                    <div className="text-[#6B7280] text-[11px]">{c.code} · {c.startDate} → {c.endDate}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-teal-dark text-[15px]">Aktivitas Terbaru</h3>
            <Activity className="h-4 w-4 text-teal-primary" />
          </div>
          {(() => {
            const acts: { time: string; text: string; status: string }[] = [];
            (isAdmin ? reports : myReports).slice(-5).forEach((r) => {
              acts.push({
                time: r.submittedAt || "",
                text: `Laporan dari ${r.affiliateName || "—"}`,
                status: r.status,
              });
            });
            (isAdmin ? blasts : myApplications).slice(-5).forEach((b) => {
              acts.push({
                time: b.appliedAt || "",
                text: `Pendaftaran ${b.affiliateName || user?.name}`,
                status: b.status,
              });
            });
            const sorted = acts.sort((a, b) => (b.time || "").localeCompare(a.time || "")).slice(0, 6);
            if (sorted.length === 0) return <p className="text-xs text-[#6B7280]">Belum ada aktivitas.</p>;
            return (
              <div className="space-y-2">
                {sorted.map((a, i) => (
                  <div key={i} className="flex items-center justify-between glass-soft rounded-lg px-3 py-2 text-xs">
                    <div className="min-w-0">
                      <div className="text-teal-dark truncate">{a.text}</div>
                      <div className="text-[10.5px] text-[#6B7280]">
                        {a.time ? new Date(a.time).toLocaleString("id-ID") : "—"}
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-[240px] flex flex-col items-center justify-center text-center text-[#6B7280] text-xs gap-2">
      <div className="h-12 w-12 rounded-full bg-teal-pale/60 border border-teal-light/40 flex items-center justify-center">
        <Activity className="h-5 w-5 text-teal-cadet" />
      </div>
      {text}
    </div>
  );
}
