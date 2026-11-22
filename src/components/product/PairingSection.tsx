import React from 'react';
import { PAIRING_PRODUCTS, formatRupiah } from '../../data/storeData';

interface PairingSectionProps {
  onNavigateHome: (category?: string) => void;
  onOpenProduct: (productId: string) => void;
  onQuickAddCustom: (name: string, price: number, image: string, categoryLabel: string) => void;
}

export const PairingSection: React.FC<PairingSectionProps> = ({
  onNavigateHome,
  onOpenProduct,
  onQuickAddCustom,
}) => {
  return (
    <section className="w-full bg-canvas-base border-t border-border-hairline py-space-xl mt-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-xs border-b border-border-hairline pb-space-sm">
          <div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-outline block mb-1">
              Kurasi Stylist UrbanStore
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
              Lengkapi Gaya Anda
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateHome('Semua')}
            className="inline-flex items-center gap-1 font-label-caps text-label-caps uppercase tracking-wider text-primary hover:text-secondary font-bold cursor-pointer"
          >
            <span>Lihat Semua Setelan</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm md:gap-gutter-desktop">
          {PAIRING_PRODUCTS.map((item, idx) => (
            <div key={idx} className="group flex flex-col">
              <div
                onClick={() => {
                  if (item.id === 'prod-3' || item.id === 'prod-7') {
                    onOpenProduct(item.id);
                  } else {
                    onQuickAddCustom(item.name, item.price, item.image, item.categoryLabel);
                  }
                }}
                className="relative aspect-[3/4] bg-surface-muted overflow-hidden border border-border-hairline mb-space-xs cursor-pointer"
              >
                {item.badge && (
                  <span
                    className={`absolute top-2 left-2 z-10 px-2 py-0.5 font-label-caps text-[10px] uppercase font-bold tracking-wider ${
                      item.badgeVariant === 'promo'
                        ? 'bg-badge-promo text-text-on-accent'
                        : 'bg-badge-new text-primary border border-border-hairline'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <img
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={item.image}
                />
                <button
                  type="button"
                  aria-label="Quick Add"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickAddCustom(item.name, item.price, item.image, item.categoryLabel);
                  }}
                  className="absolute bottom-2 right-2 w-9 h-9 bg-canvas-base border border-border-hairline hover:bg-badge-promo text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
              <span className="font-label-caps text-[10px] uppercase text-outline tracking-wider">
                {item.categoryLabel}
              </span>
              <h3
                onClick={() => {
                  if (item.id === 'prod-3' || item.id === 'prod-7') {
                    onOpenProduct(item.id);
                  } else {
                    onQuickAddCustom(item.name, item.price, item.image, item.categoryLabel);
                  }
                }}
                className="font-body-md text-body-md font-semibold text-primary truncate hover:underline cursor-pointer"
              >
                {item.name}
              </h3>
              <div className="flex items-center gap-space-xs mt-0.5">
                <span className="font-price-display text-body-md font-bold text-primary">
                  {formatRupiah(item.price)}
                </span>
                {item.originalPrice && (
                  <span className="font-price-strike text-price-strike text-outline line-through">
                    {formatRupiah(item.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
