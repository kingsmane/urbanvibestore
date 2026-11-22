import React from 'react';
import { FitProfile } from '../../data/storeData';

interface FitProfileTabProps {
  fitProfile: FitProfile;
  onNavigateSizeGuide: () => void;
}

export const FitProfileTab: React.FC<FitProfileTabProps> = ({
  fitProfile,
  onNavigateSizeGuide,
}) => {
  return (
    <>
      <div className="space-y-space-md">
        <div className="border-b border-border-hairline pb-space-sm">
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
            My Fit Profile (Ukuran Presisi)
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Data tubuh tersimpan untuk kalkulasi otomatis ukuran ideal di setiap halaman
            produk UrbanStore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="p-space-md bg-canvas-base border border-border-hairline">
            <span className="font-label-caps text-label-caps uppercase text-outline">
              Tinggi &amp; Berat Badan
            </span>
            <p className="font-headline-md text-headline-md text-primary mt-2">
              {fitProfile.height} cm{' '}
              <span className="text-outline text-headline-sm font-normal">
                / {fitProfile.weight} kg
              </span>
            </p>
            <span className="font-label-sm text-label-sm text-secondary block mt-2">
              Proporsi Standar Reguler
            </span>
          </div>
          <div className="p-space-md bg-canvas-base border border-border-hairline">
            <span className="font-label-caps text-label-caps uppercase text-outline">
              Rekomendasi Atasan
            </span>
            <p className="font-headline-md text-headline-md text-primary mt-2">
              {fitProfile.recommendedTop}
            </p>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mt-2">
              Boxy / Relaxed Cut Fit
            </span>
          </div>
          <div className="p-space-md bg-canvas-base border border-border-hairline">
            <span className="font-label-caps text-label-caps uppercase text-outline">
              Rekomendasi Bawahan
            </span>
            <p className="font-headline-md text-headline-md text-primary mt-2">
              {fitProfile.recommendedBottom}
            </p>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mt-2">
              Lingkar Pinggang: ~69-71 cm
            </span>
          </div>
        </div>

        {/* Precision Measurement Blueprint Box */}
        <div className="p-space-lg bg-surface-subtle border border-border-hairline mt-space-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="space-y-1">
              <h3 className="font-headline-sm text-headline-sm text-primary uppercase">
                Kalibrasi Ulang Ukuran Tubuh
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">
                Gunakan kalkulator interaktif visual UrbanStore untuk mengukur ulang
                lingkar dada, bahu, dan panjang inseam celana.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateSizeGuide}
              className="px-space-md py-2.5 font-label-caps text-label-caps uppercase bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent transition-colors font-bold whitespace-nowrap cursor-pointer"
            >
              Ukur Visual Sekarang
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
