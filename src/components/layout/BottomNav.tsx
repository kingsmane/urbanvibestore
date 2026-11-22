import React from 'react';
import { NavigateFn, PageRoute } from './types';

interface BottomNavProps {
  currentPage: PageRoute;
  cartCount: number;
  onNavigate: NavigateFn;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  cartCount,
  onNavigate,
}) => {
  return (
    <nav
      aria-label="Navigasi Bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-canvas-base/95 backdrop-blur-md border-t border-border-hairline px-4 py-2 flex items-center justify-around z-40"
    >
      <button
        type="button"
        onClick={() => onNavigate('home', { category: 'Semua', scrollTo: 'katalog' })}
        className={`flex flex-col items-center py-1 cursor-pointer ${
          currentPage === 'home' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">grid_view</span>
        <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Katalog</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigate('size-guide')}
        className="flex flex-col items-center text-on-surface-variant hover:text-primary py-1 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">straighten</span>
        <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Ukuran</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigate('checkout')}
        className={`flex flex-col items-center py-1 relative cursor-pointer ${
          currentPage === 'checkout'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <div className="relative">
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          <span className="absolute -top-1 -right-2 bg-badge-promo text-text-on-accent font-label-caps text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold rounded-full">
            {cartCount}
          </span>
        </div>
        <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Tas</span>
      </button>
      <button
        type="button"
        onClick={() => onNavigate('account')}
        className={`flex flex-col items-center py-1 cursor-pointer ${
          currentPage === 'account'
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">person</span>
        <span className="font-label-caps text-[10px] uppercase font-bold mt-0.5">Akun</span>
      </button>
    </nav>
  );
};
