import { useState } from "react";
import { KEYS, load, save, uid } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AcceptRejectPage() {
  const [rows, setRows] = useState<any[]>(load(KEYS.screening, []));
  const [view, setView] = useState<any>(null);
  const persist = (v: any[]) => { setRows(v); save(KEYS.screening, v); };

  const accept = (id: string) => {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    const affiliates = load<any[]>(KEYS.affiliates, []);
    if (affiliates.find((a) => a.fiacNo === r.fiacNo || a.screeningId === r.id)) {
      toast.error("Affiliate sudah ada di Data Affiliate");
    } else {
      affiliates.push({
        id: uid("a_"),
        screeningId: r.id,
        name: r.name, phone: r.phone, email: r.email, fiacNo: r.fiacNo,
        socialMedia: r.socialMedia, bankNo: r.bankNo, bankName: r.bankName,
        ownerName: r.ownerName, city: r.city, referralName: r.referralName,
        status: r.active || "Aktif",
        createdAt: new Date().toISOString(),
      });
      save(KEYS.affiliates, affiliates);
    }
    persist(rows.map((x) => x.id === id ? { ...x, status: "DITERIMA" } : x));
    toast.success("Affiliate diterima & ditambah ke Data Affiliate");
  };

  const reject = (id: string) => {
    if (!confirm("Tolak affiliate ini?")) return;
    persist(rows.map((x) => x.id === id ? { ...x, status: "DITOLAK" } : x));
    toast.success("Affiliate ditolak");
  };

  return (
    <div>
      <PageHeader
        title="Accept / Reject Affiliate"
        subtitle="Tinjau hasil screening lalu terima atau tolak calon affiliate"
      />
      <DataTable
        rows={rows}
        cols={[
          { key: "fiacNo", label: "No Fiac" },
          { key: "name", label: "Nama" },
          { key: "phone", label: "No HP" },
          { key: "city", label: "Domisili" },
          { key: "referralName", label: "Referral", render: (r) => r.referralName || "-" },
          { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            key: "act", label: "Aksi", render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-3.5 w-3.5" /></Button>
                {r.status === "PENDING" && (
                  <>
                    <Button size="sm" className="h-7 bg-brand-blue hover:bg-brand-blue-dark text-white" onClick={() => accept(r.id)}><Check className="h-3.5 w-3.5 mr-1" />Terima</Button>
                    <Button size="sm" variant="outline" className="h-7" onClick={() => reject(r.id)}><X className="h-3.5 w-3.5 mr-1" />Tolak</Button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detail Calon Affiliate</DialogTitle></DialogHeader>
          {view && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ["No Fiac", view.fiacNo], ["Nama", view.name], ["No HP", view.phone], ["Email", view.email],
                ["Domisili", view.city], ["TikTok", view.socialMedia], ["Bank", view.bankName],
                ["No Rekening", view.bankNo], ["Pemilik Rek", view.ownerName], ["Referral", view.referralName],
                ["Status", view.status],
              ].map(([k, v]) => (
                <div key={k} className="bg-muted/30 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">{k}</div>
                  <div className="font-medium">{v || "-"}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
