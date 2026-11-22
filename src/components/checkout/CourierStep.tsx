import React from 'react';
import { formatRupiah, formatEtaRange } from '../../data/storeData';
import { qualifiesForFreeShipping } from '../../lib/pricing';
import type { Courier } from './types';

interface CourierStepProps {
  subtotal: number;
  setActiveStep: (step: 1 | 2 | 3) => void;
  selectedCourier: Courier;
  setSelectedCourier: (c: Courier) => void;
}

export const CourierStep: React.FC<CourierStepProps> = ({
  subtotal,
  setActiveStep,
  selectedCourier,
  setSelectedCourier,
}) => {
  return (
    <section
      onClick={() => setActiveStep(2)}
      className="bg-canvas-base p-space-lg shadow-sm"
    >
      <div className="flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="w-2.5 h-2.5 bg-secondary inline-block"></span>
          <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
            02. Opsi Ekspedisi
          </h2>
        </div>
        <span className="font-label-caps text-label-caps uppercase text-secondary bg-surface-container px-2 py-0.5">
          Asuransi Paket Aktif
        </span>
      </div>

      <div className="space-y-space-xs">
        {[
          {
            id: 'jnt',
            name: 'J&T Express Regular',
            badge: 'Termurah',
            badgeClass: 'bg-badge-promo text-text-on-accent',
            desc: 'Estimasi tiba: 2 – 3 Hari Kerja • Pelacakan Real-time',
            eta: formatEtaRange(new Date(), 2, 4),
            cost: 12000,
            tier: 'Standard',
          },
          {
            id: 'sicepat',
            name: 'SiCepat BEST',
            badge: 'Besok Tiba',
            badgeClass: 'bg-surface-variant text-on-surface-variant',
            desc: 'Estimasi tiba: 1 Hari Kerja (Pukul 09.00 - 18.00 WIB)',
            eta: formatEtaRange(new Date(), 1, 1),
            cost: 18000,
            tier: 'Next Day',
          },
          {
            id: 'instant',
            name: 'Instant GoSend / Grab',
            badge: 'Prioritas',
            badgeClass: 'bg-badge-soldout text-on-primary',
            desc: 'Estimasi tiba: Maksimal 3 Jam sejak dipickup dari Warehouse',
            eta: 'Hari ini (Maks 3 Jam)',
            cost: 35000,
            tier: 'Kilat',
          },
        ].map((cOption) => {
          const isSelected = selectedCourier.id === cOption.id;
          return (
            <label
              key={cOption.id}
              onClick={() =>
                setSelectedCourier({
                  id: cOption.id,
                  name: cOption.name,
                  cost: cOption.cost,
                  eta: cOption.eta,
                })
              }
              className={`block p-space-md text-on-surface cursor-pointer transition-all ${
                isSelected
                  ? 'bg-surface-container'
                  : 'bg-surface-subtle hover:bg-surface-muted'
              }`}
            >
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex items-start gap-space-sm">
                  <input
                    type="radio"
                    name="courier_choice"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 accent-primary"
                  />
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">
                        {cOption.name}
                      </span>
                      <span
                        className={`font-label-caps text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider ${cOption.badgeClass}`}
                      >
                        {cOption.badge}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {cOption.desc}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-price-display text-price-display text-on-surface block font-bold">
                    {qualifiesForFreeShipping(subtotal, cOption) ? 'Gratis' : formatRupiah(cOption.cost)}
                  </span>
                  {qualifiesForFreeShipping(subtotal, cOption) && (
                    <span className="font-body-sm text-body-sm text-outline line-through block">
                      {formatRupiah(cOption.cost)}
                    </span>
                  )}
                  <span className="font-label-caps text-label-caps text-outline uppercase">
                    {cOption.tier}
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
};
