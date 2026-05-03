import { cn } from "@/lib/utils";

/**
 * Brand palette only:
 *   Blue (primary states), Soft Blue (neutral), Red (warning/cancel/rejected/unpaid)
 */
const map: Record<string, string> = {
  Aktif:           "bg-brand-blue/10 text-brand-blue border-brand-blue/30",
  "Tidak Aktif":   "bg-white text-muted-foreground border-border",
  NEW:             "bg-brand-blue/10 text-brand-blue-dark border-brand-blue/25",
  RUNNING:         "bg-brand-blue/15 text-brand-blue border-brand-blue/40",
  PROSES:          "bg-brand-blue-electric/10 text-brand-blue-electric border-brand-blue-electric/30",
  CANCEL:          "bg-brand-red-soft text-brand-red-dark border-brand-red/30 line-through",
  DONE:            "bg-brand-blue-dark/10 text-brand-blue-dark border-brand-blue-dark/30",
  PENDING:         "bg-brand-blue/10 text-brand-blue border-brand-blue/25",
  DITERIMA:        "bg-brand-blue/15 text-brand-blue border-brand-blue/40",
  DITOLAK:         "bg-brand-red-soft text-brand-red-dark border-brand-red/35",
  DIBAYAR:         "bg-brand-blue/15 text-brand-blue border-brand-blue/40",
  "BELUM DIBAYAR": "bg-brand-red-soft text-brand-red-dark border-brand-red/30",
  REVISI:          "bg-brand-blue-electric/10 text-brand-blue-electric border-brand-blue-electric/30",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = map[status] || "bg-white text-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide font-sans",
        cls
      )}
    >
      {status}
    </span>
  );
}
