import React from 'react';

export const SecurityStamp: React.FC = () => {
  return (
    <div className="bg-surface-muted p-space-md flex items-center gap-space-md">
      <div className="w-12 h-12 bg-canvas-base flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[26px] text-primary">
          verified_user
        </span>
      </div>
      <div>
        <h4 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
          Jaminan Keaslian &amp; Transaksi Aman
        </h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
          Seluruh produk dikirim dari gudang terpusat UrbanStore Cikarang. Dilindungi
          garansi pengembalian 100% jika kemasan rusak saat diterima.
        </p>
      </div>
    </div>
  );
};
