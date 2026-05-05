import { useState } from "react";
import { KEYS, load, save, uid, STATUS_CAMPAIGN } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = { code: "", name: "", customerId: "", startDate: "", endDate: "", status: "NEW", waLink: "", description: "", targetAff: 0, actualAff: 0, budget: 0, realisasiBudget: 0 };

export default function CampaignsPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.campaigns, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const customers = load<any[]>(KEYS.customers, []);

  const persist = (v: any[]) => { setRows(v); save(KEYS.campaigns, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.code) data.code = "CMP" + String(rows.length + 1).padStart(4, "0");
    if (form.id) persist(rows.map((r) => (r.id === form.id ? data : r)));
    else persist([...rows, { ...data, id: uid("cm_"), createdAt: new Date().toISOString() }]);
    toast.success("Kampanye disimpan");
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus kampanye ini?")) persist(rows.filter((r) => r.id !== id)); };

  return (
    <div>
      <PageHeader
        title="List Campaign"
        subtitle="Kelola kampanye afiliasi"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-teal-primary hover:bg-teal-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Campaign</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Campaign</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Kode</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Auto" /></div>
                <div><Label className="text-xs">Nama</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="col-span-2">
                  <Label className="text-xs">Customer</Label>
                  <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih customer" /></SelectTrigger>
                    <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Tanggal Mulai</Label><Input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div><Label className="text-xs">Tanggal Selesai</Label><Input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                <div className="col-span-2">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_CAMPAIGN.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Target Jumlah Aff</Label><Input type="number" min="0" value={form.targetAff} onChange={(e) => setForm({ ...form, targetAff: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Aktual Jumlah Aff Join</Label><Input type="number" min="0" value={form.actualAff} onChange={(e) => setForm({ ...form, actualAff: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Budget (IDR)</Label><Input type="number" min="0" value={form.budget || 0} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} /></div>
                <div><Label className="text-xs">Realisasi Budget (IDR)</Label><Input type="number" min="0" value={form.realisasiBudget || 0} onChange={(e) => setForm({ ...form, realisasiBudget: Number(e.target.value) })} /></div>
                <div className="col-span-2"><Label className="text-xs">Link Grup WA</Label><Input value={form.waLink} onChange={(e) => setForm({ ...form, waLink: e.target.value })} placeholder="https://chat.whatsapp.com/..." /></div>
                <div className="col-span-2"><Label className="text-xs">Deskripsi</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <DialogFooter className="col-span-2"><Button type="submit" className="bg-teal-primary hover:bg-teal-dark text-white">Simpan</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        rows={rows}
        cols={[
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama" },
          { key: "customer", label: "Customer", render: (r) => customers.find((c) => c.id === r.customerId)?.name || "-" },
          { key: "period", label: "Periode", render: (r) => `${r.startDate} → ${r.endDate}` },
          { key: "target", label: "Target Aff", render: (r) => r.targetAff || 0 },
          { key: "actual", label: "Aktual Aff", render: (r) => {
            const blasts = load<any[]>(KEYS.blasts, []);
            const auto = blasts.filter((b) => b.campaignId === r.id && b.status === "DITERIMA").length;
            return r.actualAff || auto;
          } },
          { key: "budget", label: "Budget", render: (r) => "Rp " + (r.budget || 0).toLocaleString("id-ID") },
          { key: "realisasi", label: "Realisasi", render: (r) => "Rp " + (r.realisasiBudget || 0).toLocaleString("id-ID") },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-teal-dark hover:bg-teal-pale/60" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
