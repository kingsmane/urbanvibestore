import React from 'react';

interface SizeGuideModalProps {
  onOpenFullSizeGuide: () => void;
  selectedSize: string;
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
  setSizeGuideModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sizeUnit: 'CM' | 'INCH';
  setSizeUnit: React.Dispatch<React.SetStateAction<'CM' | 'INCH'>>;
  formatDim: (cmVal: number) => string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  onOpenFullSizeGuide,
  selectedSize,
  setSelectedSize,
  setSizeGuideModalOpen,
  sizeUnit,
  setSizeUnit,
  formatDim,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-xs flex items-center justify-center p-margin md:p-space-xl transition-opacity duration-200">
        <div className="bg-canvas-base border border-border-strong w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
          {/* Modal Header */}
          <div className="sticky top-0 bg-canvas-base border-b border-border-hairline p-space-md md:p-space-lg flex items-center justify-between z-20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-space-xs">
                <h2 className="font-headline-md text-headline-sm md:text-headline-md font-bold uppercase tracking-tight text-primary">
                  Panduan Ukuran Presisi
                </h2>
                <span className="bg-badge-promo text-text-on-accent font-label-caps text-label-caps font-bold px-2 py-0.5 uppercase">
                  Satuan: {sizeUnit}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-outline">
                Toleransi jahitan garment ±1-2 cm dari tabel acuan resmi.
              </p>
            </div>
            <button
              type="button"
              aria-label="Tutup Panduan Ukuran"
              onClick={() => setSizeGuideModalOpen(false)}
              className="p-2 text-on-surface hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Modal Body Content */}
          <div className="p-space-md md:p-space-lg space-y-space-lg">
            <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-subtle border border-border-hairline p-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">style</span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-semibold text-primary">
                  Fit Type: Relaxed Oversized Boxy Cut
                </span>
              </div>
              <div className="flex items-center gap-1 bg-canvas-base border border-border-hairline p-0.5 font-label-caps text-label-caps">
                <button
                  type="button"
                  onClick={() => setSizeUnit('CM')}
                  className={`px-3 py-1 font-bold cursor-pointer ${
                    sizeUnit === 'CM' ? 'bg-primary text-on-primary' : 'text-outline hover:text-primary'
                  }`}
                >
                  CM
                </button>
                <button
                  type="button"
                  onClick={() => setSizeUnit('INCH')}
                  className={`px-3 py-1 font-bold cursor-pointer ${
                    sizeUnit === 'INCH'
                      ? 'bg-primary text-on-primary'
                      : 'text-outline hover:text-primary'
                  }`}
                >
                  INCH
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Size Chart Table */}
              <div className="lg:col-span-7 overflow-x-auto">
                <table className="w-full text-left border-collapse border-b border-primary">
                  <thead>
                    <tr className="border-b-2 border-primary font-label-caps text-label-caps uppercase text-primary">
                      <th className="py-space-sm pr-space-xs">Ukuran</th>
                      <th className="py-space-sm px-space-xs text-center">Lebar Dada</th>
                      <th className="py-space-sm px-space-xs text-center">Panjang Badan</th>
                      <th className="py-space-sm px-space-xs text-center">Lebar Bahu</th>
                      <th className="py-space-sm pl-space-xs text-center">P. Lengan</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-sm divide-y divide-border-hairline">
                    {[
                      { size: 'S', chest: 54, length: 68, shoulder: 50, sleeve: 22 },
                      { size: 'M', chest: 57, length: 71, shoulder: 52, sleeve: 24 },
                      { size: 'L', chest: 60, length: 74, shoulder: 55, sleeve: 25 },
                      { size: 'XL', chest: 63, length: 77, shoulder: 58, sleeve: 26 },
                    ].map((row) => {
                      const isHighlighted = selectedSize === row.size;
                      return (
                        <tr
                          key={row.size}
                          onClick={() => {
                            if (row.size !== 'XL') setSelectedSize(row.size);
                          }}
                          className={`transition-colors cursor-pointer ${
                            isHighlighted
                              ? 'bg-surface-container-low font-semibold'
                              : 'hover:bg-surface-subtle'
                          }`}
                        >
                          <td className="py-3 pr-space-xs font-headline-sm font-bold text-primary flex items-center gap-1">
                            <span>{row.size}</span>
                            {isHighlighted && (
                              <span className="w-1.5 h-1.5 rounded-full bg-badge-promo inline-block"></span>
                            )}
                          </td>
                          <td className="py-3 px-space-xs text-center font-mono">
                            {formatDim(row.chest)}
                          </td>
                          <td className="py-3 px-space-xs text-center font-mono">
                            {formatDim(row.length)}
                          </td>
                          <td className="py-3 px-space-xs text-center font-mono">
                            {formatDim(row.shoulder)}
                          </td>
                          <td className="py-3 pl-space-xs text-center font-mono">
                            {formatDim(row.sleeve)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-space-sm flex items-center gap-2 text-outline font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>
                    Baris ukuran <strong>{selectedSize}</strong> disorot sesuai pilihan Anda saat
                    ini.
                  </span>
                </div>
              </div>

              {/* Visual Measurement Diagram Graphic */}
              <div className="lg:col-span-5 bg-surface-subtle border border-border-hairline p-space-md flex flex-col items-center">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline mb-space-sm self-start">
                  Skema Titik Ukur Pakaian
                </span>
                <div className="w-full max-w-[260px] relative aspect-square my-space-xs flex items-center justify-center">
                  <svg
                    className="w-full h-full text-primary stroke-current"
                    fill="none"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M65 25 Q100 45 135 25 L175 60 L150 85 L135 72 L135 175 L65 175 L65 72 L50 85 L25 60 Z"
                      fill="#F3F4F6"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                    <path d="M65 25 Q100 45 135 25" strokeWidth="2"></path>
                    <line
                      stroke="#CCFF00"
                      strokeDasharray="3 3"
                      strokeWidth="2.5"
                      x1="45"
                      x2="155"
                      y1="42"
                      y2="42"
                    ></line>
                    <circle cx="45" cy="42" fill="#111827" r="3"></circle>
                    <circle cx="155" cy="42" fill="#111827" r="3"></circle>
                    <line
                      stroke="#111827"
                      strokeWidth="2"
                      x1="65"
                      x2="135"
                      y1="88"
                      y2="88"
                    ></line>
                    <circle cx="65" cy="88" fill="#111827" r="2.5"></circle>
                    <circle cx="135" cy="88" fill="#111827" r="2.5"></circle>
                    <line
                      stroke="#111827"
                      strokeDasharray="2 2"
                      strokeWidth="2"
                      x1="100"
                      x2="100"
                      y1="36"
                      y2="175"
                    ></line>
                    <circle cx="100" cy="36" fill="#111827" r="2.5"></circle>
                    <circle cx="100" cy="175" fill="#111827" r="2.5"></circle>
                  </svg>
                  <span className="absolute top-[16%] font-label-caps text-[10px] font-bold bg-badge-promo text-text-on-accent px-1">
                    A. Lebar Bahu
                  </span>
                  <span className="absolute top-[44%] font-label-caps text-[10px] font-bold bg-primary text-on-primary px-1">
                    B. Lebar Dada
                  </span>
                  <span className="absolute right-[15%] top-[60%] font-label-caps text-[10px] font-bold bg-primary text-on-primary px-1">
                    C. Panjang
                  </span>
                </div>

                <div className="w-full text-left space-y-space-xs mt-space-sm pt-space-sm border-t border-border-hairline">
                  <p className="font-label-caps text-[11px] uppercase tracking-wider font-bold text-primary">
                    Cara Mengukur Akurat:
                  </p>
                  <ol className="font-body-sm text-[12px] space-y-1 text-on-surface-variant list-decimal pl-4">
                    <li>
                      <strong>Rentangkan baju mendatar</strong> di atas meja atau lantai datar.
                    </li>
                    <li>
                      <strong>Ukur dada di bagian terlebar</strong>, persis 2 cm di bawah
                      sambungan ketiak (A-ke-B).
                    </li>
                    <li>
                      <strong>Bandingkan hasilnya</strong> dengan kaos paling nyaman yang biasa
                      Anda gunakan.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-surface-subtle border-t border-border-hairline p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm">
            <button
              type="button"
              onClick={() => {
                setSizeGuideModalOpen(false);
                onOpenFullSizeGuide();
              }}
              className="font-label-caps text-label-caps uppercase text-primary hover:text-secondary underline font-bold cursor-pointer"
            >
              Buka Kalkulator Smart Fit Finder Lengkap →
            </button>
            <button
              type="button"
              onClick={() => setSizeGuideModalOpen(false)}
              className="w-full sm:w-auto bg-primary text-on-primary px-space-lg py-2.5 font-label-caps text-label-caps uppercase tracking-wider font-bold hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
