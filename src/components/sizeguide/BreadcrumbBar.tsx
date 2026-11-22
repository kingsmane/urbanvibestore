import React from 'react';

export const BreadcrumbBar: React.FC = () => {
  return (
    <section className="w-full bg-surface-container-low px-margin md:px-margin-desktop py-space-sm border-b border-border-hairline">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-xs text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
        <div className="flex items-center gap-space-xs">
          <span className="inline-block w-2 h-2 bg-badge-promo"></span>
          <span>SYS.SPEC // PRD V1.0-SEC.6.3</span>
          <span className="text-outline">/</span>
          <span className="text-primary font-bold">URBAN FIT PRECISION SYSTEM</span>
        </div>
        <div className="flex items-center gap-space-md">
          <span className="text-outline">UNIT KALIBRASI: METRIK (CM)</span>
          <span className="hidden sm:inline text-outline">•</span>
          <span className="hidden sm:inline text-primary">TOLERANSI RESMI: ±1.5 CM</span>
        </div>
      </div>
    </section>
  );
};
