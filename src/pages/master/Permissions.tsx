import { useState } from "react";
import { KEYS, load, save } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const ADMIN_MENUS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "staff", label: "Master Staff" },
  { key: "affiliates", label: "Master Affiliate" },
  { key: "customers", label: "Master Customer" },
  { key: "permissions", label: "Hak Akses" },
  { key: "campaigns", label: "List Campaign" },
  { key: "blast", label: "Blast Campaign" },
  { key: "approval", label: "Approval Affiliate" },
  { key: "running", label: "Running Campaign" },
  { key: "reports", label: "Report Campaign" },
  { key: "payments", label: "Payment Affiliate" },
];
const AFFILIATE_MENUS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "blast", label: "Campaign Tersedia" },
  { key: "running", label: "Campaign Saya" },
  { key: "reports", label: "Report Saya" },
  { key: "payments", label: "Pembayaran" },
];

export default function PermissionsPage() {
  const [perms, setPerms] = useState<any>(load(KEYS.permissions, { admin: {}, affiliate: {} }));

  const toggle = (role: "admin" | "affiliate", key: string) => {
    const next = { ...perms, [role]: { ...perms[role], [key]: !perms[role][key] } };
    setPerms(next);
  };
  const savePerms = () => { save(KEYS.permissions, perms); toast.success("Hak akses disimpan. Muat ulang untuk efek penuh."); };

  return (
    <div>
      <PageHeader title="Hak Akses" subtitle="Atur menu yang bisa diakses oleh tiap role" actions={<Button onClick={savePerms} className="bg-teal-primary hover:bg-teal-dark text-white">Simpan</Button>} />

      <div className="grid md:grid-cols-2 gap-5">
        {[
          { role: "admin" as const, title: "Admin", menus: ADMIN_MENUS },
          { role: "affiliate" as const, title: "Affiliate", menus: AFFILIATE_MENUS },
        ].map((g) => (
          <div key={g.role} className="glass rounded-2xl p-5">
            <h3 className="mb-3 gradient-text">{g.title}</h3>
            <div className="space-y-2">
              {g.menus.map((m) => (
                <div key={m.key} className="flex items-center justify-between glass-soft rounded-lg px-3 py-2">
                  <span className="text-xs">{m.label}</span>
                  <Switch checked={!!perms[g.role]?.[m.key]} onCheckedChange={() => toggle(g.role, m.key)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
