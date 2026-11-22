import React from 'react';
import { Category } from './types';

interface TitleTabsProps {
  category: Category;
  setCategory: React.Dispatch<React.SetStateAction<Category>>;
}

export const TitleTabs: React.FC<TitleTabsProps> = ({
  category,
  setCategory,
}) => {
  return (
    <section className="w-full bg-canvas-base px-margin md:px-margin-desktop pt-space-xl pb-space-lg">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg border-b border-border-hairline">
          <div className="space-y-space-xs">
            <div className="inline-flex items-center gap-space-xs bg-primary text-badge-promo px-space-xs py-0.5 font-label-caps text-label-caps uppercase tracking-widest">
              <span className="material-symbols-outlined text-[14px]">straighten</span>
              Precision Sizing Protocol
            </div>
            <h1 className="font-headline-lg text-headline-lg uppercase tracking-tight text-primary text-balance">
              PANDUAN UKURAN VISUAL <span className="text-outline">//</span> URBAN FIT PRECISION
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              Cek ukuran dulu. Biar fit-nya pas. Standarisasi rasio tubuh arsitektural berbasis
              siluet rileks Tokyo-Zurich.
            </p>
          </div>

          {/* Garansi Singkat Pill */}
          <div className="flex items-center gap-space-sm bg-surface-subtle p-space-sm max-w-md border-l-2 border-border-strong">
            <span className="material-symbols-outlined text-primary text-[28px] shrink-0">
              published_with_changes
            </span>
            <div>
              <p className="font-label-caps text-label-caps uppercase text-primary font-bold">
                Jaminan Bebas Resiko
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tukar ukuran gratis dalam 7 hari kerja tanpa biaya tambahan jika tidak pas.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-space-sm pt-space-md overflow-x-auto">
          {[
            { id: 'tops' as const, label: 'Atasan (Tees, Shirts, Knit)' },
            { id: 'bottoms' as const, label: 'Bawahan (Trousers, Denim)' },
            { id: 'outerwear' as const, label: 'Outerwear (Blazer, Coat, Parka)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-space-md py-space-xs font-label-caps text-label-caps uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                category === tab.id
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-canvas-base text-on-surface border-border-hairline hover:border-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
