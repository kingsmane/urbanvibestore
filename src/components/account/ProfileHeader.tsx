import React from 'react';
import { Order, SavedAddress } from '../../data/storeData';
import type { AccountTab } from '../../routes/paths';

interface ProfileHeaderProps {
  orders: Order[];
  addresses: SavedAddress[];
  onNavigateHome: () => void;
  activeTab: AccountTab;
  changeTab: (tab: AccountTab) => void;
  pendingCount: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  orders,
  addresses,
  onNavigateHome,
  activeTab,
  changeTab,
  pendingCount,
}) => {
  return (
    <section className="w-full bg-canvas-base border-b border-border-hairline">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-xl">
        {/* Breadcrumb Bar */}
        <div className="flex items-center gap-space-xs text-outline mb-space-md">
          <button
            type="button"
            onClick={onNavigateHome}
            className="font-label-caps text-label-caps uppercase hover:text-primary transition-colors cursor-pointer"
          >
            UrbanStore
          </button>
          <span className="text-outline">/</span>
          <span className="font-label-caps text-label-caps uppercase text-primary font-semibold">
            Akun Saya &amp; Riwayat Pesanan
          </span>
        </div>

        {/* Main Profile Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* User Bio Block */}
          <div className="lg:col-span-6 flex items-start gap-space-md">
            <div className="relative shrink-0">
              <img
                alt="Naya Rahmadani"
                referrerPolicy="no-referrer"
                className="w-20 h-20 md:w-24 md:h-24 object-cover border border-border-strong bg-surface-muted"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP9KKlBDfy2uA42LrN4kNf5TeAoNWc7oaBngNFtdLENMk1dbg-K-jNN_weY0ZldlyOjoOlNYbBS7JvTk7jP8ff0lm1zmfkPC7meFmg9Lu9fwk9Xp80RYkbZ9QBM3bP79sHdH0av5UAKQf7C-JM0VzBFRZDX_UWFl_xfNYzNsCaQbwmRM3BCFkJ0tqiyI6H3CL1a3HldY9UO7HPhhnakyar9_MFxtuYuQs4w02DEJhG"
              />
              <div
                className="absolute -bottom-1 -right-1 bg-badge-promo text-text-on-accent p-0.5 border border-border-strong"
                title="Akun Terverifikasi"
              >
                <span className="material-symbols-outlined text-[14px] font-bold block">
                  verified
                </span>
              </div>
            </div>
            <div className="space-y-space-xs">
              <div className="flex flex-wrap items-center gap-space-xs">
                <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">
                  Naya Rahmadani
                </h1>
                <span className="bg-surface-muted text-on-surface border border-border-hairline font-label-caps text-label-caps uppercase px-space-xs py-0.5">
                  Active Shopper
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-outline">mail</span>
                naya.rahmadani@email.com
              </p>
              <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 pt-space-xs">
                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    chat
                  </span>
                  WhatsApp Terverifikasi (+62 812-****-4491)
                </span>
                <span className="text-outline font-label-caps text-label-caps uppercase">
                  Member Sejak: Okt 2024
                </span>
              </div>
            </div>
          </div>

          {/* Metric Strips (Monochrome Architecture) */}
          <div className="lg:col-span-6 grid grid-cols-3 border border-border-hairline bg-surface-subtle">
            <div className="p-space-md border-r border-border-hairline flex flex-col justify-between">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Total Pesanan
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-primary">
                  0{orders.length}
                </span>
                <span className="font-body-sm text-body-sm text-outline">trx</span>
              </div>
              <span className="font-label-sm text-label-sm text-outline mt-1">
                2 Selesai · 1 Proses
              </span>
            </div>
            <div className="p-space-md border-r border-border-hairline bg-canvas-base flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-2 bg-badge-promo"></div>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Menunggu Bayar
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-headline-lg text-headline-lg text-primary">
                  0{pendingCount}
                </span>
                <span className="font-body-sm text-body-sm text-error font-medium">
                  Batas 14m
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-error font-semibold mt-1">
                Perlu Tindakan
              </span>
            </div>
            <div className="p-space-md flex flex-col justify-between">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Kupon Aktif
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md text-primary">
                  Rp 50K
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-outline mt-1">
                Berlaku s/d 31 Des
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Rigid Swiss Rule) */}
        <div className="mt-space-xl flex items-center gap-space-lg overflow-x-auto no-scrollbar border-b border-border-hairline">
          <button
            type="button"
            onClick={() => changeTab('orders')}
            className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'text-primary font-bold border-primary'
                : 'text-on-surface-variant hover:text-primary border-transparent'
            }`}
          >
            Riwayat Pesanan{' '}
            <span className="ml-1 px-1.5 py-0.5 bg-border-strong text-canvas-base text-[10px]">
              {orders.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => changeTab('addresses')}
            className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'addresses'
                ? 'text-primary font-bold border-primary'
                : 'text-on-surface-variant hover:text-primary border-transparent'
            }`}
          >
            Buku Alamat <span className="ml-1 text-outline">({addresses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => changeTab('fitprofile')}
            className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'fitprofile'
                ? 'text-primary font-bold border-primary'
                : 'text-on-surface-variant hover:text-primary border-transparent'
            }`}
          >
            My Fit Profile (Ukuran)
          </button>
          <button
            type="button"
            onClick={() => changeTab('settings')}
            className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'text-primary font-bold border-primary'
                : 'text-on-surface-variant hover:text-primary border-transparent'
            }`}
          >
            Pengaturan &amp; Notifikasi
          </button>
        </div>
      </div>
    </section>
  );
};
