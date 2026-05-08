import { useState } from "react";
import { KEYS, load, save } from "@/lib/storage";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ADMIN_MENUS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "staff", label: "Master Staff" },
  { key: "affiliates", label: "Master Affiliate" },
  { key: "screening", label: "Data Screening Affiliate" },
  { key: "acceptReject", label: "Accept/Reject Affiliate" },
  { key: "referrals", label: "Referral" },
  { key: "customers", label: "Master Customer" },
  { key: "permissions", label: "Hak Akses" },
  { key: "campaigns", label: "List Campaign" },
  { key: "blast", label: "Blast Campaign" },
  { key: "approval", label: "Approval Affiliate" },
  { key: "running", label: "Running Campaign" },
  { key: "reports", label: "Report Campaign" },
  { key: "payments", label: "Payment Affiliate" },
  { key: "paymentReferrals", label: "Payment Referral" },
  { key: "challenge", label: "Challenge" },
];
const AFFILIATE_MENUS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "blast", label: "Campaign Tersedia" },
  { key: "running", label: "Campaign Saya" },
  { key: "reports", label: "Report Saya" },
  { key: "payments", label: "Pembayaran" },
  { key: "challenge", label: "Challenge" },
];
const REFERRAL_MENUS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "screening", label: "Data Screening Affiliate" },
  { key: "affiliates", label: "Affiliate Disetujui" },
  { key: "paymentReferrals", label: "Payment Referral" },
];
const CUSTOMER_MENUS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "customerCampaigns", label: "Campaign Saya" },
  { key: "customerAffiliates", label: "Affiliate Aktif" },
  { key: "customerReports", label: "Report Campaign" },
  { key: "customerChallenges", label: "Challenge" },
];

export default function PermissionsPage() {
  const [perms, setPerms] = useState<any>(load(KEYS.permissions, { admin: {}, affiliate: {}, referral: {}, customer: {} }));
  const [staffPerms, setStaffPerms] = useState<any>(load(KEYS.staffPerms, {}));
  const staff = load<any[]>(KEYS.staff, []);
  const [selectedStaff, setSelectedStaff] = useState<string>("");

  const toggle = (role: "admin" | "affiliate" | "referral" | "customer", key: string) => {
    setPerms({ ...perms, [role]: { ...perms[role], [key]: !perms[role]?.[key] } });
  };
  const toggleStaff = (key: string) => {
    if (!selectedStaff) return;
    const cur = staffPerms[selectedStaff] || {};
    setStaffPerms({ ...staffPerms, [selectedStaff]: { ...cur, [key]: !cur[key] } });
  };

  const savePerms = () => {
    save(KEYS.permissions, perms);
    save(KEYS.staffPerms, staffPerms);
    toast.success("Hak akses disimpan. Muat ulang untuk efek penuh.");
  };

  return (
    <div>
      <PageHeader title="Hak Akses" subtitle="Atur menu yang bisa diakses oleh tiap role / user" actions={<Button onClick={savePerms} className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan</Button>} />

      <Tabs defaultValue="role">
        <TabsList>
          <TabsTrigger value="role">Per Role</TabsTrigger>
          <TabsTrigger value="staff">Per Staff (Admin)</TabsTrigger>
        </TabsList>
        <TabsContent value="role" className="mt-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { role: "admin" as const, title: "Admin", menus: ADMIN_MENUS },
              { role: "affiliate" as const, title: "Affiliate", menus: AFFILIATE_MENUS },
              { role: "referral" as const, title: "Referral", menus: REFERRAL_MENUS },
              { role: "customer" as const, title: "Customer", menus: CUSTOMER_MENUS },
            ].map((g) => (
              <div key={g.role} className="glass rounded-2xl p-5">
                <h3 className="mb-3 gradient-text font-display font-semibold">{g.title}</h3>
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
        </TabsContent>
        <TabsContent value="staff" className="mt-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <div>
              <Label className="text-xs">Pilih Staff</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="max-w-xs"><SelectValue placeholder="Pilih staff" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.username})</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">Override menu admin per user. Jika tidak diatur, gunakan default role Admin.</p>
            </div>
            {selectedStaff && (
              <div className="grid sm:grid-cols-2 gap-2">
                {ADMIN_MENUS.map((m) => (
                  <div key={m.key} className="flex items-center justify-between glass-soft rounded-lg px-3 py-2">
                    <span className="text-xs">{m.label}</span>
                    <Switch
                      checked={!!staffPerms[selectedStaff]?.[m.key]}
                      onCheckedChange={() => toggleStaff(m.key)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
