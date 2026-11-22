import React from 'react';

export const StatusRibbon: React.FC = () => {
  return (
    <div className="w-full bg-surface-muted py-space-sm">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop flex flex-wrap items-center justify-between gap-y-2 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
        <div className="flex items-center gap-space-sm">
          <span className="inline-block w-2 h-2 bg-badge-promo"></span>
          <span>Pesanan Resmi UrbanStore Studio • ID/JKT-2026</span>
        </div>
        <div className="flex items-center gap-space-md text-on-surface">
          <span>1. Troli [Lengkap]</span>
          <span>—</span>
          <span>2. Pengiriman [Selesai]</span>
          <span>—</span>
          <span className="text-primary font-bold bg-badge-promo text-text-on-accent px-2 py-0.5">
            3. Verifikasi Pembayaran
          </span>
        </div>
      </div>
    </div>
  );
};
