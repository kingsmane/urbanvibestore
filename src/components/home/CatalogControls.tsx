import React from 'react';
import { Product } from '../../data/storeData';
import { SortOrder } from './types';

interface CatalogControlsProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  filteredProducts: Product[];
  applyQueryFilter: (query: string) => void;
}

export const CatalogControls: React.FC<CatalogControlsProps> = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortOrder,
  setSortOrder,
  filteredProducts,
  applyQueryFilter,
}) => {
  return (
    <section className="w-full bg-canvas-base pt-space-xl pb-space-md" id="katalog">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop">
        {/* Section Title & Meta Count */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm pb-space-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-badge-promo inline-block"></span>
              <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider">
                Koleksi Busana Esensial
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg uppercase text-primary tracking-tight">
              Katalog Terkurasi
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Menampilkan{' '}
            <strong className="text-primary font-semibold">
              {filteredProducts.length} artikel terpilih
            </strong>{' '}
            dari Koleksi Drop SS26
          </p>
        </div>

        {/* Controls Matrix */}
        <div className="bg-surface-subtle p-space-md space-y-space-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            {/* Category Tabs */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
              {[
                { id: 'Semua', label: 'Semua Koleksi (8)' },
                { id: 'Pria', label: 'Pria (3)' },
                { id: 'Wanita', label: 'Wanita (4)' },
                { id: 'Aksesoris', label: 'Aksesoris (1)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onCategoryChange(tab.id)}
                  className={`px-4 py-2 font-label-caps text-label-caps uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-canvas-base text-on-surface hover:bg-surface-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Search & Sort */}
            <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-canvas-base pl-9 pr-8 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest"
                  placeholder="Cari warna, material, nama..."
                  type="text"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <div className="relative w-full sm:w-auto shrink-0">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="w-full appearance-none bg-canvas-base px-4 py-2 pr-8 font-label-caps text-label-caps uppercase text-primary outline-none cursor-pointer"
                >
                  <option value="terbaru">Urutan: Terbaru</option>
                  <option value="harga-rendah">Harga: Terendah</option>
                  <option value="harga-tinggi">Harga: Tertinggi</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Keyword Pills & Active Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
            <div className="flex flex-wrap items-center gap-space-xs text-body-sm">
              <span className="font-label-caps text-label-caps uppercase text-outline">
                Kueri Cepat:
              </span>
              {[
                { label: 'Heavyweight Tee', query: 'Heavyweight' },
                { label: 'Linen', query: 'Linen' },
                { label: 'Pleated', query: 'Pleated' },
                { label: 'Japanese Denim', query: 'Denim' },
              ].map((qItem) => (
                <button
                  key={qItem.query}
                  type="button"
                  onClick={() => applyQueryFilter(qItem.query)}
                  className={`px-2 py-0.5 font-label-caps text-[11px] uppercase transition-colors cursor-pointer ${
                    searchQuery.toLowerCase() === qItem.query.toLowerCase()
                      ? 'bg-badge-promo text-text-on-accent font-bold'
                      : 'bg-canvas-base hover:bg-badge-promo hover:text-text-on-accent text-on-surface-variant'
                  }`}
                >
                  {qItem.label}
                </button>
              ))}
              {(searchQuery || activeCategory !== 'Semua') && (
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange('Semua');
                    onSearchChange('');
                  }}
                  className="px-2 py-0.5 bg-primary text-on-primary font-label-caps text-[11px] uppercase cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="hidden sm:inline-flex items-center gap-1 font-label-caps text-label-caps text-badge-soldout">
              <span className="w-1.5 h-1.5 rounded-full bg-badge-promo"></span>
              Filter Aktif:{' '}
              <span className="font-bold">
                {activeCategory === 'Semua' ? 'Semua Koleksi' : activeCategory}
                {searchQuery ? ` · "${searchQuery}"` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
