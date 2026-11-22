import React from 'react';

interface HeroSectionProps {
  onOpenProduct: (productId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenProduct,
}) => {
  return (
    <section className="w-full relative overflow-hidden bg-canvas-base">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg md:py-space-xl">
        {/* Top Architectural Index */}
        <div className="flex items-center justify-between pb-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="inline-block w-2.5 h-2.5 bg-badge-promo"></span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
              EDISI 01 / SS26
            </span>
            <span className="text-outline text-body-sm">|</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              SILUET KONTEMPORER
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-space-md">
            <span className="font-label-caps text-label-caps text-on-surface-variant">
              TOKYO 35.6762° N // ZURICH 47.3769° E
            </span>
            <span className="px-2 py-0.5 bg-surface-muted text-primary font-label-caps text-[11px] uppercase tracking-wider">
              KURASI TERBATAS
            </span>
          </div>
        </div>

        {/* Main Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
          {/* Typography & CTA Col */}
          <div className="lg:col-span-7 flex flex-col justify-between z-10">
            <div className="space-y-space-md">
              <div className="inline-flex items-center gap-space-xs bg-primary text-badge-promo px-3 py-1 font-label-caps text-label-caps uppercase tracking-wider">
                <span>DROP 01 / SS26</span>
                <span className="material-symbols-outlined text-[14px]">north_east</span>
              </div>
              <h1 className="font-display text-display uppercase tracking-tight text-primary leading-none">
                Find your <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-primary via-primary to-badge-promo bg-clip-text text-transparent">
                  everyday fit.
                </span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                Koleksi esensial pria &amp; wanita dengan potongan presisi dan material premium.
                Menyatukan ketenangan estetika Jepang dan ketelitian fungsional Eropa untuk
                keseharian Anda.
              </p>
            </div>

            {/* CTAs & Metric Strip */}
            <div className="pt-space-xl space-y-space-lg">
              <div className="flex flex-wrap items-center gap-space-md">
                <a
                  className="inline-flex items-center justify-center gap-space-sm bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-wider transition-all duration-200 font-bold"
                  href="#katalog"
                >
                  <span>Shop the Drop</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </a>
                <a
                  className="inline-flex items-center justify-center gap-space-sm bg-surface-muted hover:bg-surface-dim text-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-wider transition-all duration-200"
                  href="#lookbook"
                >
                  <span>Lihat Lookbook</span>
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                </a>
              </div>

              {/* Swiss Micro-metrics */}
              <div className="grid grid-cols-3 gap-space-md pt-space-md max-w-lg">
                <div className="space-y-0.5">
                  <span className="font-headline-md text-headline-md text-primary block leading-none">
                    280+
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    GSM Heavyweight
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-headline-md text-headline-md text-primary block leading-none">
                    100%
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Organic Cotton
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-headline-md text-headline-md text-badge-promo block leading-none">
                    0.0
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Toleransi Cacat
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Layered Editorial Photography Mosaic */}
          <div className="lg:col-span-5 relative">
            <div
              onClick={() => onOpenProduct('prod-1')}
              className="relative w-full aspect-[4/5] bg-surface-muted overflow-hidden cursor-pointer group"
            >
              <img
                alt="High fashion editorial studio portrait of a model wearing an oversized minimalist charcoal tee and relaxed pleated trousers"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjjGgNFqt5m8T0f1c6Mt0DFsrypMi6RMrUcMb6vQlUTxbsxUMHnEU4uTgxkC-pfKC8NcrDshL7b6pFQy9gmX9OhTJPPWUe9OXkFyptmBZrtSbGWC6T7QjtcUZZHtj8g-9QUKRCe8I8AwZ9Pa323uJtF_ZA4VOgDFxBczC0poF-iFV28XXEXpVV35ASSt-jA9JNIXX-aKUzi6R4q_BDNJaQTuAoc4rXykxEjHvD_gys"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent flex flex-col justify-end p-space-md">
                <span className="font-label-caps text-label-caps text-badge-promo uppercase tracking-widest">
                  Siluet 01 // Oversized Boxy
                </span>
                <p className="font-headline-sm text-headline-sm text-on-primary">
                  Heavyweight Tee &amp; Pleated Pants
                </p>
              </div>
            </div>

            {/* Overlapping Secondary Card */}
            <div
              onClick={() => onOpenProduct('prod-5')}
              className="hidden sm:block absolute -bottom-8 -left-12 w-48 aspect-[3/4] bg-surface-container-lowest p-2 shadow-2xl cursor-pointer"
            >
              <div className="w-full h-full relative overflow-hidden bg-surface-muted">
                <img
                  alt="Close up architectural fashion shot showing fine fabric texture of raw Japanese denim"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU1yTemLOwMCGPTWgj-QfL3GAP6WFEyr2Dxw33pDXxrPe2WEtR9Xz0BSdaZHMjkpFRGiqx_6X7EZfbg6xX4L89bmscygLqq_LabsWimQzxFuK3rWo2yT7ZrNgmMrMSeyJnra_zunH8NvAkVAp33q8DqC3FcLMuIC3FDvBNnyNgIEY8z6Pgxhy9DfyFOh_VE8BF-MJv_hHd-2hMSPpBGQD3lC-etvOAfifaO0pqmahE"
                />
                <div className="absolute top-2 left-2 bg-badge-promo px-1.5 py-0.5 font-label-caps text-[10px] text-text-on-accent uppercase font-bold">
                  Detail Tekstur
                </div>
              </div>
            </div>

            {/* Floating Micro Badge */}
            <div className="absolute top-4 right-4 bg-canvas-base/95 backdrop-blur-sm px-3 py-2 flex items-center gap-space-xs shadow-md">
              <span className="w-2 h-2 rounded-full bg-badge-promo animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase text-primary">
                Stok Terbatas
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
