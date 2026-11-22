import React from 'react';
import { FitProfile } from '../../data/storeData';

interface AccountSidebarProps {
  fitProfile: FitProfile;
  onNavigateHome: () => void;
  onNavigateSizeGuide: () => void;
  onReorderItem: (name: string, price: number, image: string) => void;
  onOpenProduct: (productId: string) => void;
  onShowToast: (msg: string, sub?: string) => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  fitProfile,
  onNavigateHome,
  onNavigateSizeGuide,
  onReorderItem,
  onOpenProduct,
  onShowToast,
}) => {
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

      {/* Card 2: Fit Recommendation Engine */}
      <div className="bg-surface-subtle border border-border-hairline p-space-lg space-y-space-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-badge-promo border border-border-strong"></span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              Rekomendasi Berdasarkan Ukuran Naya
            </span>
          </div>
          <span className="font-label-caps text-[10px] text-outline uppercase">
            Size S / 27
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Koleksi drop teranyar yang cocok persis dengan proporsi tinggi{' '}
          {fitProfile.height} cm:
        </p>

        {/* Recommendation Item 1 */}
        <div
          onClick={() =>
            onReorderItem(
              'Tailored Wool Minimal Overshirt',
              649000,
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCPc4d14kaVfodSipoXGJd_qEcy2g7bJpFho9jtnB1ltsoGIxrZ_NtEHJ_M9qvHZf0DgS4YXcy2KxxWocJ3nJqhkEWt8LAFX-Pp11URB-rqtYaxtfSwEXibjBgWhi5AuTQXHmJaiZWnPTzrrbPCptfNQmywW437FU4NYv5Ck9LRsjhHEFV0IRgMT_SdYKgDcSQmA-HeBemDQKamnKZ0XLlTCOHT922zAYcQ2gvomUte'
            )
          }
          className="flex items-center gap-space-sm bg-canvas-base p-space-sm border border-border-hairline group cursor-pointer"
        >
          <img
            alt="Tailored Wool Minimal Overshirt"
            referrerPolicy="no-referrer"
            className="w-16 h-20 object-cover bg-surface-muted border border-border-hairline shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPc4d14kaVfodSipoXGJd_qEcy2g7bJpFho9jtnB1ltsoGIxrZ_NtEHJ_M9qvHZf0DgS4YXcy2KxxWocJ3nJqhkEWt8LAFX-Pp11URB-rqtYaxtfSwEXibjBgWhi5AuTQXHmJaiZWnPTzrrbPCptfNQmywW437FU4NYv5Ck9LRsjhHEFV0IRgMT_SdYKgDcSQmA-HeBemDQKamnKZ0XLlTCOHT922zAYcQ2gvomUte"
          />
          <div className="min-w-0 flex-1">
            <span className="font-label-caps text-[10px] text-secondary uppercase font-semibold">
              Tersedia Ukuran S
            </span>
            <h4 className="font-body-sm text-body-sm font-semibold text-primary truncate group-hover:text-outline transition-colors">
              Tailored Wool Minimal Overshirt
            </h4>
            <p className="font-price-display text-[14px] text-primary mt-1">Rp 649.000</p>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
            chevron_right
          </span>
        </div>

        {/* Recommendation Item 2 */}
        <div
          onClick={() => onOpenProduct('prod-3')}
          className="flex items-center gap-space-sm bg-canvas-base p-space-sm border border-border-hairline group cursor-pointer"
        >
          <img
            alt="Pleated Wide-Leg Trousers"
            referrerPolicy="no-referrer"
            className="w-16 h-20 object-cover bg-surface-muted border border-border-hairline shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYQiGggPIhja1aaDV4IfPVaEhoPR6Lo_lSUaoOMpS-X3GKPH2bMuv8a3Q4ni6Jh4EiP9BAQj5JHsPcpWmZp1CoIesDe13JzoA8BlnfqPciWW5H5dThMc-Qm7EXNy8EeXcGIA_9nj_DgCADO3wfESH0YY4twqLHGRSZOYfkXcm2lQBWXQVISE6tg3BfLpjNhX4m8w5VK8B2r1zkfxWH9buMWSGUFRdWzHPpXjPeJEJW"
          />
          <div className="min-w-0 flex-1">
            <span className="font-label-caps text-[10px] text-secondary uppercase font-semibold">
              Tersedia Ukuran 27
            </span>
            <h4 className="font-body-sm text-body-sm font-semibold text-primary truncate group-hover:text-outline transition-colors">
              Pleated Wide-Leg Trousers
            </h4>
            <p className="font-price-display text-[14px] text-primary mt-1">Rp 529.000</p>
          </div>
          <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
            chevron_right
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full text-center font-label-caps text-label-caps uppercase text-primary hover:text-outline transition-colors pt-space-xs cursor-pointer"
        >
          Jelajahi Semua Drop Terbaru →
        </button>
      </div>

      {/* Card 3: UrbanStore Membership Status */}
      <div className="bg-primary text-on-primary p-space-lg border border-border-strong relative">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-badge-promo font-bold tracking-widest">
              UrbanStore Tier 01
            </span>
            <h3 className="font-headline-sm text-headline-sm uppercase text-on-primary mt-1">
              Silver Privilege
            </h3>
          </div>
          <span className="font-mono text-outline font-bold text-[12px]">NAYA-8492</span>
        </div>
        <div className="mt-space-md space-y-1">
          <div className="flex justify-between font-label-caps text-label-caps uppercase text-inverse-primary">
            <span>Progress Belanja ke Gold</span>
            <span>Rp 1.369K / Rp 3.000K</span>
          </div>
          <div className="w-full h-1 bg-border-strong">
            <div className="h-full bg-badge-promo" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="mt-space-md pt-space-md border-t border-border-strong flex items-center justify-between text-body-sm">
          <span className="text-inverse-primary">Voucher Diskon Rp 50.000 Siap Pakai</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText('URBANFIRST').catch(() => {});
              onShowToast('Kode voucher URBANFIRST (Rp 50.000) disalin!');
            }}
            className="font-label-caps text-label-caps text-badge-promo uppercase font-semibold hover:underline cursor-pointer"
          >
            TERAPKAN
          </button>
        </div>
      </div>
    </div>
  );
};
