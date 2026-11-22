import React from 'react';
import { NavigateFn, PageRoute } from './types';

interface SiteHeaderProps {
  currentPage: PageRoute;
  activeCategory: string;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: NavigateFn;
  mobileSearchOpen: boolean;
  setMobileSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleCategoryNav: (cat: string, scrollTarget?: string) => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  currentPage,
  activeCategory,
  cartCount,
  searchQuery,
  onSearchChange,
  onNavigate,
  mobileSearchOpen,
  setMobileSearchOpen,
  handleCategoryNav,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas-base">
      {/* Top Promo Bar */}
      <div className="bg-primary text-on-primary py-space-xs text-center border-b border-border-strong">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop flex items-center justify-center gap-space-xs">
          <span className="material-symbols-outlined text-[14px] text-badge-promo">
            local_shipping
          </span>
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-primary">
            Gratis ongkir reguler se-Indonesia untuk belanja min. Rp 500.000
          </p>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="h-20 border-b border-border-hairline">
        <div className="max-w-[1440px] h-full mx-auto px-margin md:px-margin-desktop flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <button
              type="button"
              onClick={() => onNavigate('home', { category: 'Semua', scrollTo: 'top' })}
              className="flex items-center gap-2.5 shrink-0 cursor-pointer text-left group"
            >
              <div className="w-8 h-8 bg-primary text-on-primary flex items-center justify-center relative border border-border-strong shrink-0 transition-transform group-hover:scale-105">
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
              <div className="flex flex-col leading-none">
                <span className="font-headline-sm text-[19px] uppercase tracking-tighter text-primary font-bold">
                  URBANSTORE
                </span>
                <span className="font-label-caps text-[8px] uppercase tracking-[0.22em] text-outline mt-0.5 hidden sm:block">
                  TOKYO // ZURICH
                </span>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-space-lg h-20">
              <button
                type="button"
                onClick={() => handleCategoryNav('Semua')}
                className={`h-full inline-flex items-center font-headline-sm text-headline-sm transition-colors border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentPage === 'home' && activeCategory === 'Semua'
                    ? 'text-primary font-semibold border-primary'
                    : 'text-on-surface-variant hover:text-primary border-transparent'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => handleCategoryNav('Pria')}
                className={`h-full inline-flex items-center font-headline-sm text-headline-sm transition-colors border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentPage === 'home' && activeCategory === 'Pria'
                    ? 'text-primary font-semibold border-primary'
                    : 'text-on-surface-variant hover:text-primary border-transparent'
                }`}
              >
                Pria
              </button>
              <button
                type="button"
                onClick={() => handleCategoryNav('Wanita')}
                className={`h-full inline-flex items-center font-headline-sm text-headline-sm transition-colors border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentPage === 'home' && activeCategory === 'Wanita'
                    ? 'text-primary font-semibold border-primary'
                    : 'text-on-surface-variant hover:text-primary border-transparent'
                }`}
              >
                Wanita
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home', { category: 'Semua', scrollTo: 'lookbook' })}
                className="h-full inline-flex items-center font-headline-sm text-headline-sm text-on-surface-variant hover:text-primary transition-colors border-b-2 border-transparent cursor-pointer whitespace-nowrap shrink-0"
              >
                Koleksi Baru
              </button>
              <button
                type="button"
                onClick={() => onNavigate('size-guide')}
                className={`h-full inline-flex items-center font-headline-sm text-headline-sm transition-colors border-b-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentPage === 'size-guide'
                    ? 'text-primary font-semibold border-primary'
                    : 'text-on-surface-variant hover:text-primary border-transparent'
                }`}
              >
                Panduan Ukuran
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-space-md flex-1 max-w-lg justify-end">
            <div className="relative w-full max-w-xs hidden sm:block">
              <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'home') {
                    onNavigate('home', { scrollTo: 'katalog' });
                  }
                }}
                className="w-full bg-surface-subtle border border-border-hairline focus:border-border-strong pl-9 pr-space-sm py-1.5 font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none transition-colors"
                placeholder="Cari kurasi busana..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-space-sm">
              <button
                type="button"
                aria-label="Search Mobile"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="sm:hidden p-2 text-on-surface hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>

              <button
                type="button"
                aria-label="Shopping Cart"
                onClick={() => onNavigate('checkout')}
                className="relative p-2 text-on-surface hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
                <span className="absolute top-1 right-1 w-4 h-4 bg-badge-promo text-text-on-accent flex items-center justify-center font-label-caps text-[10px] font-bold leading-none">
                  {cartCount}
                </span>
              </button>

              <div className="hidden md:flex items-center border-l border-border-hairline pl-space-sm ml-space-xs gap-space-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('account', { accountTab: 'orders' })}
                  className={`font-label-caps text-label-caps uppercase px-space-xs py-1 transition-colors whitespace-nowrap cursor-pointer ${
                    currentPage === 'account'
                      ? 'text-primary font-bold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Riwayat Pesanan
                </button>
              </div>

              <button
                type="button"
                aria-label="Akun Pengguna"
                onClick={() => onNavigate('account')}
                className="ml-space-xs shrink-0 flex items-center gap-space-xs group cursor-pointer"
              >
                <img
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-border-hairline group-hover:border-border-strong transition-colors"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzbtdls_WX8w8ws7YT8s8rLQIDdOEVMpyRcjppOb_LqJpqDPdDIpeNm4xsydA-mKXsddhkZdAGp-SRfkwgaZh6q_D09fd0FH8uU0MWv84RXp07jCLzYvuELnzTiC4TRPCR5zWxQWcZEuHkC2JPOZGWMSMpI1R_QyIuGCOElDh_qr7TdDBw7VTTLW6n3bb2AKjnm1mZWPcbE1mgp4pcoFCcqQk_U8tIzZoo7YuTogre"
                />
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant group-hover:text-primary hidden xl:inline transition-colors">
                  Akun Saya
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Drawer */}
      {mobileSearchOpen && (
        <div className="sm:hidden bg-canvas-base border-b border-border-hairline px-margin py-space-sm">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-space-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentPage !== 'home') {
                  onNavigate('home', { scrollTo: 'katalog' });
                }
              }}
              className="w-full bg-surface-subtle border border-border-hairline focus:border-border-strong pl-9 pr-space-sm py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline outline-none"
              placeholder="Cari kurasi busana, warna, bahan..."
              type="text"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};
