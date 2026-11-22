import React from 'react';
import { Order } from '../../data/storeData';

interface TrackingModalProps {
  order: Order;
  onClose: () => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-border-strong/60 flex items-center justify-center p-margin">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracking-modal-title"
        className="bg-canvas-base border-2 border-border-strong w-full max-w-md p-space-lg shadow-[8px_8px_0px_0px_#111827]"
      >
        <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
          <h3
            id="tracking-modal-title"
            className="font-headline-sm text-headline-sm text-primary uppercase font-bold"
          >
            Lacak Pengiriman
          </h3>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <dl className="py-space-md space-y-space-sm font-body-md text-body-md">
          <div>
            <dt className="font-label-caps text-label-caps uppercase text-outline">Pesanan</dt>
            <dd className="font-semibold text-primary">{order.orderNumber}</dd>
          </div>
          <div>
            <dt className="font-label-caps text-label-caps uppercase text-outline">Kurir</dt>
            <dd>{order.courierName}</dd>
          </div>
          <div>
            <dt className="font-label-caps text-label-caps uppercase text-outline">Nomor Resi</dt>
            <dd className="font-mono font-bold text-primary">
              {order.trackingNumber ?? 'Belum tersedia'}
            </dd>
          </div>
          {order.estimatedArrival && (
            <div>
              <dt className="font-label-caps text-label-caps uppercase text-outline">Estimasi Tiba</dt>
              <dd>{order.estimatedArrival}</dd>
            </div>
          )}
          <div>
            <dt className="font-label-caps text-label-caps uppercase text-outline">Alamat Tujuan</dt>
            <dd className="text-on-surface-variant">{order.shippingAddress}</dd>
          </div>
        </dl>
        <p className="font-body-sm text-body-sm text-on-surface-variant border-t border-border-hairline pt-space-sm">
          Gunakan nomor resi di atas pada situs atau aplikasi {order.courierName} untuk melihat posisi
          paket secara rinci.
        </p>
        <div className="pt-space-md flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-space-md py-2 bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent font-label-caps text-label-caps uppercase font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
