// Local storage helpers & seed defaults
export type ID = string;

export const uid = (p = "") => p + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const KEYS = {
  users: "af_users",
  session: "af_session",
  staff: "af_staff",
  affiliates: "af_affiliates",
  customers: "af_customers",
  permissions: "af_permissions",
  campaigns: "af_campaigns",
  blasts: "af_blasts", // affiliate applications per campaign
  reports: "af_reports",
  payments: "af_payments",
};

// Ensure default admin exists so first login works
export function ensureDefaultAdmin() {
  const users = load<any[]>(KEYS.users, []);
  if (!users.find((u) => u.role === "admin")) {
    users.push({
      id: uid("u_"),
      role: "admin",
      username: "admin",
      password: "admin123",
      name: "Administrator",
      phone: "",
      socialMedia: "",
      createdAt: new Date().toISOString(),
    });
    save(KEYS.users, users);
  }
  const perms = load<any>(KEYS.permissions, null);
  if (!perms) {
    save(KEYS.permissions, {
      admin: {
        dashboard: true,
        staff: true,
        affiliates: true,
        customers: true,
        permissions: true,
        campaigns: true,
        blast: true,
        approval: true,
        running: true,
        reports: true,
        payments: true,
      },
      affiliate: {
        dashboard: true,
        blast: true,
        running: true,
        reports: true,
        payments: true,
      },
    });
  }
}

export const STATUS_CAMPAIGN = ["NEW", "RUNNING", "CANCEL", "DONE", "PROSES"] as const;
export type CampaignStatus = typeof STATUS_CAMPAIGN[number];
