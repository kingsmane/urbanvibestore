import React, { useState, useEffect } from 'react';
import { Product, PAIRING_PRODUCTS, formatRupiah } from '../data/storeData';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onNavigateHome: (category?: string) => void;
  onOpenProduct: (productId: string) => void;
  onOpenFullSizeGuide: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onBuyNow: (product: Product, size: string, color: string) => void;
  onQuickAddCustom: (name: string, price: number, image: string, categoryLabel: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onNavigateHome,
  onOpenProduct,
  onOpenFullSizeGuide,
  onAddToCart,
  onBuyNow,
  onQuickAddCustom,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Charcoal Black');
  const [selectedSize, setSelectedSize] = useState(product.defaultSize || 'L');
  const [openMaterialTab, setOpenMaterialTab] = useState(true);
  const [openDeliveryTab, setOpenDeliveryTab] = useState(false);
  const [sizeGuideModalOpen, setSizeGuideModalOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<'CM' | 'INCH'>('CM');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedColor(product.colors[0]?.name || 'Charcoal Black');
    setSelectedSize(product.defaultSize || 'L');
  }, [product]);

  // Thumbnail images: for prod-1, thumb index 0..3 correspond to gallery[1..4], and main starts at gallery[0]
  const thumbnails =
    product.gallery.length > 1 ? product.gallery.slice(1) : product.gallery;
  const activeHeroImage =
    activeImageIdx === 0
      ? product.gallery[0]
      : thumbnails[activeImageIdx - 1] || product.gallery[0];

  const currentSizeObj =
    product.sizes.find((s) => s.code === selectedSize) || product.sizes[0];

  const handleAddClick = () => {
    if (product.isSoldOut || currentSizeObj?.stock === 0) return;
    onAddToCart(product, selectedSize, selectedColor);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const formatDim = (cmVal: number) => {
    if (sizeUnit === 'CM') return `${cmVal} cm`;
    return `${(cmVal / 2.54).toFixed(1)}"`;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumb Bar */}
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

      {/* Main PDP Two-Column Grid */}
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg lg:py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop">
          {/* Left Column: Editorial Gallery */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-space-md">
            {/* Thumbnail Bar */}
            <div className="order-2 md:order-1 flex md:flex-col gap-space-sm shrink-0 overflow-x-auto md:overflow-visible pb-space-xs md:pb-0">
              {thumbnails.map((thumbUrl, idx) => {
                const isSelected = activeImageIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-20 md:w-20 md:h-24 bg-surface-muted shrink-0 overflow-hidden relative transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-primary'
                        : 'border border-border-hairline hover:border-outline'
                    }`}
                  >
                    <img
                      alt={`${product.shortName} view ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      src={thumbUrl}
                    />
                  </button>
                );
              })}
            </div>

            {/* Main Display Canvas */}
            <div className="order-1 md:order-2 flex-1 flex flex-col">
              <div className="relative w-full aspect-[3/4] bg-surface-muted overflow-hidden group">
                <span className="absolute top-space-sm left-space-sm z-10 bg-badge-promo text-text-on-accent px-space-xs py-0.5 font-label-caps text-label-caps uppercase font-bold tracking-wider">
                  {product.isSoldOut ? 'HABIS' : 'NEW DROP'}
                </span>
                <button
                  type="button"
                  aria-label="Perbesar foto"
                  onClick={() => setZoomModalOpen(true)}
                  className="absolute top-space-sm right-space-sm z-10 w-10 h-10 bg-canvas-base/90 backdrop-blur-sm border border-border-hairline text-on-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                </button>

                <img
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-opacity duration-300"
                  src={activeHeroImage}
                />

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent p-space-md text-on-primary flex items-end justify-between">
                  <div>
                    <p className="font-label-caps text-label-caps uppercase tracking-wider opacity-80">
                      Catatan Fitting
                    </p>
                    <p className="font-body-sm text-body-sm font-medium">
                      {product.specs.fitNote}
                    </p>
                  </div>
                  <span className="font-label-caps text-[10px] tracking-widest uppercase bg-canvas-base/20 px-2 py-1 backdrop-blur-xs">
                    {product.specs.materialTag}
                  </span>
                </div>
              </div>

              {/* Secondary Micro-feature strip */}
              <div className="grid grid-cols-3 gap-space-xs mt-space-sm text-center">
                <div className="bg-surface-subtle border border-border-hairline p-space-xs">
                  <span className="font-label-caps text-[11px] uppercase tracking-wider block text-outline">
                    Kerapatan Kain
                  </span>
                  <span className="font-headline-sm text-body-md font-bold text-primary">
                    {product.specs.density}
                  </span>
                </div>
                <div className="bg-surface-subtle border border-border-hairline p-space-xs">
                  <span className="font-label-caps text-[11px] uppercase tracking-wider block text-outline">
                    Potongan Siluet
                  </span>
                  <span className="font-headline-sm text-body-md font-bold text-primary">
                    {product.specs.silhouette}
                  </span>
                </div>
                <div className="bg-surface-subtle border border-border-hairline p-space-xs">
                  <span className="font-label-caps text-[11px] uppercase tracking-wider block text-outline">
                    {product.specs.detailLabel}
                  </span>
                  <span className="font-headline-sm text-body-md font-bold text-primary">
                    {product.specs.detailValue}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Product Info & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="sticky top-28 bg-canvas-base border border-border-hairline p-space-lg md:p-space-xl flex flex-col gap-space-lg">
              {/* Header Info: SKU, Title, Price */}
              <div className="border-b border-border-hairline pb-space-md">
                <div className="flex items-center justify-between font-label-caps text-label-caps text-outline uppercase tracking-wider mb-space-xs">
                  <span>SKU: {product.sku}</span>
                  <span>{product.category} / Essentials</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold mb-space-xs">
                  {product.shortName}
                </h1>
                <div className="flex items-baseline gap-space-sm mt-space-xs">
                  <span className="font-price-display text-headline-md text-primary font-bold">
                    {formatRupiah(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="font-price-strike text-price-strike text-outline line-through">
                      {formatRupiah(product.originalPrice)}
                    </span>
                  )}
                  <span className="font-label-caps text-label-caps uppercase text-outline tracking-wider bg-surface-muted px-2 py-0.5 border border-border-hairline">
                    Termasuk PPN
                  </span>
                </div>
              </div>

              {/* Color Swatch Selector */}
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between">
                  <label className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-semibold">
                    Pilihan Warna:{' '}
                    <span className="font-normal text-on-surface-variant">{selectedColor}</span>
                  </label>
                  <span className="font-label-caps text-[11px] text-badge-soldout uppercase">
                    {product.colors.length} Varian
                  </span>
                </div>
                <div className="flex items-center gap-space-sm pt-space-xs">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        aria-label={`Pilih ${c.name}`}
                        onClick={() => setSelectedColor(c.name)}
                        style={{ backgroundColor: c.hex }}
                        className={`relative w-9 h-9 rounded-full outline-offset-2 focus:outline-none cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-primary ring-2 ring-primary'
                            : 'border border-border-hairline hover:border-primary'
                        }`}
                      >
                        <span className="sr-only">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector & Stock State */}
              <div className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <label className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface font-semibold">
                    Pilih Ukuran
                  </label>
                  <button
                    type="button"
                    onClick={() => setSizeGuideModalOpen(true)}
                    className="inline-flex items-center gap-1 font-label-caps text-label-caps uppercase tracking-wider text-primary hover:text-secondary border-b border-primary transition-colors pb-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">straighten</span>
                    <span>Cek Panduan Ukuran</span>
                  </button>
                </div>

                {/* Size Pills Grid */}
                <div
                  className={`grid gap-space-xs ${
                    product.sizes.length >= 5 ? 'grid-cols-5' : 'grid-cols-4'
                  }`}
                >
                  {product.sizes.map((s) => {
                    const isOut = s.stock === 0;
                    const isSelected = selectedSize === s.code && !isOut;
                    const isLowStock = s.statusLabel.includes('Sisa');

                    if (isOut) {
                      return (
                        <button
                          key={s.code}
                          type="button"
                          disabled
                          className="opacity-40 cursor-not-allowed flex flex-col items-center justify-center py-2.5 border border-dashed border-border-hairline bg-surface-muted text-outline relative overflow-hidden"
                        >
                          <span className="font-headline-sm text-headline-sm font-bold line-through">
                            {s.code}
                          </span>
                          <span className="font-label-sm text-[10px] text-outline mt-0.5">
                            Habis
                          </span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={s.code}
                        type="button"
                        onClick={() => setSelectedSize(s.code)}
                        className={`group flex flex-col items-center justify-center py-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-primary bg-primary text-on-primary'
                            : 'border border-border-hairline hover:border-primary bg-canvas-base text-primary'
                        }`}
                      >
                        <span className="font-headline-sm text-headline-sm font-bold">
                          {s.code}
                        </span>
                        <span
                          className={`font-label-sm text-[10px] mt-0.5 ${
                            isSelected
                              ? 'text-badge-promo font-bold'
                              : isLowStock
                              ? 'text-error font-medium'
                              : 'text-outline font-normal'
                          }`}
                        >
                          {s.statusLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-space-xs text-body-sm font-body-sm text-outline-variant pt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      product.isSoldOut ? 'bg-error' : 'bg-badge-promo'
                    }`}
                  ></span>
                  <span className="text-on-surface-variant font-medium">
                    {product.isSoldOut
                      ? 'Maaf, seluruh varian ukuran sedang habis terjual'
                      : `Ukuran terpilih: ${selectedSize} (${currentSizeObj?.statusLabel}, siap dikirim hari ini)`}
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-space-sm pt-space-xs">
                <button
                  type="button"
                  disabled={product.isSoldOut}
                  onClick={handleAddClick}
                  className={`flex-1 transition-colors py-3.5 px-space-md font-label-caps text-headline-sm font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs group shadow-sm ${
                    product.isSoldOut
                      ? 'bg-surface-variant text-outline cursor-not-allowed'
                      : addedFeedback
                      ? 'bg-primary text-on-primary cursor-pointer'
                      : 'bg-badge-promo text-text-on-accent hover:bg-primary hover:text-on-primary active:translate-y-0.5 cursor-pointer'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                    {addedFeedback ? 'check' : 'shopping_bag'}
                  </span>
                  <span>
                    {product.isSoldOut
                      ? 'Stok Habis'
                      : addedFeedback
                      ? 'Berhasil Ditambahkan'
                      : 'Tambah ke Keranjang'}
                  </span>
                </button>
                {!product.isSoldOut && (
                  <button
                    type="button"
                    onClick={() => onBuyNow(product, selectedSize, selectedColor)}
                    className="sm:w-1/3 bg-canvas-base text-primary border border-border-strong hover:bg-surface-muted transition-colors py-3.5 px-space-md font-label-caps text-label-caps uppercase tracking-wider font-bold cursor-pointer"
                  >
                    Beli Langsung
                  </button>
                )}
              </div>

              {/* Trust & Value Proposition */}
              <div className="bg-surface-subtle border border-border-hairline p-space-md space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
                    published_with_changes
                  </span>
                  <span>
                    Gratis penukaran ukuran dalam <strong>7 hari kerja</strong> sejak paket
                    diterima.
                  </span>
                </div>
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">
                    inventory_2
                  </span>
                  <span>
                    Bahan <strong>100% Combed Cotton 24s Heavyweight</strong>, pre-shrunk, tidak
                    mudah susut.
                  </span>
                </div>
              </div>

              {/* Accordion Information Tabs */}
              <div className="border-t border-border-hairline divide-y divide-border-hairline">
                {/* Accordion 1: Material & Perawatan */}
                <div className="py-space-sm">
                  <button
                    type="button"
                    onClick={() => setOpenMaterialTab(!openMaterialTab)}
                    className="w-full flex items-center justify-between text-left font-headline-sm text-body-md font-bold text-primary py-1 cursor-pointer"
                  >
                    <span>Detail Material &amp; Perawatan</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform">
                      {openMaterialTab ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {openMaterialTab && (
                    <div className="pt-space-xs space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
                      {product.specs.carePoints.map((pt, i) => (
                        <p key={i}>{pt}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion 2: Pengiriman & Retur */}
                <div className="py-space-sm">
                  <button
                    type="button"
                    onClick={() => setOpenDeliveryTab(!openDeliveryTab)}
                    className="w-full flex items-center justify-between text-left font-headline-sm text-body-md font-bold text-primary py-1 cursor-pointer"
                  >
                    <span>Pengiriman &amp; Kebijakan Retur</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform">
                      {openDeliveryTab ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {openDeliveryTab && (
                    <div className="pt-space-xs space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
                      <p>
                        • Pesanan sebelum pukul 15.00 WIB dikirim pada hari kerja yang sama dari
                        Hub Logistik Jakarta.
                      </p>
                      <p>
                        • Bebas ongkir reguler se-Indonesia untuk total transaksi minimal Rp
                        500.000.
                      </p>
                      <p>
                        • Kebijakan retur berlaku 7 hari sejak status terkirim dengan kondisi tag
                        utuh dan pakaian belum dicuci.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ZOOM LIGHTBOX MODAL */}
      {zoomModalOpen && (
        <div
          onClick={() => setZoomModalOpen(false)}
          className="fixed inset-0 z-[110] bg-primary/80 backdrop-blur-sm flex items-center justify-center p-margin"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-canvas-base border border-border-strong p-2"
          >
            <button
              type="button"
              onClick={() => setZoomModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-primary text-on-primary flex items-center justify-center hover:bg-badge-promo hover:text-text-on-accent cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <img
              alt={product.name}
              referrerPolicy="no-referrer"
              src={activeHeroImage}
              className="w-full max-h-[82vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Interactive Visual Size Guide Modal */}
      {sizeGuideModalOpen && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-xs flex items-center justify-center p-margin md:p-space-xl transition-opacity duration-200">
          <div className="bg-canvas-base border border-border-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-canvas-base border-b border-border-hairline p-space-md md:p-space-lg flex items-center justify-between z-20">
              <div className="space-y-0.5">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-md text-headline-sm md:text-headline-md font-bold uppercase tracking-tight text-primary">
                    Panduan Ukuran Presisi
                  </h2>
                  <span className="bg-badge-promo text-text-on-accent font-label-caps text-label-caps font-bold px-2 py-0.5 uppercase">
                    Satuan: {sizeUnit}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Toleransi jahitan garment ±1-2 cm dari tabel acuan resmi.
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup Panduan Ukuran"
                onClick={() => setSizeGuideModalOpen(false)}
                className="p-2 text-on-surface hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-space-md md:p-space-lg space-y-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-subtle border border-border-hairline p-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">style</span>
                  <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold text-primary">
                    Fit Type: Relaxed Oversized Boxy Cut
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-canvas-base border border-border-hairline p-0.5 font-label-caps text-label-caps">
                  <button
                    type="button"
                    onClick={() => setSizeUnit('CM')}
                    className={`px-3 py-1 font-bold cursor-pointer ${
                      sizeUnit === 'CM' ? 'bg-primary text-on-primary' : 'text-outline hover:text-primary'
                    }`}
                  >
                    CM
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeUnit('INCH')}
                    className={`px-3 py-1 font-bold cursor-pointer ${
                      sizeUnit === 'INCH'
                        ? 'bg-primary text-on-primary'
                        : 'text-outline hover:text-primary'
                    }`}
                  >
                    INCH
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
                {/* Size Chart Table */}
                <div className="lg:col-span-7 overflow-x-auto">
                  <table className="w-full text-left border-collapse border-b border-primary">
                    <thead>
                      <tr className="border-b-2 border-primary font-label-caps text-label-caps uppercase text-primary">
                        <th className="py-space-sm pr-space-xs">Ukuran</th>
                        <th className="py-space-sm px-space-xs text-center">Lebar Dada</th>
                        <th className="py-space-sm px-space-xs text-center">Panjang Badan</th>
                        <th className="py-space-sm px-space-xs text-center">Lebar Bahu</th>
                        <th className="py-space-sm pl-space-xs text-center">P. Lengan</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-md text-body-sm divide-y divide-border-hairline">
                      {[
                        { size: 'S', chest: 54, length: 68, shoulder: 50, sleeve: 22 },
                        { size: 'M', chest: 57, length: 71, shoulder: 52, sleeve: 24 },
                        { size: 'L', chest: 60, length: 74, shoulder: 55, sleeve: 25 },
                        { size: 'XL', chest: 63, length: 77, shoulder: 58, sleeve: 26 },
                      ].map((row) => {
                        const isHighlighted = selectedSize === row.size;
                        return (
                          <tr
                            key={row.size}
                            onClick={() => {
                              if (row.size !== 'XL') setSelectedSize(row.size);
                            }}
                            className={`transition-colors cursor-pointer ${
                              isHighlighted
                                ? 'bg-surface-container-low font-semibold'
                                : 'hover:bg-surface-subtle'
                            }`}
                          >
                            <td className="py-3 pr-space-xs font-headline-sm font-bold text-primary flex items-center gap-1">
                              <span>{row.size}</span>
                              {isHighlighted && (
                                <span className="w-1.5 h-1.5 rounded-full bg-badge-promo inline-block"></span>
                              )}
                            </td>
                            <td className="py-3 px-space-xs text-center font-mono">
                              {formatDim(row.chest)}
                            </td>
                            <td className="py-3 px-space-xs text-center font-mono">
                              {formatDim(row.length)}
                            </td>
                            <td className="py-3 px-space-xs text-center font-mono">
                              {formatDim(row.shoulder)}
                            </td>
                            <td className="py-3 pl-space-xs text-center font-mono">
                              {formatDim(row.sleeve)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mt-space-sm flex items-center gap-2 text-outline font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>
                      Baris ukuran <strong>{selectedSize}</strong> disorot sesuai pilihan Anda saat
                      ini.
                    </span>
                  </div>
                </div>

                {/* Visual Measurement Diagram Graphic */}
                <div className="lg:col-span-5 bg-surface-subtle border border-border-hairline p-space-md flex flex-col items-center">
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline mb-space-sm self-start">
                    Skema Titik Ukur Pakaian
                  </span>
                  <div className="w-full max-w-[260px] relative aspect-square my-space-xs flex items-center justify-center">
                    <svg
                      className="w-full h-full text-primary stroke-current"
                      fill="none"
                      viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M65 25 Q100 45 135 25 L175 60 L150 85 L135 72 L135 175 L65 175 L65 72 L50 85 L25 60 Z"
                        fill="#F3F4F6"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      ></path>
                      <path d="M65 25 Q100 45 135 25" strokeWidth="2"></path>
                      <line
                        stroke="#CCFF00"
                        strokeDasharray="3 3"
                        strokeWidth="2.5"
                        x1="45"
                        x2="155"
                        y1="42"
                        y2="42"
                      ></line>
                      <circle cx="45" cy="42" fill="#111827" r="3"></circle>
                      <circle cx="155" cy="42" fill="#111827" r="3"></circle>
                      <line
                        stroke="#111827"
                        strokeWidth="2"
                        x1="65"
                        x2="135"
                        y1="88"
                        y2="88"
                      ></line>
                      <circle cx="65" cy="88" fill="#111827" r="2.5"></circle>
                      <circle cx="135" cy="88" fill="#111827" r="2.5"></circle>
                      <line
                        stroke="#111827"
                        strokeDasharray="2 2"
                        strokeWidth="2"
                        x1="100"
                        x2="100"
                        y1="36"
                        y2="175"
                      ></line>
                      <circle cx="100" cy="36" fill="#111827" r="2.5"></circle>
                      <circle cx="100" cy="175" fill="#111827" r="2.5"></circle>
                    </svg>
                    <span className="absolute top-[16%] font-label-caps text-[10px] font-bold bg-badge-promo text-text-on-accent px-1">
                      A. Lebar Bahu
                    </span>
                    <span className="absolute top-[44%] font-label-caps text-[10px] font-bold bg-primary text-on-primary px-1">
                      B. Lebar Dada
                    </span>
                    <span className="absolute right-[15%] top-[60%] font-label-caps text-[10px] font-bold bg-primary text-on-primary px-1">
                      C. Panjang
                    </span>
                  </div>

                  <div className="w-full text-left space-y-space-xs mt-space-sm pt-space-sm border-t border-border-hairline">
                    <p className="font-label-caps text-[11px] uppercase tracking-wider font-bold text-primary">
                      Cara Mengukur Akurat:
                    </p>
                    <ol className="font-body-sm text-[12px] space-y-1 text-on-surface-variant list-decimal pl-4">
                      <li>
                        <strong>Rentangkan baju mendatar</strong> di atas meja atau lantai datar.
                      </li>
                      <li>
                        <strong>Ukur dada di bagian terlebar</strong>, persis 2 cm di bawah
                        sambungan ketiak (A-ke-B).
                      </li>
                      <li>
                        <strong>Bandingkan hasilnya</strong> dengan kaos paling nyaman yang biasa
                        Anda gunakan.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-surface-subtle border-t border-border-hairline p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm">
              <button
                type="button"
                onClick={() => {
                  setSizeGuideModalOpen(false);
                  onOpenFullSizeGuide();
                }}
                className="font-label-caps text-label-caps uppercase text-primary hover:text-secondary underline font-bold cursor-pointer"
              >
                Buka Kalkulator Smart Fit Finder Lengkap →
              </button>
              <button
                type="button"
                onClick={() => setSizeGuideModalOpen(false)}
                className="w-full sm:w-auto bg-primary text-on-primary px-space-lg py-2.5 font-label-caps text-label-caps uppercase tracking-wider font-bold hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Pairing Section: Lengkapi Gaya Anda */}
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
    </div>
  );
};
