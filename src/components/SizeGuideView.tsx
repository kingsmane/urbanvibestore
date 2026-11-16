import React, { useState } from 'react';
import { FitProfile } from '../data/storeData';

interface SizeGuideViewProps {
  fitProfile: FitProfile;
  onUpdateFitProfile: (updated: FitProfile) => void;
  onApplyAndReturn: (selectedSize: string) => void;
  onBack: () => void;
}

const POINT_DATA: Record<
  'A' | 'B' | 'C' | 'D',
  { title: string; tag: string; body: string }
> = {
  A: {
    title: 'Cara Mengukur Lebar Bahu (Shoulder Width)',
    tag: 'TITIK A: LEBAR BAHU',
    body: 'Bentangkan pakaian menghadap ke bawah atau depan. Ukur garis horizontal lurus dari titik sambungan jahitan bahu paling luar sebelah kiri ke titik jahitan bahu sebelah kanan.',
  },
  B: {
    title: 'Cara Mengukur Dada (Chest Width)',
    tag: 'TITIK B: LINGKAR DADA',
    body: 'Bentangkan pakaian favorit Anda secara rata di atas meja datar. Tarik pita meteran lurus dari ujung jahitan bawah ketiak kiri tepat ke jahitan bawah ketiak kanan (pit-to-pit). Kalikan 2 untuk mendapatkan lingkar dada keliling.',
  },
  C: {
    title: 'Cara Mengukur Panjang Badan (Body Length)',
    tag: 'TITIK C: PANJANG BADAN',
    body: 'Ukur dari titik tertinggi kerah bahu (HPS - High Point Shoulder) lurus ke bawah hingga ujung kelim paling bawah pakaian (bottom hem).',
  },
  D: {
    title: 'Cara Mengukur Panjang Lengan (Sleeve Length)',
    tag: 'TITIK D: PANJANG LENGAN',
    body: 'Tarik meteran dari sambungan jahitan bahu atas menuruni tepi luar lengan hingga ujung manset atau rib pergelangan tangan.',
  },
};

