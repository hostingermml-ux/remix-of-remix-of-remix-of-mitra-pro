import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function Login() {
  const { loginAdmin, loginAffiliate, loginReferral } = useAuth();
  const nav = useNavigate();
  const [admin, setAdmin] = useState({ username: "", password: "" });
  const [aff, setAff] = useState({ fiacNo: "", phone: "" });
  const [ref, setRef] = useState({ username: "", password: "" });

  const submitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const err = loginAdmin(admin.username, admin.password);
    if (err) return toast.error(err);
    toast.success("Selamat datang, Admin!"); nav("/app");
  };
  const submitAff = (e: React.FormEvent) => {
    e.preventDefault();
    const err = loginAffiliate(aff.fiacNo, aff.phone);
    if (err) return toast.error(err);
    toast.success("Berhasil masuk"); nav("/app");
  };
  const submitRef = (e: React.FormEvent) => {
    e.preventDefault();
    const err = loginReferral(ref.username, ref.password);
    if (err) return toast.error(err);
    toast.success("Berhasil masuk"); nav("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-soft text-xs">
            <Sparkles className="h-3.5 w-3.5 text-brand-blue" />
            <span className="text-brand-blue-dark font-medium">Platform Manajemen Afiliasi</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-brand-blue-dark">
            Masuk ke <span className="gradient-text">AfiliasiHub</span>
          </h1>
          <p className="text-[#6B7280] text-xs mt-1">Kelola kampanye afiliasi dengan mudah</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <Tabs defaultValue="admin">
            <TabsList className="grid grid-cols-3 w-full bg-muted/50">
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
              <TabsTrigger value="referral">Referral</TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="mt-4">
              <form onSubmit={submitAdmin} className="space-y-3">
                <div><Label className="text-xs">Username</Label><Input value={admin.username} onChange={(e) => setAdmin({ ...admin, username: e.target.value })} required /></div>
                <div><Label className="text-xs">Password</Label><Input type="password" value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} required /></div>
                <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white">Masuk sebagai Admin</Button>
                <p className="text-[11px] text-center text-[#6B7280]">Default: admin / admin123</p>
              </form>
            </TabsContent>

            <TabsContent value="affiliate" className="mt-4">
              <form onSubmit={submitAff} className="space-y-3">
                <div><Label className="text-xs">Fiac No (Affiliate ID)</Label><Input value={aff.fiacNo} onChange={(e) => setAff({ ...aff, fiacNo: e.target.value })} placeholder="FIAC0001" required /></div>
                <div><Label className="text-xs">Nomor Telepon</Label><Input value={aff.phone} onChange={(e) => setAff({ ...aff, phone: e.target.value })} required /></div>
                <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white">Masuk sebagai Affiliate</Button>
              </form>
            </TabsContent>

            <TabsContent value="referral" className="mt-4">
              <form onSubmit={submitRef} className="space-y-3">
                <div><Label className="text-xs">Username</Label><Input value={ref.username} onChange={(e) => setRef({ ...ref, username: e.target.value })} required /></div>
                <div><Label className="text-xs">Password</Label><Input type="password" value={ref.password} onChange={(e) => setRef({ ...ref, password: e.target.value })} required /></div>
                <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white">Masuk sebagai Referral</Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-5 pt-4 border-t border-border text-center text-xs text-muted-foreground">
            Belum punya akun? <Link to="/signup" className="font-semibold gradient-text">Daftar sekarang</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
