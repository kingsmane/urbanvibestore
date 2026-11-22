import React from 'react';

interface NotFoundViewProps {
  title?: string;
  message?: string;
  onNavigateHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  title = 'Halaman tidak ditemukan',
  message = 'Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.',
  onNavigateHome,
}) => (
  <div className="max-w-[720px] w-full mx-auto px-margin py-space-xl text-center">
    <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block mb-space-xs">
      Error 404
    </span>
    <h1 className="font-headline-lg text-headline-lg uppercase tracking-tight text-on-surface mb-space-sm">
      {title}
    </h1>
    <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">{message}</p>
    <button
      type="button"
      onClick={onNavigateHome}
      className="bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent px-space-md py-space-sm font-label-caps text-label-caps uppercase tracking-wider transition-colors cursor-pointer"
    >
      Kembali ke katalog
    </button>
  </div>
);
