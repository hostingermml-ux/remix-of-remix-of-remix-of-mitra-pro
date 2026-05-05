import { useState } from "react";
import { KEYS, load, save, uid } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";

/**
 * Admin: sees active campaigns (RUNNING/NEW/PROSES) — each card has "Blast" toggle (sets broadcasted=true).
 * Affiliate: sees broadcasted campaigns and can "Daftar" (creates a blast/application row with PENDING).
 */
export default function BlastPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>(load(KEYS.campaigns, []));
  const [blasts, setBlasts] = useState<any[]>(load(KEYS.blasts, []));
  const customers = load<any[]>(KEYS.customers, []);

  const persistCampaigns = (v: any[]) => { setCampaigns(v); save(KEYS.campaigns, v); };
  const persistBlasts = (v: any[]) => { setBlasts(v); save(KEYS.blasts, v); };

  const toggleBlast = (id: string) => {
    persistCampaigns(campaigns.map((c) => c.id === id ? { ...c, broadcasted: !c.broadcasted } : c));
    toast.success("Status blast diperbarui");
  };

  const apply = (campaignId: string) => {
    if (!user) return;
    if (blasts.find((b) => b.campaignId === campaignId && b.affiliateId === user.affiliateId)) {
      toast.error("Anda sudah mendaftar pada kampanye ini");
      return;
    }
    const affiliates = load<any[]>(KEYS.affiliates, []);
    const a = affiliates.find((x) => x.id === user.affiliateId);
    persistBlasts([...blasts, {
      id: uid("b_"),
      campaignId,
      affiliateId: user.affiliateId,
      affiliateName: a?.name,
      affiliatePhone: a?.phone,
      status: "PENDING",
      appliedAt: new Date().toISOString(),
    }]);
    toast.success("Pendaftaran terkirim, menunggu persetujuan admin");
  };

  const visibleCampaigns = user?.role === "admin"
    ? campaigns.filter((c) => ["NEW", "RUNNING", "PROSES"].includes(c.status))
    : campaigns.filter((c) => c.broadcasted && ["NEW", "RUNNING", "PROSES"].includes(c.status));

  return (
    <div>
      <PageHeader
        title={user?.role === "admin" ? "Blast Campaign" : "Campaign Tersedia"}
        subtitle={user?.role === "admin" ? "Broadcast kampanye aktif ke affiliate" : "Daftar pada kampanye yang tersedia"}
      />

      {visibleCampaigns.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground text-sm">Belum ada kampanye aktif.</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleCampaigns.map((c) => {
            const applied = blasts.find((b) => b.campaignId === c.id && b.affiliateId === user?.affiliateId);
            return (
              <div key={c.id} className="glass rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.code}</div>
                    <h3 className="mt-0.5">{c.name}</h3>
                    <div className="text-[11px] text-muted-foreground mt-1">{customers.find((x) => x.id === c.customerId)?.name || "-"}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-[11px] text-muted-foreground">📅 {c.startDate} → {c.endDate}</div>
                {c.description && <p className="text-xs text-foreground/80">{c.description}</p>}

                {user?.role === "admin" ? (
                  <Button onClick={() => toggleBlast(c.id)} className={c.broadcasted ? "bg-teal-primary hover:bg-teal-dark text-white" : ""} variant={c.broadcasted ? "default" : "outline"}>
                    {c.broadcasted ? <><CheckCircle2 className="h-4 w-4 mr-1" /> Sudah Di-blast (klik untuk batal)</> : <><Send className="h-4 w-4 mr-1" /> Blast ke Affiliate</>}
                  </Button>
                ) : applied ? (
                  <Button disabled variant="outline">
                    Status: <StatusBadge status={applied.status} />
                  </Button>
                ) : (
                  <Button onClick={() => apply(c.id)} className="bg-teal-primary hover:bg-teal-dark text-white">Daftar Kampanye</Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-display text-foreground text-[15px] font-semibold mb-2">Database Blast Campaign</h3>
        <DataTable
          rows={(user?.role === "admin" ? blasts : blasts.filter((b) => b.affiliateId === user?.affiliateId)).map((b: any) => ({ ...b }))}
          cols={[
            { key: "campaign", label: "Kampanye", render: (r: any) => campaigns.find((c) => c.id === r.campaignId)?.name || "-" },
            { key: "affiliateName", label: "Affiliate" },
            { key: "affiliatePhone", label: "No HP" },
            { key: "appliedAt", label: "Tgl Daftar", render: (r: any) => r.appliedAt ? new Date(r.appliedAt).toLocaleDateString("id-ID") : "-" },
            { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
          empty="Belum ada blast campaign."
        />
      </div>
    </div>
  );
}
