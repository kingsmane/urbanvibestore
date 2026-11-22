import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/storeData';
import { filterAndSortProducts } from './catalog';
import { computeRecommendedSize, recommendedBottomSize } from './sizing';

describe('computeRecommendedSize', () => {
  it('batas skor: 96 -> M, 109 -> L, 122 -> XL, 135 -> XXL', () => {
    // skor = 0.4h + 0.6w; h=w=s menghasilkan skor s
    expect(computeRecommendedSize(95, 95, 'regular')).toBe('S');
    expect(computeRecommendedSize(96, 96, 'regular')).toBe('M');
    expect(computeRecommendedSize(109, 109, 'regular')).toBe('L');
    expect(computeRecommendedSize(122, 122, 'regular')).toBe('XL');
    expect(computeRecommendedSize(135, 135, 'regular')).toBe('XXL');
  });

  it('slim turun satu ukuran untuk L/XL/XXL, tetapi tidak untuk S/M', () => {
    expect(computeRecommendedSize(110, 110, 'slim')).toBe('M'); // L -> M
    expect(computeRecommendedSize(125, 125, 'slim')).toBe('L'); // XL -> L
    expect(computeRecommendedSize(140, 140, 'slim')).toBe('XL'); // XXL -> XL
    expect(computeRecommendedSize(95, 95, 'slim')).toBe('S');
    expect(computeRecommendedSize(100, 100, 'slim')).toBe('M');
  });

  it('oversized menaikkan S menjadi M saja', () => {
    expect(computeRecommendedSize(95, 95, 'oversized')).toBe('M');
    expect(computeRecommendedSize(110, 110, 'oversized')).toBe('L');
  });

  it('hasil selalu salah satu ukuran valid', () => {
    for (const pref of ['slim', 'regular', 'oversized'] as const) {
      for (let h = 140; h <= 200; h += 10) {
        for (let w = 40; w <= 130; w += 10) {
          expect(['S', 'M', 'L', 'XL', 'XXL']).toContain(computeRecommendedSize(h, w, pref));
        }
      }
    }
  });
});

describe('recommendedBottomSize', () => {
  it('berdasarkan berat badan', () => {
    expect(recommendedBottomSize(50)).toBe('Size 27');
    expect(recommendedBottomSize(58)).toBe('Size 29');
    expect(recommendedBottomSize(67)).toBe('Size 29');
    expect(recommendedBottomSize(68)).toBe('Size 31');
  });
});

describe('filterAndSortProducts', () => {
  const names = (list: typeof PRODUCTS) => list.map((p) => p.id);

  it('"Semua" tanpa query mengembalikan seluruh produk', () => {
    expect(filterAndSortProducts(PRODUCTS, 'Semua', '', 'terbaru')).toHaveLength(PRODUCTS.length);
  });

  it('memfilter berdasarkan kategori', () => {
    const wanita = filterAndSortProducts(PRODUCTS, 'Wanita', '', 'terbaru');
    expect(wanita.length).toBeGreaterThan(0);
    expect(wanita.every((p) => p.category === 'Wanita')).toBe(true);
  });

  it('pencarian tidak peka huruf besar/kecil dan mengabaikan spasi tepi', () => {
    const r = filterAndSortProducts(PRODUCTS, 'Semua', '  LINEN ', 'terbaru');
    expect(names(r)).toContain('prod-2');
  });

  it('pencarian meliputi tagLabel dan subKategori', () => {
    expect(names(filterAndSortProducts(PRODUCTS, 'Semua', 'kojima', 'terbaru'))).toContain('prod-5');
    expect(names(filterAndSortProducts(PRODUCTS, 'Semua', 'outerwear', 'terbaru'))).toContain('prod-4');
  });

  it('kategori dan pencarian digabung (AND)', () => {
    expect(filterAndSortProducts(PRODUCTS, 'Pria', 'linen', 'terbaru').map((p) => p.id)).toEqual(['prod-2']);
    expect(filterAndSortProducts(PRODUCTS, 'Wanita', 'linen', 'terbaru')).toEqual([]);
  });

  it('tanpa hasil mengembalikan array kosong', () => {
    expect(filterAndSortProducts(PRODUCTS, 'Semua', 'zzzz', 'terbaru')).toEqual([]);
  });

  it('sort harga naik dan turun, tanpa memutasi array asal', () => {
    const before = names(PRODUCTS);
    const asc = filterAndSortProducts(PRODUCTS, 'Semua', '', 'harga-rendah').map((p) => p.price);
    const desc = filterAndSortProducts(PRODUCTS, 'Semua', '', 'harga-tinggi').map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    expect(names(PRODUCTS)).toEqual(before);
  });
});
