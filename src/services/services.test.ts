import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/storeData';
import { AppError, describeAuthError, describeError, describeVoucherReason, toAppError } from './errors';
import {
  DbOrderRow,
  DbProductRow,
  formatVa,
  mapAddress,
  mapOrder,
  mapOrderStatus,
  mapProduct,
  stockLabel,
} from './mappers';

describe('toAppError / describeError', () => {
  it('memecah pesan kode:detail dari database', () => {
    const e = toAppError({ message: 'insufficient_stock:prod-1:M:3' });
    expect(e.code).toBe('insufficient_stock');
    expect(e.details).toEqual(['prod-1', 'M', '3']);
  });

  it('pesan tak dikenal menjadi unknown dan tidak membocorkan detail teknis ke pengguna', () => {
    const raw = 'duplicate key value violates unique constraint "orders_pkey"';
    expect(toAppError(new Error(raw)).code).toBe('unknown');
    expect(describeError(new Error(raw))).toBe('Terjadi kesalahan. Silakan coba lagi.');
  });

  it('AppError dikembalikan apa adanya', () => {
    const e = new AppError('forbidden');
    expect(toAppError(e)).toBe(e);
  });

  it.each([
    ['insufficient_stock:prod-1:M:3', /tersisa 3/],
    ['insufficient_stock:prod-1:M:0', /sudah habis/],
    ['item_unavailable:prod-2:XL', /tidak tersedia/],
    ['voucher_invalid:user_limit', /sudah Anda gunakan/],
    ['voucher_invalid:expired', /kedaluwarsa/],
    ['invalid_address:postal_code', /5 digit/],
    ['not_cancellable:PAID', /tidak dapat dibatalkan/],
    ['tracking_required', /resi wajib/],
    ['forbidden', /tidak memiliki izin/],
    ['not_authenticated', /masuk kembali/],
    ['cannot_change_own_role', /peran akun Anda sendiri/],
  ])('describeError(%s)', (msg, pattern) => {
    expect(describeError({ message: msg })).toMatch(pattern);
  });

  it('describeVoucherReason: alasan dikenal dan fallback', () => {
    expect(describeVoucherReason('min_subtotal')).toMatch(/minimum/);
    expect(describeVoucherReason('aneh')).toBe('Kode kupon tidak valid.');
    expect(describeVoucherReason(null)).toBe('Kode kupon tidak valid.');
  });
});

