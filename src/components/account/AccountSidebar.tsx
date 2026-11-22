import React from 'react';
import { FitProfile, Product, formatRupiah } from '../../data/storeData';

interface AccountSidebarProps {
  fitProfile: FitProfile;
  onNavigateHome: () => void;
  onNavigateSizeGuide: () => void;
  products: Product[];
  onOpenProduct: (productId: string) => void;
  onShowToast: (msg: string, sub?: string) => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  fitProfile,
  onNavigateHome,
  onNavigateSizeGuide,
  products,
  onOpenProduct,
  onShowToast,
}) => {
  const size = fitProfile.calculatedSize;
  const recommendations = products
    .filter(
      (p) =>
        !p.isSoldOut &&
        p.category !== 'Aksesoris' &&
        p.sizes.some((s) => s.code === size && s.stock > 0)
    )
    .slice(0, 2);

  return (
    <div className="lg:col-span-4 space-y-space-lg">
      {/* Card 1: Fast Support & Concierge */}
      <div className="bg-canvas-base border border-border-hairline p-space-lg relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-outline">
              Bantuan &amp; Layanan Pelanggan
            </span>
            <h3 className="font-headline-sm text-headline-sm uppercase text-primary mt-1">
              Layanan Concierge 24/7
            </h3>
          </div>
          <span className="material-symbols-outlined text-[24px] text-secondary">
            support_agent
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm leading-relaxed">
          Membutuhkan bantuan terkait pembayaran VA atau perubahan alamat pengiriman sebelum
          resi terbit?
        </p>
        <div className="mt-space-md pt-space-md border-t border-border-hairline space-y-space-sm">
          <a
            className="w-full py-2.5 px-space-md bg-canvas-base border border-border-strong text-primary hover:bg-badge-promo hover:border-badge-promo hover:text-text-on-accent font-label-caps text-label-caps uppercase font-bold flex items-center justify-center gap-2 transition-colors"
            href="https://wa.me/628112345678"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp Customer Care
          </a>
          <button
            type="button"
            onClick={onNavigateSizeGuide}
            className="w-full py-2 px-space-md text-on-surface-variant hover:text-primary font-label-caps text-label-caps uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            Kebijakan Retur Ukuran (7 Hari Bebas Biaya)
          </button>
        </div>
      </div>

      {/* Card 2: Rekomendasi berdasarkan ukuran (dari katalog nyata) */}
      <div className="bg-surface-subtle border border-border-hairline p-space-lg space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-badge-promo border border-border-strong"></span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Rekomendasi Berdasarkan Ukuran Anda
            </span>
          </div>
          <span className="font-label-caps text-[10px] text-outline uppercase">Size {size}</span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Produk tersedia dalam ukuran {size} yang sesuai profil tinggi {fitProfile.height} cm Anda:
        </p>

        {recommendations.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Belum ada produk tersedia untuk ukuran ini.
          </p>
        )}
        {recommendations.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpenProduct(p.id)}
            className="w-full text-left flex items-center gap-space-sm bg-canvas-base p-space-sm border border-border-hairline group cursor-pointer"
          >
            <img
              alt={p.shortName}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-16 h-20 object-cover bg-surface-muted border border-border-hairline shrink-0"
              src={p.image}
            />
            <div className="min-w-0 flex-1">
              <span className="font-label-caps text-[10px] text-secondary uppercase font-semibold">
                Tersedia Ukuran {size}
              </span>
              <h4 className="font-body-sm text-body-sm font-semibold text-primary truncate group-hover:text-outline transition-colors">
                {p.shortName}
              </h4>
              <p className="font-price-display text-[14px] text-primary mt-1">{formatRupiah(p.price)}</p>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform" aria-hidden="true">
              chevron_right
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={onNavigateSizeGuide}
          className="font-label-caps text-label-caps uppercase text-primary underline cursor-pointer"
        >
          Perbarui Fit Profile
        </button>
      </div>

      {/* Card 3: Kupon */}
      <div className="bg-primary text-on-primary p-space-lg">
        <span className="font-label-caps text-label-caps uppercase text-badge-promo font-bold tracking-wider">
          Kupon untuk Anda
        </span>
        <div className="mt-space-sm flex items-center justify-between gap-space-sm">
          <div>
            <p className="font-mono font-bold text-on-primary">URBANFIRST</p>
            <p className="font-body-sm text-body-sm text-inverse-primary">Potongan Rp 50.000 untuk pembelian pertama</p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText('URBANFIRST').catch(() => {});
              onShowToast('Kode voucher URBANFIRST (Rp 50.000) disalin!');
            }}
            className="font-label-caps text-label-caps text-badge-promo uppercase font-semibold hover:underline cursor-pointer shrink-0"
          >
            Salin
          </button>
        </div>
      </div>
    </div>
  );
};
