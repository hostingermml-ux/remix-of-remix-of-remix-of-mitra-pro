import { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <section className="page-hero mb-6 px-6 sm:px-8 py-6 sm:py-7 flex flex-wrap items-center justify-between gap-4">
      <div className="relative z-10">
        <h1 className="font-display text-2xl sm:text-[28px] font-bold text-white leading-tight drop-shadow-sm">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12.5px] text-white/80 mt-1.5 max-w-2xl font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="relative z-10 flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}