describe('describeAuthError', () => {
  it.each([
    ['Invalid login credentials', 'Email atau kata sandi salah.'],
    ['Email not confirmed', 'Email belum dikonfirmasi. Periksa kotak masuk Anda.'],
    ['User already registered', 'Email ini sudah terdaftar. Silakan masuk.'],
    ['email_taken', 'Email ini sudah terdaftar. Silakan masuk.'],
    ['Password should be at least 6 characters', 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.'],
    ['Email rate limit exceeded', 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.'],
    ['Failed to fetch', 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'],
  ])('%s', (raw, expected) => {
    expect(describeAuthError({ message: raw })).toBe(expected);
  });

  it('error tak dikenal tidak menampilkan pesan mentah', () => {
    expect(describeAuthError({ message: 'sesuatu yang aneh' })).toBe('Terjadi kesalahan. Silakan coba lagi.');
  });
});

describe('mappers', () => {
  const row: DbProductRow = {
    slug: 'prod-x', sku: 'SKU-X', name: 'Produk X Hitam', short_name: 'Produk X',
    category: 'Pria', sub_category: 'Pria // Tes', tag_label: 'Tes', price: 100000, original_price: 120000,
    image_url: 'https://img/main.jpg', default_size: null, extra_color_count: 0,
    badges: [{ text: 'Baru', variant: 'promo' }],
    specs: { density: '200 GSM', carePoints: ['a'] },
    product_variants: [
      { size: 'L', stock: 0, sort_order: 2 },
      { size: 'M', stock: 2, sort_order: 1 },
    ],
    product_colors: [
      { name: 'B', hex: '#000000', sort_order: 2 },
      { name: 'A', hex: '#ffffff', sort_order: 1 },
    ],
    product_images: [
      { url: 'u2', sort_order: 2 },
      { url: 'u1', sort_order: 1 },
    ],
  };

  it('mapProduct: urut berdasarkan sort_order, label stok, ukuran default dari stok tersedia', () => {
    const p = mapProduct(row);
    expect(p.id).toBe('prod-x');
    expect(p.sizes.map((s) => s.code)).toEqual(['M', 'L']);
    expect(p.sizes.map((s) => s.statusLabel)).toEqual(['Sisa 2', 'Habis']);
    expect(p.colors.map((c) => c.name)).toEqual(['A', 'B']);
    expect(p.gallery).toEqual(['u1', 'u2']);
    expect(p.defaultSize).toBe('M'); // default_size null -> ukuran pertama yang masih ada stok
    expect(p.isSoldOut).toBe(false);
    expect(p.originalPrice).toBe(120000);
    expect(p.specs.materialTag).toBe(''); // spesifikasi yang hilang tidak membuat crash
  });

  it('mapProduct: sold out bila semua ukuran stok 0; galeri jatuh ke gambar utama', () => {
    const p = mapProduct({
      ...row,
      product_variants: [{ size: 'M', stock: 0, sort_order: 1 }],
      product_images: [],
      original_price: null,
    });
    expect(p.isSoldOut).toBe(true);
    expect(p.gallery).toEqual(['https://img/main.jpg']);
    expect(p.originalPrice).toBeUndefined();
  });

  it('stockLabel', () => {
    expect(stockLabel(0)).toBe('Habis');
    expect(stockLabel(3)).toBe('Sisa 3');
    expect(stockLabel(4)).toBe('Tersedia');
  });

  it('katalog bawaan konsisten dengan pemetaan label stok', () => {
    for (const p of PRODUCTS) {
      for (const s of p.sizes) {
        if (s.stock === 0) expect(s.statusLabel).toBe('Habis');
      }
    }
  });

  const orderRow: DbOrderRow = {
    id: 'o1', order_number: 'URBN-202611-0042', user_id: 'u', status: 'SHIPPED', payment_method: 'va',
    subtotal: 389000, shipping_fee: 12000, discount: 0, service_fee: 1000, total: 402000, voucher_code: null,
    courier_name: 'J&T Express Regular', tracking_number: 'JT1', estimated_arrival: '2 – 4 hari kerja',
    recipient_name: 'Budi', recipient_phone: '+62 812', recipient_email: 'b@x.co',
    ship_district: 'Kebayoran Baru', ship_city: 'Jakarta Selatan', ship_postal_code: '12160',
    ship_address: 'Jl. Merdeka 10', va_number: '827712345678901 2'.replace(' ', ''),
    payment_expires_at: '2026-11-22T10:15:00.000Z', created_at: '2026-11-22T10:00:00.000Z',
    order_items: [
      { name: 'Linen Shirt', sku: 'S-M', color: 'Sand', size: 'M', unit_price: 389000, quantity: 1, image_url: 'i', products: { slug: 'prod-2' } },
    ],
  };

  it('mapOrder: nomor dengan #, status SHIPPED -> IN_TRANSIT, VA diformat, alamat digabung', () => {
    const o = mapOrder(orderRow);
    expect(o.orderNumber).toBe('#URBN-202611-0042');
    expect(o.status).toBe('IN_TRANSIT');
    expect(o.vaNumber).toBe('8277 1234 5678 9012');
    expect(o.shippingAddress).toBe('Jl. Merdeka 10, Kebayoran Baru, Jakarta Selatan, 12160');
    expect(o.items[0]).toMatchObject({ productId: 'prod-2', price: 389000, quantity: 1 });
    expect(o.paymentExpiresAt).toBe('2026-11-22T10:15:00.000Z');
    expect(o.paymentMethod).toBe('Virtual Account BCA');
    expect(o.voucherCode).toBeUndefined();
    expect(o.total).toBe(o.subtotal + o.shippingFee + o.serviceFee - o.discount);
  });

  it('mapOrderStatus: seluruh status dan fallback aman', () => {
    for (const s of ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED']) {
      expect(mapOrderStatus(s)).toBe(s);
    }
    expect(mapOrderStatus('SHIPPED')).toBe('IN_TRANSIT');
    expect(mapOrderStatus('ENTAH')).toBe('PENDING_PAYMENT');
  });

  it('formatVa', () => {
    expect(formatVa('8277123456789012')).toBe('8277 1234 5678 9012');
    expect(formatVa(null)).toBeUndefined();
  });

  it('mapAddress: menyusun alamat tampilan dan menyimpan data terstruktur', () => {
    const a = mapAddress({
      id: 'a1', label: 'Rumah', recipient_name: 'Ani', phone: '0812', province: 'DKI Jakarta', city: 'Jakarta Selatan',
      district: 'Cilandak', postal_code: '12430', full_address: 'Jl. Mawar 5', courier_note: 'Titip satpam', is_primary: true,
    });
    expect(a.recipient).toBe('Ani (0812)');
    expect(a.fullAddress).toBe('Jl. Mawar 5, Cilandak, Jakarta Selatan, DKI Jakarta, 12430');
    expect(a.streetAddress).toBe('Jl. Mawar 5');
    expect(a.courierNote).toBe('Catatan kurir: Titip satpam');
    expect(a.isPrimary).toBe(true);
  });
});
