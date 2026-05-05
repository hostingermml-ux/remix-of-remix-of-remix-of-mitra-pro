import { useState } from "react";
import { KEYS, load, save, uid } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, FileBarChart, Send, Download } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", sow: "", reward: "", deadline: "", reportColumns: "Nama,Link Konten,Views,Note", status: "AKTIF" };

export default function ChallengePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [rows, setRows] = useState<any[]>(load(KEYS.challenges, []));
  const [apps, setApps] = useState<any[]>(load(KEYS.challengeApps, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [report, setReport] = useState<any>(null);
  const [reportEdit, setReportEdit] = useState<any>(null);
  const [reportData, setReportData] = useState<Record<string, string>>({});

  const persist = (v: any[]) => { setRows(v); save(KEYS.challenges, v); };
  const persistApps = (v: any[]) => { setApps(v); save(KEYS.challengeApps, v); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) persist(rows.map((r) => r.id === form.id ? form : r));
    else persist([...rows, { ...form, id: uid("ch_"), createdAt: new Date().toISOString() }]);
    toast.success("Challenge disimpan");
    setOpen(false); setForm(empty);
  };
  const edit = (r: any) => { setForm(r); setOpen(true); };
  const del = (id: string) => { if (confirm("Hapus challenge ini?")) persist(rows.filter((r) => r.id !== id)); };

  const apply = (challengeId: string) => {
    if (!user) return;
    if (apps.find((a) => a.challengeId === challengeId && a.affiliateId === user.affiliateId)) {
      return toast.error("Sudah mendaftar challenge ini");
    }
    persistApps([...apps, {
      id: uid("ca_"), challengeId, affiliateId: user.affiliateId,
      affiliateName: user.name, status: "PENDING", reportData: {},
      appliedAt: new Date().toISOString(),
    }]);
    toast.success("Pendaftaran terkirim");
  };

  const openReport = (challenge: any) => { setReport(challenge); };

  const openReportEdit = (a: any, cols: string[]) => {
    setReportEdit(a);
    const init: Record<string, string> = {};
    cols.forEach((c) => { init[c] = a.reportData?.[c] || ""; });
    setReportData(init);
  };
  const saveReport = () => {
    persistApps(apps.map((a) => a.id === reportEdit.id ? { ...a, reportData } : a));
    toast.success("Report disimpan");
    setReportEdit(null);
  };

  const downloadCsv = (challenge: any) => {
    const cols = challenge.reportColumns.split(",").map((c: string) => c.trim()).filter(Boolean);
    const list = apps.filter((a) => a.challengeId === challenge.id);
    const header = ["Affiliate", ...cols, "Status"];
    const rowsCsv = list.map((a) => [
      a.affiliateName, ...cols.map((c: string) => a.reportData?.[c] || ""), a.status,
    ]);
    const csv = [header, ...rowsCsv].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `challenge-${challenge.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const myApps = !isAdmin ? apps.filter((a) => a.affiliateId === user?.affiliateId) : [];

  return (
    <div>
      <PageHeader
        title="Challenge"
        subtitle="SOW challenge dari Admin untuk Affiliate"
        actions={isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
            <DialogTrigger asChild><Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Buat Challenge</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{form.id ? "Edit" : "Buat"} Challenge</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-3">
                <div><Label className="text-xs">Nama Challenge</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label className="text-xs">SOW / Deskripsi</Label><Textarea required value={form.sow} onChange={(e) => setForm({ ...form, sow: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Reward</Label><Input value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} /></div>
                  <div><Label className="text-xs">Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
                </div>
                <div>
                  <Label className="text-xs">Kolom Report (pisahkan dengan koma)</Label>
                  <Input value={form.reportColumns} onChange={(e) => setForm({ ...form, reportColumns: e.target.value })} placeholder="Nama,Link Konten,Views,Note" />
                </div>
                <DialogFooter><Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.length === 0 && (
          <div className="glass rounded-2xl p-8 col-span-full text-center text-muted-foreground text-sm">Belum ada challenge.</div>
        )}
        {rows.map((c) => {
          const list = apps.filter((a) => a.challengeId === c.id);
          const mine = !isAdmin ? myApps.find((a) => a.challengeId === c.id) : null;
          return (
            <div key={c.id} className="glass rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{c.name}</h3>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Reward: {c.reward || "-"} · Deadline: {c.deadline || "-"}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-wrap">{c.sow}</p>
              <div className="text-[11px] text-muted-foreground">{list.length} affiliate terdaftar</div>
              <div className="flex flex-wrap gap-2">
                {isAdmin ? (
                  <>
                    <Button size="sm" variant="outline" onClick={() => openReport(c)}><FileBarChart className="h-3.5 w-3.5 mr-1" />Report</Button>
                    <Button size="sm" variant="outline" onClick={() => edit(c)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
                    <Button size="sm" variant="outline" className="text-brand-red" onClick={() => del(c.id)}><Trash2 className="h-3.5 w-3.5 mr-1" />Hapus</Button>
                  </>
                ) : mine ? (
                  <>
                    <span className="text-[11px]"><StatusBadge status={mine.status} /></span>
                    <Button size="sm" variant="outline" onClick={() => openReportEdit(mine, c.reportColumns.split(",").map((s: string) => s.trim()).filter(Boolean))}>
                      <Send className="h-3.5 w-3.5 mr-1" />Isi Report
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-dark text-white" onClick={() => apply(c.id)}>Daftar Challenge</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report dialog (admin) */}
      <Dialog open={!!report} onOpenChange={(o) => !o && setReport(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Report — {report?.name}</span>
              {report && <Button size="sm" variant="outline" onClick={() => downloadCsv(report)}><Download className="h-3.5 w-3.5 mr-1" />Excel</Button>}
            </DialogTitle>
          </DialogHeader>
          {report && (() => {
            const cols = report.reportColumns.split(",").map((s: string) => s.trim()).filter(Boolean);
            const list = apps.filter((a) => a.challengeId === report.id);
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-muted/40">
                    <th className="px-2 py-2 text-left">Affiliate</th>
                    {cols.map((c: string) => <th key={c} className="px-2 py-2 text-left">{c}</th>)}
                    <th className="px-2 py-2 text-left">Status</th>
                    <th className="px-2 py-2"></th>
                  </tr></thead>
                  <tbody>
                    {list.length === 0 ? <tr><td colSpan={cols.length + 3} className="text-center py-4 text-muted-foreground">Belum ada peserta</td></tr> :
                      list.map((a) => (
                        <tr key={a.id} className="border-t border-border/60">
                          <td className="px-2 py-2">{a.affiliateName}</td>
                          {cols.map((c: string) => <td key={c} className="px-2 py-2">{a.reportData?.[c] || "-"}</td>)}
                          <td className="px-2 py-2"><StatusBadge status={a.status} /></td>
                          <td className="px-2 py-2">
                            {a.status === "PENDING" && (
                              <div className="flex gap-1">
                                <Button size="sm" className="h-6 bg-brand-blue text-white" onClick={() => { persistApps(apps.map((x) => x.id === a.id ? { ...x, status: "DITERIMA" } : x)); }}>OK</Button>
                                <Button size="sm" variant="outline" className="h-6" onClick={() => { persistApps(apps.map((x) => x.id === a.id ? { ...x, status: "DITOLAK" } : x)); }}>Tolak</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Affiliate report submit */}
      <Dialog open={!!reportEdit} onOpenChange={(o) => !o && setReportEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Isi Report Challenge</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {Object.keys(reportData).map((c) => (
              <div key={c}>
                <Label className="text-xs">{c}</Label>
                <Input value={reportData[c]} onChange={(e) => setReportData({ ...reportData, [c]: e.target.value })} />
              </div>
            ))}
            <DialogFooter><Button onClick={saveReport} className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan Report</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
