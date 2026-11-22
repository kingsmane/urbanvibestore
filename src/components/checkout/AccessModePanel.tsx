import React from 'react';
import type { AccessMode } from './types';

interface AccessModePanelProps {
  accessMode: AccessMode;
  handleSwitchMode: (mode: AccessMode) => void;
}

export const AccessModePanel: React.FC<AccessModePanelProps> = ({
  accessMode,
  handleSwitchMode,
}) => {
  return (
    <div className="bg-canvas-base p-space-lg shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
        <div>
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block">
            Metode Masuk
          </span>
          <p className="font-headline-sm text-headline-sm uppercase text-on-surface">
            Pilihan Akses Pesanan
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleSwitchMode(accessMode === 'guest' ? 'member' : 'guest')}
          className="inline-flex items-center gap-space-xs text-on-surface hover:text-secondary font-label-caps text-label-caps uppercase tracking-wider transition-colors cursor-pointer"
        >
          <span>
            {accessMode === 'guest'
              ? 'Sudah punya akun? Masuk (Naya)'
              : 'Aktif sebagai: Naya Rahmadani'}
          </span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mt-space-sm">
        <button
          type="button"
          onClick={() => handleSwitchMode('guest')}
          className={`p-space-sm flex items-center justify-between text-left transition-colors cursor-pointer ${
            accessMode === 'guest'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-muted text-on-surface hover:bg-surface-variant'
          }`}
        >
          <div>
            <span
              className={`font-label-caps text-label-caps uppercase block ${
                accessMode === 'guest' ? 'text-badge-promo' : 'text-outline'
              }`}
            >
              Rekomendasi Cepat
            </span>
            <span className="font-headline-sm text-headline-sm uppercase">
              Checkout Tamu
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[20px] ${
              accessMode === 'guest' ? 'text-badge-promo' : 'text-outline'
            }`}
          >
            bolt
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchMode('member')}
          className={`p-space-sm flex items-center justify-between text-left transition-colors cursor-pointer ${
            accessMode === 'member'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-muted text-on-surface hover:bg-surface-variant'
          }`}
        >
          <div>
            <span
              className={`font-label-caps text-label-caps uppercase block ${
                accessMode === 'member' ? 'text-badge-promo' : 'text-outline'
              }`}
            >
              Anggota UrbanStore
            </span>
            <span
              className={`font-headline-sm text-headline-sm uppercase ${
                accessMode === 'member' ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              Sinkronisasi Poin
            </span>
          </div>
          <span
            className={`material-symbols-outlined text-[20px] ${
              accessMode === 'member' ? 'text-badge-promo' : 'text-outline'
            }`}
          >
            person
          </span>
        </button>
      </div>
    </div>
  );
};
