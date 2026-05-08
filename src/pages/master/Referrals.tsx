import { useMemo, useState } from "react";
import { KEYS, load, save, uid, fmtIDR } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", username: "", password: "", phone: "", email: "", status: "Aktif" };

export default function ReferralsPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.referrals, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(load(KEYS.settings, { referralCommission: 100000 }));

  const screening = load<any[]>(KEYS.screening, []);
  const affiliates = load<any[]>(KEYS.affiliates, []);
  const payments = load<any[]>(KEYS.paymentReferrals, []);

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

  const saveCommission = () => {
    save(KEYS.settings, settings);
    toast.success("Pengaturan komisi disimpan");
  };

  const stats = useMemo(() => {
    const map: Record<string, any> = {};
    for (const r of rows) {
      const sub = screening.filter((s) => s.referralName === r.name);
      const approved = sub.filter((s) => s.status === "DITERIMA");
      const pending = sub.filter((s) => s.status === "PENDING").length;
      const rejected = sub.filter((s) => s.status === "DITOLAK").length;
      const totalPayable = approved.length * (Number(settings.referralCommission) || 0);
      const paid = payments.filter((p) => p.referralId === r.id && p.status === "DIBAYAR")
        .reduce((a, b) => a + (Number(b.amount) || 0), 0);
      const remaining = Math.max(0, totalPayable - paid);
      map[r.id] = { sub, approved, pending, rejected, totalPayable, paid, remaining };
    }
    return map;
  }, [rows, screening, payments, settings.referralCommission]);

  return (
    <div>
      <PageHeader
        title="Referral"
        subtitle="Agen pencari affiliator. Komisi dihitung per affiliate yang DITERIMA."
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

      {/* Commission setting */}
      <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <Label className="text-xs">Komisi per Affiliate Disetujui (Rp)</Label>
          <Input
            type="number" min="0"
            value={settings.referralCommission || 0}
            onChange={(e) => setSettings({ ...settings, referralCommission: Number(e.target.value) })}
          />
          <p className="text-[11px] text-muted-foreground mt-1">Saat ini: <b>{fmtIDR(settings.referralCommission)}</b> per affiliate diterima.</p>
        </div>
        <Button onClick={saveCommission} className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Save className="h-3.5 w-3.5 mr-1" />Simpan Pengaturan</Button>
      </div>

      {/* Custom expandable table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto bg-white/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-brand-blue/[0.06] via-white to-brand-blue/[0.06] text-left">
                <th className="px-3 py-3 w-8"></th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Nama</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Username</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">No HP</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Aff Disetujui</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Total Komisi</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Sisa</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Status</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Belum ada referral.</td></tr>
              ) : rows.map((r) => {
                const s = stats[r.id];
                const isOpen = expanded === r.id;
                return (
                  <>
                    <tr key={r.id} className="border-t border-border/70 hover:bg-brand-blue/[0.04]">
                      <td className="px-3 py-2.5">
                        <button onClick={() => setExpanded(isOpen ? null : r.id)} className="text-brand-blue">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 font-medium">{r.name}</td>
                      <td className="px-4 py-2.5">{r.username}</td>
                      <td className="px-4 py-2.5">{r.phone || "-"}</td>
                      <td className="px-4 py-2.5">{s.approved.length} / {s.sub.length}</td>
                      <td className="px-4 py-2.5 font-semibold">{fmtIDR(s.totalPayable)}</td>
                      <td className={`px-4 py-2.5 font-semibold ${s.remaining > 0 ? "text-brand-red" : "text-brand-blue"}`}>{fmtIDR(s.remaining)}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red hover:bg-brand-red-soft" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-brand-blue/[0.03] border-t border-border/50">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <Stat label="Total Pengajuan" value={s.sub.length} />
                            <Stat label="Diterima" value={s.approved.length} color="text-brand-blue" />
                            <Stat label="Pending" value={s.pending} />
                            <Stat label="Ditolak" value={s.rejected} color="text-brand-red" />
                            <Stat label="Komisi/Aff" value={fmtIDR(settings.referralCommission)} />
                            <Stat label="Total Komisi" value={fmtIDR(s.totalPayable)} color="text-brand-blue-dark" />
                            <Stat label="Sudah Dibayar" value={fmtIDR(s.paid)} />
                            <Stat label="Sisa Belum Dibayar" value={fmtIDR(s.remaining)} color="text-brand-red" />
                          </div>
                          <div className="text-[11px] text-muted-foreground mb-1.5 font-semibold">Daftar Affiliate Referral</div>
                          <div className="overflow-x-auto rounded-lg border border-border bg-white">
                            <table className="w-full text-[11px]">
                              <thead className="bg-muted/40">
                                <tr>
                                  <th className="px-3 py-2 text-left">Fiac</th>
                                  <th className="px-3 py-2 text-left">Nama</th>
                                  <th className="px-3 py-2 text-left">No HP</th>
                                  <th className="px-3 py-2 text-left">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {s.sub.length === 0 ? (
                                  <tr><td colSpan={4} className="px-3 py-3 text-center text-muted-foreground">Belum ada pengajuan.</td></tr>
                                ) : s.sub.map((x: any) => (
                                  <tr key={x.id} className="border-t border-border/60">
                                    <td className="px-3 py-1.5">{x.fiacNo}</td>
                                    <td className="px-3 py-1.5">{x.name}</td>
                                    <td className="px-3 py-1.5">{x.phone}</td>
                                    <td className="px-3 py-1.5"><StatusBadge status={x.status} /></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div className="bg-white rounded-lg border border-border px-3 py-2">
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className={`font-display font-bold text-sm ${color || "text-foreground"}`}>{value}</div>
    </div>
  );
}
