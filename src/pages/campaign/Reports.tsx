import { useState } from "react";
import { KEYS, load, save, uid } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, X, Download } from "lucide-react";
import { toast } from "sonner";

const empty = { campaignId: "", views: 0, likes: 0, comments: 0, contentLink: "", notes: "" };

export default function ReportsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>(load(KEYS.reports, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const campaigns = load<any[]>(KEYS.campaigns, []);
  const blasts = load<any[]>(KEYS.blasts, []);

  const persist = (v: any[]) => { setRows(v); save(KEYS.reports, v); };

  const myCampaigns = user?.role === "affiliate"
    ? campaigns.filter((c) => blasts.some((b) => b.campaignId === c.id && b.affiliateId === user.affiliateId && b.status === "DITERIMA"))
    : [];

  const visible = user?.role === "admin" ? rows : rows.filter((r) => r.affiliateId === user?.affiliateId);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const affiliates = load<any[]>(KEYS.affiliates, []);
    const a = affiliates.find((x) => x.id === user.affiliateId);
    if (form.id) {
      persist(rows.map((r) => r.id === form.id ? { ...form, status: "PENDING" } : r));
      toast.success("Laporan diperbarui & diajukan ulang");
    } else {
      persist([...rows, {
        ...form,
        id: uid("r_"),
        affiliateId: user.affiliateId,
        affiliateName: a?.name,
        status: "PENDING",
        submittedAt: new Date().toISOString(),
        views: Number(form.views), likes: Number(form.likes), comments: Number(form.comments),
      }]);
      toast.success("Laporan terkirim");
    }
    setOpen(false); setForm(empty);
  };

  const approve = (id: string) => {
    persist(rows.map((r) => r.id === id ? { ...r, status: "DITERIMA" } : r));
    // Auto-create pending payment
    const report = rows.find((r) => r.id === id);
    if (report) {
      const payments = load<any[]>(KEYS.payments, []);
      if (!payments.find((p) => p.reportId === id)) {
        payments.push({
          id: uid("p_"),
          reportId: id,
          affiliateId: report.affiliateId,
          affiliateName: report.affiliateName,
          campaignId: report.campaignId,
          amount: 0,
          status: "BELUM DIBAYAR",
          createdAt: new Date().toISOString(),
        });
        save(KEYS.payments, payments);
      }
    }
    toast.success("Laporan disetujui, pembayaran dibuat");
  };
  const revise = (id: string) => {
    const note = prompt("Catatan revisi untuk affiliate:") || "";
    persist(rows.map((r) => r.id === id ? { ...r, status: "REVISI", adminNote: note } : r));
    toast.success("Dikembalikan ke affiliate untuk revisi");
  };

  const downloadCsv = () => {
    const header = ["Kampanye", "Affiliate", "Views", "Likes", "Comments", "Link Konten", "Status", "Catatan"];
    const data = visible.map((r) => [
      campaigns.find((c) => c.id === r.campaignId)?.name || "-",
      r.affiliateName || "-",
      r.views, r.likes, r.comments,
      r.contentLink || "", r.status, r.notes || "",
    ]);
    const csv = [header, ...data].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `report-campaign-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report diunduh");
  };

  return (
    <div>
      <PageHeader
        title="Report Campaign"
        subtitle={user?.role === "admin" ? "Tinjau laporan affiliate" : "Kirim laporan performa Anda"}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCsv} className="border-brand-blue/40 text-brand-blue hover:bg-brand-blue/5">
              <Download className="h-4 w-4 mr-1" />Excel / Spreadsheet
            </Button>
            {user?.role === "affiliate" && (
              <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
                <DialogTrigger asChild><Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Kirim Laporan</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{form.id ? "Revisi" : "Kirim"} Laporan</DialogTitle></DialogHeader>
                  <form onSubmit={submit} className="space-y-3">
                    <div>
                      <Label className="text-xs">Kampanye</Label>
                      <Select value={form.campaignId} onValueChange={(v) => setForm({ ...form, campaignId: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                        <SelectContent>{myCampaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><Label className="text-xs">Views</Label><Input type="number" min="0" required value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} /></div>
                      <div><Label className="text-xs">Likes</Label><Input type="number" min="0" required value={form.likes} onChange={(e) => setForm({ ...form, likes: e.target.value })} /></div>
                      <div><Label className="text-xs">Comments</Label><Input type="number" min="0" required value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></div>
                    </div>
                    <div><Label className="text-xs">Link Konten</Label><Input required value={form.contentLink} onChange={(e) => setForm({ ...form, contentLink: e.target.value })} placeholder="https://..." /></div>
                    <div><Label className="text-xs">Catatan</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    {form.adminNote && <div className="text-[11px] bg-brand-blue/10 text-brand-blue-dark border border-brand-blue/30 rounded p-2">Catatan admin: {form.adminNote}</div>}
                    <DialogFooter><Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white">Kirim</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      <DataTable
        rows={visible}
        cols={[
          { key: "campaign", label: "Kampanye", render: (r) => campaigns.find((c) => c.id === r.campaignId)?.name || "-" },
          ...(user?.role === "admin" ? [{ key: "affiliateName", label: "Affiliate" }] : []),
          { key: "views", label: "Views" },
          { key: "likes", label: "Likes" },
          { key: "comments", label: "Comments" },
          { key: "link", label: "Konten", render: (r) => <a href={r.contentLink} target="_blank" rel="noreferrer" className="gradient-text text-[11px] font-semibold">Lihat</a> },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => {
              if (user?.role === "admin" && r.status === "PENDING") {
                return (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => approve(r.id)} className="h-7 bg-teal-primary hover:bg-teal-dark text-white"><Check className="h-3.5 w-3.5 mr-1" />Terima</Button>
                    <Button size="sm" variant="outline" onClick={() => revise(r.id)} className="h-7"><X className="h-3.5 w-3.5 mr-1" />Revisi</Button>
                  </div>
                );
              }
              if (user?.role === "affiliate" && r.status === "REVISI") {
                return <Button size="sm" variant="outline" className="h-7" onClick={() => { setForm(r); setOpen(true); }}>Revisi</Button>;
              }
              return <span className="text-[11px] text-muted-foreground">—</span>;
            },
          },
        ]}
      />
    </div>
  );
}
