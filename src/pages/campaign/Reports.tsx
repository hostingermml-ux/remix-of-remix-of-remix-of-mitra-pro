import { useState, useRef } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Check, X, Download, Camera, Upload, Wallet } from "lucide-react";
import { toast } from "sonner";

const empty: any = {
  campaignId: "", followers: 0,
  contentLink: "", views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
  receipts: [] as string[], insights: [] as string[],
  notes: "",
};

const emptyPay: any = {
  kategoriFee: "", hargaProduk: 100000, biayaOngkir: 0, adminBank: 0,
};

// Read files as base64 data URLs (frontend-only "upload")
function readFiles(files: FileList | null): Promise<string[]> {
  if (!files || !files.length) return Promise.resolve([]);
  return Promise.all(Array.from(files).map((f) => new Promise<string>((res) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.readAsDataURL(f);
  })));
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>(load(KEYS.reports, []));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [payEdit, setPayEdit] = useState<any>(null);
  const [payForm, setPayForm] = useState<any>(emptyPay);
  const receiptInput = useRef<HTMLInputElement>(null);
  const receiptCam = useRef<HTMLInputElement>(null);
  const insightInput = useRef<HTMLInputElement>(null);
  const insightCam = useRef<HTMLInputElement>(null);

  const campaigns = load<any[]>(KEYS.campaigns, []);
  const blasts = load<any[]>(KEYS.blasts, []);
  const affiliates = load<any[]>(KEYS.affiliates, []);

  const persist = (v: any[]) => { setRows(v); save(KEYS.reports, v); };

  const myCampaigns = user?.role === "affiliate"
    ? campaigns.filter((c) => blasts.some((b) => b.campaignId === c.id && b.affiliateId === user.affiliateId && b.status === "DITERIMA"))
    : [];

  const visible = user?.role === "admin" ? rows : rows.filter((r) => r.affiliateId === user?.affiliateId);

  const onPickCampaign = (cid: string) => {
    // Auto fill followers from affiliate db (editable)
    const a = affiliates.find((x) => x.id === user?.affiliateId);
    setForm((f: any) => ({ ...f, campaignId: cid, followers: f.followers || a?.followers || 0 }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const a = affiliates.find((x) => x.id === user.affiliateId);
    const base = {
      ...form,
      followers: Number(form.followers) || 0,
      views: Number(form.views) || 0, likes: Number(form.likes) || 0,
      comments: Number(form.comments) || 0, shares: Number(form.shares) || 0, saves: Number(form.saves) || 0,
    };
    if (form.id) {
      persist(rows.map((r) => r.id === form.id ? { ...r, ...base, status: "PENDING" } : r));
      toast.success("Laporan diperbarui & diajukan ulang");
    } else {
      persist([...rows, {
        ...base,
        id: uid("r_"),
        affiliateId: user.affiliateId,
        affiliateName: a?.name,
        status: "PENDING",
        submittedAt: new Date().toISOString(),
      }]);
      toast.success("Laporan terkirim");
    }
    setOpen(false); setForm(empty);
  };

  const approve = (id: string) => {
    persist(rows.map((r) => r.id === id ? { ...r, status: "DITERIMA" } : r));
    const report = rows.find((r) => r.id === id);
    if (report) {
      const payments = load<any[]>(KEYS.payments, []);
      if (!payments.find((p) => p.reportId === id)) {
        payments.push({
          id: uid("p_"), reportId: id,
          affiliateId: report.affiliateId, affiliateName: report.affiliateName,
          campaignId: report.campaignId, amount: 0,
          status: "BELUM DIBAYAR", createdAt: new Date().toISOString(),
        });
        save(KEYS.payments, payments);
      }
    }
    toast.success("Laporan disetujui, pembayaran dibuat");
  };
  const revise = (id: string) => {
    const note = prompt("Catatan revisi untuk affiliate:") || "";
    persist(rows.map((r) => r.id === id ? { ...r, status: "REVISI", adminNote: note } : r));
    toast.success("Dikembalikan ke affiliate untuk revisi");
  };

  const openPay = (r: any) => {
    setPayEdit(r);
    setPayForm({
      kategoriFee: r.kategoriFee || "",
      hargaProduk: Number(r.hargaProduk ?? 100000),
      biayaOngkir: Number(r.biayaOngkir ?? 0),
      adminBank: Number(r.adminBank ?? 0),
    });
  };
  const savePay = () => {
    const totalTransfer = Number(payForm.hargaProduk) + Number(payForm.biayaOngkir);
    const grandTotal = totalTransfer + Number(payForm.adminBank);
    persist(rows.map((r) => r.id === payEdit.id ? { ...r, ...payForm, totalTransfer, grandTotal } : r));
    toast.success("Biaya pembayaran disimpan");
    setPayEdit(null);
  };

  const downloadCsv = (header: string[], data: any[][], file: string) => {
    const csv = [header, ...data].map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = file; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report diunduh");
  };

  const downloadPembayaran = () => {
    const header = ["No", "Fiac", "Nama Aff", "Tanggal Report", "No Rek", "Bank", "Nama Pemilik Rek",
      "Kategori Fee", "Harga Produk", "Biaya Ongkir", "Total Transfer", "Admin Bank", "Grand Total"];
    const data = visible.map((r, i) => {
      const a = affiliates.find((x) => x.id === r.affiliateId) || {};
      const tt = Number(r.hargaProduk || 0) + Number(r.biayaOngkir || 0);
      const gt = tt + Number(r.adminBank || 0);
      return [i + 1, a.fiacNo || "-", r.affiliateName || a.name || "-",
        r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("id-ID") : "-",
        a.bankNo || "-", a.bankName || "-", a.ownerName || "-",
        r.kategoriFee || "-", r.hargaProduk || 0, r.biayaOngkir || 0, tt, r.adminBank || 0, gt];
    });
    downloadCsv(header, data, `report-pembayaran-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const downloadInsight = () => {
    const header = ["No FIAC", "Nama Aff", "No HP", "Kota", "Username", "Link Akun",
      "Followers", "Link Posting", "SS Insight", "View", "Like", "Komentar", "Share", "Save"];
    const data = visible.map((r) => {
      const a = affiliates.find((x) => x.id === r.affiliateId) || {};
      return [a.fiacNo || "-", r.affiliateName || a.name || "-", a.phone || "-", a.city || "-",
        a.name || "-", a.socialMedia || "-",
        r.followers || 0, r.contentLink || "-",
        (r.insights || []).length + " file",
        r.views || 0, r.likes || 0, r.comments || 0, r.shares || 0, r.saves || 0];
    });
    downloadCsv(header, data, `report-insight-${new Date().toISOString().slice(0,10)}.csv`);
  };

  const addReceipts = async (files: FileList | null) => {
    const urls = await readFiles(files);
    setForm((f: any) => ({ ...f, receipts: [...(f.receipts || []), ...urls] }));
  };
  const addInsights = async (files: FileList | null) => {
    const urls = await readFiles(files);
    setForm((f: any) => ({ ...f, insights: [...(f.insights || []), ...urls] }));
  };

  return (
    <div>
      <PageHeader
        title="Report Campaign"
        subtitle={user?.role === "admin" ? "Tinjau laporan affiliate. Pembayaran maks. 60 affiliate per campaign per hari." : "Kirim laporan performa Anda"}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadPembayaran} className="border-brand-blue/40 text-brand-blue hover:bg-brand-blue/5">
              <Download className="h-4 w-4 mr-1" />Report Pembayaran
            </Button>
            <Button variant="outline" onClick={downloadInsight} className="border-brand-blue/40 text-brand-blue hover:bg-brand-blue/5">
              <Download className="h-4 w-4 mr-1" />Report Insight
            </Button>
            {user?.role === "affiliate" && (
              <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
                <DialogTrigger asChild><Button className="bg-brand-blue hover:bg-brand-blue-dark text-white"><Plus className="h-4 w-4 mr-1" />Kirim Laporan</Button></DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{form.id ? "Revisi" : "Kirim"} Laporan</DialogTitle></DialogHeader>
                  <form onSubmit={submit} className="space-y-3">
                    <div>
                      <Label className="text-xs">Kampanye</Label>
                      <Select value={form.campaignId} onValueChange={onPickCampaign}>
                        <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                        <SelectContent>{myCampaigns.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Input Followers (auto-fill, dapat diubah)</Label>
                      <Input type="number" min="0" value={form.followers} onChange={(e) => setForm({ ...form, followers: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Upload Struk Belanja Produk VAPE (multi)</Label>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => receiptInput.current?.click()}><Upload className="h-3.5 w-3.5 mr-1" />Pilih File</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => receiptCam.current?.click()}><Camera className="h-3.5 w-3.5 mr-1" />Kamera</Button>
                        <input ref={receiptInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addReceipts(e.target.files)} />
                        <input ref={receiptCam} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => addReceipts(e.target.files)} />
                        <span className="text-[11px] text-muted-foreground self-center">{(form.receipts || []).length} file</span>
                      </div>
                      {(form.receipts || []).length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {form.receipts.map((u: string, i: number) => <img key={i} src={u} className="h-12 w-12 object-cover rounded border" />)}
                        </div>
                      )}
                    </div>
                    <div><Label className="text-xs">Link Konten</Label><Input required value={form.contentLink} onChange={(e) => setForm({ ...form, contentLink: e.target.value })} placeholder="https://..." /></div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><Label className="text-xs">View</Label><Input type="number" min="0" value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} /></div>
                      <div><Label className="text-xs">Like</Label><Input type="number" min="0" value={form.likes} onChange={(e) => setForm({ ...form, likes: e.target.value })} /></div>
                      <div><Label className="text-xs">Komentar</Label><Input type="number" min="0" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></div>
                      <div><Label className="text-xs">Share</Label><Input type="number" min="0" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} /></div>
                      <div><Label className="text-xs">Save</Label><Input type="number" min="0" value={form.saves} onChange={(e) => setForm({ ...form, saves: e.target.value })} /></div>
                    </div>
                    <div>
                      <Label className="text-xs">Screenshot Insight (multi)</Label>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => insightInput.current?.click()}><Upload className="h-3.5 w-3.5 mr-1" />Pilih File</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => insightCam.current?.click()}><Camera className="h-3.5 w-3.5 mr-1" />Kamera</Button>
                        <input ref={insightInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addInsights(e.target.files)} />
                        <input ref={insightCam} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => addInsights(e.target.files)} />
                        <span className="text-[11px] text-muted-foreground self-center">{(form.insights || []).length} file</span>
                      </div>
                      {(form.insights || []).length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          {form.insights.map((u: string, i: number) => <img key={i} src={u} className="h-12 w-12 object-cover rounded border" />)}
                        </div>
                      )}
                    </div>
                    <div><Label className="text-xs">Catatan</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                    {form.adminNote && <div className="text-[11px] bg-brand-blue/10 text-brand-blue-dark border border-brand-blue/30 rounded p-2">Catatan admin: {form.adminNote}</div>}
                    <DialogFooter><Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white">Kirim</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      {user?.role === "admin" && (
        <div className="text-[11px] text-muted-foreground mb-3 px-1">
          Catatan: pembayaran dilakukan maksimal <span className="font-semibold text-brand-blue-dark">60 affiliate per campaign per hari</span>.
        </div>
      )}

      <DataTable
        rows={visible}
        cols={[
          { key: "campaign", label: "Kampanye", render: (r) => campaigns.find((c) => c.id === r.campaignId)?.name || "-" },
          ...(user?.role === "admin" ? [{ key: "affiliateName", label: "Affiliate" }] : []),
          { key: "followers", label: "Followers", render: (r) => (r.followers || 0).toLocaleString("id-ID") },
          { key: "views", label: "View" },
          { key: "likes", label: "Like" },
          { key: "comments", label: "Komentar" },
          { key: "shares", label: "Share" },
          { key: "saves", label: "Save" },
          { key: "link", label: "Konten", render: (r) => r.contentLink ? <a href={r.contentLink} target="_blank" rel="noreferrer" className="gradient-text text-[11px] font-semibold">Lihat</a> : "-" },
          { key: "grand", label: "Grand Total", render: (r) => r.grandTotal ? "Rp " + Number(r.grandTotal).toLocaleString("id-ID") : "-" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => {
              if (user?.role === "admin") {
                return (
                  <div className="flex gap-1 flex-wrap">
                    {r.status === "PENDING" && (<>
                      <Button size="sm" onClick={() => approve(r.id)} className="h-7 bg-teal-primary hover:bg-teal-dark text-white"><Check className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" onClick={() => revise(r.id)} className="h-7"><X className="h-3.5 w-3.5" /></Button>
                    </>)}
                    <Button size="sm" variant="outline" className="h-7" onClick={() => openPay(r)}><Wallet className="h-3.5 w-3.5 mr-1" />Biaya</Button>
                  </div>
                );
              }
              if (user?.role === "affiliate" && r.status === "REVISI") {
                return <Button size="sm" variant="outline" className="h-7" onClick={() => { setForm(r); setOpen(true); }}>Revisi</Button>;
              }
              return <span className="text-[11px] text-muted-foreground">—</span>;
            },
          },
        ]}
      />

      {/* Admin: Biaya Pembayaran Affiliate */}
      <Dialog open={!!payEdit} onOpenChange={(o) => !o && setPayEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Biaya Pembayaran Affiliate</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Kategori Fee</Label>
              <Input value={payForm.kategoriFee} onChange={(e) => setPayForm({ ...payForm, kategoriFee: e.target.value })} placeholder="Reguler / Premium / dll" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Harga Produk (mis. 100K)</Label><Input type="number" value={payForm.hargaProduk} onChange={(e) => setPayForm({ ...payForm, hargaProduk: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Biaya Ongkir</Label><Input type="number" value={payForm.biayaOngkir} onChange={(e) => setPayForm({ ...payForm, biayaOngkir: Number(e.target.value) })} /></div>
            </div>
            <div className="bg-muted/40 rounded p-2 text-xs">
              Total Transfer: <span className="font-semibold">Rp {(Number(payForm.hargaProduk) + Number(payForm.biayaOngkir)).toLocaleString("id-ID")}</span>
            </div>
            <div><Label className="text-xs">Admin Bank</Label><Input type="number" value={payForm.adminBank} onChange={(e) => setPayForm({ ...payForm, adminBank: Number(e.target.value) })} /></div>
            <div className="bg-brand-blue/10 border border-brand-blue/30 rounded p-2 text-xs">
              Grand Total: <span className="font-semibold text-brand-blue-dark">Rp {(Number(payForm.hargaProduk) + Number(payForm.biayaOngkir) + Number(payForm.adminBank)).toLocaleString("id-ID")}</span>
            </div>
            <DialogFooter><Button onClick={savePay} className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
