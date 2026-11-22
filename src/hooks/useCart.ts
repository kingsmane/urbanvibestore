import { useCallback, useMemo } from 'react';
import type { CartItem, Product } from '../data/storeData';
import { isArrayOf, usePersistentState } from './usePersistentState';

const isCartItem = (v: unknown): boolean =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as CartItem).id === 'string' &&
  typeof (v as CartItem).productId === 'string' &&
  typeof (v as CartItem).price === 'number' &&
  typeof (v as CartItem).quantity === 'number';

interface UseCartOptions {
  showToast: (msg: string, sub?: string) => void;
  /** Katalog terkini; dipakai membatasi jumlah sesuai stok. */
  products: Product[];
  /** Kunci penyimpanan; sertakan id pengguna agar keranjang tidak tercampur antar akun. */
  storageKey?: string;
}

export function useCart({ showToast, products, storageKey = 'urbanstore_cart_v2' }: UseCartOptions) {
  const [cart, setCart] = usePersistentState<CartItem[]>(storageKey, [], isArrayOf<CartItem>(isCartItem));

  const stockFor = useCallback(
    (productId: string, size: string): number | null => {
      const product = products.find((p) => p.id === productId);
      const variant = product?.sizes.find((s) => s.code === size);
      return variant ? variant.stock : null; // null = tidak diketahui (jangan membatasi)
    },
    [products]
  );

  /** Stok dihitung per ukuran, jadi seluruh warna pada ukuran yang sama berbagi stok. */
  const quantityInCart = useCallback(
    (items: CartItem[], productId: string, size: string, exceptItemId?: string) =>
      items
        .filter((i) => i.productId === productId && i.size === size && i.id !== exceptItemId)
        .reduce((sum, i) => sum + i.quantity, 0),
    []
  );

  const addToCart = useCallback(
    (product: Product, size?: string, color?: string, silent = false): boolean => {
      if (product.isSoldOut) return false;
      const chosenSize = size || product.defaultSize;
      const chosenColor = color || product.colors[0]?.name || 'Default';

      const stock = stockFor(product.id, chosenSize);
      if (stock !== null && quantityInCart(cart, product.id, chosenSize) + 1 > stock) {
        showToast(
          stock === 0
            ? `${product.shortName} ukuran ${chosenSize} habis`
            : `Stok ${product.shortName} ukuran ${chosenSize} hanya ${stock}`,
          'Jumlah di keranjang sudah mencapai stok tersedia'
        );
        return false;
      }

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
      return true;
    },
    [cart, quantityInCart, setCart, showToast, stockFor]
  );

  const addBundle = useCallback(() => {
    const tee = products.find((p) => p.id === 'prod-1');
    const trousers = products.find((p) => p.id === 'prod-3');
    let added = 0;
    if (tee && addToCart(tee, 'L', 'Charcoal Black', true)) added += 1;
    if (trousers && addToCart(trousers, '28', 'Ink Black', true)) added += 1;
    if (added > 0) showToast(`${added} Produk Ansambel Lookbook ditambahkan ke tas`);
  }, [addToCart, products, showToast]);

  const updateQty = useCallback(
    (itemId: string, delta: number) => {
      const item = cart.find((i) => i.id === itemId);
      if (!item) return;
      const next = Math.max(1, item.quantity + delta);
      const stock = stockFor(item.productId, item.size);
      if (delta > 0 && stock !== null) {
        const others = quantityInCart(cart, item.productId, item.size, item.id);
        if (others + next > stock) {
          showToast(`Stok ${item.name} ukuran ${item.size} hanya ${stock}`, 'Jumlah tidak dapat ditambah lagi');
          return;
        }
      }
      setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: next } : i)));
    },
    [cart, quantityInCart, setCart, showToast, stockFor]
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

  return { cart, addToCart, addBundle, updateQty, removeItem, clearCart, totalItems };
}
