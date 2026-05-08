import { useAuth } from "@/lib/auth";
import { KEYS, load } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";

export default function CustomerReports() {
  const { user } = useAuth();
  const campaigns = load<any[]>(KEYS.campaigns, []).filter((c) => c.customerId === user?.customerId);
  const ids = new Set(campaigns.map((c) => c.id));
  const reports = load<any[]>(KEYS.reports, []).filter((r) => ids.has(r.campaignId));

  return (
    <div>
      <PageHeader title="Report Campaign" subtitle="Laporan affiliate untuk campaign Anda (tanpa data finansial)" />
      <DataTable
        rows={reports}
        cols={[
          { key: "campaign", label: "Campaign", render: (r) => campaigns.find((c) => c.id === r.campaignId)?.name || "-" },
          { key: "affiliateName", label: "Affiliate" },
          { key: "views", label: "Views", render: (r) => (Number(r.views) || 0).toLocaleString("id-ID") },
          { key: "likes", label: "Likes", render: (r) => (Number(r.likes) || 0).toLocaleString("id-ID") },
          { key: "comments", label: "Comments", render: (r) => (Number(r.comments) || 0).toLocaleString("id-ID") },
          { key: "shares", label: "Shares", render: (r) => (Number(r.shares) || 0).toLocaleString("id-ID") },
          { key: "submittedAt", label: "Tgl Submit", render: (r) => r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("id-ID") : "-" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
