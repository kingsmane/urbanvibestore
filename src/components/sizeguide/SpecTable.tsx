import React from 'react';
import { SizeRow } from './types';

interface SpecTableProps {
  selectedSize: string;
  setSelectedSize: React.Dispatch<React.SetStateAction<string>>;
  sizeRows: SizeRow[];
}

export const SpecTable: React.FC<SpecTableProps> = ({
  selectedSize,
  setSelectedSize,
  sizeRows,
}) => {
  return (
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
  );
};
