import { useAuth } from "@/lib/auth";
import { KEYS, load } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export default function CustomerChallenges() {
  const { user } = useAuth();
  const campaigns = load<any[]>(KEYS.campaigns, []).filter((c) => c.customerId === user?.customerId);
  const cIds = new Set(campaigns.map((c) => c.id));
  const challenges = load<any[]>(KEYS.challenges, []).filter((ch: any) => !ch.customerId || ch.customerId === user?.customerId || cIds.has(ch.campaignId));

  return (
    <div>
      <PageHeader title="Challenge" subtitle="Challenge terkait campaign perusahaan Anda" />
      <DataTable
        rows={challenges}
        cols={[
          { key: "name", label: "Nama Challenge" },
          { key: "campaign", label: "Campaign", render: (r) => campaigns.find((c) => c.id === r.campaignId)?.name || "-" },
          { key: "startDate", label: "Mulai" },
          { key: "endDate", label: "Selesai" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status || "AKTIF"} /> },
        ]}
      />
    </div>
  );
}
