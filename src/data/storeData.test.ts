import { describe, expect, it } from 'vitest';
import {
  PAIRING_PRODUCTS,
  PRODUCTS,
  INITIAL_ORDERS,
  formatEtaRange,
  formatRupiah,
  generateOrderNumber,
  generateVaNumber,
} from './storeData';

describe('formatRupiah', () => {
  it('memformat dengan pemisah ribuan Indonesia', () => {
    expect(formatRupiah(249000)).toBe('Rp 249.000');
    expect(formatRupiah(0)).toBe('Rp 0');
  });
});

describe('generateOrderNumber / generateVaNumber', () => {
  it('format nomor order sesuai pola dan memuat tahun-bulan', () => {
    const n = generateOrderNumber(new Date(2026, 10, 22));
    expect(n).toMatch(/^#URBN-202611-\d{4}$/);
  });

  it('menghasilkan nomor yang berbeda antar pemanggilan', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateOrderNumber()));
    expect(set.size).toBeGreaterThan(30);
  });

  it('VA terdiri dari 4 kelompok 4 digit', () => {
    expect(generateVaNumber()).toMatch(/^8277 \d{4} \d{4} \d{4}$/);
  });
});

describe('formatEtaRange', () => {
  it('rentang dalam bulan yang sama', () => {
    expect(formatEtaRange(new Date(2026, 10, 22), 2, 4)).toBe('24 – 26 Nov 2026');
  });
  it('rentang lintas bulan', () => {
    expect(formatEtaRange(new Date(2026, 10, 28), 2, 4)).toBe('30 Nov 2026 – 2 Des 2026');
  });
  it('rentang lintas tahun', () => {
    expect(formatEtaRange(new Date(2026, 11, 30), 2, 5)).toBe('1 – 4 Jan 2027');
  });
  it('satu hari tunggal', () => {
    expect(formatEtaRange(new Date(2026, 10, 22), 1, 1)).toBe('23 Nov 2026');
  });
});

describe('konsistensi data katalog', () => {
  it('semua id produk unik', () => {
    const ids = PRODUCTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('harga pairing produk katalog sama dengan harga katalog', () => {
    for (const item of PAIRING_PRODUCTS) {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (product) expect(item.price).toBe(product.price);
    }
  });

  it('total seed order = subtotal + ongkir - diskon + biaya layanan', () => {
    for (const o of INITIAL_ORDERS) {
      expect(o.total).toBe(o.subtotal + o.shippingFee - o.discount + o.serviceFee);
    }
  });

  it('subtotal seed order = jumlah harga item', () => {
    for (const o of INITIAL_ORDERS) {
      const sum = o.items.reduce((a, i) => a + i.price * i.quantity, 0);
      expect(o.subtotal).toBe(sum);
    }
  });

  it('produk habis tidak punya stok ukuran', () => {
    for (const p of PRODUCTS.filter((p) => p.isSoldOut)) {
      expect(p.sizes.every((s) => s.stock === 0)).toBe(true);
    }
  });

  it('defaultSize selalu ada di daftar ukuran', () => {
    for (const p of PRODUCTS) {
      expect(p.sizes.map((s) => s.code)).toContain(p.defaultSize);
    }
  });
});
