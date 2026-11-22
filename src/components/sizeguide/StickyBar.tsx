import React from 'react';

interface StickyBarProps {
  onApplyAndReturn: (selectedSize: string) => void;
  onBack: () => void;
  selectedSize: string;
  barFitDesc: string;
}

export const StickyBar: React.FC<StickyBarProps> = ({
  onApplyAndReturn,
  onBack,
  selectedSize,
  barFitDesc,
}) => {
  return (
    <aside className="sticky bottom-0 left-0 right-0 z-40 bg-canvas-base border-t border-border-strong px-margin md:px-margin-desktop py-space-sm shadow-md">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm w-full sm:w-auto">
          <span className="w-3 h-3 bg-badge-promo border border-border-strong"></span>
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              PILIHAN FIT: <span>UKURAN {selectedSize}</span> (<span>{barFitDesc}</span>)
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">
              Toleransi terverifikasi ±1.5 cm • Jaminan retur 7 hari bebas repot
            </span>
          </div>
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 sm:flex-none border border-border-strong px-space-md py-2 font-label-caps text-label-caps uppercase hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            Batal / Kembali
          </button>
          <button
            type="button"
            onClick={() => onApplyAndReturn(selectedSize)}
            className="flex-1 sm:flex-none bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary px-space-lg py-2 font-label-caps text-label-caps uppercase font-bold transition-colors cursor-pointer"
          >
            Gunakan Ukuran {selectedSize} &amp; Belanja
          </button>
        </div>
      </div>
    </aside>
  );
};
