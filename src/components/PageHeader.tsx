import { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <section className="page-hero mb-6 px-5 sm:px-7 py-5 sm:py-6 flex flex-wrap items-center justify-between gap-4">
      <div className="relative z-10">
        <h1 className="font-display text-2xl sm:text-[26px] font-semibold text-teal-dark leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12.5px] text-[#6B7280] mt-1 max-w-2xl font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="relative z-10 flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}
