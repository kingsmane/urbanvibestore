/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_ADDRESSES,
  INITIAL_FIT_PROFILE,
  Order,
  SavedAddress,
  FitProfile,
} from './data/storeData';
import { Layout, PageRoute } from './components/Layout';
import { NotFoundView } from './components/NotFoundView';
import { useCart } from './hooks/useCart';
import { useToast } from './hooks/useToast';
import { isArrayOf, isObjectWith, usePersistentState } from './hooks/usePersistentState';
import { AccountTab, isAccountTab, pageFromPath, paths } from './routes/paths';

const HomeView = lazy(() => import('./components/HomeView').then((m) => ({ default: m.HomeView })));
const ProductDetailView = lazy(() =>
  import('./components/ProductDetailView').then((m) => ({ default: m.ProductDetailView }))
);
const SizeGuideView = lazy(() =>
  import('./components/SizeGuideView').then((m) => ({ default: m.SizeGuideView }))
);
const CheckoutView = lazy(() =>
  import('./components/CheckoutView').then((m) => ({ default: m.CheckoutView }))
);
const OrderConfirmationView = lazy(() =>
  import('./components/OrderConfirmationView').then((m) => ({ default: m.OrderConfirmationView }))
);
const AccountView = lazy(() =>
  import('./components/AccountView').then((m) => ({ default: m.AccountView }))
);

const isOrder = (v: unknown) =>
  isObjectWith<Order>('id', 'orderNumber', 'items', 'total', 'status')(v);
const isAddress = (v: unknown) => isObjectWith<SavedAddress>('id', 'fullAddress')(v);

