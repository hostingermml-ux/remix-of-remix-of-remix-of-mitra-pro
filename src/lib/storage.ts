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
  blasts: "af_blasts",
  reports: "af_reports",
  payments: "af_payments",
  // new
  screening: "af_screening",
  referrals: "af_referrals",
  paymentReferrals: "af_payment_referrals",
  challenges: "af_challenges",
  challengeApps: "af_challenge_apps",
  challengeWinners: "af_challenge_winners",
  paymentChallenges: "af_payment_challenges",
  staffPerms: "af_staff_perms", // per-user admin/staff overrides
};

const ADMIN_DEFAULT = {
  dashboard: true,
  staff: true,
  affiliates: true,
  customers: true,
  permissions: true,
  screening: true,
  acceptReject: true,
  referrals: true,
  campaigns: true,
  blast: true,
  approval: true,
  running: true,
  reports: true,
  payments: true,
  paymentReferrals: true,
  challenge: true,
  challengeWinners: true,
  paymentChallenges: true,
};
const AFFILIATE_DEFAULT = {
  dashboard: true,
  blast: true,
  running: true,
  reports: true,
  payments: true,
  challenge: true,
};
const REFERRAL_DEFAULT = {
  dashboard: true,
  screening: true,        // their own submissions
  affiliates: true,       // approved view (read-only)
  paymentReferrals: true, // their payments
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
  // merge perms so new menus appear without wiping user customisations
  const perms = load<any>(KEYS.permissions, null);
  const next = {
    admin: { ...ADMIN_DEFAULT, ...(perms?.admin || {}) },
    affiliate: { ...AFFILIATE_DEFAULT, ...(perms?.affiliate || {}) },
    referral: { ...REFERRAL_DEFAULT, ...(perms?.referral || {}) },
  };
  save(KEYS.permissions, next);
}

export const STATUS_CAMPAIGN = ["NEW", "RUNNING", "CANCEL", "DONE", "PROSES"] as const;
export type CampaignStatus = typeof STATUS_CAMPAIGN[number];

export const SCREENING_STATUS = ["PENDING", "DITERIMA", "DITOLAK"] as const;
