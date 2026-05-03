import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { KEYS, load, save, ensureDefaultAdmin } from "./storage";

export type Role = "admin" | "affiliate";
export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  username?: string;
  affiliateId?: string;
}

interface AuthCtx {
  user: SessionUser | null;
  loginAdmin: (username: string, password: string) => string | null;
  loginAffiliate: (affiliateId: string, phone: string) => string | null;
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
    // ensure a user record exists so profile updates work
    const users = load<any[]>(KEYS.users, []);
    let u = users.find((x) => x.role === "affiliate" && x.affiliateId === a.id);
    if (!u) {
      u = {
        id: a.id,
        role: "affiliate",
        affiliateId: a.id,
        name: a.name,
        phone: a.phone,
        password: phone,
        socialMedia: a.socialMedia || "",
        createdAt: new Date().toISOString(),
      };
      users.push(u);
      save(KEYS.users, users);
    }
    persist({ id: u.id, role: "affiliate", name: a.name, affiliateId: a.id });
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
    // affiliate signup creates an affiliate row
    const affiliates = load<any[]>(KEYS.affiliates, []);
    if (affiliates.find((a) => a.phone === data.phone)) return "Nomor telepon sudah terdaftar";
    const fiacNo = "FIAC" + String(affiliates.length + 1).padStart(4, "0");
    const a = {
      id: crypto.randomUUID(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      fiacNo,
      socialMedia: data.socialMedia || "",
      bankNo: data.bankNo || "",
      bankName: data.bankName || "",
      status: "Aktif",
      createdAt: new Date().toISOString(),
    };
    affiliates.push(a);
    save(KEYS.affiliates, affiliates);
    return `AFFILIATE_REGISTERED:${fiacNo}`;
  };

  const logout = () => persist(null);

  const updateProfile = (data: any) => {
    if (!user) return;
    const users = load<any[]>(KEYS.users, []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...data };
      save(KEYS.users, users);
    }
    if (user.role === "affiliate") {
      const affiliates = load<any[]>(KEYS.affiliates, []);
      const ai = affiliates.findIndex((a) => a.id === user.affiliateId);
      if (ai >= 0) {
        affiliates[ai] = { ...affiliates[ai], ...data };
        save(KEYS.affiliates, affiliates);
      }
    }
  };

  return <Ctx.Provider value={{ user, loginAdmin, loginAffiliate, signup, logout, updateProfile }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
