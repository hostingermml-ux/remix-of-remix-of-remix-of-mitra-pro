import { useState } from "react";
import { KEYS, load, save, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const empty = {
  name: "", phone: "", email: "", fiacNo: "", socialMedia: "",
  bankNo: "", bankName: "", ownerName: "", city: "", referralName: "",
  followers: 0, followersUpdatedAt: "",
  status: "Aktif",
};

export default function AffiliatesPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.affiliates, []));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const referrals = load<any[]>(KEYS.referrals, []);

  const persist = (v: any[]) => { setRows(v); save(KEYS.affiliates, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.fiacNo) data.fiacNo = "FIAC" + String(rows.length + 1).padStart(4, "0");
    if (form.id) {
      persist(rows.map((r) => (r.id === form.id ? data : r)));
      toast.success("Affiliate diperbarui");
    } else {
      persist([...rows, { ...data, id: uid("a_") }]);
      toast.success("Affiliate ditambahkan");
    }
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus affiliate ini?")) persist(rows.filter((r) => r.id !== id)); };

  return (
    <div>
      <PageHeader
        title="Data Affiliate"
        subtitle="Database affiliate resmi (hasil approval screening atau input manual)"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Input Manual</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Affiliate (Manual)</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label className="text-xs">Nama Affiliate</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-xs">No HP</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label className="text-xs">No Fiac</Label><Input value={form.fiacNo} onChange={(e) => setForm({ ...form, fiacNo: e.target.value })} placeholder="Auto" /></div>
                <div><Label className="text-xs">Domisili (Kota)</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Link Social Media (TikTok)</Label><Input value={form.socialMedia} onChange={(e) => setForm({ ...form, socialMedia: e.target.value })} /></div>
                <div><Label className="text-xs">Nama Bank</Label><Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
                <div><Label className="text-xs">No Rekening</Label><Input value={form.bankNo} onChange={(e) => setForm({ ...form, bankNo: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Nama Pemilik Rekening</Label><Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></div>
                <div><Label className="text-xs">Jumlah Followers</Label><Input type="number" min="0" value={form.followers || 0} onChange={(e) => setForm({ ...form, followers: Number(e.target.value), followersUpdatedAt: new Date().toISOString().slice(0,10) })} /></div>
                <div><Label className="text-xs">Tanggal Update Followers</Label><Input type="date" value={form.followersUpdatedAt || ""} onChange={(e) => setForm({ ...form, followersUpdatedAt: e.target.value })} /></div>
                <div>
                  <Label className="text-xs">Nama Referral</Label>
                  <Select value={form.referralName || "__none"} onValueChange={(v) => setForm({ ...form, referralName: v === "__none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">— Tanpa Referral —</SelectItem>
                      {referrals.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem></SelectContent>
                  </Select>
                </div>
                <DialogFooter className="col-span-2"><Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        rows={rows}
        cols={[
          { key: "fiacNo", label: "Fiac No" },
          { key: "name", label: "Nama" },
          { key: "phone", label: "Telepon" },
          { key: "city", label: "Domisili" },
          { key: "bankName", label: "Bank" },
          { key: "followers", label: "Followers", render: (r) => (r.followers || 0).toLocaleString("id-ID") },
          { key: "followersUpdatedAt", label: "Tgl Update", render: (r) => r.followersUpdatedAt || "-" },
          { key: "referralName", label: "Referral", render: (r) => r.referralName || "-" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red hover:bg-brand-red-soft" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detail Affiliate</DialogTitle></DialogHeader>
          {view && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["No Fiac", view.fiacNo], ["Nama", view.name], ["No HP", view.phone], ["Email", view.email],
                ["Domisili", view.city], ["TikTok", view.socialMedia], ["Bank", view.bankName],
                ["No Rekening", view.bankNo], ["Pemilik Rek", view.ownerName], ["Referral", view.referralName],
                ["Jumlah Followers", (view.followers || 0).toLocaleString("id-ID")],
                ["Tanggal Update", view.followersUpdatedAt || "-"],
                ["Status", view.status],
              ].map(([k, v]) => (
                <div key={k} className="bg-muted/30 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">{k}</div>
                  <div className="font-medium">{v || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
