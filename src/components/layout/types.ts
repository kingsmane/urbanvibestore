export type PageRoute =
  | 'home'
  | 'product-detail'
  | 'size-guide'
  | 'checkout'
  | 'order-confirmation'
  | 'account'
  | 'not-found';

export type NavigateFn = (
  page: PageRoute,
  options?: {
    category?: string;
    productId?: string;
    accountTab?: 'orders' | 'addresses' | 'fitprofile' | 'settings';
    scrollTo?: string;
  }
) => void;

export interface InfoContent {
  title: string;
  subtitle: string;
  content: string[];
}
