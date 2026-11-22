import React from 'react';
import { Product, SizeVariant, formatRupiah } from '../../data/storeData';

interface PurchasePanelProps {
  product: Product;
  onBuyNow: (product: Product, size: string, color: string) => void;
  selectedColor: string;
  setSelectedColor: React.Dispatch<React.SetStateAction<string>>;
  selectedSize: string;
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
  openMaterialTab: boolean;
  setOpenMaterialTab: React.Dispatch<React.SetStateAction<boolean>>;
  openDeliveryTab: boolean;
  setOpenDeliveryTab: React.Dispatch<React.SetStateAction<boolean>>;
  setSizeGuideModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addedFeedback: boolean;
  currentSizeObj: SizeVariant;
  handleAddClick: () => void;
}

export const PurchasePanel: React.FC<PurchasePanelProps> = ({
  product,
  onBuyNow,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  openMaterialTab,
  setOpenMaterialTab,
  openDeliveryTab,
  setOpenDeliveryTab,
  setSizeGuideModalOpen,
  addedFeedback,
  currentSizeObj,
  handleAddClick,
}) => {
  return (
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
  );
};
