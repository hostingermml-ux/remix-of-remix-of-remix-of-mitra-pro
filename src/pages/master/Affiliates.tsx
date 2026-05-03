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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", phone: "", email: "", fiacNo: "", socialMedia: "", bankNo: "", bankName: "", status: "Aktif" };

export default function AffiliatesPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.affiliates, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

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
        subtitle="Kelola data affiliate"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-teal-primary hover:bg-teal-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Affiliate</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Affiliate</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label className="text-xs">Nama</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-xs">Telepon</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label className="text-xs">Fiac No</Label><Input value={form.fiacNo} onChange={(e) => setForm({ ...form, fiacNo: e.target.value })} placeholder="Auto jika kosong" /></div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="col-span-2"><Label className="text-xs">Link TikTok</Label><Input value={form.socialMedia} onChange={(e) => setForm({ ...form, socialMedia: e.target.value })} /></div>
                <div><Label className="text-xs">Nama Bank</Label><Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} /></div>
                <div><Label className="text-xs">No. Rekening</Label><Input value={form.bankNo} onChange={(e) => setForm({ ...form, bankNo: e.target.value })} /></div>
                <DialogFooter className="col-span-2"><Button type="submit" className="bg-teal-primary hover:bg-teal-dark text-white">Simpan</Button></DialogFooter>
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
          { key: "email", label: "Email" },
          { key: "bankName", label: "Bank" },
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
