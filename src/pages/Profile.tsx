import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KEYS, load } from "@/lib/storage";
import { toast } from "sonner";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState<any>({ name: "", password: "", socialMedia: "", phone: "", email: "", bankName: "", bankNo: "", address: "", picName: "", picPhone: "" });

  useEffect(() => {
    if (!user) return;
    if (user.role === "customer") {
      const customers = load<any[]>(KEYS.customers, []);
      const c = customers.find((x) => x.id === user.customerId);
      if (c) setForm((f: any) => ({ ...f, ...c, password: "" }));
    } else {
      const users = load<any[]>(KEYS.users, []);
      const u = users.find((x) => x.id === user.id);
      if (u) setForm((f: any) => ({ ...f, ...u, password: "" }));
    }
    // eslint-disable-next-line
  }, [user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    let data: any;
    if (user?.role === "customer") {
      data = { name: form.name, address: form.address, picName: form.picName, picPhone: form.picPhone };
    } else {
      data = { name: form.name, socialMedia: form.socialMedia, phone: form.phone, email: form.email, bankName: form.bankName, bankNo: form.bankNo };
    }
    if (form.password) data.password = form.password;
    updateProfile(data);
    toast.success("Profil diperbarui");
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profil Saya" subtitle="Perbarui data akun Anda" />
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Nama</Label>
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          {user?.role !== "customer" && (
            <div>
              <Label className="text-xs">Telepon</Label>
              <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          )}
          {user?.role === "affiliate" && (
            <>
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Social Media (TikTok)</Label>
                <Input value={form.socialMedia || ""} onChange={(e) => setForm({ ...form, socialMedia: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Nama Bank</Label>
                <Input value={form.bankName || ""} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">No. Rekening</Label>
                <Input value={form.bankNo || ""} onChange={(e) => setForm({ ...form, bankNo: e.target.value })} />
              </div>
            </>
          )}
          {user?.role === "customer" && (
            <>
              <div className="sm:col-span-2">
                <Label className="text-xs">Alamat</Label>
                <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Nama PIC</Label>
                <Input value={form.picName || ""} onChange={(e) => setForm({ ...form, picName: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Telepon PIC</Label>
                <Input value={form.picPhone || ""} onChange={(e) => setForm({ ...form, picPhone: e.target.value })} />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <Label className="text-xs">{user?.role === "customer" ? "Ubah Password (kosongkan jika tidak diubah)" : "Password Baru (kosongkan jika tidak diubah)"}</Label>
            <Input type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        <Button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-white">Simpan Perubahan</Button>
      </form>
    </div>
  );
}
