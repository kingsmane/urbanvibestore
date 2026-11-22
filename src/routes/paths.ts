import type { PageRoute } from '../components/Layout';

export type AccountTab = 'orders' | 'addresses' | 'fitprofile' | 'settings';
export const ACCOUNT_TABS: AccountTab[] = ['orders', 'addresses', 'fitprofile', 'settings'];

export const isAccountTab = (v: string | undefined): v is AccountTab =>
  !!v && (ACCOUNT_TABS as string[]).includes(v);

export const paths = {
  home: () => '/',
  product: (id: string) => `/produk/${encodeURIComponent(id)}`,
  sizeGuide: () => '/panduan-ukuran',
  checkout: () => '/checkout',
  order: (id: string) => `/pesanan/${encodeURIComponent(id)}`,
  account: (tab: AccountTab = 'orders') => `/akun/${tab}`,
};

/** Menentukan halaman aktif (untuk highlight navigasi) dari pathname. */
export function pageFromPath(pathname: string): PageRoute {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/produk/')) return 'product-detail';
  if (pathname === '/panduan-ukuran') return 'size-guide';
  if (pathname === '/checkout') return 'checkout';
  if (pathname.startsWith('/pesanan/')) return 'order-confirmation';
  if (pathname === '/akun' || pathname.startsWith('/akun/')) return 'account';
  return 'not-found';
}
