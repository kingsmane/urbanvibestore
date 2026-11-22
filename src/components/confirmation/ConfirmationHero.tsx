import React from 'react';
import { Order } from '../../data/storeData';
import { ORDER_STATUS_LABEL, isAwaitingPayment, isClosedUnpaid } from '../../lib/orderStatus';

interface ConfirmationHeroProps {
  order: Order;
  secondsLeft: number;
  copiedRef: boolean;
  formatTimer: (sec: number) => string;
  handleCopyRef: () => void;
}

export const ConfirmationHero: React.FC<ConfirmationHeroProps> = ({
  order,
  secondsLeft,
  copiedRef,
  formatTimer,
  handleCopyRef,
}) => {
  return (
    <section className="mb-space-xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-end">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-space-sm mb-space-sm">
            <div className="w-10 h-10 bg-badge-promo flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[24px] text-text-on-accent"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
            </div>
            <span className="bg-primary text-on-primary px-space-sm py-1 font-label-caps text-label-caps uppercase tracking-wider">
              {isAwaitingPayment(order.status)
                ? 'Pesanan Diterima • Menunggu Pelunasan'
                : isClosedUnpaid(order.status)
                  ? ORDER_STATUS_LABEL[order.status]
                  : `Pembayaran Terverifikasi • ${ORDER_STATUS_LABEL[order.status]}`}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg md:font-display md:text-display uppercase tracking-tight text-primary leading-none">
            {isClosedUnpaid(order.status)
              ? 'Pesanan Ini Tidak Dilanjutkan.'
              : 'Terima Kasih, Pesanan Anda Telah Diterima.'}
          </h1>
        </div>

        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-end items-start lg:items-end gap-space-sm">
          {/* Order ID Badge with Copy Interaction */}
          <div className="bg-surface-container p-space-sm flex items-center gap-space-md w-full sm:w-auto">
            <div className="text-left">
              <span className="font-label-sm text-label-sm uppercase text-outline block">
                Nomor Referensi
              </span>
              <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">
                {order.orderNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyRef}
              className="bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent p-2 transition-colors cursor-pointer"
              title="Salin Nomor Referensi"
            >
              <span className="material-symbols-outlined text-[18px]">
                {copiedRef ? 'check' : 'content_copy'}
              </span>
            </button>
          </div>

          {/* Countdown Pill (hanya saat menunggu pembayaran) */}
          {isAwaitingPayment(order.status) && (
          <div className="bg-badge-soldout text-on-primary px-space-md py-2 flex items-center gap-space-sm w-full sm:w-auto justify-between sm:justify-start">
            <span className="material-symbols-outlined text-[18px] text-badge-promo animate-pulse">
              timer
            </span>
            <span className="font-label-caps text-label-caps uppercase text-surface-variant">
              Selesaikan dalam:
            </span>
            <span className="font-price-display text-price-display text-badge-promo font-mono">
              {formatTimer(secondsLeft)}
            </span>
          </div>
          )}
        </div>
      </div>

      {/* Architectural Divider Accent */}
      <div className="w-full h-1 bg-primary mt-space-lg flex">
        <div className="w-32 bg-badge-promo h-full"></div>
      </div>
    </section>
  );
};
