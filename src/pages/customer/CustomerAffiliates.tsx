import { useAuth } from "@/lib/auth";
import { KEYS, load } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";

export default function CustomerAffiliates() {
  const { user } = useAuth();
  const campaigns = load<any[]>(KEYS.campaigns, []).filter((c) => c.customerId === user?.customerId);
  const ids = new Set(campaigns.map((c) => c.id));
  const blasts = load<any[]>(KEYS.blasts, []).filter((b) => ids.has(b.campaignId) && b.status === "DITERIMA");
  const affiliates = load<any[]>(KEYS.affiliates, []);
  const seen = new Set<string>();
  const rows = blasts.map((b) => {
    const a = affiliates.find((x) => x.id === b.affiliateId);
    return a ? { ...a, campaign: campaigns.find((c) => c.id === b.campaignId)?.name } : null;
  }).filter(Boolean).filter((a: any) => {
    const k = a.id + "_" + a.campaign;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }) as any[];

  return (
    <div>
      <PageHeader title="Affiliate Aktif" subtitle="Affiliate yang menjalankan campaign untuk perusahaan Anda" />
      <DataTable
        rows={rows}
        cols={[
          { key: "fiacNo", label: "Fiac No" },
          { key: "name", label: "Nama" },
          { key: "city", label: "Domisili" },
          { key: "socialMedia", label: "Social Media", render: (r) => r.socialMedia ? <a className="text-brand-blue underline" href={r.socialMedia} target="_blank" rel="noreferrer">Link</a> : "-" },
          { key: "followers", label: "Followers", render: (r) => (r.followers || 0).toLocaleString("id-ID") },
          { key: "campaign", label: "Campaign" },
        ]}
      />
    </div>
  );
}
