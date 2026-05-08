import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [aff, setAff] = useState({ name: "", phone: "", email: "", socialMedia: "", bankNo: "", bankName: "" });

  const submitAff = (e: React.FormEvent) => {
    e.preventDefault();
    const result = signup({ role: "affiliate", ...aff });
    if (result && !result.startsWith("AFFILIATE_REGISTERED")) return toast.error(result);
    const fiacNo = result!.split(":")[1];
    toast.success(`Pendaftaran berhasil! Fiac No Anda: ${fiacNo}`);
    nav("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-5">
          <h1 className="font-display text-3xl font-bold text-brand-blue-dark">
            Daftar <span className="gradient-text">AfiliasiHub</span>
          </h1>
          <p className="text-[#6B7280] text-xs mt-1">Pendaftaran publik hanya untuk Affiliate</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <form onSubmit={submitAff} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs">Nama Lengkap</Label>
              <Input required value={aff.name} onChange={(e) => setAff({ ...aff, name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Nomor Telepon (WhatsApp)</Label>
              <Input required value={aff.phone} onChange={(e) => setAff({ ...aff, phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" required value={aff.email} onChange={(e) => setAff({ ...aff, email: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Link TikTok / Social Media</Label>
              <Input value={aff.socialMedia} onChange={(e) => setAff({ ...aff, socialMedia: e.target.value })} placeholder="https://tiktok.com/@username" />
            </div>
            <div>
              <Label className="text-xs">Nama Bank</Label>
              <Input value={aff.bankName} onChange={(e) => setAff({ ...aff, bankName: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Nomor Rekening</Label>
              <Input value={aff.bankNo} onChange={(e) => setAff({ ...aff, bankNo: e.target.value })} />
            </div>
            <Button type="submit" className="sm:col-span-2 bg-brand-blue hover:bg-brand-blue-dark text-white">Daftar sebagai Affiliate</Button>
          </form>

          <div className="mt-5 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            Sudah punya akun? <Link to="/login" className="font-semibold gradient-text">Masuk di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
