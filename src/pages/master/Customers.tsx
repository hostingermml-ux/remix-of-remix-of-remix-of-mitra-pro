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

const empty = { code: "", name: "", address: "", picName: "", picPhone: "", status: "Aktif" };

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.customers, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const persist = (v: any[]) => { setRows(v); save(KEYS.customers, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.code) data.code = "CUS" + String(rows.length + 1).padStart(4, "0");
    if (form.id) persist(rows.map((r) => (r.id === form.id ? data : r)));
    else persist([...rows, { ...data, id: uid("c_") }]);
    toast.success("Customer disimpan");
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus customer ini?")) persist(rows.filter((r) => r.id !== id)); };

  return (
    <div>
      <PageHeader
        title="Master Data Customer"
        subtitle="Kelola data customer"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-teal-primary hover:bg-teal-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Customer</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Customer</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div><Label className="text-xs">Kode Customer</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Auto jika kosong" /></div>
                <div><Label className="text-xs">Nama</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-xs">Alamat</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Nama PIC</Label><Input value={form.picName} onChange={(e) => setForm({ ...form, picName: e.target.value })} /></div>
                  <div><Label className="text-xs">Telepon PIC</Label><Input value={form.picPhone} onChange={(e) => setForm({ ...form, picPhone: e.target.value })} /></div>
                </div>
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
          { key: "code", label: "Kode" },
          { key: "name", label: "Nama" },
          { key: "address", label: "Alamat" },
          { key: "picName", label: "PIC" },
          { key: "picPhone", label: "Telepon PIC" },
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
