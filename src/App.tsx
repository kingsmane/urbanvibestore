/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  PRODUCTS,
  INITIAL_CART,
  INITIAL_ORDERS,
  INITIAL_ADDRESSES,
  INITIAL_FIT_PROFILE,
  Product,
  CartItem,
  Order,
  SavedAddress,
  FitProfile,
} from './data/storeData';
import { Layout, PageRoute } from './components/Layout';
import { HomeView } from './components/HomeView';
import { ProductDetailView } from './components/ProductDetailView';
import { SizeGuideView } from './components/SizeGuideView';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmationView } from './components/OrderConfirmationView';
import { AccountView } from './components/AccountView';

const STORAGE_KEYS = {
  CART: 'urbanstore_cart_v1',
  ORDERS: 'urbanstore_orders_v1',
  ADDRESSES: 'urbanstore_addresses_v1',
  FIT_PROFILE: 'urbanstore_fit_v1',
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [previousPage, setPreviousPage] = useState<PageRoute>('product-detail');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-1');
  const [accountTab, setAccountTab] = useState<'orders' | 'addresses' | 'fitprofile' | 'settings'>(
    'orders'
  );

  // Persistent state: Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_CART;
  });

  // Persistent state: Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  // Active order for OrderConfirmationView
  const [activeConfirmationOrder, setActiveConfirmationOrder] = useState<Order>(() => {
    return INITIAL_ORDERS[0];
  });

  // Persistent state: Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADDRESSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ADDRESSES;
  });

  // Persistent state: Fit Profile
  const [fitProfile, setFitProfile] = useState<FitProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FIT_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_FIT_PROFILE;
  });

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSubtext, setToastSubtext] = useState<string | undefined>(undefined);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(addresses));
    } catch {
      // ignore
    }
  }, [addresses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FIT_PROFILE, JSON.stringify(fitProfile));
    } catch {
      // ignore
    }
  }, [fitProfile]);

  const showToast = (msg: string, sub?: string) => {
    setToastMessage(msg);
    setToastSubtext(sub);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  const handleNavigate = (
    page: PageRoute,
    options?: {
      category?: string;
      productId?: string;
      accountTab?: 'orders' | 'addresses' | 'fitprofile' | 'settings';
      scrollTo?: string;
    }
  ) => {
    if (page !== currentPage) {
      setPreviousPage(currentPage);
    }
    if (options?.category) {
      setActiveCategory(options.category);
    }
    if (options?.productId) {
      setSelectedProductId(options.productId);
    }
    if (options?.accountTab) {
      setAccountTab(options.accountTab);
    }
    setCurrentPage(page);

    if (options?.scrollTo && options.scrollTo !== 'top') {
      setTimeout(() => {
        const el = document.getElementById(options.scrollTo!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenProduct = (productId: string) => {
    setSelectedProductId(productId);
    setPreviousPage(currentPage);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, size?: string, color?: string) => {
    if (product.isSoldOut) return;
    const chosenSize = size || product.defaultSize;
    const chosenColor = color || product.colors[0]?.name || 'Default';

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.productId === product.id && item.size === chosenSize && item.color === chosenColor
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        sku: `${product.sku}-${chosenSize}`,
        name: product.shortName,
        price: product.price,
        color: chosenColor,
        size: chosenSize,
        quantity: 1,
        image: product.image,
        badgeText: product.category === 'Pria' ? 'Esensial' : 'New',
        badgeVariant: product.category === 'Pria' ? 'promo' : 'dark',
      };
      return [...prev, newItem];
    });

    showToast(`Ditambahkan: ${product.shortName} (${chosenSize})`);
  };

  const handleAddBundle = () => {
    const tee = PRODUCTS.find((p) => p.id === 'prod-1');
    const trousers = PRODUCTS.find((p) => p.id === 'prod-3');
    if (tee) handleAddToCart(tee, 'L', 'Charcoal Black');
    if (trousers) handleAddToCart(trousers, '28', 'Ink Black');
    showToast('2 Produk Ansambel Lookbook ditambahkan ke tas');
  };

  const handleBuyNow = (product: Product, size: string, color: string) => {
    handleAddToCart(product, size, color);
    setPreviousPage(currentPage);
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAddCustom = (
    name: string,
    price: number,
    image: string,
    categoryLabel: string
  ) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.name === name);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}`,
          productId: 'prod-1',
          sku: `UB-PAIR-${Math.floor(100 + Math.random() * 899)}`,
          name,
          price,
          color: 'Archive Black',
          size: categoryLabel === 'Alas Kaki' ? '42' : 'OS',
          quantity: 1,
          image,
          badgeText: 'Kurasi',
          badgeVariant: 'dark',
        },
      ];
    });
    showToast(`Ditambahkan: ${name}`);
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
      })
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    const removed = cart.find((c) => c.id === itemId);
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    if (removed) {
      showToast(`Dihapus dari tas: ${removed.name}`, 'Ringkasan tas diperbarui');
    }
  };

  const handleCompleteOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setActiveConfirmationOrder(newOrder);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(
      `Pesanan ${newOrder.orderNumber} dibuat`,
      'Selesaikan pembayaran dalam 15 menit'
    );
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
    setActiveConfirmationOrder((prev) => ({
      ...prev,
      status: 'IN_TRANSIT',
    }));
    showToast('Pembayaran Terverifikasi Otomatis!', 'Status pesanan diperbarui ke Dalam Pengiriman');
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const selectedProduct =
    PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  return (
    <Layout
      currentPage={currentPage}
      activeCategory={activeCategory}
      cartCount={totalCartItems}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNavigate={handleNavigate}
      toastMessage={toastMessage}
      toastSubtext={toastSubtext}
    >
      {currentPage === 'home' && (
        <HomeView
          products={PRODUCTS}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenProduct={handleOpenProduct}
          onAddToCart={handleAddToCart}
          onAddBundle={handleAddBundle}
        />
      )}

      {currentPage === 'product-detail' && (
        <ProductDetailView
          product={selectedProduct}
          allProducts={PRODUCTS}
          onNavigateHome={(cat) =>
            handleNavigate('home', { category: cat || 'Semua', scrollTo: 'katalog' })
          }
          onOpenProduct={handleOpenProduct}
          onOpenFullSizeGuide={() => handleNavigate('size-guide')}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onQuickAddCustom={handleQuickAddCustom}
        />
      )}

      {currentPage === 'size-guide' && (
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
            setCurrentPage('product-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBack={() => {
            setCurrentPage(previousPage === 'size-guide' ? 'product-detail' : previousPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {currentPage === 'checkout' && (
        <CheckoutView
          cart={cart}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveCartItem}
          onOpenProduct={handleOpenProduct}
          onNavigateCatalog={() =>
            handleNavigate('home', { category: 'Semua', scrollTo: 'katalog' })
          }
          onCompleteOrder={handleCompleteOrder}
        />
      )}

      {currentPage === 'order-confirmation' && (
        <OrderConfirmationView
          order={activeConfirmationOrder}
          onNavigateCatalog={() =>
            handleNavigate('home', { category: 'Semua', scrollTo: 'katalog' })
          }
          onNavigateAccount={() => handleNavigate('account', { accountTab: 'orders' })}
          onMarkOrderPaid={handleMarkOrderPaid}
        />
      )}

      {currentPage === 'account' && (
        <AccountView
          orders={orders}
          addresses={addresses}
          fitProfile={fitProfile}
          initialTab={accountTab}
          onUpdateAddresses={setAddresses}
          onNavigateHome={() => handleNavigate('home', { category: 'Semua', scrollTo: 'top' })}
          onNavigateSizeGuide={() => handleNavigate('size-guide')}
          onPayOrder={(ord) => {
            setActiveConfirmationOrder(ord);
            setCurrentPage('order-confirmation');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onReorderItem={(name, price, image) => {
            handleQuickAddCustom(name, price, image, 'Aksesoris');
            setCurrentPage('checkout');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenProduct={handleOpenProduct}
          onShowToast={showToast}
        />
      )}
    </Layout>
  );
}
