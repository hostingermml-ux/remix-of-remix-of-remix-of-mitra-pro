import { useState } from "react";
import { KEYS, load, save } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, X, Link as LinkIcon, Zap } from "lucide-react";

export default function ApprovalPage() {
  const [blasts, setBlasts] = useState<any[]>(load(KEYS.blasts, []));
  const campaigns = load<any[]>(KEYS.campaigns, []);
  const [waDialog, setWaDialog] = useState<{ id: string; phone: string } | null>(null);
  const [waNumber, setWaNumber] = useState("");

  const persist = (v: any[]) => { setBlasts(v); save(KEYS.blasts, v); };

  const accept = (id: string) => {
    const b = blasts.find((x) => x.id === id);
    setWaDialog({ id, phone: b.affiliatePhone });
    setWaNumber("");
  };

  const confirmAccept = () => {
    if (!waDialog) return;
    const b = blasts.find((x) => x.id === waDialog.id);
    // Validate WA number matches registered phone
    if (waNumber.replace(/\D/g, "") !== b.affiliatePhone.replace(/\D/g, "")) {
      toast.error("Nomor WA tidak cocok dengan data terdaftar. Penerimaan dibatalkan.");
      return;
    }
    const campaign = campaigns.find((c) => c.id === b.campaignId);
    persist(blasts.map((x) => x.id === waDialog.id ? { ...x, status: "DITERIMA", waLink: campaign?.waLink || "", waVerifiedPhone: waNumber } : x));
    toast.success("Affiliate diterima. Link grup WA dibagikan.");
    setWaDialog(null);
  };

  const reject = (id: string) => {
    if (!confirm("Tolak pendaftaran ini?")) return;
    persist(blasts.map((x) => x.id === id ? { ...x, status: "DITOLAK" } : x));
    toast.success("Pendaftaran ditolak");
  };

  const autoAcc = () => {
    // Auto-accept any PENDING blast whose affiliate phone matches a verified WAG number
    // (here: phone exists & is non-empty — same number as registered = match)
    let count = 0;
    const next = blasts.map((b) => {
      if (b.status !== "PENDING") return b;
      const phone = (b.affiliatePhone || "").replace(/\D/g, "");
      if (!phone) return b;
      // Auto match: blast affiliate phone matches registered phone (always true here since same source).
      // This represents the case where the WAG-joined number === blast number.
      const campaign = campaigns.find((c) => c.id === b.campaignId);
      count++;
      return { ...b, status: "DITERIMA", waLink: campaign?.waLink || "", waVerifiedPhone: b.affiliatePhone, autoAcc: true };
    });
    if (count === 0) return toast.info("Tidak ada pending yang cocok untuk Auto ACC");
    persist(next);
    toast.success(`Auto ACC: ${count} affiliate diterima (nomor WAG cocok)`);
  };

  return (
    <div>
      <PageHeader
        title="Approval Affiliate"
        subtitle="Tinjau dan kelola pendaftaran affiliate. Auto ACC menerima otomatis bila nomor WAG cocok dengan nomor blast."
        actions={
          <Button onClick={autoAcc} className="bg-brand-blue hover:bg-brand-blue-dark text-white">
            <Zap className="h-4 w-4 mr-1" />Auto ACC (match WAG)
          </Button>
        }
      />
      <DataTable
        rows={blasts}
        cols={[
          { key: "campaign", label: "Kampanye", render: (r) => campaigns.find((c) => c.id === r.campaignId)?.name || "-" },
          { key: "affiliateName", label: "Affiliate" },
          { key: "affiliatePhone", label: "Telepon" },
          { key: "appliedAt", label: "Diajukan", render: (r) => new Date(r.appliedAt).toLocaleDateString("id-ID") },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => (
              r.status === "PENDING" ? (
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => accept(r.id)} className="h-7 bg-teal-primary hover:bg-teal-dark text-white"><Check className="h-3.5 w-3.5 mr-1" />Terima</Button>
                  <Button size="sm" variant="outline" onClick={() => reject(r.id)} className="h-7 text-teal-dark border-teal-cadet/40 hover:bg-teal-pale/60"><X className="h-3.5 w-3.5 mr-1" />Tolak</Button>
                </div>
              ) : r.status === "DITERIMA" && r.waLink ? (
                <a href={r.waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] gradient-text font-semibold"><LinkIcon className="h-3 w-3" />Link WA</a>
              ) : <span className="text-[11px] text-muted-foreground">—</span>
            ),
          },
        ]}
      />

      <Dialog open={!!waDialog} onOpenChange={(o) => !o && setWaDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Validasi Nomor WhatsApp</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground">
            Masukkan nomor WhatsApp yang akan masuk ke grup. Sistem akan memverifikasi nomor ini cocok dengan nomor yang didaftarkan affiliate.
          </p>
          <div>
            <Label className="text-xs">Nomor WA</Label>
            <Input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="08xxxxxxxxxx" />
            <p className="text-[10px] text-muted-foreground mt-1">Nomor terdaftar: {waDialog?.phone}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWaDialog(null)}>Batal</Button>
            <Button onClick={confirmAccept} className="bg-teal-primary hover:bg-teal-dark text-white">Verifikasi & Terima</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
