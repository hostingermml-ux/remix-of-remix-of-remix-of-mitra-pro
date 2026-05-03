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
  const [form, setForm] = useState<any>({ name: "", password: "", socialMedia: "", phone: "", email: "", bankName: "", bankNo: "" });

  useEffect(() => {
    if (!user) return;
    const users = load<any[]>(KEYS.users, []);
    const u = users.find((x) => x.id === user.id);
    if (u) setForm({ ...form, ...u, password: "" });
    // eslint-disable-next-line
  }, [user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { name: form.name, socialMedia: form.socialMedia, phone: form.phone, email: form.email, bankName: form.bankName, bankNo: form.bankNo };
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
          <div>
            <Label className="text-xs">Telepon</Label>
            <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
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
          <div className="sm:col-span-2">
            <Label className="text-xs">Password Baru (kosongkan jika tidak diubah)</Label>
            <Input type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        <Button type="submit" className="bg-teal-primary hover:bg-teal-dark text-white">Simpan Perubahan</Button>
      </form>
    </div>
  );
}
