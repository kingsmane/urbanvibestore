import React from 'react';

export const MeasuringProtocols: React.FC = () => {
  return (
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
  );
};
