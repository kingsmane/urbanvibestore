import React, { useState } from 'react';

export type PageRoute =
  | 'home'
  | 'product-detail'
  | 'size-guide'
  | 'checkout'
  | 'order-confirmation'
  | 'account';

interface LayoutProps {
  currentPage: PageRoute;
  activeCategory: string;
  cartCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigate: (
    page: PageRoute,
    options?: {
      category?: string;
      productId?: string;
      accountTab?: 'orders' | 'addresses' | 'fitprofile' | 'settings';
      scrollTo?: string;
    }
  ) => void;
  toastMessage: string | null;
  toastSubtext?: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentPage,
  activeCategory,
  cartCount,
  searchQuery,
  onSearchChange,
  onNavigate,
  toastMessage,
  toastSubtext,
  children,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    title: string;
    subtitle: string;
    content: string[];
  } | null>(null);

  const handleCategoryNav = (cat: string, scrollTarget = 'katalog') => {
    onNavigate('home', { category: cat, scrollTo: scrollTarget });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 4000);
  };

  const openInfoModal = (type: string) => {
    const infoMap: Record<string, { title: string; subtitle: string; content: string[] }> = {
      'layanan-pelanggan': {
        title: 'Layanan Concierge 24/7',
        subtitle: 'Bantuan Pelanggan UrbanStore Studio',
        content: [
          'Tim kurator dan layanan pelanggan kami siap membantu Anda terkait konsultasi ukuran, perubahan alamat pengiriman sebelum resi terbit, maupun verifikasi pembayaran Virtual Account.',
          '• WhatsApp Resmi: +62 812-3456-7890 (Respon cepat < 5 menit)',
          '• Surel Concierge: concierge@urbanstore.id',
          '• Jam Operasional Gudang Cikarang & Hub Jakarta: Senin – Sabtu, 08.00 – 18.00 WIB.',
        ],
      },
      'pertanyaan-umum': {
        title: 'Pertanyaan Umum (FAQ)',
        subtitle: 'Informasi Belanja, Ukuran & Pembayaran',
        content: [
          '1. Bagaimana cara memastikan ukuran pakaian pas? Gunakan fitur Smart Fit Finder di halaman Panduan Ukuran Visual atau periksa tabel matriks dalam satuan CM.',
          '2. Berapa lama batas waktu pembayaran? Stok direservasi secara atomik selama 15 menit untuk metode QRIS dan Virtual Account.',
          '3. Kapan pesanan dikirim? Pesanan terverifikasi sebelum pukul 15.00 WIB dikirim di hari kerja yang sama.',
        ],
      },
      'kebijakan-privasi': {
        title: 'Kebijakan Privasi',
        subtitle: 'Perlindungan Data Pribadi Pelanggan',
        content: [
          'UrbanStore menerapkan prinsip minimasi data sesuai standar keamanan informasi modern. Situs diakses melalui koneksi HTTPS.',
          '• Data nama, alamat, dan nomor telepon hanya digunakan untuk pemrosesan pengiriman logistik dan notifikasi status pesanan.',
          '• Kami tidak menyimpan kredensial kartu kredit/debit; seluruh otorisasi diproses langsung melalui gerbang pembayaran terverifikasi.',
        ],
      },
      'syarat-ketentuan': {
        title: 'Syarat & Ketentuan',
        subtitle: 'Ketentuan Transaksi Resmi UrbanStore',
        content: [
          '• Seluruh harga yang tertera pada katalog dalam mata uang Rupiah (IDR) telah termasuk PPN 11%.',
          '• Produk berstatus Habis (Sold Out) tidak dapat dipesan hingga jadwal restock koleksi berikutnya.',
          '• Nomor pesanan unik diterbitkan setelah konfirmasi checkout dan divalidasi terhadap ketersediaan stok terkini.',
        ],
      },
      pengembalian: {
        title: 'Kebijakan Retur & Tukar Ukuran',
        subtitle: 'Garansi 7 Hari Bebas Biaya Ongkir Retur',
        content: [
          '• Anda berhak mengajukan penukaran ukuran (Size Guarantee) dalam 7 hari kerja sejak status paket diterima.',
          '• Syarat kondisi: Hangtag masih terpasang utuh, pakaian belum dicuci, dan bebas dari aroma parfum atau noda.',
          '• Kurir rekanan kami akan menjemput paket retur langsung ke alamat Anda tanpa biaya tambahan.',
        ],
      },
    };
    if (infoMap[type]) {
      setInfoModal(infoMap[type]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-canvas-base">
        {/* Top Promo Bar */}
        <div className="bg-primary text-on-primary py-space-xs text-center border-b border-border-strong">
          <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop flex items-center justify-center gap-space-xs">
            <span className="material-symbols-outlined text-[14px] text-badge-promo">
              local_shipping
            </span>
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-primary">
              Gratis ongkir se-Indonesia untuk pesanan di atas Rp 500.000
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

      {/* MAIN CONTENT */}
      <main className="w-full pt-28 bg-surface min-h-screen flex-1">{children}</main>

      {/* GLOBAL TOAST NOTIFICATION */}
      <aside
        aria-live="polite"
        role="status"
        className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 bg-primary text-on-primary px-4 py-3 shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${
          toastMessage
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-6 h-6 bg-badge-promo text-text-on-accent flex items-center justify-center font-bold text-xs shrink-0">
          ✓
        </div>
        <div>
          <p className="font-body-sm text-body-sm font-semibold">
            {toastMessage || 'Produk ditambahkan ke keranjang'}
          </p>
          {toastSubtext && (
            <span className="font-label-caps text-[10px] text-badge-promo uppercase block">
              {toastSubtext}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onNavigate('checkout')}
          className="ml-2 px-2 py-1 bg-canvas-base text-primary font-label-caps text-[10px] uppercase font-bold hover:bg-badge-promo transition-colors cursor-pointer"
        >
          Lihat Tas
        </button>
      </aside>

      {/* MOBILE STICKY BOTTOM NAVIGATION */}
      {currentPage !== 'size-guide' && (
        <nav
          aria-label="Navigasi Bawah"
          className="md:hidden fixed bottom-0 left-0 right-0 bg-canvas-base/95 backdrop-blur-md border-t border-border-hairline px-4 py-2 flex items-center justify-around z-40"
        >
          <button
            type="button"
            onClick={() => onNavigate('home', { category: 'Semua', scrollTo: 'katalog' })}
            className={`flex flex-col items-center py-1 cursor-pointer ${
              currentPage === 'home' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Katalog</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('size-guide')}
            className="flex flex-col items-center text-on-surface-variant hover:text-primary py-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">straighten</span>
            <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Ukuran</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('checkout')}
            className={`flex flex-col items-center py-1 relative cursor-pointer ${
              currentPage === 'checkout'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              <span className="absolute -top-1 -right-2 bg-badge-promo text-text-on-accent font-label-caps text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold rounded-full">
                {cartCount}
              </span>
            </div>
            <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Tas</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('account')}
            className={`flex flex-col items-center py-1 cursor-pointer ${
              currentPage === 'account'
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Akun</span>
          </button>
        </nav>
      )}

      {/* INFO MODAL FOR FOOTER UTILITY LINKS */}
      {infoModal && (
        <div className="fixed inset-0 z-[110] bg-primary/60 backdrop-blur-xs flex items-center justify-center p-margin">
          <div className="bg-canvas-base border-2 border-border-strong w-full max-w-lg p-space-lg shadow-[8px_8px_0px_0px_#111827]">
            <div className="flex items-start justify-between border-b border-border-hairline pb-space-sm">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  {infoModal.subtitle}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary uppercase font-bold mt-0.5">
                  {infoModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <div className="py-space-md space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              {infoModal.content.map((paragraph, idx) => (
                <p key={idx} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="border-t border-border-hairline pt-space-md flex justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => setInfoModal(null)}
                className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
              >
                Mengerti &amp; Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
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
    </div>
  );
};
