import React from 'react';
import { Order } from '../../data/storeData';

interface NextStepsCardProps {
  order: Order;
  onNavigateCatalog: () => void;
  onNavigateAccount: () => void;
}

export const NextStepsCard: React.FC<NextStepsCardProps> = ({
  order,
  onNavigateCatalog,
  onNavigateAccount,
}) => {
  return (
    <div className="bg-surface-subtle p-space-lg flex flex-col gap-space-md">
      <div className="flex items-start gap-space-sm">
        <span className="material-symbols-outlined text-[24px] text-badge-promo bg-primary p-1">
          notifications_active
        </span>
        <div>
          <p className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
            Notifikasi &amp; Konfirmasi Pengiriman
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Salinan invoice dan nota kurasi telah dikirimkan ke{' '}
            <strong className="text-on-surface">{order.recipientEmail}</strong> serta
            notifikasi status pesanan via WhatsApp ke{' '}
            <strong className="text-on-surface">{order.recipientPhone}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-space-xs text-center">
        <a
          className="bg-canvas-base hover:bg-surface-muted p-space-sm flex flex-col items-center justify-center gap-1 transition-colors"
          href="https://wa.me/6281234567890"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">chat</span>
          <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
            WhatsApp CS
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            Balasan Cepat 24/7
          </span>
        </a>
        <button
          type="button"
          onClick={onNavigateAccount}
          className="bg-canvas-base hover:bg-surface-muted p-space-sm flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">
            receipt_long
          </span>
          <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
            Riwayat Pesanan
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            Pantau Status
          </span>
        </button>
        <button
          type="button"
          onClick={onNavigateAccount}
          className="bg-canvas-base hover:bg-surface-muted p-space-sm flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-primary">
            swap_horiz
          </span>
          <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
            Tukar Ukuran
          </span>
          <span className="font-label-sm text-label-sm text-outline">
            Garansi 7 Hari
          </span>
        </button>
      </div>

      <div className="pt-space-xs flex justify-start">
        <button
          type="button"
          onClick={onNavigateCatalog}
          className="inline-flex items-center gap-space-xs text-primary font-label-caps text-label-caps uppercase tracking-wider hover:text-secondary transition-colors font-bold group cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">
            arrow_back
          </span>
          <span>Kembali Berbelanja (Katalog Drop)</span>
        </button>
      </div>
    </div>
  );
};
