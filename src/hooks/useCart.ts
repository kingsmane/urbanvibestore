import { useCallback, useMemo } from 'react';
import { CartItem, INITIAL_CART, PRODUCTS, Product } from '../data/storeData';
import { isArrayOf, usePersistentState } from './usePersistentState';

const isCartItem = (v: unknown): boolean =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as CartItem).id === 'string' &&
  typeof (v as CartItem).productId === 'string' &&
  typeof (v as CartItem).price === 'number' &&
  typeof (v as CartItem).quantity === 'number';

export function useCart(showToast: (msg: string, sub?: string) => void) {
  const [cart, setCart] = usePersistentState<CartItem[]>(
    'urbanstore_cart_v1',
    INITIAL_CART,
    isArrayOf<CartItem>(isCartItem)
  );

  const addToCart = useCallback(
    (product: Product, size?: string, color?: string, silent = false) => {
      if (product.isSoldOut) return;
      const chosenSize = size || product.defaultSize;
      const chosenColor = color || product.colors[0]?.name || 'Default';

      setCart((prev) => {
        const idx = prev.findIndex(
          (i) => i.productId === product.id && i.size === chosenSize && i.color === chosenColor
        );
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
          return updated;
        }
        return [
          ...prev,
          {
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
          },
        ];
      });
      if (!silent) showToast(`Ditambahkan: ${product.shortName} (${chosenSize})`);
    },
    [setCart, showToast]
  );

  const addBundle = useCallback(() => {
    const tee = PRODUCTS.find((p) => p.id === 'prod-1');
    const trousers = PRODUCTS.find((p) => p.id === 'prod-3');
    if (tee) addToCart(tee, 'L', 'Charcoal Black', true);
    if (trousers) addToCart(trousers, '28', 'Ink Black', true);
    showToast('2 Produk Ansambel Lookbook ditambahkan ke tas');
  }, [addToCart, showToast]);

  const quickAddCustom = useCallback(
    (name: string, price: number, image: string, categoryLabel: string) => {
      setCart((prev) => {
        const idx = prev.findIndex((c) => c.name === name);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
          return updated;
        }
        return [
          ...prev,
          {
            id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    },
    [setCart, showToast]
  );

  const updateQty = useCallback(
    (itemId: string, delta: number) =>
      setCart((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
        )
      ),
    [setCart]
  );

  const removeItem = useCallback(
    (itemId: string) => {
      const removed = cart.find((c) => c.id === itemId);
      setCart((prev) => prev.filter((i) => i.id !== itemId));
      if (removed) showToast(`Dihapus dari tas: ${removed.name}`, 'Ringkasan tas diperbarui');
    },
    [cart, setCart, showToast]
  );

  const clearCart = useCallback(() => setCart([]), [setCart]);
  const totalItems = useMemo(() => cart.reduce((a, i) => a + i.quantity, 0), [cart]);

  return { cart, addToCart, addBundle, quickAddCustom, updateQty, removeItem, clearCart, totalItems };
}
