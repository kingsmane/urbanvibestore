import React, { useState } from 'react';
import { Product, formatRupiah } from '../data/storeData';

interface HomeViewProps {
  products: Product[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProduct: (productId: string) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onAddBundle: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenProduct,
  onAddToCart,
  onAddBundle,
}) => {
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'harga-rendah' | 'harga-tinggi' | 'populer'>('terbaru');
  const [selectedCardSizes, setSelectedCardSizes] = useState<Record<string, string>>({
    'prod-1': 'L',
    'prod-2': 'M',
    'prod-3': '28',
  });
  const [selectedCardColors, setSelectedCardColors] = useState<Record<string, string>>({});

  const filteredProducts = products
    .filter((item) => {
      const matchesCat = activeCategory === 'Semua' || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subCategory.toLowerCase().includes(q) ||
        item.tagLabel.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'harga-rendah') return a.price - b.price;
      if (sortOrder === 'harga-tinggi') return b.price - a.price;
      if (sortOrder === 'populer') return (b.rating ? 1 : 0) - (a.rating ? 1 : 0);
      return 0;
    });

  const applyQueryFilter = (query: string) => {
    onCategoryChange('Semua');
    onSearchChange(query);
  };

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: EDITORIAL HERO BANNER */}
      <section className="w-full relative overflow-hidden bg-canvas-base">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg md:py-space-xl">
          {/* Top Architectural Index */}
          <div className="flex items-center justify-between pb-space-sm">
            <div className="flex items-center gap-space-sm">
              <span className="inline-block w-2.5 h-2.5 bg-badge-promo"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
                EDISI 01 / SS26
              </span>
              <span className="text-outline text-body-sm">|</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                SILUET KONTEMPORER
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-space-md">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                TOKYO 35.6762° N // ZURICH 47.3769° E
              </span>
              <span className="px-2 py-0.5 bg-surface-muted text-primary font-label-caps text-[11px] uppercase tracking-wider">
                KURASI TERBATAS
              </span>
            </div>
          </div>

          {/* Main Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            {/* Typography & CTA Col */}
            <div className="lg:col-span-7 flex flex-col justify-between z-10">
              <div className="space-y-space-md">
                <div className="inline-flex items-center gap-space-xs bg-primary text-badge-promo px-3 py-1 font-label-caps text-label-caps uppercase tracking-wider">
                  <span>DROP 01 / SS26</span>
                  <span className="material-symbols-outlined text-[14px]">north_east</span>
                </div>
                <h1 className="font-display text-display uppercase tracking-tight text-primary leading-none">
                  Find your <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-primary via-primary to-badge-promo bg-clip-text text-transparent">
                    everyday fit.
                  </span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                  Koleksi esensial pria &amp; wanita dengan potongan presisi dan material premium.
                  Menyatukan ketenangan estetika Jepang dan ketelitian fungsional Eropa untuk
                  keseharian Anda.
                </p>
              </div>

              {/* CTAs & Metric Strip */}
              <div className="pt-space-xl space-y-space-lg">
                <div className="flex flex-wrap items-center gap-space-md">
                  <a
                    className="inline-flex items-center justify-center gap-space-sm bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-wider transition-all duration-200 font-bold"
                    href="#katalog"
                  >
                    <span>Shop the Drop</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </a>
                  <a
                    className="inline-flex items-center justify-center gap-space-sm bg-surface-muted hover:bg-surface-dim text-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-wider transition-all duration-200"
                    href="#lookbook"
                  >
                    <span>Lihat Lookbook</span>
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  </a>
                </div>

                {/* Swiss Micro-metrics */}
                <div className="grid grid-cols-3 gap-space-md pt-space-md max-w-lg">
                  <div className="space-y-0.5">
                    <span className="font-headline-md text-headline-md text-primary block leading-none">
                      280+
                    </span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      GSM Heavyweight
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-headline-md text-headline-md text-primary block leading-none">
                      100%
                    </span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Organic Cotton
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-headline-md text-headline-md text-badge-promo block leading-none">
                      0.0
                    </span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Toleransi Cacat
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layered Editorial Photography Mosaic */}
            <div className="lg:col-span-5 relative">
              <div
                onClick={() => onOpenProduct('prod-1')}
                className="relative w-full aspect-[4/5] bg-surface-muted overflow-hidden cursor-pointer group"
              >
                <img
                  alt="High fashion editorial studio portrait of a model wearing an oversized minimalist charcoal tee and relaxed pleated trousers"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjjGgNFqt5m8T0f1c6Mt0DFsrypMi6RMrUcMb6vQlUTxbsxUMHnEU4uTgxkC-pfKC8NcrDshL7b6pFQy9gmX9OhTJPPWUe9OXkFyptmBZrtSbGWC6T7QjtcUZZHtj8g-9QUKRCe8I8AwZ9Pa323uJtF_ZA4VOgDFxBczC0poF-iFV28XXEXpVV35ASSt-jA9JNIXX-aKUzi6R4q_BDNJaQTuAoc4rXykxEjHvD_gys"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent flex flex-col justify-end p-space-md">
                  <span className="font-label-caps text-label-caps text-badge-promo uppercase tracking-widest">
                    Siluet 01 // Oversized Boxy
                  </span>
                  <p className="font-headline-sm text-headline-sm text-on-primary">
                    Heavyweight Tee &amp; Pleated Pants
                  </p>
                </div>
              </div>

              {/* Overlapping Secondary Card */}
              <div
                onClick={() => onOpenProduct('prod-5')}
                className="hidden sm:block absolute -bottom-8 -left-12 w-48 aspect-[3/4] bg-surface-container-lowest p-2 shadow-2xl cursor-pointer"
              >
                <div className="w-full h-full relative overflow-hidden bg-surface-muted">
                  <img
                    alt="Close up architectural fashion shot showing fine fabric texture of raw Japanese denim"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU1yTemLOwMCGPTWgj-QfL3GAP6WFEyr2Dxw33pDXxrPe2WEtR9Xz0BSdaZHMjkpFRGiqx_6X7EZfbg6xX4L89bmscygLqq_LabsWimQzxFuK3rWo2yT7ZrNgmMrMSeyJnra_zunH8NvAkVAp33q8DqC3FcLMuIC3FDvBNnyNgIEY8z6Pgxhy9DfyFOh_VE8BF-MJv_hHd-2hMSPpBGQD3lC-etvOAfifaO0pqmahE"
                  />
                  <div className="absolute top-2 left-2 bg-badge-promo px-1.5 py-0.5 font-label-caps text-[10px] text-text-on-accent uppercase font-bold">
                    Detail Tekstur
                  </div>
                </div>
              </div>

              {/* Floating Micro Badge */}
              <div className="absolute top-4 right-4 bg-canvas-base/95 backdrop-blur-sm px-3 py-2 flex items-center gap-space-xs shadow-md">
                <span className="w-2 h-2 rounded-full bg-badge-promo animate-pulse"></span>
                <span className="font-label-caps text-label-caps uppercase text-primary">
                  Stok Terbatas
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VALUE PROPOSITION STRIP */}
      <section className="w-full bg-surface-subtle py-space-lg">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
              <div className="w-10 h-10 bg-surface-muted flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  local_shipping
                </span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Pengiriman Cepat Se-Indonesia
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Layanan ekspres terintegrasi ke seluruh nusantara dengan pelacakan presisi.
                </p>
              </div>
            </div>

            <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
              <div className="w-10 h-10 bg-badge-promo flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-text-on-accent text-[22px]">
                  sync_alt
                </span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Size Guarantee &amp; Tukar Mudah
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Garansi tukar ukuran bebas repot dalam 7 hari kerja tanpa biaya tambahan.
                </p>
              </div>
            </div>

            <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
              <div className="w-10 h-10 bg-surface-muted flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  verified
                </span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  100% Original Premium Fabric
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Material katun combed berat, linen murni, dan denim kurasi tanpa kompromi.
                </p>
              </div>
            </div>

            <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
              <div className="w-10 h-10 bg-surface-muted flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[22px]">lock</span>
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Pembayaran Aman &amp; Terverifikasi
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Enkripsi bank level enterprise dengan instant QRIS, VA, dan paylater.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CATEGORY SWITCHER & FILTER BAR */}
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
                    <option value="populer">Paling Populer</option>
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

      {/* SECTION 4: CURATED PRODUCT GRID */}
      <section className="w-full bg-canvas-base pb-space-xl">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop">
          {filteredProducts.length === 0 ? (
            <div className="py-space-xl text-center bg-surface-subtle border border-border-hairline p-space-lg space-y-space-sm">
              <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
              <h3 className="font-headline-sm text-headline-sm uppercase text-primary">
                Tidak Ada Artikel yang Cocok
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
                Pencarian &ldquo;{searchQuery}&rdquo; pada kategori {activeCategory} tidak ditemukan.
                Silakan atur ulang filter untuk melihat katalog kurasi lengkap.
              </p>
              <button
                type="button"
                onClick={() => {
                  onCategoryChange('Semua');
                  onSearchChange('');
                }}
                className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
              >
                Tampilkan Semua Koleksi
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-space-sm md:gap-x-space-md gap-y-space-lg">
              {filteredProducts.map((product) => {
                const activeSize = selectedCardSizes[product.id] || product.defaultSize;
                const activeColor =
                  selectedCardColors[product.id] || product.colors[0]?.name || 'Default';

                if (product.isSoldOut) {
                  return (
                    <article
                      key={product.id}
                      onClick={() => onOpenProduct(product.id)}
                      className="product-item group flex flex-col justify-between bg-surface-subtle p-space-xs opacity-75 relative cursor-pointer"
                    >
                      <div className="relative w-full aspect-[3/4] bg-surface-dim overflow-hidden grayscale">
                        <img
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover mix-blend-multiply"
                          src={product.image}
                        />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="bg-badge-soldout text-on-primary px-2.5 py-1 font-label-caps text-[11px] uppercase tracking-wider font-bold">
                            Habis
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                          <span className="bg-badge-soldout text-on-primary px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest">
                            Stok Kosong
                          </span>
                        </div>
                      </div>
                      <div className="pt-space-sm flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-center justify-between text-outline mb-1">
                            <span className="font-label-caps text-label-caps uppercase">
                              {product.subCategory}
                            </span>
                            <span className="font-label-caps text-[10px] text-error font-bold uppercase">
                              {product.tagLabel}
                            </span>
                          </div>
                          <h3 className="font-body-md text-body-md text-outline font-semibold line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1.5 my-2">
                            {product.colors.map((c) => (
                              <span
                                key={c.name}
                                style={{ backgroundColor: c.hex }}
                                className="w-3.5 h-3.5 rounded-full inline-block opacity-50 border border-border-hairline"
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="font-price-display text-price-display text-outline">
                              {formatRupiah(product.price)}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-2 bg-surface-variant text-outline font-label-caps text-label-caps uppercase tracking-wider cursor-not-allowed text-center"
                          >
                            Habis Terjual
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={product.id}
                    className="product-item group flex flex-col justify-between bg-canvas-base p-space-xs transition-shadow duration-200 hover:shadow-lg"
                  >
                    <div
                      onClick={() => onOpenProduct(product.id)}
                      className="relative w-full aspect-[3/4] bg-surface-muted overflow-hidden cursor-pointer"
                    >
                      <img
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={product.image}
                      />
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.badges.map((b, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 font-label-caps text-[10px] uppercase font-bold shadow-sm ${
                              b.variant === 'promo'
                                ? 'bg-badge-promo text-text-on-accent'
                                : b.variant === 'dark'
                                ? 'bg-primary text-on-primary'
                                : 'bg-canvas-base text-primary'
                            }`}
                          >
                            {b.text}
                          </span>
                        ))}
                      </div>

                      {/* Star rating overlay if present */}
                      {product.rating && (
                        <div className="absolute bottom-2 left-2 bg-canvas-base/90 backdrop-blur-xs px-2 py-0.5 flex items-center gap-1">
                          <span
                            className="material-symbols-outlined text-[14px] text-badge-soldout"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          <span className="font-label-caps text-[11px] font-bold text-primary">
                            {product.rating.score}
                          </span>
                          <span className="text-[10px] text-outline">({product.rating.count})</span>
                        </div>
                      )}

                      {/* Hover Action Quick Add */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-x-2 bottom-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
                      >
                        <button
                          type="button"
                          onClick={() => onAddToCart(product, activeSize, activeColor)}
                          className="w-full py-2.5 bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-1 shadow-md cursor-pointer font-bold"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            shopping_bag
                          </span>
                          <span>+ Keranjang</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-space-sm flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between text-outline mb-1">
                          <span className="font-label-caps text-label-caps uppercase">
                            {product.subCategory}
                          </span>
                          <span className="font-label-caps text-[11px] text-badge-soldout bg-surface-muted px-1">
                            {product.tagLabel}
                          </span>
                        </div>

                        <h3
                          onClick={() => onOpenProduct(product.id)}
                          className="font-body-md text-body-md text-primary font-semibold line-clamp-1 group-hover:underline cursor-pointer"
                        >
                          {product.name}
                        </h3>

                        {/* Color Swatches */}
                        <div className="flex items-center gap-1.5 my-2">
                          {product.colors.map((c) => {
                            const isSelectedColor = activeColor === c.name;
                            return (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() =>
                                  setSelectedCardColors((prev) => ({
                                    ...prev,
                                    [product.id]: c.name,
                                  }))
                                }
                                style={{ backgroundColor: c.hex }}
                                className={`w-3.5 h-3.5 rounded-full inline-block cursor-pointer ${
                                  isSelectedColor
                                    ? 'ring-1 ring-offset-1 ring-primary'
                                    : 'hover:ring-1 hover:ring-outline'
                                }`}
                                title={c.name}
                              />
                            );
                          })}
                          {product.extraColorCount && (
                            <span className="text-[10px] font-label-caps text-outline ml-1">
                              +{product.extraColorCount} warna
                            </span>
                          )}
                        </div>

                        {/* Size selector pills for top 3 featured cards (matching design) */}
                        {['prod-1', 'prod-2', 'prod-3'].includes(product.id) && (
                          <div className="flex items-center gap-1 my-1.5">
                            {product.sizes
                              .filter((s) => s.stock > 0)
                              .slice(0, 4)
                              .map((s) => (
                                <button
                                  key={s.code}
                                  type="button"
                                  onClick={() =>
                                    setSelectedCardSizes((prev) => ({
                                      ...prev,
                                      [product.id]: s.code,
                                    }))
                                  }
                                  className={`w-6 h-6 flex items-center justify-center font-label-caps text-[10px] transition-colors cursor-pointer ${
                                    activeSize === s.code
                                      ? 'bg-primary text-on-primary font-bold'
                                      : 'bg-surface-muted hover:bg-primary hover:text-on-primary text-primary'
                                  }`}
                                >
                                  {s.code}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between pt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-price-display text-price-display text-primary">
                            {formatRupiah(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="font-price-strike text-price-strike text-outline line-through">
                              {formatRupiah(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label="Tambah Produk"
                          onClick={() => onAddToCart(product, activeSize, activeColor)}
                          className="md:hidden p-1.5 bg-badge-promo text-text-on-accent cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            add_shopping_cart
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: CURATED LOOKBOOK / EDITORIAL STORY */}
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
    </div>
  );
};
