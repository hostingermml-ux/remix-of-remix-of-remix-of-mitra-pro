import { useState } from "react";
import { KEYS, load, save, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty: any = {
  challengeId: "", challengeName: "", affiliateId: "", affiliateName: "",
  noRek: "", indikatorReport: "", nilaiHadiah: 0, adminBank: 0,
};

export default function PaymentChallengesPage() {
  const challenges = load<any[]>(KEYS.challenges, []);
  const winners = load<any[]>(KEYS.challengeWinners, []);
  const affiliates = load<any[]>(KEYS.affiliates, []);
  const apps = load<any[]>(KEYS.challengeApps, []);
  const [rows, setRows] = useState<any[]>(load(KEYS.paymentChallenges, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);

  const persist = (v: any[]) => { setRows(v); save(KEYS.paymentChallenges, v); };

  const winnersForChallenge = form.challengeId
    ? winners.filter((w) => w.challengeId === form.challengeId)
    : [];

  const onPickChallenge = (id: string) => {
    const c = challenges.find((x) => x.id === id);
    setForm((f: any) => ({ ...f, challengeId: id, challengeName: c?.name || "", nilaiHadiah: Number(c?.nilaiChallenge || f.nilaiHadiah || 0), affiliateId: "", affiliateName: "", noRek: "" }));
  };
  const onPickAffiliate = (aid: string) => {
    const aff = affiliates.find((x) => x.id === aid);
    const w = winners.find((x) => x.challengeId === form.challengeId && x.affiliateId === aid);
    const app = apps.find((x) => x.challengeId === form.challengeId && x.affiliateId === aid);
    setForm((f: any) => ({
      ...f,
      affiliateId: aid,
      affiliateName: aff?.name || w?.affiliateName || "",
      noRek: aff?.bankNo || "",
      nilaiHadiah: Number(w?.nilaiHadiah ?? f.nilaiHadiah ?? 0),
      indikatorReport: app?.status || f.indikatorReport,
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(form.nilaiHadiah || 0) + Number(form.adminBank || 0);
    const data = { ...form, nilaiHadiah: Number(form.nilaiHadiah || 0), adminBank: Number(form.adminBank || 0), total };
    if (form.id) persist(rows.map((r) => r.id === form.id ? data : r));
    else persist([...rows, { ...data, id: uid("pc_"), createdAt: new Date().toISOString() }]);
    toast.success("Payment challenge disimpan");
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus?")) persist(rows.filter((r) => r.id !== id)); };

  return (
    <div>
      <PageHeader
        title="Payment Challenges Aff"
        subtitle="Pembayaran hadiah challenge ke affiliate"
        actions={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Pembayaran</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Tambah"} Payment Challenge</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label className="text-xs">Nama Challenge</Label>
                  <Select value={form.challengeId} onValueChange={onPickChallenge}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{challenges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Nama Aff (pemenang)</Label>
                  <Select value={form.affiliateId} onValueChange={onPickAffiliate}>
                    <SelectTrigger><SelectValue placeholder={winnersForChallenge.length ? "Pilih" : "Belum ada pemenang"} /></SelectTrigger>
                    <SelectContent>
                      {winnersForChallenge.map((w) => <SelectItem key={w.affiliateId} value={w.affiliateId}>{w.affiliateName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input className="mt-1" placeholder="Atau tulis manual" value={form.affiliateName} onChange={(e) => setForm({ ...form, affiliateName: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">No Rek</Label><Input value={form.noRek} onChange={(e) => setForm({ ...form, noRek: e.target.value })} /></div>
                  <div><Label className="text-xs">Indikator Report</Label><Input value={form.indikatorReport} onChange={(e) => setForm({ ...form, indikatorReport: e.target.value })} placeholder="DITERIMA/PENDING" /></div>
                  <div><Label className="text-xs">Nilai Hadiah</Label><Input type="number" value={form.nilaiHadiah} onChange={(e) => setForm({ ...form, nilaiHadiah: Number(e.target.value) })} /></div>
                  <div><Label className="text-xs">Admin Bank</Label><Input type="number" value={form.adminBank} onChange={(e) => setForm({ ...form, adminBank: Number(e.target.value) })} /></div>
                </div>
                <div className="bg-brand-blue/10 border border-brand-blue/30 rounded p-2 text-xs">
                  Total: <span className="font-semibold text-brand-blue-dark">Rp {(Number(form.nilaiHadiah || 0) + Number(form.adminBank || 0)).toLocaleString("id-ID")}</span>
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
          { key: "challengeName", label: "Challenge" },
          { key: "affiliateName", label: "Affiliate" },
          { key: "noRek", label: "No Rek" },
          { key: "indikatorReport", label: "Indikator" },
          { key: "nilaiHadiah", label: "Nilai Hadiah", render: (r) => "Rp " + (r.nilaiHadiah || 0).toLocaleString("id-ID") },
          { key: "adminBank", label: "Admin Bank", render: (r) => "Rp " + (r.adminBank || 0).toLocaleString("id-ID") },
          { key: "total", label: "Total", render: (r) => <span className="font-semibold">Rp {(r.total || 0).toLocaleString("id-ID")}</span> },
          { key: "act", label: "Aksi", render: (r) => (
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ) },
        ]}
      />
    </div>
  );
}
