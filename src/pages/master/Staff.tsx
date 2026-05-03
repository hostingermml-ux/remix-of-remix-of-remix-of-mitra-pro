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

const empty = { name: "", username: "", gender: "Pria", phone: "", status: "Aktif" };

export default function StaffPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.staff, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const persist = (v: any[]) => { setRows(v); save(KEYS.staff, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
      persist(rows.map((r) => (r.id === form.id ? form : r)));
      toast.success("Staff diperbarui");
    } else {
      persist([...rows, { ...form, id: uid("s_") }]);
      toast.success("Staff ditambahkan");
    }
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus staff ini?")) persist(rows.filter((r) => r.id !== id)); };

  return (
    <div>
      <PageHeader
        title="Master Data Staff"
        subtitle="Kelola data staff internal"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild>
              <Button className="bg-teal-primary hover:bg-teal-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Staff</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div><Label className="text-xs">Nama</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-xs">Username</Label><Input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
                <div>
                  <Label className="text-xs">Jenis Kelamin</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Pria">Pria</SelectItem><SelectItem value="Wanita">Wanita</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Nomor Telepon</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem></SelectContent>
                  </Select>
                </div>
                <DialogFooter><Button type="submit" className="bg-teal-primary hover:bg-teal-dark text-white">Simpan</Button></DialogFooter>
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
          { key: "gender", label: "Gender" },
          { key: "phone", label: "Telepon" },
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
