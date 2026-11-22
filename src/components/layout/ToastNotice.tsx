import React from 'react';
import { NavigateFn } from './types';

interface ToastNoticeProps {
  onNavigate: NavigateFn;
  toastMessage: string | null;
  toastSubtext: string | undefined;
}

export const ToastNotice: React.FC<ToastNoticeProps> = ({
  onNavigate,
  toastMessage,
  toastSubtext,
}) => {
  return (
    <aside
      aria-live="polite"
      role="status"
      className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 bg-primary text-on-primary px-4 py-3 shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 ${
        toastMessage
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 pointer-events-none'
      }`}
    >
      <div className="w-6 h-6 bg-badge-promo text-text-on-accent flex items-center justify-center font-bold text-xs shrink-0">
        ✓
      </div>
      <div>
        <p className="font-body-sm text-body-sm font-semibold">
          {toastMessage || 'Produk ditambahkan ke keranjang'}
        </p>
        {toastSubtext && (
          <span className="font-label-caps text-[10px] text-badge-promo uppercase block">
            {toastSubtext}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onNavigate('checkout')}
        className="ml-2 px-2 py-1 bg-canvas-base text-primary font-label-caps text-[10px] uppercase font-bold hover:bg-badge-promo transition-colors cursor-pointer"
      >
        Lihat Tas
      </button>
    </aside>
  );
};
