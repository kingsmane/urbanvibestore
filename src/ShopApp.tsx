import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Order, OrderItemSnapshot, Product } from './data/storeData';
import { Layout, PageRoute } from './components/Layout';
import { NotFoundView } from './components/NotFoundView';
import type { PlaceOrderOptions } from './components/CheckoutView';
import { useAuth } from './auth/AuthContext';
import { useCart } from './hooks/useCart';
import { useShopData } from './hooks/useShopData';
import { useToast } from './hooks/useToast';
import { describeError, toAppError } from './services/errors';
import { useServices } from './services/ServicesContext';
import type { PlaceOrderInput } from './services/types';
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

type NavOptions = {
  category?: string;
  productId?: string;
  accountTab?: AccountTab;
  scrollTo?: string;
};

const SectionLoader: React.FC<{ label?: string }> = ({ label = 'Memuat…' }) => (
  <div
    role="status"
    className="w-full py-space-xl text-center font-label-caps text-label-caps uppercase text-outline"
  >
    {label}
  </div>
);

/** Aplikasi toko untuk pengguna yang sudah masuk. Di-mount dengan key = id pengguna. */
export default function ShopApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { shop } = useServices();
  const { user, profile, isAdmin, signOut } = useAuth();
  const currentPage: PageRoute = pageFromPath(location.pathname);

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Produk terakhir yang dibuka, dipakai untuk "terapkan ukuran lalu kembali".
  const lastProductIdRef = useRef<string>('prod-1');
  const markProductVisited = useCallback((id: string) => {
    lastProductIdRef.current = id;
  }, []);

  const { toastMessage, toastSubtext, showToast } = useToast();
  const data = useShopData();
  const { cart, addToCart, addBundle, updateQty, removeItem, clearCart, totalItems } = useCart({
    showToast,
    products: data.products,
    storageKey: `urbanstore_cart_v2:${user?.id ?? 'anon'}`,
  });

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

  // Adaptor untuk Layout yang memakai API onNavigate(page, options).
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

  /* ------------------------------ Pesanan ------------------------------ */

  const handlePlaceOrder = async (input: PlaceOrderInput, options: PlaceOrderOptions) => {
    let placed;
    try {
      placed = await shop.placeOrder(input);
    } catch (e) {
      // Stok/harga berubah: muat ulang katalog agar keranjang dan halaman produk akurat.
      const code = toAppError(e).code;
      if (code === 'insufficient_stock' || code === 'item_unavailable') void data.reloadProducts();
      throw e;
    }

    // Menyimpan alamat bersifat opsional; kegagalannya tidak boleh menggagalkan pesanan.
    const addr = options.saveAddress;
    if (addr) {
      const duplicate = data.addresses.some(
        (a) => a.streetAddress === addr.fullAddress && a.postalCode === addr.postalCode
      );
      if (!duplicate) {
        try {
          await data.saveAddress({ ...addr, isPrimary: data.addresses.length === 0 });
        } catch {
          /* abaikan */
        }
      }
    }

    clearCart();
    await data.reloadOrders();
    void data.reloadProducts();
    navigate(paths.order(placed.id));
    showToast(`Pesanan ${placed.orderNumber} dibuat`, 'Selesaikan pembayaran sebelum batas waktu');
  };

  const handleRefreshOrder = useCallback(async () => {
    await data.reloadOrders();
  }, [data]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await shop.cancelOrder(orderId);
      await data.reloadOrders();
      void data.reloadProducts();
      showToast('Pesanan dibatalkan', 'Stok dan kupon dikembalikan');
    } catch (e) {
      showToast('Pesanan tidak dapat dibatalkan', describeError(e));
    }
  };

  const handleReorder = (item: OrderItemSnapshot) => {
    const product = data.products.find((p) => p.id === item.productId);
    if (!product) {
      showToast('Produk tidak lagi tersedia', 'Item ini tidak dapat dipesan ulang');
      return;
    }
    if (addToCart(product, item.size, item.color)) navigate(paths.checkout());
  };

  const handleSubscribeNewsletter = async (email: string) => {
    await shop.subscribeNewsletter(email);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/masuk', { replace: true });
  };

  const accountName = profile?.fullName || user?.email || '';

  if (data.catalogLoading) {
    return <SectionLoader label="Memuat katalog…" />;
  }

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
      account={{ name: accountName, email: user?.email ?? '', isAdmin }}
      onSignOut={handleSignOut}
      onSubscribeNewsletter={handleSubscribeNewsletter}
    >
      {data.catalogError && (
        <div
          role="alert"
          className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-sm"
        >
          <p className="bg-error-container text-on-error-container font-body-sm text-body-sm p-space-sm flex items-center justify-between gap-space-sm">
            <span>{data.catalogError}</span>
            <button type="button" onClick={() => void data.reloadProducts()} className="underline font-semibold cursor-pointer">
              Coba lagi
            </button>
          </p>
        </div>
      )}
      <Suspense fallback={<SectionLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <HomeView
                products={data.products}
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
                products={data.products}
                onVisit={markProductVisited}
                onNavigateHome={(cat) => goHome(cat || 'Semua')}
                onOpenProduct={openProduct}
                onOpenFullSizeGuide={() => navigate(paths.sizeGuide())}
                onAddToCart={(p, size, color) => {
                  addToCart(p, size, color);
                }}
                onBuyNow={(p, size, color) => {
                  if (addToCart(p, size, color)) navigate(paths.checkout());
                }}
                onNotFound={() => goHome('Semua', 'top')}
              />
            }
          />

          <Route
            path="/panduan-ukuran"
            element={
              <SizeGuideView
                fitProfile={data.fitProfile}
                onUpdateFitProfile={(updated) => {
                  void data.saveFitProfile(updated);
                  showToast(
                    `Ukuran Rekomendasi: ${updated.calculatedSize}`,
                    'Tersimpan di My Fit Profile Anda'
                  );
                }}
                onApplyAndReturn={(chosenSize) => {
                  void data.saveFitProfile({
                    ...data.fitProfile,
                    calculatedSize: chosenSize,
                    recommendedTop: `Size ${chosenSize}`,
                  });
                  showToast(
                    `Ukuran ${chosenSize} diterapkan pada produk`,
                    'Toleransi terverifikasi ±1.5 cm'
                  );
                  navigate(paths.product(lastProductIdRef.current));
                }}
                onBack={() =>
                  location.key !== 'default'
                    ? navigate(-1)
                    : navigate(paths.product(lastProductIdRef.current))
                }
              />
            }
          />

          <Route
            path="/checkout"
            element={
              <CheckoutView
                cart={cart}
                profile={profile}
                defaultAddress={data.addresses.find((a) => a.isPrimary) ?? data.addresses[0]}
                onUpdateQty={updateQty}
                onRemoveItem={removeItem}
                onOpenProduct={openProduct}
                onNavigateCatalog={() => goHome()}
                onPlaceOrder={handlePlaceOrder}
                onValidateVoucher={(code, subtotal) => shop.validateVoucher(code, subtotal)}
              />
            }
          />

          <Route
            path="/pesanan/:orderId"
            element={
              <OrderRoute
                orders={data.orders}
                ordersLoaded={data.ordersLoaded}
                onNavigateCatalog={() => goHome()}
                onNavigateAccount={() => navigate(paths.account('orders'))}
                onRefresh={handleRefreshOrder}
                onCancelOrder={handleCancelOrder}
                onMissing={() => navigate(paths.account('orders'), { replace: true })}
              />
            }
          />

          <Route path="/akun" element={<Navigate to={paths.account('orders')} replace />} />
          <Route
            path="/akun/:tab"
            element={
              <AccountRoute
                orders={data.orders}
                addresses={data.addresses}
                fitProfile={data.fitProfile}
                products={data.products}
                profile={profile}
                onSaveAddress={data.saveAddress}
                onSetPrimaryAddress={data.setPrimaryAddress}
                onNavigateHome={() => goHome('Semua', 'top')}
                onNavigateSizeGuide={() => navigate(paths.sizeGuide())}
                onPayOrder={(ord) => navigate(paths.order(ord.id))}
                onCancelOrder={handleCancelOrder}
                onReorderItem={handleReorder}
                onOpenProduct={openProduct}
                onShowToast={showToast}
                onTabChange={(tab) => navigate(paths.account(tab), { replace: true })}
              />
            }
          />

          <Route path="*" element={<NotFoundView onNavigateHome={() => goHome('Semua', 'top')} />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

/* ---------- Route adapters: baca parameter URL, validasi, lalu render view ---------- */

function ProductRoute(
  props: Omit<React.ComponentProps<typeof ProductDetailView>, 'product' | 'allProducts'> & {
    products: Product[];
    onVisit: (id: string) => void;
    onNotFound: () => void;
  }
) {
  const { productId } = useParams();
  const { products, onVisit, onNotFound, ...viewProps } = props;
  const product = products.find((p) => p.id === productId);

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
  return <ProductDetailView {...viewProps} product={product} allProducts={products} />;
}

function OrderRoute({
  orders,
  ordersLoaded,
  onMissing,
  ...viewProps
}: {
  orders: Order[];
  ordersLoaded: boolean;
  onMissing: () => void;
} & Omit<React.ComponentProps<typeof OrderConfirmationView>, 'order'>) {
  const { orderId } = useParams();
  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (ordersLoaded && !order) onMissing();
  }, [ordersLoaded, order, onMissing]);

  if (!order) return <SectionLoader label="Memuat pesanan…" />;
  return <OrderConfirmationView {...viewProps} order={order} />;
}

function AccountRoute(props: Omit<React.ComponentProps<typeof AccountView>, 'initialTab'>) {
  const { tab } = useParams();
  if (!isAccountTab(tab)) return <Navigate to={paths.account('orders')} replace />;
  return <AccountView {...props} initialTab={tab} />;
}
