import React from 'react';

export const TrustStrip: React.FC = () => {
  return (
    <section className="w-full bg-surface-subtle py-space-lg">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
            <div className="w-10 h-10 bg-surface-muted flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[22px]">
                local_shipping
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Pengiriman Cepat Se-Indonesia
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Layanan ekspres terintegrasi ke seluruh nusantara dengan pelacakan presisi.
              </p>
            </div>
          </div>

          <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
            <div className="w-10 h-10 bg-badge-promo flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-text-on-accent text-[22px]">
                sync_alt
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Size Guarantee &amp; Tukar Mudah
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Garansi tukar ukuran bebas repot dalam 7 hari kerja tanpa biaya tambahan.
              </p>
            </div>
          </div>

          <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
            <div className="w-10 h-10 bg-surface-muted flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[22px]">
                verified
              </span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                100% Original Premium Fabric
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Material katun combed berat, linen murni, dan denim kurasi tanpa kompromi.
              </p>
            </div>
          </div>

          <div className="bg-canvas-base p-space-md flex items-start gap-space-sm transition-all hover:bg-surface-container-low">
            <div className="w-10 h-10 bg-surface-muted flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[22px]">lock</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Pembayaran Aman &amp; Terverifikasi
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Enkripsi bank level enterprise dengan instant QRIS, VA, dan paylater.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