export const SizeGuideView: React.FC<SizeGuideViewProps> = ({
  fitProfile,
  onUpdateFitProfile,
  onApplyAndReturn,
  onBack,
}) => {
  const [category, setCategory] = useState<'tops' | 'bottoms' | 'outerwear'>('tops');
  const [activePoint, setActivePoint] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [heightInput, setHeightInput] = useState<number>(175);
  const [weightInput, setWeightInput] = useState<number>(68);
  const [preference, setPreference] = useState<'slim' | 'regular' | 'oversized'>(
    fitProfile.preference || 'oversized'
  );
  const [selectedSize, setSelectedSize] = useState<string>(fitProfile.calculatedSize || 'L');

  const computeRecommendedSize = (
    h: number,
    w: number,
    pref: 'slim' | 'regular' | 'oversized'
  ) => {
    const score = h * 0.4 + w * 0.6;
    let calc = 'M';
    if (score < 96) calc = 'S';
    else if (score < 109) calc = 'M';
    else if (score < 122) calc = 'L';
    else if (score < 135) calc = 'XL';
    else calc = 'XXL';

    if (pref === 'slim') {
      if (calc === 'XXL') calc = 'XL';
      else if (calc === 'XL') calc = 'L';
      else if (calc === 'L') calc = 'M';
    } else if (pref === 'oversized') {
      if (calc === 'S') calc = 'M';
    }
    return calc;
  };

  const handleCalculate = (
    h = heightInput,
    w = weightInput,
    pref = preference
  ) => {
    const calc = computeRecommendedSize(h, w, pref);
    setSelectedSize(calc);
    onUpdateFitProfile({
      height: h,
      weight: w,
      preference: pref,
      recommendedTop: `Size ${calc}`,
      recommendedBottom: w < 58 ? 'Size 27' : w < 68 ? 'Size 29' : 'Size 31',
      calculatedSize: calc,
    });
  };

  const schematicTitle =
    category === 'tops'
      ? 'ATASAN: SILUET BOXY OVERSIZED TEE'
      : category === 'bottoms'
      ? 'BAWAHAN: WIDE STRAIGHT PLEATED TROUSER'
      : 'OUTERWEAR: RELAXED STRUCTURED BLAZER';

  const fitDescLabel =
    preference === 'oversized'
      ? 'Boxy Oversized Fit'
      : preference === 'slim'
      ? 'Tapered Slim Fit'
      : 'Relaxed Regular Fit';

  const barFitDesc =
    preference === 'oversized'
      ? 'BOXY OVERSIZED'
      : preference === 'slim'
      ? 'SLIM CUT'
      : 'REGULAR FIT';

  const sizeRows = [
    { size: 'S', shoulder: 49, chest: 108, length: 69, heightRange: '160 – 170', weightRange: '50 – 62' },
    { size: 'M', shoulder: 51, chest: 114, length: 71, heightRange: '168 – 176', weightRange: '60 – 72' },
    { size: 'L', shoulder: 53, chest: 120, length: 74, heightRange: '173 – 182', weightRange: '68 – 80' },
    { size: 'XL', shoulder: 55, chest: 126, length: 76, heightRange: '178 – 188', weightRange: '78 – 92' },
    { size: 'XXL', shoulder: 58, chest: 132, length: 78, heightRange: '182 – 195', weightRange: '90 – 108' },
  ];

  const currentPointInfo = POINT_DATA[activePoint];

  return (
    <div className="flex flex-col w-full">
      {/* Top Technical Breadcrumb & Meta Bar */}
      <section className="w-full bg-surface-container-low px-margin md:px-margin-desktop py-space-sm border-b border-border-hairline">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-space-xs text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
          <div className="flex items-center gap-space-xs">
            <span className="inline-block w-2 h-2 bg-badge-promo"></span>
            <span>SYS.SPEC // PRD V1.0-SEC.6.3</span>
            <span className="text-outline">/</span>
            <span className="text-primary font-bold">URBAN FIT PRECISION SYSTEM</span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="text-outline">UNIT KALIBRASI: METRIK (CM)</span>
            <span className="hidden sm:inline text-outline">•</span>
            <span className="hidden sm:inline text-primary">TOLERANSI RESMI: ±1.5 CM</span>
          </div>
        </div>
      </section>

      {/* Title & Category Tabs Section */}
      <section className="w-full bg-canvas-base px-margin md:px-margin-desktop pt-space-xl pb-space-lg">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg border-b border-border-hairline">
            <div className="space-y-space-xs">
              <div className="inline-flex items-center gap-space-xs bg-primary text-badge-promo px-space-xs py-0.5 font-label-caps text-label-caps uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">straighten</span>
                Precision Sizing Protocol
              </div>
              <h1 className="font-headline-lg text-headline-lg uppercase tracking-tight text-primary text-balance">
                PANDUAN UKURAN VISUAL <span className="text-outline">//</span> URBAN FIT PRECISION
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Cek ukuran dulu. Biar fit-nya pas. Standarisasi rasio tubuh arsitektural berbasis
                siluet rileks Tokyo-Zurich.
              </p>
            </div>

            {/* Garansi Singkat Pill */}
            <div className="flex items-center gap-space-sm bg-surface-subtle p-space-sm max-w-md border-l-2 border-border-strong">
              <span className="material-symbols-outlined text-primary text-[28px] shrink-0">
                published_with_changes
              </span>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-primary font-bold">
                  Jaminan Bebas Resiko
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Tukar ukuran gratis dalam 7 hari kerja tanpa biaya tambahan jika tidak pas.
                </p>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-space-sm pt-space-md overflow-x-auto">
            {[
              { id: 'tops' as const, label: 'Atasan (Tees, Shirts, Knit)' },
              { id: 'bottoms' as const, label: 'Bawahan (Trousers, Denim)' },
              { id: 'outerwear' as const, label: 'Outerwear (Blazer, Coat, Parka)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`px-space-md py-space-xs font-label-caps text-label-caps uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                  category === tab.id
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-canvas-base text-on-surface border-border-hairline hover:border-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Blueprint Interactive Workspace */}
      <section className="w-full px-margin md:px-margin-desktop py-space-xl">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Interactive Silhouette & Measuring Guide Panel (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-canvas-base border border-border-hairline p-space-md md:p-space-lg flex flex-col justify-between relative">
            <div className="flex items-center justify-between pb-space-sm border-b border-border-hairline">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  FIG. 01 // SCHEMATIC OVERVIEW
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary uppercase">
                  {schematicTitle}
                </h2>
              </div>
              <div className="flex items-center gap-space-xs bg-badge-new px-space-xs py-1">
                <span className="w-1.5 h-1.5 bg-badge-promo inline-block"></span>
                <span className="font-label-caps text-[10px] uppercase text-primary font-bold">
                  Interaktif: Klik Titik Ukur
                </span>
              </div>
            </div>

            {/* Technical Silhouette Vector Graphic with Coordinate Measurement Hotspots */}
            <div className="relative w-full my-space-lg flex items-center justify-center min-h-[380px] bg-surface-subtle p-space-md overflow-hidden">
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              ></div>

              <svg
                className="w-full max-w-[420px] h-auto text-primary transition-all duration-300"
                viewBox="0 0 500 460"
              >
                <path
                  d="M175,95 Q250,118 325,95 L405,155 L365,215 L320,185 L320,380 L180,380 L180,185 L135,215 L95,155 Z"
                  fill="#FFFFFF"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                ></path>
                <path
                  d="M175,95 Q250,132 325,95"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                ></path>
                <path
                  d="M185,95 Q250,120 315,95"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                ></path>
                <line
                  stroke="currentColor"
                  strokeDasharray="4,4"
                  strokeWidth="1.5"
                  x1="180"
                  x2="175"
                  y1="185"
                  y2="95"
                ></line>
                <line
                  stroke="currentColor"
                  strokeDasharray="4,4"
                  strokeWidth="1.5"
                  x1="320"
                  x2="325"
                  y1="185"
                  y2="95"
                ></line>
                <line
                  stroke="currentColor"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                  x1="180"
                  x2="320"
                  y1="365"
                  y2="365"
                ></line>
                <line
                  stroke="currentColor"
                  strokeWidth="1.5"
                  x1="95"
                  x2="135"
                  y1="155"
                  y2="215"
                ></line>
                <line
                  stroke="currentColor"
                  strokeWidth="1.5"
                  x1="405"
                  x2="365"
                  y1="155"
                  y2="215"
                ></line>
                {/* Dimension Guide Line: A (Shoulder) */}
                <g className={activePoint === 'A' ? 'opacity-100' : 'opacity-60'}>
                  <line
                    stroke="#111827"
                    strokeDasharray="2,2"
                    strokeWidth={activePoint === 'A' ? '2.5' : '1.5'}
                    x1="175"
                    x2="325"
                    y1="85"
                    y2="85"
                  ></line>
                  <line stroke="#111827" strokeWidth="1.5" x1="175" x2="175" y1="78" y2="92"></line>
                  <line stroke="#111827" strokeWidth="1.5" x1="325" x2="325" y1="78" y2="92"></line>
                </g>
                {/* Dimension Guide Line: B (Chest) */}
                <g className={activePoint === 'B' ? 'opacity-100' : 'opacity-60'}>
                  <line
                    stroke="#111827"
                    strokeDasharray="2,2"
                    strokeWidth={activePoint === 'B' ? '2.5' : '1.5'}
                    x1="180"
                    x2="320"
                    y1="205"
                    y2="205"
                  ></line>
                  <line
                    stroke="#111827"
                    strokeWidth="1.5"
                    x1="180"
                    x2="180"
                    y1="198"
                    y2="212"
                  ></line>
                  <line
                    stroke="#111827"
                    strokeWidth="1.5"
                    x1="320"
                    x2="320"
                    y1="198"
                    y2="212"
                  ></line>
                </g>
                {/* Dimension Guide Line: C (Body Length) */}
                <g className={activePoint === 'C' ? 'opacity-100' : 'opacity-60'}>
                  <line
                    stroke="#111827"
                    strokeDasharray="2,2"
                    strokeWidth={activePoint === 'C' ? '2.5' : '1.5'}
                    x1="340"
                    x2="340"
                    y1="95"
                    y2="380"
                  ></line>
                  <line stroke="#111827" strokeWidth="1.5" x1="333" x2="347" y1="95" y2="95"></line>
                  <line
                    stroke="#111827"
                    strokeWidth="1.5"
                    x1="333"
                    x2="347"
                    y1="380"
                    y2="380"
                  ></line>
                </g>
                {/* Dimension Guide Line: D (Sleeve Length) */}
                <g className={activePoint === 'D' ? 'opacity-100' : 'opacity-60'}>
                  <line
                    stroke="#111827"
                    strokeDasharray="2,2"
                    strokeWidth={activePoint === 'D' ? '2.5' : '1.5'}
                    x1="325"
                    x2="395"
                    y1="82"
                    y2="135"
                  ></line>
                </g>
              </svg>

              {/* Hotspot Buttons */}
              {(
                [
                  { id: 'A', label: 'A. BAHU', pos: 'top-[18%] left-[49%] -translate-x-1/2' },
                  { id: 'B', label: 'B. DADA', pos: 'top-[48%] left-[49%] -translate-x-1/2' },
                  { id: 'C', label: 'C. PANJANG', pos: 'top-[52%] right-[18%]' },
                  { id: 'D', label: 'D. LENGAN', pos: 'top-[28%] right-[16%]' },
                ] as const
              ).map((pt) => {
                const isSelected = activePoint === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setActivePoint(pt.id)}
                    className={`absolute ${pt.pos} flex items-center gap-1 group border border-border-strong px-2 py-1 shadow-sm transition-colors cursor-pointer ${
                      isSelected ? 'bg-badge-promo' : 'bg-canvas-base hover:bg-badge-promo'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-none inline-block ${
                        isSelected ? 'bg-primary' : 'bg-badge-promo group-hover:bg-primary'
                      }`}
                    ></span>
                    <span className="font-label-caps text-label-caps text-primary font-bold">
                      {pt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Measurement Callout Card */}
            <div className="bg-surface-subtle border-t-2 border-border-strong p-space-md transition-all">
              <div className="flex items-start gap-space-sm">
                <span className="bg-primary text-badge-promo font-label-caps text-label-caps px-space-xs py-0.5 shrink-0">
                  {currentPointInfo.tag}
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm uppercase text-primary">
                    {currentPointInfo.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {currentPointInfo.body}
                  </p>
                  <div className="mt-space-xs flex items-center gap-space-xs text-outline font-label-caps text-[11px] uppercase">
                    <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                    Tips Pro: Jangan mengukur baju saat masih digantung untuk akurasi optimal.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Fit Finder / Precision Calculator Panel (Right 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="bg-canvas-base border border-border-hairline p-space-md md:p-space-lg flex-1">
              <div className="flex items-center justify-between pb-space-sm border-b border-border-hairline mb-space-md">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    ALAT KALKULASI FIT
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary uppercase">
                    SMART FIT FINDER
                  </h2>
                </div>
                <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
              </div>

              <form
                className="space-y-space-md"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCalculate();
                }}
              >
                <div className="grid grid-cols-2 gap-space-sm">
                  <div className="space-y-1">
                    <label
                      className="block font-label-caps text-label-caps uppercase text-on-surface font-semibold"
                      htmlFor="inputHeight"
                    >
                      Tinggi Badan (cm)
                    </label>
                    <div className="relative">
                      <input
                        id="inputHeight"
                        type="number"
                        min={140}
                        max={210}
                        required
                        value={heightInput}
                        onChange={(e) => setHeightInput(Number(e.target.value))}
                        className="w-full bg-surface-subtle border border-border-hairline focus:border-border-strong px-space-sm py-2 font-headline-sm text-headline-sm text-primary outline-none transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-outline">
                        CM
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label
                      className="block font-label-caps text-label-caps uppercase text-on-surface font-semibold"
                      htmlFor="inputWeight"
                    >
                      Berat Badan (kg)
                    </label>
                    <div className="relative">
                      <input
                        id="inputWeight"
                        type="number"
                        min={35}
                        max={150}
                        required
                        value={weightInput}
                        onChange={(e) => setWeightInput(Number(e.target.value))}
                        className="w-full bg-surface-subtle border border-border-hairline focus:border-border-strong px-space-sm py-2 font-headline-sm text-headline-sm text-primary outline-none transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-label-caps text-label-caps text-outline">
                        KG
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fit Preference Selector */}
                <div className="space-y-1">
                  <label className="block font-label-caps text-label-caps uppercase text-on-surface font-semibold">
                    Preferensi Potongan (Silhouette Vibe)
                  </label>
                  <div className="grid grid-cols-3 gap-space-xs">
                    {(
                      [
                        { id: 'slim', label: 'Slim' },
                        { id: 'regular', label: 'Regular' },
                        { id: 'oversized', label: 'Boxy Oversized' },
                      ] as const
                    ).map((prefItem) => {
                      const isSelected = preference === prefItem.id;
                      return (
                        <button
                          key={prefItem.id}
                          type="button"
                          onClick={() => {
                            setPreference(prefItem.id);
                            handleCalculate(heightInput, weightInput, prefItem.id);
                          }}
                          className={`py-2 px-1 text-center font-label-caps text-label-caps uppercase transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-2 border-primary bg-primary text-badge-promo font-bold'
                              : 'border border-border-hairline bg-canvas-base text-on-surface hover:border-primary'
                          }`}
                        >
                          {prefItem.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-badge-promo hover:text-text-on-accent text-on-primary py-3 font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">calculate</span>
                  Hitung Ukuran Rekomendasi
                </button>
              </form>

              {/* Result Showcase Box */}
              <div className="mt-space-md p-space-md bg-surface-subtle border-l-4 border-badge-promo">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Hasil Rekomendasi:
                  </span>
                  <span className="bg-badge-soldout text-on-primary font-label-caps text-[10px] uppercase px-space-xs py-0.5">
                    3 STOK TERSISA
                  </span>
                </div>
                <div className="my-space-xs flex items-baseline gap-space-sm">
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">
                    UKURAN {selectedSize}
                  </span>
                  <span className="font-label-caps text-label-caps uppercase text-outline">
                    {fitDescLabel}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Proporsional untuk tinggi{' '}
                  <span className="font-semibold text-primary">{heightInput} cm</span> dan berat{' '}
                  <span className="font-semibold text-primary">{weightInput} kg</span>. Jahitan bahu
                  jatuh sedikit di bawah titik anatomis untuk aksentuasi santai.
                </p>
                <div className="mt-space-md pt-space-sm border-t border-border-hairline flex flex-col sm:flex-row gap-space-xs">
                  <button
                    type="button"
                    onClick={() => onApplyAndReturn(selectedSize)}
                    className="flex-1 bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary py-2.5 px-space-sm font-label-caps text-label-caps uppercase text-center transition-colors font-bold cursor-pointer"
                  >
                    Pilih Ukuran {selectedSize} &amp; Kembali ke Produk
                  </button>
                </div>
              </div>
            </div>

            {/* Return Guarantee Banner Card */}
            <div className="bg-primary text-on-primary p-space-md flex items-start gap-space-sm">
              <div className="bg-badge-promo text-text-on-accent p-2 shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h4 className="font-label-caps text-label-caps uppercase text-badge-promo tracking-wide">
                  GARANSI BEBAS REPOT URBANSTORE
                </h4>
                <p className="font-body-sm text-body-sm text-surface-subtle mt-1">
                  Khawatir ukurannya kurang pas? Nikmati layanan{' '}
                  <strong>Tukar Ukuran Bebas Ongkir Retur</strong> dalam 7 hari kerja sejak barang
                  diterima. Kurir kami jemput langsung di tempat Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Precision Size Specification Table */}
      <section className="w-full bg-canvas-base px-margin md:px-margin-desktop py-space-xl border-t border-border-hairline">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-outline">
                DATA MATRIKS TEKNIS
              </span>
              <h2 className="font-headline-lg text-headline-lg text-primary uppercase">
                TABEL UKURAN PRESISI (CM)
              </h2>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-1.5 font-label-caps text-label-caps uppercase text-on-surface-variant">
                <span className="w-3 h-3 bg-badge-promo border border-border-strong inline-block"></span>
                <span>Ukuran Terpilih Saat Ini</span>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto border border-border-hairline">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border-strong text-primary font-label-caps text-label-caps uppercase">
                  <th className="py-3 px-space-md">Ukuran</th>
                  <th className="py-3 px-space-md">Lebar Bahu (cm)</th>
                  <th className="py-3 px-space-md">Lingkar Dada (cm)</th>
                  <th className="py-3 px-space-md">Panjang Badan (cm)</th>
                  <th className="py-3 px-space-md">Estimasi Tinggi (cm)</th>
                  <th className="py-3 px-space-md">Estimasi Berat (kg)</th>
                  <th className="py-3 px-space-md text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-hairline font-body-sm text-body-sm text-on-surface">
                {sizeRows.map((row) => {
                  const isSelected = selectedSize === row.size;
                  return (
                    <tr
                      key={row.size}
                      onClick={() => setSelectedSize(row.size)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-surface-container-low border-l-4 border-badge-promo'
                          : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <td className="py-3.5 px-space-md font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                        <span>{row.size}</span>
                        {isSelected && (
                          <span className="bg-badge-promo text-text-on-accent text-[10px] font-label-caps px-1 py-0.5">
                            REKOMENDASI
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3.5 px-space-md font-body-md text-body-md ${
                          isSelected ? 'font-semibold text-primary' : ''
                        }`}
                      >
                        {row.shoulder}
                      </td>
                      <td
                        className={`py-3.5 px-space-md font-body-md text-body-md ${
                          isSelected ? 'font-semibold text-primary' : ''
                        }`}
                      >
                        {row.chest}
                      </td>
                      <td
                        className={`py-3.5 px-space-md font-body-md text-body-md ${
                          isSelected ? 'font-semibold text-primary' : ''
                        }`}
                      >
                        {row.length}
                      </td>
                      <td
                        className={`py-3.5 px-space-md ${
                          isSelected ? 'text-primary font-medium' : 'text-on-surface-variant'
                        }`}
                      >
                        {row.heightRange}
                      </td>
                      <td
                        className={`py-3.5 px-space-md ${
                          isSelected ? 'text-primary font-medium' : 'text-on-surface-variant'
                        }`}
                      >
                        {row.weightRange}
                      </td>
                      <td className="py-3.5 px-space-md text-right">
                        {isSelected ? (
                          <button
                            type="button"
                            className="px-space-xs py-1 bg-primary text-badge-promo font-label-caps text-[11px] uppercase font-bold cursor-pointer"
                          >
                            Terpilih
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="px-space-xs py-1 border border-border-hairline font-label-caps text-[11px] uppercase hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                          >
                            Pilih {row.size}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-space-md grid grid-cols-1 md:grid-cols-2 gap-space-md text-on-surface-variant font-body-sm text-body-sm">
            <div className="p-space-sm bg-surface-subtle border-l-2 border-border-strong">
              <p className="font-label-caps text-label-caps uppercase text-primary font-bold mb-1">
                Catatan Potongan (Fit Notes):
              </p>
              <p>
                Boxy Oversized Fit — Direkomendasikan <em>true to size</em> untuk tampilan rileks
                bervolume khas street-couture Tokyo, atau turun satu ukuran (<em>size down</em>)
                jika menginginkan siluet reguler yang lebih konvensional.
              </p>
            </div>
            <div className="p-space-sm bg-surface-subtle border-l-2 border-border-strong">
              <p className="font-label-caps text-label-caps uppercase text-primary font-bold mb-1">
                Standar Toleransi Resmi:
              </p>
              <p>
                Toleransi ukuran jahitan ±1–2 cm akibat proses pencucian garmen katun murni (
                <em>pre-washed combed ring-spun cotton</em>) untuk mencegah penyusutan lanjutan
                pasca pemakaian konsumen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Real Model Specs / Visual Fitting Comparison */}
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

      {/* Section 5: Step-by-Step Measuring Protocols & FAQ */}
      <section className="w-full bg-canvas-base px-margin md:px-margin-desktop py-space-xl border-t border-border-hairline">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {/* Left: 3-Step Protocol */}
            <div className="lg:col-span-6 space-y-space-md">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  METODE PENGUKURAN MANDIRI
                </span>
                <h3 className="font-headline-md text-headline-md text-primary uppercase">
                  3 LANGKAH MENDAPATKAN FIT PRESISI
                </h3>
              </div>
              <div className="space-y-space-sm">
                <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle border-l-2 border-primary">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    01
                  </span>
                  <div>
                    <p className="font-label-caps text-label-caps uppercase text-primary font-bold">
                      Gunakan Pakaian Referensi Terbaik Anda
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Alih-alih mengukur badan secara melingkar sendiri yang rentan deviasi pita
                      bengkok, ambil kaus atau jaket favorit yang potongannya paling Anda sukai saat
                      ini.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle border-l-2 border-primary">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    02
                  </span>
                  <div>
                    <p className="font-label-caps text-label-caps uppercase text-primary font-bold">
                      Ratakan di Atas Permukaan Keras
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Hamparkan di atas meja kayu atau lantai bersih. Ratakan lipatan kain tanpa
                      menarik atau meregangkan elastisitas serat katun.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle border-l-2 border-primary">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">
                    03
                  </span>
                  <div>
                    <p className="font-label-caps text-label-caps uppercase text-primary font-bold">
                      Catat Ukuran &amp; Cocokkan Matriks
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Ukur lebar dada (ketiak ke ketiak) dan panjang punggung. Cari nilai yang
                      paling mendekati pada tabel matriks kami di atas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: FAQ Accordions */}
            <div className="lg:col-span-6 space-y-space-md">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  TANYA JAWAB FIT
                </span>
                <h3 className="font-headline-md text-headline-md text-primary uppercase">
                  FREQUENTLY ASKED QUESTIONS
                </h3>
              </div>
              <div className="space-y-space-xs">
                <details className="group bg-surface-subtle border border-border-hairline p-space-sm [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                  <summary className="flex items-center justify-between font-label-caps text-label-caps uppercase text-primary font-bold">
                    <span>Apakah bahan katun UrbanStore akan menyusut setelah dicuci?</span>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs pt-space-xs border-t border-border-hairline">
                    Semua garmen UrbanStore telah melalui proses industrial garment wash
                    (preshrunk). Penyusutan residual sangat minimal, di bawah 1% jika dicuci dengan
                    air dingin (&lt;30°C) dan dijemur datar tanpa mesin pengering panas tinggi.
                  </p>
                </details>
                <details
                  open
                  className="group bg-surface-subtle border border-border-hairline p-space-sm [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                >
                  <summary className="flex items-center justify-between font-label-caps text-label-caps uppercase text-primary font-bold">
                    <span>
                      Bagaimana jika ukuran saya berada di antara dua ukuran (In-Between)?
                    </span>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs pt-space-xs border-t border-border-hairline">
                    Jika Anda menginginkan potongan clean minimalis ala arsitektur kontemporer,
                    pilih ukuran yang lebih kecil. Namun jika Anda menyukai look kasual relaxed
                    Tokyo streetwear dengan aksentuasi lipatan bahan tebal, pilih ukuran yang lebih
                    besar.
                  </p>
                </details>
                <details className="group bg-surface-subtle border border-border-hairline p-space-sm [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                  <summary className="flex items-center justify-between font-label-caps text-label-caps uppercase text-primary font-bold">
                    <span>Bagaimana alur retur tukar ukuran jika tetap tidak pas?</span>
                    <span className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs pt-space-xs border-t border-border-hairline">
                    Cukup buka menu &lsquo;Riwayat Pesanan&rsquo;, klik tombol &lsquo;Tukar
                    Ukuran&rsquo;, dan pilih ukuran baru yang diinginkan. Kurir logistik rekanan
                    kami akan datang menjemput paket Anda dalam 1x24 jam tanpa perlu Anda membayar
                    ongkos kirim retur.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Conversion Bottom Bar */}
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
    </div>
  );
};
