import { useRef } from "react";
import { Download, Upload, DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AUTO_IMPORT_URL = "/data/localstorage-seed.json";

function todayStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function exportAll() {
  try {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === null) continue;
      const v = localStorage.getItem(k);
      if (v !== null) data[k] = v;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rumah-vape-localstorage-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Export berhasil", { description: `${Object.keys(data).length} keys diekspor.` });
  } catch (e: any) {
    toast.error("Export gagal", { description: e?.message || "Terjadi kesalahan." });
  }
}

function validatePayload(parsed: unknown): parsed is Record<string, string> {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof k !== "string" || typeof v !== "string") return false;
  }
  return true;
}

function applyImport(parsed: Record<string, string>) {
  for (const [k, v] of Object.entries(parsed)) {
    localStorage.setItem(k, v);
  }
}

export default function BackupControls() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleManualFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        if (!text.trim()) throw new Error("File kosong.");
        const parsed = JSON.parse(text);
        if (!validatePayload(parsed)) throw new Error("Struktur JSON tidak valid.");
        applyImport(parsed);
        toast.success("Import berhasil", { description: "Memuat ulang aplikasi..." });
        setTimeout(() => window.location.reload(), 700);
      } catch (e: any) {
        toast.error("Import gagal", { description: e?.message || "File tidak valid." });
      }
    };
    reader.onerror = () => toast.error("Import gagal", { description: "File tidak terbaca." });
    reader.readAsText(file);
  };

  const autoImport = async () => {
    try {
      const res = await fetch(AUTO_IMPORT_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`File tidak ditemukan (${res.status}).`);
      const text = await res.text();
      if (!text.trim()) throw new Error("File kosong.");
      const parsed = JSON.parse(text);
      if (!validatePayload(parsed)) throw new Error("Struktur JSON tidak valid.");
      applyImport(parsed);
      toast.success("Auto import berhasil", { description: "Memuat ulang aplikasi..." });
      setTimeout(() => window.location.reload(), 700);
    } catch (e: any) {
      toast.error("Auto import gagal", { description: e?.message || "Tidak dapat memuat seed." });
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleManualFile(f);
          e.target.value = "";
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-foreground hover:bg-brand-blue/5 hover:text-brand-blue"
        onClick={exportAll}
        title="Export semua data localStorage"
      >
        <Download className="h-4 w-4" />
        <span className="hidden md:inline ml-1.5 text-[12px]">Export</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-foreground hover:bg-brand-blue/5 hover:text-brand-blue"
        onClick={() => fileRef.current?.click()}
        title="Import manual dari file JSON"
      >
        <Upload className="h-4 w-4" />
        <span className="hidden md:inline ml-1.5 text-[12px]">Import</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-foreground hover:bg-brand-blue/5 hover:text-brand-blue"
        onClick={autoImport}
        title="Auto import dari /data/localstorage-seed.json"
      >
        <DownloadCloud className="h-4 w-4" />
        <span className="hidden lg:inline ml-1.5 text-[12px]">Auto</span>
      </Button>
    </div>
  );
}