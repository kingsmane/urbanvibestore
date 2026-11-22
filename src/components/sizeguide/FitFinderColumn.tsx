import React from 'react';
import { Preference } from './types';

interface FitFinderColumnProps {
  onApplyAndReturn: (selectedSize: string) => void;
  heightInput: number;
  setHeightInput: React.Dispatch<React.SetStateAction<number>>;
  weightInput: number;
  setWeightInput: React.Dispatch<React.SetStateAction<number>>;
  preference: Preference;
  setPreference: React.Dispatch<React.SetStateAction<Preference>>;
  selectedSize: string;
  handleCalculate: (h?: number, w?: number, pref?: Preference) => void;
  fitDescLabel: string;
}

export const FitFinderColumn: React.FC<FitFinderColumnProps> = ({
  onApplyAndReturn,
  heightInput,
  setHeightInput,
  weightInput,
  setWeightInput,
  preference,
  setPreference,
  selectedSize,
  handleCalculate,
  fitDescLabel,
}) => {
  return (
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
  );
};
