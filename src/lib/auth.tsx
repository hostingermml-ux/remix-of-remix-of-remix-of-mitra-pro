import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { KEYS, load, save, ensureDefaultAdmin } from "./storage";

export type Role = "admin" | "affiliate" | "referral";
export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  username?: string;
  affiliateId?: string;
  referralId?: string;
}

interface AuthCtx {
  user: SessionUser | null;
  loginAdmin: (username: string, password: string) => string | null;
  loginAffiliate: (affiliateId: string, phone: string) => string | null;
  loginReferral: (username: string, password: string) => string | null;
  signup: (data: any) => string | null;
  logout: () => void;
  updateProfile: (data: any) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    ensureDefaultAdmin();
    const s = load<SessionUser | null>(KEYS.session, null);
    if (s) setUser(s);
  }, []);

  const persist = (u: SessionUser | null) => {
    setUser(u);
    if (u) save(KEYS.session, u);
    else localStorage.removeItem(KEYS.session);
  };

  const loginAdmin = (username: string, password: string) => {
    const users = load<any[]>(KEYS.users, []);
    const u = users.find((x) => x.role === "admin" && x.username === username && x.password === password);
    if (!u) return "Username atau password salah";
    persist({ id: u.id, role: "admin", name: u.name, username: u.username });
    return null;
  };

  const loginAffiliate = (affiliateId: string, phone: string) => {
    const affiliates = load<any[]>(KEYS.affiliates, []);
    const a = affiliates.find((x) => x.fiacNo === affiliateId && x.phone === phone);
    if (!a) return "Fiac No atau nomor telepon salah";
    if (a.status !== "Aktif") return "Akun affiliate tidak aktif";
    const users = load<any[]>(KEYS.users, []);
    let u = users.find((x) => x.role === "affiliate" && x.affiliateId === a.id);
    if (!u) {
      u = {
        id: a.id, role: "affiliate", affiliateId: a.id, name: a.name,
        phone: a.phone, password: phone, socialMedia: a.socialMedia || "",
        createdAt: new Date().toISOString(),
      };
      users.push(u); save(KEYS.users, users);
    }
    persist({ id: u.id, role: "affiliate", name: a.name, affiliateId: a.id });
    return null;
  };

  const loginReferral = (username: string, password: string) => {
    const refs = load<any[]>(KEYS.referrals, []);
    const r = refs.find((x) => x.username === username && x.password === password);
    if (!r) return "Username atau password salah";
    if (r.status && r.status !== "Aktif") return "Akun referral tidak aktif";
    persist({ id: r.id, role: "referral", name: r.name, username: r.username, referralId: r.id });
    return null;
  };

  const signup = (data: any) => {
    const users = load<any[]>(KEYS.users, []);
    if (data.role === "admin") {
      if (users.find((u) => u.username === data.username)) return "Username sudah dipakai";
      users.push({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
      save(KEYS.users, users);
      return null;
    }
    if (data.role === "referral") {
      const refs = load<any[]>(KEYS.referrals, []);
      if (refs.find((r) => r.username === data.username)) return "Username sudah dipakai";
      const r = {
        id: crypto.randomUUID(),
        name: data.name, username: data.username, password: data.password,
        phone: data.phone || "", email: data.email || "",
        status: "Aktif", createdAt: new Date().toISOString(),
      };
      refs.push(r); save(KEYS.referrals, refs);
      return null;
    }
    // affiliate signup -> goes to SCREENING (not direct affiliate anymore)
    const screening = load<any[]>(KEYS.screening, []);
    if (screening.find((a) => a.phone === data.phone)) return "Nomor telepon sudah terdaftar";
    const fiacNo = "FIAC" + String(screening.length + 1).padStart(4, "0");
    const s = {
      id: crypto.randomUUID(),
      name: data.name, phone: data.phone, email: data.email, fiacNo,
      socialMedia: data.socialMedia || "", bankNo: data.bankNo || "",
      bankName: data.bankName || "", ownerName: data.ownerName || data.name,
      city: data.city || "", referralName: data.referralName || "",
      status: "PENDING", active: "Aktif",
      createdAt: new Date().toISOString(),
    };
    screening.push(s);
    save(KEYS.screening, screening);
    return `AFFILIATE_REGISTERED:${fiacNo}`;
  };

  const logout = () => persist(null);

  const updateProfile = (data: any) => {
    if (!user) return;
    const users = load<any[]>(KEYS.users, []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) { users[idx] = { ...users[idx], ...data }; save(KEYS.users, users); }
    if (user.role === "affiliate") {
      const affiliates = load<any[]>(KEYS.affiliates, []);
      const ai = affiliates.findIndex((a) => a.id === user.affiliateId);
      if (ai >= 0) { affiliates[ai] = { ...affiliates[ai], ...data }; save(KEYS.affiliates, affiliates); }
    }
    if (user.role === "referral") {
      const refs = load<any[]>(KEYS.referrals, []);
      const ri = refs.findIndex((r) => r.id === user.referralId);
      if (ri >= 0) { refs[ri] = { ...refs[ri], ...data }; save(KEYS.referrals, refs); }
    }
  };

  return <Ctx.Provider value={{ user, loginAdmin, loginAffiliate, loginReferral, signup, logout, updateProfile }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
