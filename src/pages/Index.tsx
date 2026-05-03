import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Wallet, Users, CheckCircle2, ArrowRight } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="glass-soft sticky top-0 z-10 border-b border-white/40">
        <div className="container mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-primary to-teal-dark flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-semibold text-teal-dark">
              Afiliasi<span className="text-teal-primary">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/app"><Button className="bg-teal-primary hover:bg-teal-dark text-white">Ke Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm" className="text-teal-dark hover:bg-teal-pale/60">Masuk</Button></Link>
                <Link to="/signup"><Button size="sm" className="bg-teal-primary hover:bg-teal-dark text-white">Daftar</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="container mx-auto py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-soft text-xs mb-5">
          <Sparkles className="h-3.5 w-3.5 text-teal-primary" />
          <span className="text-teal-dark font-medium">Platform manajemen kampanye afiliasi</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto text-teal-dark">
          Kelola kampanye, affiliate, dan pembayaran{" "}
          <span className="gradient-text">dalam satu tempat.</span>
        </h1>
        <p className="text-sm text-[#6B7280] mt-4 max-w-xl mx-auto">
          Blast kampanye, setujui afiliasi, validasi nomor WhatsApp grup, dan bayar performer — semua otomatis.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link to="/signup">
            <Button className="bg-teal-primary hover:bg-teal-dark text-white">
              Mulai Sekarang <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-teal-cadet/50 text-teal-dark hover:bg-teal-pale/60">
              Masuk
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto pb-20 grid md:grid-cols-4 gap-4">
        {[
          { icon: Send, title: "Blast Campaign", desc: "Broadcast kampanye ke seluruh affiliate dengan sekali klik." },
          { icon: CheckCircle2, title: "Approval Terverifikasi", desc: "Validasi nomor WA sebelum masuk grup." },
          { icon: Users, title: "Pelaporan Performa", desc: "Views, likes, comments, dan link konten." },
          { icon: Wallet, title: "Pembayaran Otomatis", desc: "Payment otomatis dibuat saat laporan disetujui." },
        ].map((f, i) => (
          <div key={i} className="glass rounded-2xl p-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-primary to-teal-dark text-white flex items-center justify-center mb-3 shadow-md">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-teal-dark">{f.title}</h3>
            <p className="text-xs text-[#6B7280] mt-1">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Index;
