import { useState } from "react";
import { KEYS, load, save, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function ChallengeWinnersPage() {
  const challenges = load<any[]>(KEYS.challenges, []);
  const apps = load<any[]>(KEYS.challengeApps, []);
  const affiliates = load<any[]>(KEYS.affiliates, []);
  const [rows, setRows] = useState<any[]>(load(KEYS.challengeWinners, []));
  const [open, setOpen] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [nilaiHadiah, setNilaiHadiah] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [notif, setNotif] = useState("");

  const persist = (v: any[]) => { setRows(v); save(KEYS.challengeWinners, v); };

  const challenge = challenges.find((c) => c.id === challengeId);
  const candidates = apps
    .filter((a) => a.challengeId === challengeId)
    .map((a) => ({ id: a.affiliateId, name: a.affiliateName || affiliates.find((x) => x.id === a.affiliateId)?.name || a.affiliateId }));

  const onPickChallenge = (id: string) => {
    setChallengeId(id);
    const c = challenges.find((x) => x.id === id);
    setNilaiHadiah(Number(c?.nilaiChallenge || 0));
    setSelected([]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return toast.error("Pilih challenge");
    if (!selected.length) return toast.error("Pilih minimal satu pemenang");
    const newRows = selected.map((aid) => {
      const aff = affiliates.find((x) => x.id === aid);
      return {
        id: uid("w_"), challengeId, challengeName: challenge?.name,
        affiliateId: aid, affiliateName: aff?.name || aid,
        nilaiHadiah: Number(nilaiHadiah) || 0,
        notif, createdAt: new Date().toISOString(),
      };
    });
    persist([...rows, ...newRows]);
    toast.success(`${newRows.length} pemenang disimpan`);
    setOpen(false); setChallengeId(""); setSelected([]); setNotif(""); setNilaiHadiah(0);
  };

  const del = (id: string) => { if (confirm("Hapus pemenang?")) persist(rows.filter((r) => r.id !== id)); };

  return (
    <div>
      <PageHeader
        title="Pilih Pemenang Challenge"
        subtitle="Tentukan pemenang dan kirim notifikasi pemenang"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Tambah Pemenang</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Pilih Pemenang Challenge</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <Label className="text-xs">Pilih Challenge</Label>
                  <Select value={challengeId} onValueChange={onPickChallenge}>
                    <SelectTrigger><SelectValue placeholder="Pilih challenge" /></SelectTrigger>
                    <SelectContent>{challenges.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {challenge && (
                  <div className="text-[11px] bg-muted/40 rounded p-2">
                    <div>Nama: <span className="font-semibold">{challenge.name}</span></div>
                  </div>
                )}
                <div><Label className="text-xs">Nilai Hadiah (IDR)</Label><Input type="number" min="0" value={nilaiHadiah} onChange={(e) => setNilaiHadiah(Number(e.target.value))} /></div>
                <div>
                  <Label className="text-xs">Pemenang (multi)</Label>
                  <div className="border border-border rounded p-2 max-h-40 overflow-y-auto space-y-1">
                    {candidates.length === 0 ? <div className="text-[11px] text-muted-foreground">Belum ada peserta.</div> :
                      candidates.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <Checkbox checked={selected.includes(c.id)} onCheckedChange={(v) => setSelected(v ? [...selected, c.id] : selected.filter((x) => x !== c.id))} />
                          <span>{c.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
                <div><Label className="text-xs">Notif Pemenang Challenge</Label><Textarea value={notif} onChange={(e) => setNotif(e.target.value)} placeholder="Selamat! Anda terpilih sebagai pemenang..." /></div>
                <DialogFooter><Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Trophy className="h-4 w-4 mr-1" />Simpan Pemenang</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        rows={rows}
        cols={[
          { key: "challengeName", label: "Challenge" },
          { key: "affiliateName", label: "Pemenang" },
          { key: "nilaiHadiah", label: "Nilai Hadiah", render: (r) => "Rp " + (r.nilaiHadiah || 0).toLocaleString("id-ID") },
          { key: "notif", label: "Notif", render: (r) => <span className="text-[11px] text-muted-foreground line-clamp-1">{r.notif || "-"}</span> },
          { key: "createdAt", label: "Tanggal", render: (r) => new Date(r.createdAt).toLocaleDateString("id-ID") },
          { key: "act", label: "Aksi", render: (r) => <Button size="icon" variant="ghost" className="h-7 w-7 text-brand-red" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button> },
        ]}
      />
    </div>
  );
}
