import { ReactNode, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Inbox } from "lucide-react";

interface Col<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  rows: T[];
  cols: Col<T>[];
  empty?: string;
  title?: string;
  searchable?: boolean;
  pageSizeDefault?: number;
}

export function DataTable<T extends { id: string }>({
  rows,
  cols,
  empty = "Belum ada data tersedia.",
  title,
  searchable = true,
  pageSizeDefault = 10,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [pageSize, setPageSize] = useState(pageSizeDefault);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const t = q.trim().toLowerCase();
    return rows.filter((r) =>
      Object.values(r as any).some((v) => String(v ?? "").toLowerCase().includes(t))
    );
  }, [rows, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-white/40">
        <div className="flex items-center gap-3">
          {title && <h3 className="font-display text-teal-dark text-[15px]">{title}</h3>}
          <span className="text-[11px] font-sans text-[#6B7280] bg-white/60 border border-teal-light/40 rounded-full px-2.5 py-0.5">
            Total <span className="font-semibold text-teal-primary">{total}</span> data
          </span>
        </div>
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-teal-cadet" />
              <Input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Cari..."
                className="h-8 pl-8 w-44 text-xs bg-white/70 border-teal-light/50 focus-visible:ring-teal-primary"
              />
            </div>
          )}
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="h-8 text-xs rounded-md border border-teal-light/50 bg-white/70 px-2 text-teal-dark focus:outline-none focus:ring-2 focus:ring-teal-primary/40"
            aria-label="Jumlah per halaman"
          >
            {[5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n} / hal</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-teal-pale/70 via-white/60 to-teal-pale/70 text-left">
              <th className="px-3 py-2.5 font-display font-semibold text-[11px] uppercase tracking-wide text-teal-dark w-12">No</th>
              {cols.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-2.5 font-display font-semibold text-[11px] uppercase tracking-wide text-teal-dark",
                    c.className
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 1} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-[#6B7280]">
                    <div className="h-12 w-12 rounded-full bg-teal-pale/60 border border-teal-light/40 flex items-center justify-center">
                      <Inbox className="h-5 w-5 text-teal-cadet" />
                    </div>
                    <span className="text-xs">{empty}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-t border-teal-light/30 hover:bg-teal-pale/40 transition-colors"
                >
                  <td className="px-3 py-2.5 align-middle text-[11px] text-[#6B7280] font-medium">
                    {start + i + 1}
                  </td>
                  {cols.map((c) => (
                    <td key={c.key} className={cn("px-4 py-2.5 align-middle text-[#1F2937]", c.className)}>
                      {c.render ? c.render(r) : (r as any)[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-white/40 bg-white/40">
        <div className="text-[11px] text-[#6B7280] font-sans">
          Menampilkan{" "}
          <span className="font-semibold text-teal-dark">
            {total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)}
          </span>{" "}
          dari <span className="font-semibold text-teal-dark">{total}</span> data
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-7 px-2 border-teal-light/50 text-teal-dark hover:bg-teal-pale/60 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="ml-1 text-[11px]">Prev</span>
          </Button>
          <div className="px-2 text-[11px] font-sans text-teal-dark">
            Hal <span className="font-semibold text-teal-primary">{currentPage}</span> / {totalPages}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-7 px-2 border-teal-light/50 text-teal-dark hover:bg-teal-pale/60 disabled:opacity-40"
          >
            <span className="mr-1 text-[11px]">Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
