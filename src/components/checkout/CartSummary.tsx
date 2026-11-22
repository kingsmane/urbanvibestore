import React from 'react';
import { FREE_SHIPPING_MIN_SUBTOTAL, amountToFreeShipping } from '../../lib/pricing';
import { formatRupiah, CartItem } from '../../data/storeData';
import type { Courier, Voucher } from './types';

interface CartSummaryProps {
  freeShippingApplied: boolean;
  kecamatan: string;
  selectedCourier: Courier;
  voucherInput: string;
  setVoucherInput: (v: string) => void;
  appliedVoucher: Voucher | null;
  setAppliedVoucher: (v: Voucher | null) => void;
  voucherError: string | null;
  handleApplyVoucher: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  subtotal: number;
  totalItems: number;
  shippingFee: number;
  discount: number;
  serviceFee: number;
  grandTotal: number;
  validateAndSubmit: () => void;
  cart: CartItem[];
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenProduct: (productId: string) => void;
  onNavigateCatalog: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  freeShippingApplied,
  kecamatan,
  selectedCourier,
  voucherInput,
  setVoucherInput,
  appliedVoucher,
  setAppliedVoucher,
  voucherError,
  handleApplyVoucher,
  isSubmitting,
  submitError,
  subtotal,
  totalItems,
  shippingFee,
  discount,
  serviceFee,
  grandTotal,
  validateAndSubmit,
  cart,
  onUpdateQty,
  onRemoveItem,
  onOpenProduct,
  onNavigateCatalog,
}) => {
  return (
    <div className="bg-canvas-base p-space-lg shadow-sm">
      <div className="flex items-center justify-between pb-space-sm mb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
            Ringkasan Tas
          </span>
          <span className="w-5 h-5 bg-badge-promo text-text-on-accent font-label-caps text-[11px] font-bold flex items-center justify-center">
            {totalItems}
          </span>
        </div>
        <button
          type="button"
          onClick={onNavigateCatalog}
          className="font-label-caps text-label-caps uppercase text-outline hover:text-primary transition-colors cursor-pointer"
        >
          + Tambah Produk
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="py-space-xl text-center bg-surface-subtle p-space-md space-y-space-sm">
          <span className="material-symbols-outlined text-[32px] text-outline">
            shopping_bag
          </span>
          <p className="font-headline-sm text-headline-sm text-primary uppercase">
            Keranjang masih kosong. Saatnya cari fit baru.
          </p>
          <button
            type="button"
            onClick={onNavigateCatalog}
            className="px-space-md py-2 bg-badge-promo text-text-on-accent hover:bg-primary hover:text-on-primary font-label-caps text-label-caps uppercase font-bold transition-colors cursor-pointer"
          >
            Shop the Drop
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border-hairline">
            {cart.map((item) => (
              <article
                key={item.id}
                className="py-space-md flex gap-space-sm items-start"
              >
                <div
                  onClick={() => onOpenProduct(item.productId)}
                  className="w-20 h-28 bg-surface-muted shrink-0 overflow-hidden relative cursor-pointer"
                >
                  <img
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    src={item.image}
                  />
                  {item.badgeText && (
                    <span
                      className={`absolute top-1 left-1 font-label-caps text-[9px] px-1 py-0.2 font-bold uppercase tracking-wider ${
                        item.badgeVariant === 'promo'
                          ? 'bg-badge-promo text-text-on-accent'
                          : 'bg-badge-soldout text-on-primary'
                      }`}
                    >
                      {item.badgeText}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between h-28">
                  <div>
                    <div className="flex items-start justify-between gap-space-xs">
                      <h3
                        onClick={() => onOpenProduct(item.productId)}
                        className="font-headline-sm text-headline-sm uppercase text-on-surface truncate hover:underline cursor-pointer"
                      >
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        aria-label="Hapus Item"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-outline hover:text-error transition-colors p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Warna: {item.color} • Ukuran:{' '}
                      <strong className="text-on-surface">{item.size}</strong>
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    {/* Stepper Qty Counter */}
                    <div className="inline-flex items-center bg-surface-muted">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center font-headline-sm text-headline-sm text-on-surface hover:bg-surface-variant cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-headline-sm text-headline-sm text-on-surface font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center font-headline-sm text-headline-sm text-on-surface hover:bg-surface-variant cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-price-display text-price-display text-on-surface font-bold">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Promo Voucher Module */}
          <div className="mt-space-md pt-space-md bg-surface-subtle p-space-sm">
            <span className="font-label-caps text-label-caps uppercase text-on-surface block mb-1 tracking-wider">
              Kupon &amp; Voucher Promo
            </span>
            <div className="flex gap-space-xs">
              <input
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                className="flex-1 bg-canvas-base p-space-xs px-space-sm font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface outline-none"
                placeholder="Masukkan kode promo"
                type="text"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent px-space-md py-space-xs font-label-caps text-label-caps uppercase tracking-wider transition-colors shrink-0 font-bold cursor-pointer"
              >
                Terapkan
              </button>
            </div>
            {voucherError && (
              <p className="mt-1 font-body-sm text-body-sm text-error">{voucherError}</p>
            )}
            {appliedVoucher && (
              <div className="mt-space-xs flex items-center justify-between bg-badge-promo/20 p-1.5 text-on-surface">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    check_circle
                  </span>
                  <span className="font-label-caps text-[11px] font-bold uppercase text-secondary">
                    {appliedVoucher.code} — Hemat {formatRupiah(appliedVoucher.amount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedVoucher(null)}
                  className="text-on-surface-variant hover:text-error text-[11px] font-label-caps uppercase underline cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>

          {/* Transparent Cost Calculation Breakdown */}
          <div className="mt-space-lg pt-space-md space-y-space-xs">
            <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Subtotal Produk ({totalItems} Item)</span>
              <span className="text-on-surface font-medium">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
              <div className="flex items-center gap-1">
                <span>Ongkos Kirim ({selectedCourier.name})</span>
                <span
                  className="material-symbols-outlined text-[14px] text-outline cursor-help"
                  title="Dihitung berdasarkan berat total ke kecamatan tujuan"
                >
                  info
                </span>
              </div>
              <span className="text-on-surface font-medium">
                {freeShippingApplied ? 'Gratis' : formatRupiah(shippingFee)}
              </span>
            </div>
            {cart.length > 0 && subtotal < FREE_SHIPPING_MIN_SUBTOTAL && (
              <p className="font-body-sm text-body-sm text-secondary">
                Tambah {formatRupiah(amountToFreeShipping(subtotal))} lagi untuk gratis ongkir reguler.
              </p>
            )}
            {discount > 0 && (
              <div className="flex items-center justify-between font-body-md text-body-md text-secondary">
                <span>Diskon Voucher ({appliedVoucher?.code})</span>
                <span className="font-bold">- {formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
              <span>Biaya Layanan Sistem</span>
              <span className="text-on-surface font-medium">
                {formatRupiah(serviceFee)}
              </span>
            </div>

            {/* Grand Total Highlight Box */}
            <div className="mt-space-md pt-space-sm bg-primary text-on-primary p-space-md flex items-end justify-between">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-badge-promo tracking-widest block">
                  Total Tagihan Final
                </span>
                <span className="font-body-sm text-body-sm text-on-primary/70">
                  Sudah termasuk PPN 11%
                </span>
              </div>
              <div className="text-right">
                <span className="font-display text-[2rem] leading-none text-badge-promo block font-bold">
                  {formatRupiah(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Checkout CTA Button */}
          <div className="mt-space-md space-y-space-xs">
            {submitError && (
              <p
                role="alert"
                className="mb-space-sm font-body-sm text-body-sm text-error font-medium bg-error-container p-space-sm"
              >
                {submitError}
              </p>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={validateAndSubmit}
              className="w-full bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary p-space-md flex items-center justify-center gap-space-sm font-label-caps text-label-caps uppercase font-bold tracking-wider transition-all shadow-md group cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                lock
              </span>
              <span>
                {isSubmitting
                  ? 'Memproses Pesanan...'
                  : `Lanjut ke Pembayaran (${formatRupiah(grandTotal)})`}
              </span>
            </button>
            <div className="flex items-center justify-center gap-space-xs text-outline py-space-xs font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                timer
              </span>
              <span>
                Stok barang Anda direservasi eksklusif selama{' '}
                <strong className="text-on-surface">15 menit</strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
