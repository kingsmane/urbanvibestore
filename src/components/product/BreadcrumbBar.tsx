import React from 'react';
import { Product } from '../../data/storeData';

interface BreadcrumbBarProps {
  product: Product;
  onNavigateHome: (category?: string) => void;
}

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  product,
  onNavigateHome,
}) => {
  return (
    <div className="w-full bg-canvas-base border-b border-border-hairline py-space-sm">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop flex items-center justify-between text-body-sm font-body-sm text-outline">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs flex-wrap">
          <button
            type="button"
            onClick={() => onNavigateHome('Semua')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <span className="text-[12px] opacity-40">/</span>
          <button
            type="button"
            onClick={() => onNavigateHome(product.category)}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            {product.category}
          </button>
          <span className="text-[12px] opacity-40">/</span>
          <span className="hover:text-primary transition-colors">Atasan &amp; Kurasi</span>
          <span className="text-[12px] opacity-40">/</span>
          <span className="text-primary font-medium">{product.shortName}</span>
        </nav>
        <div className="hidden sm:flex items-center gap-space-sm font-label-caps text-label-caps uppercase tracking-wider text-outline">
          <span>Koleksi Essentials 2026</span>
          <span className="w-1.5 h-1.5 rounded-full bg-badge-promo"></span>
          <span className="text-on-surface">Edisi Terbatas</span>
        </div>
      </div>
    </div>
  );
};