type NavOptions = {
  category?: string;
  productId?: string;
  accountTab?: AccountTab;
  scrollTo?: string;
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage: PageRoute = pageFromPath(location.pathname);

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Produk terakhir yang dibuka, dipakai untuk "terapkan ukuran lalu kembali".
  const lastProductIdRef = useRef<string>('prod-1');
  const markProductVisited = useCallback((id: string) => {
    lastProductIdRef.current = id;
  }, []);

  const { toastMessage, toastSubtext, showToast } = useToast();
  const { cart, addToCart, addBundle, quickAddCustom, updateQty, removeItem, clearCart, totalItems } =
    useCart(showToast);

  const [orders, setOrders] = usePersistentState<Order[]>(
    'urbanstore_orders_v1',
    INITIAL_ORDERS,
    isArrayOf<Order>(isOrder)
  );
  const [addresses, setAddresses] = usePersistentState<SavedAddress[]>(
    'urbanstore_addresses_v1',
    INITIAL_ADDRESSES,
    isArrayOf<SavedAddress>(isAddress)
  );
  const [fitProfile, setFitProfile] = usePersistentState<FitProfile>(
    'urbanstore_fit_v1',
    INITIAL_FIT_PROFILE,
    isObjectWith<FitProfile>('height', 'weight', 'calculatedSize')
  );

  // Scroll setiap perpindahan halaman (atau ke anchor bila diminta).
  useEffect(() => {
    const target = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (target && target !== 'top') {
      const t = window.setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.key, location.state]);

  const goHome = useCallback(
    (category = 'Semua', scrollTo = 'katalog') => {
      setActiveCategory(category);
      navigate(paths.home(), { state: { scrollTo } });
    },
    [navigate]
  );

  // Adaptor untuk Layout yang masih memakai API onNavigate(page, options).
  const handleNavigate = (page: PageRoute, options?: NavOptions) => {
    if (options?.category) setActiveCategory(options.category);
    const state = { scrollTo: options?.scrollTo };
    switch (page) {
      case 'product-detail':
        navigate(paths.product(options?.productId ?? lastProductIdRef.current), { state });
        break;
      case 'size-guide':
        navigate(paths.sizeGuide(), { state });
        break;
      case 'checkout':
        navigate(paths.checkout(), { state });
        break;
      case 'account':
        navigate(paths.account(options?.accountTab ?? 'orders'), { state });
        break;
      default:
        navigate(paths.home(), { state });
    }
  };

  const openProduct = useCallback(
    (productId: string) => navigate(paths.product(productId)),
    [navigate]
  );

  const handleCompleteOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    navigate(paths.order(newOrder.id));
    showToast(`Pesanan ${newOrder.orderNumber} dibuat`, 'Selesaikan pembayaran dalam 15 menit');
  };

  const handleMarkOrderPaid = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'IN_TRANSIT',
              trackingNumber: 'JT9842109988',
              estimatedArrival: 'Besok, maks 18:00 WIB',
            }
          : o
      )
    );
    showToast('Pembayaran Terverifikasi Otomatis!', 'Status pesanan diperbarui ke Dalam Pengiriman');
  };

  const handleOrderMissing = useCallback(
    () => navigate(paths.account('orders'), { replace: true }),
    [navigate]
  );

  const canGoBack = location.key !== 'default';

  return (
    <Layout
      currentPage={currentPage}
      activeCategory={activeCategory}
      cartCount={totalItems}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNavigate={handleNavigate}
      toastMessage={toastMessage}
      toastSubtext={toastSubtext}
    >
      <Suspense
        fallback={
          <div className="w-full py-space-xl text-center font-label-caps text-label-caps uppercase text-outline">
            Memuat…
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <HomeView
                products={PRODUCTS}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenProduct={openProduct}
                onAddToCart={(p, size, color) => addToCart(p, size, color)}
                onAddBundle={addBundle}
              />
            }
          />

          <Route
            path="/produk/:productId"
            element={
              <ProductRoute
                onVisit={markProductVisited}
                onNavigateHome={(cat) => goHome(cat || 'Semua')}
                onOpenProduct={openProduct}
                onOpenFullSizeGuide={() => navigate(paths.sizeGuide())}
                onAddToCart={(p, size, color) => addToCart(p, size, color)}
                onBuyNow={(p, size, color) => {
                  addToCart(p, size, color);
                  navigate(paths.checkout());
                }}
                onQuickAddCustom={quickAddCustom}
                onNotFound={() => goHome('Semua', 'top')}
              />
            }
          />

          <Route
            path="/panduan-ukuran"
            element={
              <SizeGuideView
                fitProfile={fitProfile}
                onUpdateFitProfile={(updated) => {
                  setFitProfile(updated);
                  showToast(
                    `Ukuran Rekomendasi: ${updated.calculatedSize}`,
                    'Tersimpan di My Fit Profile Anda'
                  );
                }}
                onApplyAndReturn={(chosenSize) => {
                  setFitProfile((prev) => ({
                    ...prev,
                    calculatedSize: chosenSize,
                    recommendedTop: `Size ${chosenSize}`,
                  }));
                  showToast(
                    `Ukuran ${chosenSize} diterapkan pada produk`,
                    'Toleransi terverifikasi ±1.5 cm'
                  );
                  navigate(paths.product(lastProductIdRef.current));
                }}
                onBack={() =>
                  canGoBack ? navigate(-1) : navigate(paths.product(lastProductIdRef.current))
                }
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <CheckoutView
                cart={cart}
                onUpdateQty={updateQty}
                onRemoveItem={removeItem}
                onOpenProduct={openProduct}
                onNavigateCatalog={() => goHome()}
                onCompleteOrder={handleCompleteOrder}
              />
            }
          />

          <Route
            path="/pesanan/:orderId"
            element={
              <OrderRoute
                orders={orders}
                onNavigateCatalog={() => goHome()}
                onNavigateAccount={() => navigate(paths.account('orders'))}
                onMarkOrderPaid={handleMarkOrderPaid}
                onMissing={handleOrderMissing}
              />
            }
          />

          <Route path="/akun" element={<Navigate to={paths.account('orders')} replace />} />
          <Route
            path="/akun/:tab"
            element={
              <AccountRoute
                orders={orders}
                addresses={addresses}
                fitProfile={fitProfile}
                onUpdateAddresses={setAddresses}
                onNavigateHome={() => goHome('Semua', 'top')}
                onNavigateSizeGuide={() => navigate(paths.sizeGuide())}
                onPayOrder={(ord) => navigate(paths.order(ord.id))}
                onReorderItem={(name, price, image) => {
                  quickAddCustom(name, price, image, 'Aksesoris');
                  navigate(paths.checkout());
                }}
                onOpenProduct={openProduct}
                onShowToast={showToast}
                onTabChange={(tab) => navigate(paths.account(tab), { replace: true })}
              />
            }
          />

          <Route
            path="*"
            element={<NotFoundView onNavigateHome={() => goHome('Semua', 'top')} />}
          />
        </Routes>
      </Suspense>
    </Layout>
  );
}

/* ---------- Route adapters: baca parameter URL, validasi, lalu render view ---------- */

function ProductRoute(
  props: Omit<React.ComponentProps<typeof ProductDetailView>, 'product' | 'allProducts'> & {
    onVisit: (id: string) => void;
    onNotFound: () => void;
  }
) {
  const { productId } = useParams();
  const { onVisit, onNotFound, ...viewProps } = props;
  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    if (product) onVisit(product.id);
  }, [product, onVisit]);

  if (!product) {
    return (
      <NotFoundView
        title="Produk tidak ditemukan"
        message="Produk ini tidak tersedia atau tautannya sudah tidak berlaku."
        onNavigateHome={onNotFound}
      />
    );
  }
  return <ProductDetailView {...viewProps} product={product} allProducts={PRODUCTS} />;
}

function OrderRoute({
  orders,
  onMissing,
  ...viewProps
}: {
  orders: Order[];
  onMissing: () => void;
} & Omit<React.ComponentProps<typeof OrderConfirmationView>, 'order'>) {
  const { orderId } = useParams();
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (!order) onMissing();
  }, [order, onMissing]);

  if (!order) return null;
  return <OrderConfirmationView {...viewProps} order={order} />;
}

function AccountRoute(props: Omit<React.ComponentProps<typeof AccountView>, 'initialTab'>) {
  const { tab } = useParams();
  if (!isAccountTab(tab)) return <Navigate to={paths.account('orders')} replace />;
  return <AccountView {...props} initialTab={tab} />;
}
