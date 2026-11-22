import React from 'react';

interface ModelComparisonProps {
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({
  setSelectedSize,
}) => {
  return (
    <section className="w-full bg-surface px-margin md:px-margin-desktop py-space-xl border-t border-border-hairline">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-lg">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-outline">
              KOMPARASI VISUAL ASLI
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary uppercase">
              FITTING MODEL NYATA
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
            Lihat jatuhnya bahan dan drape kain pada berbagai postur tubuh untuk memvisualisasikan
            proporsi sebelum membeli.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
          {/* Model 1 */}
          <div className="bg-canvas-base border border-border-hairline flex flex-col group hover:border-primary transition-all">
            <div className="relative w-full aspect-[3/4] bg-surface-muted overflow-hidden">
              <img
                alt="Kenji (Pria) wearing Size L"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-102 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiOVpQZECkmW_REhIhcDY6kINOzx2G1sqdEML8vPrlYMWFM69WITXofZJ8KmUWrdz1cPmSVGRjgfgGrtyI197_D2F6HbzgFd86v-OAPMlz8AOExbpsYOY8GrGbzrJcrBuTqOxktGfB2BDlmt1fPTi_eFvrktjLr6bXfPD71A_xwa5LNX_ZkdQTQDP65Wh1GY894w__cOGgfrIgFF-6ajpT43FL5Gmh-lAU1DaKCmp1"
              />
              <div className="absolute top-2 left-2 bg-badge-soldout text-on-primary font-label-caps text-label-caps uppercase px-2 py-1">
                MODEL 01 // OVERSIZED LOOK
              </div>
              <div className="absolute bottom-2 right-2 bg-badge-promo text-text-on-accent font-headline-sm text-headline-sm px-2 py-0.5 font-bold">
                SIZE L
              </div>
            </div>
            <div className="p-space-md flex-1 flex flex-col justify-between">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    Kenji (Pria)
                  </span>
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    Street Fit
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-body-sm text-body-sm">
                  <div>
                    <span className="text-outline block text-[11px] font-label-caps uppercase">
                      Tinggi Badan
                    </span>
                    <span className="font-semibold text-primary">182 cm</span>
                  </div>
                  <div>
                    <span className="text-outline block text-[11px] font-label-caps uppercase">
                      Berat Badan
                    </span>
                    <span className="font-semibold text-primary">72 kg</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-border-hairline">
                  Mengenakan <strong>Ukuran L</strong>. Bahu drop 4 cm dari tulang bahu asli,
                  memberikan karakter boxy longgar dengan lipatan kain struktural yang bersih.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSize('L')}
                className="mt-space-md w-full py-2 border border-border-strong text-primary font-label-caps text-label-caps uppercase hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
              >
                Pilih Ukuran L Seperti Model
              </button>
            </div>
          </div>

          {/* Model 2 */}
          <div className="bg-canvas-base border border-border-hairline flex flex-col group hover:border-primary transition-all">
            <div className="relative w-full aspect-[3/4] bg-surface-muted overflow-hidden">
              <img
                alt="Arka (Pria) wearing Size M"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-102 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLNPYFA7iZ3GMQvXRnTgyMt6GUAf6WDVlnL2uJ5Lbj3orIKrUgdX-0UYiGe8dwFLNHr_MWR_W4xGSMGfoneBIv00KpfV2zS5Jf4VLkUjPVh8jM_YaKL8C6R7np7cSt-AQ5d1o3tr8Jk5e5cPWHykTKbAB608Ngraeoespn1wRjHxeE1JEYyTFRAg3BaPGlkDel0AT8TveLMp058P4UYPqCe5A2MnIt4XzK0Z6LPbwR"
              />
              <div className="absolute top-2 left-2 bg-canvas-base border border-border-strong text-primary font-label-caps text-label-caps uppercase px-2 py-1">
                MODEL 02 // RELAXED REGULAR
              </div>
              <div className="absolute bottom-2 right-2 bg-canvas-base border border-border-strong text-primary font-headline-sm text-headline-sm px-2 py-0.5 font-bold">
                SIZE M
              </div>
            </div>
            <div className="p-space-md flex-1 flex flex-col justify-between">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    Arka (Pria)
                  </span>
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    Everyday Fit
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-body-sm text-body-sm">
                  <div>
                    <span className="text-outline block text-[11px] font-label-caps uppercase">
                      Tinggi Badan
                    </span>
                    <span className="font-semibold text-primary">175 cm</span>
                  </div>
                  <div>
                    <span className="text-outline block text-[11px] font-label-caps uppercase">
                      Berat Badan
                    </span>
                    <span className="font-semibold text-primary">65 kg</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-border-hairline">
                  Mengenakan <strong>Ukuran M</strong>. Pilihan tepat untuk look santai harian
                  yang tetap rapi saat dipadukan dengan pleated trousers atau layered blazer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSize('M')}
                className="mt-space-md w-full py-2 border border-border-strong text-primary font-label-caps text-label-caps uppercase hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
              >
                Pilih Ukuran M Seperti Model
              </button>
            </div>
          </div>

          {/* Model 3 */}
          <div className="bg-canvas-base border border-border-hairline flex flex-col group hover:border-primary transition-all">
            <div className="relative w-full aspect-[3/4] bg-surface-muted overflow-hidden">
              <img
                alt="Reiko (Wanita) wearing Size S"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-102 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXEXTwfjByvENZnkYICaKMuWNvNQAiydIOD2mqZgcNSvgGXJZEU4zrVvLOGQmO_eK2xNAwT_x-4dXpG6nrECOHlVFXSBf1-jyvJv93Svr1r__cD_R4sdEB6cmVBgxpPmRdFPnxl46pD-_Alas7fECf89T3dDrxlMJd0nVrGOc0gCdmmcDDWnmwOvPyXV_b8iOxuoEfTg-OE0SS8hhyWQxDBstFPIplG7njFgittGMP"
              />
              <div className="absolute top-2 left-2 bg-canvas-base border border-border-strong text-primary font-label-caps text-label-caps uppercase px-2 py-1">
                MODEL 03 // DRAPED BOXY
              </div>
              <div className="absolute bottom-2 right-2 bg-canvas-base border border-border-strong text-primary font-headline-sm text-headline-sm px-2 py-0.5 font-bold">
                SIZE S
              </div>
            </div>
            <div className="p-space-md flex-1 flex flex-col justify-between">
              <div className="space-y-space-xs">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2">
                  <span className="font-headline-sm text-headline-sm text-primary">
                    Reiko (Wanita)
                  </span>
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    Fluid Genderless
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-body-sm text-body-sm">
                  <div>
                    <span className="text-outline block text-[11px] font-label-caps uppercase">
                      Tinggi Badan
                    </span>
                    <span className="font-semibold text-primary">168 cm</span>
                  </div>
                  <div>
                    <span className="text-outline block text-[11px] font-label-caps uppercase">
                      Berat Badan
                    </span>
                    <span className="font-semibold text-primary">50 kg</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant pt-2 border-t border-border-hairline">
                  Mengenakan <strong>Ukuran S</strong>. Menciptakan siluet androgini modern dengan
                  hem bawah yang jatuh tepat di batas pinggul, nyaman untuk french tuck.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSize('S')}
                className="mt-space-md w-full py-2 border border-border-strong text-primary font-label-caps text-label-caps uppercase hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
              >
                Pilih Ukuran S Seperti Model
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
