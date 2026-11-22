import React from 'react';

interface TrackingModalProps {
  setTrackingModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  setTrackingModalOpen,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-border-strong/60 flex items-center justify-center p-margin">
        <div className="bg-canvas-base border-2 border-border-strong w-full max-w-xl max-h-[90vh] overflow-y-auto p-space-lg shadow-[8px_8px_0px_0px_#111827]">
          <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-outline">
                Lacak Pengiriman Real-Time
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary uppercase font-bold mt-0.5">
                Resi #JT9842109923 (J&amp;T Express)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setTrackingModalOpen(false)}
              className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          <div className="py-space-md space-y-space-md">
            <div className="relative pl-6 space-y-space-md before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-hairline">
              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-badge-promo border-2 border-border-strong"></span>
                <p className="font-label-caps text-label-caps uppercase text-primary font-bold">
                  29 Okt 2026, 11:20 WIB
                </p>
                <p className="font-body-md text-body-md text-primary font-medium">
                  Paket dibawa kurir J&amp;T menuju Kebayoran Baru, Jakarta Selatan
                </p>
                <p className="font-body-sm text-body-sm text-outline">
                  Kurir: Bpk. Joko Priyono (ID: JKT-441)
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary border-2 border-border-strong"></span>
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                  29 Okt 2026, 04:15 WIB
                </p>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Tiba di Sorting Center Hub Jakarta Selatan (Tebet)
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-border-hairline border-2 border-border-strong"></span>
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                  28 Okt 2026, 21:00 WIB
                </p>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Diberangkatkan dari Main Hub Gudang Logistik UrbanStore Cikarang
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-border-hairline border-2 border-border-strong"></span>
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                  28 Okt 2026, 09:45 WIB
                </p>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Pesanan diproses &amp; nomor resi telah dibuat
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-border-hairline pt-space-md flex justify-end">
            <button
              type="button"
              onClick={() => setTrackingModalOpen(false)}
              className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
            >
              Tutup Pemantau
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
