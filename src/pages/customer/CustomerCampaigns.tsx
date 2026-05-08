import { useAuth } from "@/lib/auth";
import { KEYS, load } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export default function CustomerCampaigns() {
  const { user } = useAuth();
  const campaigns = load<any[]>(KEYS.campaigns, []).filter((c) => c.customerId === user?.customerId);

  return (
    <div>
      <PageHeader title="Campaign Saya" subtitle="Daftar campaign yang berjalan untuk perusahaan Anda" />
      <DataTable
        rows={campaigns}
        cols={[
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama Campaign" },
          { key: "period", label: "Periode", render: (r) => `${r.startDate} → ${r.endDate}` },
          { key: "target", label: "Target Aff", render: (r) => r.targetAff || 0 },
          { key: "actual", label: "Aktual Aff Join", render: (r) => {
            const blasts = load<any[]>(KEYS.blasts, []);
            const auto = blasts.filter((b) => b.campaignId === r.id && b.status === "DITERIMA").length;
            return r.actualAff || auto;
          } },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
