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
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const empty = { referralId: "", paymentName: "", amount: 0, proof: "", note: "", status: "BELUM DIBAYAR", paidAt: "" };

export default function PaymentReferralPage() {
  const { user } = useAuth();
  const isReferral = user?.role === "referral";
  const [rows, setRows] = useState<any[]>(load(KEYS.paymentReferrals, []));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const referrals = load<any[]>(KEYS.referrals, []);

  const visible = isReferral ? rows.filter((r) => r.referralId === user?.referralId) : rows;
  const persist = (v: any[]) => { setRows(v); save(KEYS.paymentReferrals, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      persist(rows.map((r) => r.id === form.id ? { ...form, amount: Number(form.amount) } : r));
      toast.success("Pembayaran referral diperbarui");
    } else {
      persist([...rows, { ...form, amount: Number(form.amount), id: uid("pr_"), createdAt: new Date().toISOString() }]);
      toast.success("Pembayaran referral ditambahkan");
    }
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus pembayaran ini?")) persist(rows.filter((r) => r.id !== id)); };

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);
  const refName = (id: string) => referrals.find((r) => r.id === id)?.name || "-";

  return (
    <div>
      <PageHeader
        title="Payment Referral"
        subtitle={isReferral ? "Riwayat pembayaran referral Anda" : "Kelola pembayaran untuk referral"}
        actions={!isReferral && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Pembayaran</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Pembayaran Referral</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label className="text-xs">Pilih Referral</Label>
                  <Select value={form.referralId} onValueChange={(v) => setForm({ ...form, referralId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{referrals.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Nama Pembayaran</Label><Input required value={form.paymentName} onChange={(e) => setForm({ ...form, paymentName: e.target.value })} /></div>
                <div><Label className="text-xs">Nilai Bayar (IDR)</Label><Input type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div><Label className="text-xs">Bukti Bayar (URL)</Label><Input value={form.proof} onChange={(e) => setForm({ ...form, proof: e.target.value })} placeholder="https://..." /></div>
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
                <div><Label className="text-xs">Note</Label><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
                <DialogFooter><Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      />

      <DataTable
        rows={visible}
        cols={[
          { key: "referral", label: "Referral", render: (r) => refName(r.referralId) },
          { key: "paymentName", label: "Nama Pembayaran" },
          { key: "amount", label: "Nilai", render: (r) => <span className="font-semibold">{fmt(r.amount)}</span> },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5" /></Button>
                {!isReferral && <>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red hover:bg-brand-red-soft" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </>}
              </div>
            ),
          },
        ]}
      />

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detail Pembayaran Referral</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-2 text-xs">
              <div><b>Referral:</b> {refName(view.referralId)}</div>
              <div><b>Nama Pembayaran:</b> {view.paymentName}</div>
              <div><b>Nilai:</b> {fmt(view.amount)}</div>
              <div><b>Status:</b> <StatusBadge status={view.status} /></div>
              <div><b>Bukti:</b> {view.proof ? <a className="gradient-text font-semibold" target="_blank" rel="noreferrer" href={view.proof}>Lihat</a> : "-"}</div>
              <div><b>Note:</b> {view.note || "-"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
