import { useState } from "react";
import { KEYS, load, save } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>(load(KEYS.payments, []));
  const campaigns = load<any[]>(KEYS.campaigns, []);
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState<any>({ amount: 0, status: "BELUM DIBAYAR", paidAt: "" });

  const persist = (v: any[]) => { setRows(v); save(KEYS.payments, v); };
  const visible = user?.role === "admin" ? rows : rows.filter((r) => r.affiliateId === user?.affiliateId);

  const openEdit = (r: any) => { setEdit(r); setForm({ amount: r.amount || 0, status: r.status, paidAt: r.paidAt || "" }); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    persist(rows.map((r) => r.id === edit.id ? { ...r, ...form, amount: Number(form.amount) } : r));
    toast.success("Pembayaran diperbarui");
    setEdit(null);
  };

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div>
      <PageHeader
        title="Payment Affiliate"
        subtitle={user?.role === "admin" ? "Kelola pembayaran untuk laporan yang disetujui" : "Status pembayaran Anda"}
      />

      <DataTable
        rows={visible}
        cols={[
          { key: "campaign", label: "Kampanye", render: (r) => campaigns.find((c) => c.id === r.campaignId)?.name || "-" },
          ...(user?.role === "admin" ? [{ key: "affiliateName", label: "Affiliate" }] : []),
          { key: "amount", label: "Jumlah", render: (r) => <span className="font-semibold">{fmt(r.amount)}</span> },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { key: "paidAt", label: "Tgl Bayar", render: (r) => r.paidAt || "-" },
          ...(user?.role === "admin" ? [{
            key: "act", label: "Aksi", render: (r: any) => (
              <Button size="sm" variant="outline" className="h-7" onClick={() => openEdit(r)}>Update</Button>
            ),
          }] : []),
        ]}
      />

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Pembayaran</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div><Label className="text-xs">Jumlah (IDR)</Label><Input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BELUM DIBAYAR">BELUM DIBAYAR</SelectItem>
                  <SelectItem value="PROSES">PROSES</SelectItem>
                  <SelectItem value="DIBAYAR">DIBAYAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Tanggal Bayar</Label><Input type="date" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} /></div>
            <DialogFooter><Button type="submit" className="bg-teal-primary hover:bg-teal-dark text-white">Simpan</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
