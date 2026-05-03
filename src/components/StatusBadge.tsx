import { cn } from "@/lib/utils";

// All statuses use the teal palette only (varying weight/opacity/borders)
const map: Record<string, string> = {
  Aktif: "bg-teal-primary/10 text-teal-primary border-teal-primary/30",
  "Tidak Aktif": "bg-white/60 text-teal-cadet border-teal-light/50",
  NEW: "bg-teal-pale/60 text-teal-dark border-teal-light/60",
  RUNNING: "bg-teal-primary/15 text-teal-primary border-teal-primary/40",
  PROSES: "bg-teal-light/30 text-teal-dark border-teal-cadet/40",
  CANCEL: "bg-white/50 text-teal-cadet border-teal-cadet/40 line-through",
  DONE: "bg-teal-dark/10 text-teal-dark border-teal-dark/30",
  PENDING: "bg-teal-pale/60 text-teal-dark border-teal-cadet/40",
  DITERIMA: "bg-teal-primary/15 text-teal-primary border-teal-primary/40",
  DITOLAK: "bg-white/60 text-teal-dark border-teal-dark/40",
  DIBAYAR: "bg-teal-primary/15 text-teal-primary border-teal-primary/40",
  "BELUM DIBAYAR": "bg-teal-pale/60 text-teal-dark border-teal-cadet/40",
  REVISI: "bg-teal-light/30 text-teal-dark border-teal-cadet/50",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = map[status] || "bg-white/60 text-teal-dark border-teal-light/50";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide font-sans", cls)}>
      {status}
    </span>
  );
}
