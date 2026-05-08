import { useMemo, useState } from "react";
import { KEYS, load, save, uid, fmtIDR } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const empty = { referralId: "", paymentName: "", amount: 0, proof: "", note: "", status: "BELUM DIBAYAR", paidAt: "" };

export default function PaymentReferralPage() {
  const { user } = useAuth();
  const isReferral = user?.role === "referral";
  const [rows, setRows] = useState<any[]>(load(KEYS.paymentReferrals, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [expanded, setExpanded] = useState<string | null>(null);

  const referrals = load<any[]>(KEYS.referrals, []);
  const screening = load<any[]>(KEYS.screening, []);
  const settings = load<any>(KEYS.settings, { referralCommission: 100000 });
  const commission = Number(settings.referralCommission) || 0;

  const visibleReferrals = isReferral ? referrals.filter((r) => r.id === user?.referralId) : referrals;

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

  const stats = useMemo(() => {
    const map: Record<string, any> = {};
    for (const ref of referrals) {
      const approved = screening.filter((s) => s.referralName === ref.name && s.status === "DITERIMA").length;
      const totalPayable = approved * commission;
      const refPayments = rows.filter((p) => p.referralId === ref.id);
      const paid = refPayments.filter((p) => p.status === "DIBAYAR").reduce((a, b) => a + (Number(b.amount) || 0), 0);
      const remaining = Math.max(0, totalPayable - paid);
      map[ref.id] = { approved, totalPayable, paid, remaining, payments: refPayments };
    }
    return map;
  }, [referrals, screening, rows, commission]);

  return (
    <div>
      <PageHeader
        title="Payment Referral"
        subtitle={isReferral ? "Riwayat pembayaran referral Anda" : "Otomatis dari Affiliate Disetujui × Komisi Referral"}
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

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto bg-white/60">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-brand-blue/[0.06] via-white to-brand-blue/[0.06] text-left">
                <th className="px-3 py-3 w-8"></th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Referral</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Aff Disetujui</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Total Komisi</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Sudah Dibayar</th>
                <th className="px-4 py-3 font-display font-semibold text-[11px] uppercase tracking-wide text-brand-blue-dark">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {visibleReferrals.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Belum ada referral.</td></tr>
              ) : visibleReferrals.map((r) => {
                const s = stats[r.id] || { approved: 0, totalPayable: 0, paid: 0, remaining: 0, payments: [] };
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
                      <td className="px-4 py-2.5">{s.approved}</td>
                      <td className="px-4 py-2.5 font-semibold">{fmtIDR(s.totalPayable)}</td>
                      <td className="px-4 py-2.5">{fmtIDR(s.paid)}</td>
                      <td className={`px-4 py-2.5 font-semibold ${s.remaining > 0 ? "text-brand-red" : "text-brand-blue"}`}>{fmtIDR(s.remaining)}</td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-brand-blue/[0.03] border-t border-border/50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <Stat label="Affiliate Disetujui" value={s.approved} />
                            <Stat label="Komisi/Aff" value={fmtIDR(commission)} />
                            <Stat label="Total Komisi" value={fmtIDR(s.totalPayable)} color="text-brand-blue-dark" />
                            <Stat label="Sisa Belum Dibayar" value={fmtIDR(s.remaining)} color="text-brand-red" />
                          </div>
                          <div className="text-[11px] text-muted-foreground mb-1.5 font-semibold">Riwayat Pembayaran</div>
                          <div className="overflow-x-auto rounded-lg border border-border bg-white">
                            <table className="w-full text-[11px]">
                              <thead className="bg-muted/40">
                                <tr>
                                  <th className="px-3 py-2 text-left">Nama</th>
                                  <th className="px-3 py-2 text-left">Nilai</th>
                                  <th className="px-3 py-2 text-left">Status</th>
                                  <th className="px-3 py-2 text-left">Tgl</th>
                                  {!isReferral && <th className="px-3 py-2 text-left">Aksi</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {s.payments.length === 0 ? (
                                  <tr><td colSpan={5} className="px-3 py-3 text-center text-muted-foreground">Belum ada pembayaran.</td></tr>
                                ) : s.payments.map((p: any) => (
                                  <tr key={p.id} className="border-t border-border/60">
                                    <td className="px-3 py-1.5">{p.paymentName}</td>
                                    <td className="px-3 py-1.5 font-semibold">{fmtIDR(p.amount)}</td>
                                    <td className="px-3 py-1.5"><StatusBadge status={p.status} /></td>
                                    <td className="px-3 py-1.5">{p.paidAt || "-"}</td>
                                    {!isReferral && (
                                      <td className="px-3 py-1.5">
                                        <div className="flex gap-1">
                                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => edit(p)}><Pencil className="h-3 w-3" /></Button>
                                          <Button size="icon" variant="ghost" className="h-6 w-6 text-brand-red" onClick={() => del(p.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                      </td>
                                    )}
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
