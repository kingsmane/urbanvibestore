import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '../data/storeData';
import { isArrayOf, isObjectWith, usePersistentState } from './usePersistentState';
import { useCart } from './useCart';

const tee = PRODUCTS.find((p) => p.id === 'prod-1')!;
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
  it('keranjang awal kosong', () => {
    const { result } = renderHook(() => useCart(vi.fn()));
    expect(result.current.cart).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('menambah produk dan menggabungkan varian yang sama', () => {
    const toast = vi.fn();
    const { result } = renderHook(() => useCart(toast));
    act(() => result.current.addToCart(tee, 'M', 'Chalk White'));
    act(() => result.current.addToCart(tee, 'M', 'Chalk White'));
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(toast).toHaveBeenCalled();
  });

  it('ukuran/warna berbeda menjadi baris terpisah', () => {
    const { result } = renderHook(() => useCart(vi.fn()));
    act(() => result.current.addToCart(tee, 'M', 'Chalk White'));
    act(() => result.current.addToCart(tee, 'L', 'Chalk White'));
    expect(result.current.cart).toHaveLength(2);
  });

  it('produk habis tidak bisa ditambahkan', () => {
    const { result } = renderHook(() => useCart(vi.fn()));
    act(() => result.current.addToCart(blazerSoldOut));
    expect(result.current.cart).toHaveLength(0);
  });

  it('qty tidak turun di bawah 1 dan item bisa dihapus', () => {
    const { result } = renderHook(() => useCart(vi.fn()));
    act(() => result.current.addToCart(tee, 'M', 'Chalk White'));
    const id = result.current.cart[0].id;
    act(() => result.current.updateQty(id, -5));
    expect(result.current.cart[0].quantity).toBe(1);
    act(() => result.current.updateQty(id, 2));
    expect(result.current.cart[0].quantity).toBe(3);
    act(() => result.current.removeItem(id));
    expect(result.current.cart).toHaveLength(0);
  });

  it('bundle menambah dua produk; clearCart mengosongkan', () => {
    const { result } = renderHook(() => useCart(vi.fn()));
    act(() => result.current.addBundle());
    expect(result.current.cart).toHaveLength(2);
    act(() => result.current.clearCart());
    expect(result.current.cart).toHaveLength(0);
  });

  it('cart dipulihkan dari localStorage', () => {
    const first = renderHook(() => useCart(vi.fn()));
    act(() => first.result.current.addToCart(tee, 'M', 'Chalk White'));
    first.unmount();
    const second = renderHook(() => useCart(vi.fn()));
    expect(second.result.current.cart).toHaveLength(1);
  });
});
