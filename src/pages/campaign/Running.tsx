import { KEYS, load } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Link as LinkIcon, Users } from "lucide-react";

export default function RunningPage() {
  const { user } = useAuth();
  const campaigns = load<any[]>(KEYS.campaigns, []);
  const blasts = load<any[]>(KEYS.blasts, []);
  const customers = load<any[]>(KEYS.customers, []);

  // campaigns that have at least 1 accepted affiliate (admin) OR where current affiliate is accepted
  let list: any[] = [];
  if (user?.role === "admin") {
    list = campaigns.filter((c) => blasts.some((b) => b.campaignId === c.id && b.status === "DITERIMA"));
  } else {
    list = campaigns.filter((c) => blasts.some((b) => b.campaignId === c.id && b.affiliateId === user?.affiliateId && b.status === "DITERIMA"));
  }

  return (
    <div>
      <PageHeader title="Running Campaign" subtitle="Kampanye aktif dengan affiliate yang sudah diterima" />
      {list.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">Belum ada kampanye berjalan.</div>
      ) : (
        <div className="space-y-4">
          {list.map((c) => {
            const accepted = blasts.filter((b) => b.campaignId === c.id && b.status === "DITERIMA");
            return (
              <div key={c.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.code}</div>
                    <h3>{c.name}</h3>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {customers.find((x) => x.id === c.customerId)?.name || "-"} · {c.startDate} → {c.endDate}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    {c.waLink && (
                      <a href={c.waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] gradient-text font-semibold">
                        <LinkIcon className="h-3 w-3" />Link Grup WA
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Users className="h-3.5 w-3.5" /> {accepted.length} affiliate di grup
                </div>
                <div className="flex flex-wrap gap-2">
                  {accepted.map((a) => (
                    <div key={a.id} className="glass-soft rounded-lg px-3 py-1.5 text-[11px] flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-teal-primary to-teal-dark text-white flex items-center justify-center text-[10px] font-semibold">
                        {a.affiliateName?.charAt(0)}
                      </div>
                      <span className="font-medium">{a.affiliateName}</span>
                      <span className="text-muted-foreground">· {a.affiliatePhone}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
