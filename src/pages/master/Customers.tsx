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
import { Plus, Pencil, Trash2, KeyRound, Copy } from "lucide-react";
import { toast } from "sonner";

const empty = { code: "", name: "", address: "", picName: "", picPhone: "", status: "Aktif" };

function makePass() {
  return Math.random().toString(36).slice(2, 8) + Math.floor(Math.random() * 90 + 10);
}

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.customers, []));
  const [accounts, setAccounts] = useState<any[]>(load(KEYS.customerAccounts, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [credView, setCredView] = useState<any>(null);

  const persist = (v: any[]) => { setRows(v); save(KEYS.customers, v); };
  const persistAcc = (v: any[]) => { setAccounts(v); save(KEYS.customerAccounts, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.code) data.code = "CUS" + String(rows.length + 1).padStart(4, "0");
    if (form.id) {
      persist(rows.map((r) => (r.id === form.id ? data : r)));
      toast.success("Customer disimpan");
    } else {
      const id = uid("c_");
      const newRow = { ...data, id };
      persist([...rows, newRow]);
      // generate credentials
      const username = (data.code || `cust${rows.length + 1}`).toLowerCase();
      const password = makePass();
      const acc = { id: uid("cu_"), customerId: id, username, password, createdAt: new Date().toISOString() };
      persistAcc([...accounts, acc]);
      toast.success("Customer ditambahkan & login dibuat");
      setCredView({ customer: newRow, account: acc });
    }
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => {
    if (!confirm("Hapus customer ini?")) return;
    persist(rows.filter((r) => r.id !== id));
    persistAcc(accounts.filter((a) => a.customerId !== id));
  };

  const showCred = (r: any) => {
    const acc = accounts.find((a) => a.customerId === r.id);
    if (!acc) {
      // create one if missing
      const newAcc = { id: uid("cu_"), customerId: r.id, username: r.code.toLowerCase(), password: makePass(), createdAt: new Date().toISOString() };
      persistAcc([...accounts, newAcc]);
      setCredView({ customer: r, account: newAcc });
    } else setCredView({ customer: r, account: acc });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin");
  };

  return (
    <div>
      <PageHeader
        title="Master Data Customer"
        subtitle="Kelola data customer & login portal"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Customer</Button></DialogTrigger>
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
                <DialogFooter><Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan</Button></DialogFooter>
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
          { key: "login", label: "Login Portal", render: (r) => {
            const acc = accounts.find((a) => a.customerId === r.id);
            return acc ? <span className="text-[11px] text-brand-blue-dark font-mono">{acc.username}</span> : <span className="text-[11px] text-muted-foreground">—</span>;
          } },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => showCred(r)} title="Lihat Login"><KeyRound className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red hover:bg-brand-red-soft" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={!!credView} onOpenChange={(o) => !o && setCredView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Login Customer Portal</DialogTitle></DialogHeader>
          {credView && (
            <div className="space-y-3 text-sm">
              <div className="text-xs text-muted-foreground">Kirimkan informasi login berikut kepada customer:</div>
              <div className="glass-soft rounded-lg p-3 space-y-2">
                <Field label="Customer" value={credView.customer.name} />
                <Field label="URL" value={`${window.location.origin}/login`} />
                <Field label="Username" value={credView.account.username} onCopy={copy} />
                <Field label="Password" value={credView.account.password} onCopy={copy} />
              </div>
              <Button
                className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white"
                onClick={() => copy(`Login Portal Customer\nURL: ${window.location.origin}/login\nUsername: ${credView.account.username}\nPassword: ${credView.account.password}`)}
              >
                <Copy className="h-3.5 w-3.5 mr-1" /> Salin Semua Info Login
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, onCopy }: { label: string; value: string; onCopy?: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        <div className="font-mono text-xs truncate">{value}</div>
      </div>
      {onCopy && (
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onCopy(value)}><Copy className="h-3.5 w-3.5" /></Button>
      )}
    </div>
  );
}
