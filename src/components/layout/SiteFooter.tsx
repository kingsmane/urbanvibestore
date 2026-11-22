import React from 'react';
import { NavigateFn } from './types';

interface SiteFooterProps {
  onNavigate: NavigateFn;
  newsletterEmail: string;
  setNewsletterEmail: React.Dispatch<React.SetStateAction<string>>;
  newsletterSubscribed: boolean;
  handleCategoryNav: (cat: string, scrollTarget?: string) => void;
  handleNewsletterSubmit: (e: React.FormEvent) => void;
  openInfoModal: (type: string) => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  onNavigate,
  newsletterEmail,
  setNewsletterEmail,
  newsletterSubscribed,
  handleCategoryNav,
  handleNewsletterSubmit,
  openInfoModal,
}) => {
  return (
    <footer className="w-full bg-canvas-base border-t border-border-hairline mt-space-xl pb-16 md:pb-0">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-lg">
          <div className="md:col-span-5 space-y-space-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary text-on-primary flex items-center justify-center border border-border-strong shrink-0">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6V18C6 22.4183 9.58172 26 14 26H20V19H14C12.3431 19 11 17.6569 11 16V6H6Z"
                    fill="#FFFFFF"
                  />
                  <rect x="19" y="6" width="7" height="7" fill="#CCFF00" />
                  <rect x="22" y="19" width="4" height="7" fill="#FFFFFF" />
                </svg>
              </div>
              <span className="font-headline-md text-headline-md uppercase tracking-tight text-primary font-bold block">
                UrbanStore
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Kurasi busana esensial dengan presisi Swiss dan reduksi estetika Jepang. Menghadirkan
              siluet kontemporer untuk ritme hidup modern.
            </p>
            <div className="pt-space-xs">
              <p className="font-label-caps text-label-caps uppercase text-on-surface mb-space-xs">
                Berlangganan Warta Kurasi
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex max-w-md">
                <input
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-surface-subtle border border-border-hairline px-space-md py-2 font-body-sm text-body-sm text-on-surface outline-none focus:border-border-strong"
                  placeholder="Surel Anda"
                  type="email"
                  required
                />
                <button
                  className="bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent px-space-md py-2 font-label-caps text-label-caps uppercase transition-colors shrink-0 cursor-pointer"
                  type="submit"
                >
                  {newsletterSubscribed ? 'Terdaftar ✓' : 'Daftar'}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <p className="font-label-caps text-label-caps uppercase text-primary mb-space-md">
              Koleksi
            </p>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => handleCategoryNav('Semua')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Semua Koleksi
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => handleCategoryNav('Pria')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Koleksi Pria
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => handleCategoryNav('Wanita')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Koleksi Wanita
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => onNavigate('home', { category: 'Semua', scrollTo: 'lookbook' })}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Koleksi Terbaru
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-label-caps text-label-caps uppercase text-primary mb-space-md">
              Bantuan &amp; Panduan
            </p>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => onNavigate('size-guide')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Panduan Ukuran (Visual Size Guide)
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => onNavigate('account', { accountTab: 'orders' })}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Riwayat &amp; Status Pesanan
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => openInfoModal('layanan-pelanggan')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Layanan Pelanggan
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => openInfoModal('pertanyaan-umum')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Pertanyaan Umum (FAQ)
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-label-caps text-label-caps uppercase text-primary mb-space-md">
              Informasi Legal
            </p>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => openInfoModal('kebijakan-privasi')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => openInfoModal('syarat-ketentuan')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Syarat &amp; Ketentuan
                </button>
              </li>
              <li className="h-5 flex items-center">
                <button
                  type="button"
                  onClick={() => openInfoModal('pengembalian')}
                  className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Kebijakan Retur
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-space-xl pt-space-md border-t border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-space-sm">
          <p className="font-body-sm text-body-sm text-outline">
            © 2026 UrbanStore Studio Ltd. Seluruh hak cipta dilindungi.
          </p>
          <p className="font-label-caps text-label-caps uppercase text-outline">
            Tokyo / Zurich Design Synthesis
          </p>
        </div>
      </div>
    </footer>
  );
};
