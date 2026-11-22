import React from 'react';
import { Order, formatRupiah } from '../../data/storeData';
import { ORDER_STATUS_LABEL, STATUS_NOTICE, isAwaitingPayment } from '../../lib/orderStatus';

interface PaymentCardProps {
  order: Order;
  copiedVa: boolean;
  statusNotice: string | null;
  isChecking: boolean;
  isCancelling: boolean;
  handleCopyVa: () => void;
  handleCheckStatus: () => void;
  handleCancel: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  order,
  copiedVa,
  statusNotice,
  isChecking,
  isCancelling,
  handleCopyVa,
  handleCheckStatus,
  handleCancel,
}) => {
  const awaiting = isAwaitingPayment(order.status);

  return (
    <div className="bg-canvas-base shadow-sm p-space-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-surface-muted px-3 py-1 font-label-caps text-label-caps uppercase text-outline">
        Metode: {order.paymentMethod}
      </div>
      <div className="mb-space-md">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-1">
          {awaiting ? 'Total Kewajiban Pembayaran' : 'Total Pesanan'}
        </span>
        <div className="flex items-baseline gap-space-xs flex-wrap">
          <span className="font-display text-display text-primary tracking-tight font-bold">
            {formatRupiah(order.total)}
          </span>
          {awaiting && (
            <span className="bg-badge-promo text-text-on-accent px-1.5 py-0.5 font-label-caps text-[10px] font-bold uppercase tracking-wider">
              Transfer sesuai nominal
            </span>
          )}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Status pesanan: <strong>{ORDER_STATUS_LABEL[order.status]}</strong>. {STATUS_NOTICE[order.status]}
        </p>
      </div>

      {/* VA Number Display Box (hanya untuk pesanan yang menunggu pembayaran) */}
      {awaiting && order.vaNumber && (
        <div className="bg-surface-subtle p-space-md my-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-outline block">
                Nomor Virtual Account BCA
              </span>
              <span className="font-headline-lg text-headline-lg tracking-wider font-mono text-primary font-bold">
                {order.vaNumber}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                Atas Nama: <strong className="text-on-surface font-semibold">URBANSTORE</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyVa}
              className="bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary px-space-md py-3 font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              <span>{copiedVa ? 'Tersalin!' : 'Salin Nomor VA'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Aksi: periksa status ke server / batalkan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
        <button
          type="button"
          onClick={handleCheckStatus}
          disabled={isChecking}
          className="w-full bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent disabled:opacity-60 py-3 px-space-md font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          <span>{isChecking ? 'Memeriksa…' : 'Cek Status Pembayaran'}</span>
        </button>
        {awaiting && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isCancelling}
            className="w-full bg-surface-muted hover:bg-surface-variant text-on-surface disabled:opacity-60 py-3 px-space-md font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            <span>{isCancelling ? 'Membatalkan…' : 'Batalkan Pesanan'}</span>
          </button>
        )}
      </div>
      {statusNotice && (
        <p role="status" className="font-body-sm text-body-sm text-secondary font-medium mt-space-sm">
          {statusNotice}
        </p>
      )}
    </div>
  );
};
