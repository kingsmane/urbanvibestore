import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '../data/storeData';
import { isArrayOf, isObjectWith, usePersistentState } from './usePersistentState';
import { useCart } from './useCart';

const tee = PRODUCTS.find((p) => p.id === 'prod-1')!; // stok: S3 M12 L15 XL0 XXL1
const blazerSoldOut = PRODUCTS.find((p) => p.isSoldOut)!;

describe('usePersistentState', () => {
  const isNumArr = isArrayOf<number>((x) => typeof x === 'number');

  it('memakai nilai awal bila storage kosong', () => {
    const { result } = renderHook(() => usePersistentState<number[]>('k', [1], isNumArr));
    expect(result.current[0]).toEqual([1]);
  });

  it('memulihkan nilai valid dari storage', () => {
    localStorage.setItem('k', JSON.stringify([5, 6]));
    const { result } = renderHook(() => usePersistentState<number[]>('k', [1], isNumArr));
    expect(result.current[0]).toEqual([5, 6]);
  });

  it('menolak data rusak/bentuk salah dan kembali ke nilai awal', () => {
    localStorage.setItem('k', '{bukan json');
    const a = renderHook(() => usePersistentState<number[]>('k', [1], isNumArr));
    expect(a.result.current[0]).toEqual([1]);

    localStorage.setItem('k2', JSON.stringify(['x']));
    const b = renderHook(() => usePersistentState<number[]>('k2', [9], isNumArr));
    expect(b.result.current[0]).toEqual([9]);
  });

  it('menyimpan perubahan ke storage', () => {
    const { result } = renderHook(() => usePersistentState<number[]>('k', [], isNumArr));
    act(() => result.current[1]([7]));
    expect(JSON.parse(localStorage.getItem('k')!)).toEqual([7]);
  });

  it('isObjectWith memeriksa kunci wajib', () => {
    const check = isObjectWith<{ a: number }>('a');
    expect(check({ a: 1 })).toBe(true);
    expect(check({})).toBe(false);
    expect(check(null)).toBe(false);
    expect(check([])).toBe(false);
  });
});

describe('useCart', () => {
  const setup = (showToast = vi.fn(), storageKey?: string) =>
    renderHook(() => useCart({ showToast, products: PRODUCTS, storageKey }));

  it('keranjang awal kosong', () => {
    const { result } = setup();
    expect(result.current.cart).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('menambah produk dan menggabungkan varian yang sama', () => {
    const toast = vi.fn();
    const { result } = setup(toast);
    act(() => void result.current.addToCart(tee, 'M', 'Chalk White'));
    act(() => void result.current.addToCart(tee, 'M', 'Chalk White'));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(toast).toHaveBeenCalled();
  });

  it('ukuran/warna berbeda menjadi baris terpisah', () => {
    const { result } = setup();
    act(() => void result.current.addToCart(tee, 'M', 'Chalk White'));
    act(() => void result.current.addToCart(tee, 'L', 'Chalk White'));
    expect(result.current.cart).toHaveLength(2);
  });

  it('produk habis tidak bisa ditambahkan', () => {
    const { result } = setup();
    let ok = true;
    act(() => {
      ok = result.current.addToCart(blazerSoldOut);
    });
    expect(ok).toBe(false);
    expect(result.current.cart).toHaveLength(0);
  });

  it('qty tidak melebihi stok ukuran (PRD CART-07)', () => {
    const toast = vi.fn();
    const { result } = setup(toast);
    // ukuran XXL stok 1
    act(() => void result.current.addToCart(tee, 'XXL', 'Chalk White'));
    expect(result.current.cart[0].quantity).toBe(1);
    let ok = true;
    act(() => {
      ok = result.current.addToCart(tee, 'XXL', 'Chalk White');
    });
    expect(ok).toBe(false);
    expect(result.current.cart[0].quantity).toBe(1);
    expect(toast).toHaveBeenLastCalledWith(expect.stringContaining('hanya 1'), expect.any(String));
  });

  it('stok dibagi lintas warna pada ukuran yang sama', () => {
    const { result } = setup();
    act(() => void result.current.addToCart(tee, 'XXL', 'Chalk White'));
    let ok = true;
    act(() => {
      ok = result.current.addToCart(tee, 'XXL', 'Charcoal Black');
    });
    expect(ok).toBe(false);
    expect(result.current.cart).toHaveLength(1);
  });

  it('updateQty dibatasi stok dan minimal 1; item dapat dihapus', () => {
    const { result } = setup();
    // ukuran S stok 3
    act(() => void result.current.addToCart(tee, 'S', 'Chalk White'));
    const id = result.current.cart[0].id;
    act(() => result.current.updateQty(id, 10));
    expect(result.current.cart[0].quantity).toBe(1); // 11 > stok 3, ditolak
    act(() => result.current.updateQty(id, 2));
    expect(result.current.cart[0].quantity).toBe(3);
    act(() => result.current.updateQty(id, 1));
    expect(result.current.cart[0].quantity).toBe(3);
    act(() => result.current.updateQty(id, -9));
    expect(result.current.cart[0].quantity).toBe(1);
    act(() => result.current.removeItem(id));
    expect(result.current.cart).toHaveLength(0);
  });

  it('bundle menambah dua produk; clearCart mengosongkan', () => {
    const { result } = setup();
    act(() => result.current.addBundle());
    expect(result.current.cart).toHaveLength(2);
    act(() => result.current.clearCart());
    expect(result.current.cart).toHaveLength(0);
  });

  it('cart dipulihkan dari localStorage per kunci pengguna', () => {
    const first = setup(vi.fn(), 'cart:user-a');
    act(() => void first.result.current.addToCart(tee, 'M', 'Chalk White'));
    first.unmount();

    const same = setup(vi.fn(), 'cart:user-a');
    expect(same.result.current.cart).toHaveLength(1);
    const other = setup(vi.fn(), 'cart:user-b');
    expect(other.result.current.cart).toHaveLength(0); // keranjang tidak bocor antar akun
  });
});
