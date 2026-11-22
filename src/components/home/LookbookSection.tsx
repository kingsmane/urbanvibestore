import React from 'react';
import { Product } from '../../data/storeData';

interface LookbookSectionProps {
  products: Product[];
  onOpenProduct: (productId: string) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onAddBundle: () => void;
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({
  products,
  onOpenProduct,
  onAddToCart,
  onAddBundle,
}) => {
  return (
    <section className="w-full bg-primary text-on-primary py-space-xl" id="lookbook">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop">
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-space-lg gap-space-md">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-badge-promo inline-block"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-badge-promo">
                Editorial Story 01
              </span>
            </div>
            <h2 className="font-display text-display uppercase tracking-tight leading-none text-on-primary">
              The Art of <br className="hidden sm:inline" />
              Everyday Living
            </h2>
          </div>
          <p className="font-body-md text-body-md text-on-primary-container max-w-md">
            Sebuah eksplorasi harmonis antara kenyamanan kasual harian dan siluet arsitektural.
            Klik pada tag busana interaktif di bawah untuk melihat rincian ansambel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-stretch">
          {/* Interactive Main Shot (with Hotspots) */}
          <div className="lg:col-span-8 relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-[620px] bg-neutral-900 overflow-hidden group">
            <img
              alt="High fashion couple editorial in minimalist concrete courtyard in Tokyo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZdldFDIt9RcC4oteSGZe-8M1k4dXmTW3ZP4jVJr9CkgahojMfKkJdjY7dJg79QjcUb6INbrDQKvmQsW5db9ou8F8QFGG6ZVcjQzQ3YW-L4-hnK5ONcz8DbbUy8lHJNqj-7UdGPApUVQaWuoFDJU9Aploetp8X-BNRafFwNPmHIi-8iaKvyznrxTOwN_ntnBKkFB0932bvdtLGduO7qVOEFsoOvrQnIwf2S_NtapiW"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/30 pointer-events-none"></div>

            {/* Hotspot 1: Tee */}
            <div className="absolute top-[35%] left-[30%] -translate-x-1/2 -translate-y-1/2 group/spot">
              <button
                type="button"
                onClick={() => onOpenProduct('prod-1')}
                className="relative w-8 h-8 rounded-full bg-badge-promo text-text-on-accent flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-110 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="absolute inset-0 rounded-full bg-badge-promo animate-ping opacity-40"></span>
              </button>
              <div className="absolute left-10 top-0 w-52 bg-canvas-base text-primary p-2.5 shadow-2xl opacity-0 group-hover/spot:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <span className="font-label-caps text-[10px] text-outline uppercase block">
                  Outfit Tag 01
                </span>
                <p className="font-headline-sm text-body-sm font-bold">Heavyweight Tee</p>
                <p className="font-price-display text-body-sm text-primary">Rp 249.000</p>
              </div>
            </div>

            {/* Hotspot 2: Pleated Trousers */}
            <div className="absolute top-[68%] left-[72%] -translate-x-1/2 -translate-y-1/2 group/spot">
              <button
                type="button"
                onClick={() => onOpenProduct('prod-3')}
                className="relative w-8 h-8 rounded-full bg-badge-promo text-text-on-accent flex items-center justify-center font-bold shadow-lg transition-transform hover:scale-110 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="absolute inset-0 rounded-full bg-badge-promo animate-ping opacity-40"></span>
              </button>
              <div className="absolute right-10 top-0 w-56 bg-canvas-base text-primary p-2.5 shadow-2xl opacity-0 group-hover/spot:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <span className="font-label-caps text-[10px] text-outline uppercase block">
                  Outfit Tag 02
                </span>
                <p className="font-headline-sm text-body-sm font-bold">Wide-Leg Pleated Pants</p>
                <p className="font-price-display text-body-sm text-primary">Rp 479.000</p>
              </div>
            </div>

            {/* Bottom Caption Strip */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-on-primary">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps uppercase text-badge-promo">
                  Lokasi:
                </span>
                <span className="font-label-caps text-label-caps uppercase text-on-primary">
                  Shibuya Stream Pavilion
                </span>
              </div>
              <span className="font-label-caps text-label-caps uppercase text-on-primary-container">
                Katalog SS26 // Halaman 14
              </span>
            </div>
          </div>

          {/* Curated Outfit Breakdown Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-space-md bg-neutral-900 p-space-md">
            <div>
              <div className="flex items-center justify-between pb-space-sm">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-badge-promo">
                  Ansambel Terpilih
                </span>
                <span className="font-label-caps text-[11px] text-on-primary-container">
                  2 Produk
                </span>
              </div>

              <div className="space-y-space-md pt-space-sm">
                {/* Item 1 */}
                <div className="flex items-center gap-space-sm bg-primary p-2.5 transition-colors hover:bg-neutral-800">
                  <div
                    onClick={() => onOpenProduct('prod-1')}
                    className="w-16 h-20 bg-neutral-800 shrink-0 overflow-hidden cursor-pointer"
                  >
                    <img
                      alt="Oversized Heavyweight Tee"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8zYBtXMlTGpKNeqJt6ZXWO3qKCIz4im99UUe4hTkdkPo0rv6bIzzuyCvYn7_rFW992pKce1gWZlsmIWJuupZVh_1t_V-PrQeuQLuIyZuxRTh_1hQgiN3KJqd49TsUOv7gYOLxI5AWj4ktOthpDp9g-GVjrKRM0UJhy-NDeEuSsSjXhVVT31ZipwmyGp5NdLCJGHKuMoxFgCZuwqYnNOR5q3Ben1FbJ2TshwyGKBl0"
                    />
                  </div>
                  <div
                    onClick={() => onOpenProduct('prod-1')}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <span className="font-label-caps text-[10px] text-outline uppercase">
                      Atasan Pria
                    </span>
                    <h4 className="font-body-md text-body-md font-semibold text-on-primary truncate hover:underline">
                      Oversized Heavyweight Tee
                    </h4>
                    <p className="font-price-display text-body-md text-badge-promo mt-0.5">
                      Rp 249.000
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToCart(products[0], 'L', 'Charcoal Black')}
                    className="w-8 h-8 bg-badge-promo text-text-on-accent flex items-center justify-center shrink-0 hover:bg-canvas-base cursor-pointer"
                    title="Tambah"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>

                {/* Item 2 */}
                <div className="flex items-center gap-space-sm bg-primary p-2.5 transition-colors hover:bg-neutral-800">
                  <div
                    onClick={() => onOpenProduct('prod-3')}
                    className="w-16 h-20 bg-neutral-800 shrink-0 overflow-hidden cursor-pointer"
                  >
                    <img
                      alt="Wide-Leg Pleated Trousers"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw14YRvisUi6Nx_-38l57WG34s5Qu0kndBz0bfgbPUKS0qZdKRvB1zosKk2sCXfsttSzbT5uRBA4_dVUjZ7dArGt5bhiqehBMrft574N8lBa1zAAs1IvQIVEfk4pqmE3ZAskTpsz3Gpc0YsaqcEmP7v4WIOeTpTVH_bUT-8DPGfCMSWGeNJ3yD3YO0fbWqCeYcmRNEE7yFA1kdVOi60vHn9IxY_FpVYkk7Hnp7HFOI"
                    />
                  </div>
                  <div
                    onClick={() => onOpenProduct('prod-3')}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <span className="font-label-caps text-[10px] text-outline uppercase">
                      Bawahan Wanita
                    </span>
                    <h4 className="font-body-md text-body-md font-semibold text-on-primary truncate hover:underline">
                      Wide-Leg Pleated Trousers
                    </h4>
                    <p className="font-price-display text-body-md text-badge-promo mt-0.5">
                      Rp 479.000
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToCart(products[2], '28', 'Ink Black')}
                    className="w-8 h-8 bg-badge-promo text-text-on-accent flex items-center justify-center shrink-0 hover:bg-canvas-base cursor-pointer"
                    title="Tambah"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Total & Bundle Button */}
            <div className="pt-space-md">
              <div className="flex items-center justify-between text-body-sm pb-space-sm">
                <span className="text-on-primary-container">Total Paket Ansambel:</span>
                <span className="font-price-display text-headline-sm text-on-primary font-bold">
                  Rp 728.000
                </span>
              </div>
              <button
                type="button"
                onClick={onAddBundle}
                className="w-full py-3.5 bg-badge-promo hover:bg-canvas-base text-text-on-accent font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-2 font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">check_box</span>
                <span>Beli Satu Set Lengkap</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
