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

const empty = { name: "", username: "", password: "", phone: "", email: "", status: "Aktif" };

export default function ReferralsPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.referrals, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const persist = (v: any[]) => { setRows(v); save(KEYS.referrals, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      persist(rows.map((r) => r.id === form.id ? form : r));
      toast.success("Referral diperbarui");
    } else {
      if (rows.find((r) => r.username === form.username)) return toast.error("Username sudah dipakai");
      persist([...rows, { ...form, id: uid("ref_"), createdAt: new Date().toISOString() }]);
      toast.success("Referral ditambahkan");
    }
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus referral ini?")) persist(rows.filter((r) => r.id !== id)); };

  return (
    <div>
      <PageHeader
        title="Referral"
        subtitle="Agen pencari affiliator yang mengajukan calon ke screening"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Referral</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Referral</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Label className="text-xs">Nama</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-xs">Username</Label><Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
                <div><Label className="text-xs">Password</Label><Input required type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <div><Label className="text-xs">No HP</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="col-span-2">
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
          { key: "name", label: "Nama" },
          { key: "username", label: "Username" },
          { key: "phone", label: "No HP" },
          { key: "email", label: "Email" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red hover:bg-brand-red-soft" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
