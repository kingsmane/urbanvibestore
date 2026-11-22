/**
 * Implementasi Services di memori untuk tes UI. Meniru aturan server yang
 * penting (harga dari katalog, stok atomik, kupon, ongkir, idempotensi, peran)
 * agar alur aplikasi dapat diuji tanpa jaringan. Aturan sebenarnya diuji di
 * supabase/tests/db.test.ts terhadap Postgres.
 */
import {
  FitProfile,
  INITIAL_FIT_PROFILE,
  Order,
  OrderStatus,
  PRODUCTS,
  Product,
  SavedAddress,
  formatDateTimeId,
  generateOrderNumber,
  generateVaNumber,
} from '../data/storeData';
import { calculateShippingFee, SERVICE_FEE } from '../lib/pricing';
import { AppError } from '../services/errors';
import type {
  AdminOrder,
  AdminProduct,
  AdminVoucher,
  AuthUser,
  Profile,
  Role,
  Services,
  PlacedOrder,
  VoucherResult,
} from '../services/types';

export interface MemoryUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  role: Role;
}

export interface MemoryOptions {
  users?: MemoryUser[];
  /** Id pengguna yang sedang login saat render awal. */
  sessionUserId?: string | null;
  orders?: Order[];
  addresses?: SavedAddress[];
  fitProfile?: FitProfile | null;
  needsEmailConfirmation?: boolean;
  /** Paksa kegagalan pada operasi tertentu. */
  failPlaceOrderWith?: AppError;
}

const COURIERS: Record<string, { name: string; cost: number }> = {
  jnt: { name: 'J&T Express Regular', cost: 12000 },
  sicepat: { name: 'SiCepat BEST', cost: 18000 },
  instant: { name: 'Instant GoSend / Grab', cost: 35000 },
};

const VOUCHERS: Record<string, { amount: number; perUserLimit: number | null }> = {
  URBANFIRST: { amount: 50000, perUserLimit: 1 },
  ESSENTIAL2026: { amount: 50000, perUserLimit: null },
};

export const CUSTOMER: MemoryUser = {
  id: 'user-customer-1',
  email: 'budi@example.com',
  password: 'password123',
  fullName: 'Budi Santoso',
  phone: '+62 812-3456-7890',
  role: 'customer',
};

export const ADMIN: MemoryUser = {
  id: 'user-admin-1',
  email: 'admin@example.com',
  password: 'adminpass123',
  fullName: 'Admin Toko',
  role: 'admin',
};

type StoredOrder = Order & { userId: string; createdAt: string; idempotencyKey?: string };

export function createMemoryServices(options: MemoryOptions = {}) {
  const users: MemoryUser[] = (options.users ?? [CUSTOMER, ADMIN]).map((u) => ({ ...u }));
  let sessionId: string | null = options.sessionUserId ?? null;
  const authListeners = new Set<(u: AuthUser | null) => void>();

  const state = {
    stock: new Map<string, number>(), // `${slug}|${size}` -> stok
    names: new Map<string, string>(),
    prices: new Map<string, number>(),
    originalPrices: new Map<string, number | null>(),
    inactive: new Set<string>(),
    customProducts: [] as Product[],
    uploadedImages: [] as string[],
    vouchers: new Map<string, AdminVoucher>(),
    orders: [] as StoredOrder[],
    addresses: (options.addresses ?? []).map((a) => ({ ...a })),
    fitProfile: options.fitProfile === undefined ? null : options.fitProfile,
    subscribers: [] as string[],
    redemptions: [] as { code: string; userId: string; orderId: string }[],
    placeOrderCalls: 0,
    signOutCalls: 0,
  };
  for (const [code, v] of Object.entries(VOUCHERS)) {
    state.vouchers.set(code, {
      code,
      description: `Potongan ${code}`,
      discountAmount: v.amount,
      minSubtotal: 0,
      maxRedemptions: null,
      perUserLimit: v.perUserLimit,
      isActive: true,
      createdAt: '2026-01-15T00:00:00.000Z',
    });
  }
  for (const p of PRODUCTS) {
    state.names.set(p.id, p.name);
    state.prices.set(p.id, p.price);
    state.originalPrices.set(p.id, p.originalPrice ?? null);
    for (const s of p.sizes) state.stock.set(`${p.id}|${s.code}`, s.stock);
  }
  const owner = options.sessionUserId ?? CUSTOMER.id;
  for (const o of options.orders ?? []) {
    state.orders.push({ ...o, userId: owner, createdAt: new Date().toISOString() });
  }

  const currentUser = () => users.find((u) => u.id === sessionId) ?? null;
  const toAuthUser = (u: MemoryUser | null): AuthUser | null => (u ? { id: u.id, email: u.email } : null);
  const emit = () => authListeners.forEach((cb) => cb(toAuthUser(currentUser())));
  const requireUser = () => {
    const u = currentUser();
    if (!u) throw new AppError('not_authenticated');
    return u;
  };
  const requireAdmin = () => {
    const u = requireUser();
    if (u.role !== 'admin') throw new AppError('forbidden');
    return u;
  };
  const profileOf = (u: MemoryUser): Profile => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone ?? null,
    role: u.role,
    createdAt: '2026-01-15T00:00:00.000Z',
  });

  const allBaseProducts = (): Product[] => [...PRODUCTS, ...state.customProducts];

  const productsNow = (): Product[] =>
    allBaseProducts().filter((p) => !state.inactive.has(p.id)).map((p) => {
      const sizes = p.sizes.map((s) => {
        const stock = state.stock.get(`${p.id}|${s.code}`) ?? 0;
        return { ...s, stock, statusLabel: stock <= 0 ? 'Habis' : stock <= 3 ? `Sisa ${stock}` : 'Tersedia' };
      });
      return {
        ...p,
        price: state.prices.get(p.id) ?? p.price,
        sizes,
        isSoldOut: sizes.every((s) => s.stock === 0),
      };
    });

  const restoreStock = (o: StoredOrder) => {
    for (const i of o.items) {
      const key = `${i.productId}|${i.size}`;
      state.stock.set(key, (state.stock.get(key) ?? 0) + i.quantity);
    }
    state.redemptions = state.redemptions.filter((r) => r.orderId !== o.id);
  };

  const find = (id: string) => state.orders.find((o) => o.id === id);
  const publicOrder = ({ userId: _u, createdAt: _c, idempotencyKey: _k, ...rest }: StoredOrder): Order => {
    void _u; void _c; void _k;
    return { ...rest };
  };

  let idSeq = 0;

  const services: Services = {
    auth: {
      async getSession() {
        return toAuthUser(currentUser());
      },
      onAuthChange(cb) {
        authListeners.add(cb);
        return () => authListeners.delete(cb);
      },
      async signIn(email, password) {
        const u = users.find((x) => x.email === email && x.password === password);
        if (!u) throw new Error('Invalid login credentials');
        sessionId = u.id;
        emit();
      },
      async signUp(email, password, fullName) {
        if (users.some((u) => u.email === email)) throw new Error('User already registered');
        const u: MemoryUser = { id: `user-${++idSeq}`, email, password, fullName, role: 'customer' };
        users.push(u);
        if (!options.needsEmailConfirmation) {
          sessionId = u.id;
          emit();
        }
        return { needsEmailConfirmation: Boolean(options.needsEmailConfirmation) };
      },
      async signOut() {
        state.signOutCalls += 1;
        sessionId = null;
        emit();
      },
      async getProfile(userId) {
        const u = users.find((x) => x.id === userId);
        return u ? profileOf(u) : null;
      },
      async updateProfile(userId, patch) {
        const u = users.find((x) => x.id === userId)!;
        if (patch.fullName !== undefined) u.fullName = patch.fullName;
        if (patch.phone !== undefined) u.phone = patch.phone;
        return profileOf(u);
      },
    },

    shop: {
      async listProducts() {
        return productsNow();
      },
      async listMyOrders() {
        const u = requireUser();
        return state.orders.filter((o) => o.userId === u.id).map(publicOrder);
      },
      async getOrder(id) {
        const u = requireUser();
        const o = find(id);
        return o && o.userId === u.id ? publicOrder(o) : null;
      },

      async placeOrder(input): Promise<PlacedOrder> {
        const u = requireUser();
        state.placeOrderCalls += 1;
        if (options.failPlaceOrderWith) throw options.failPlaceOrderWith;

        const dup = state.orders.find((o) => o.userId === u.id && o.idempotencyKey === input.idempotencyKey);
        if (dup) return { id: dup.id, orderNumber: dup.orderNumber, total: dup.total, duplicate: true };

        if (input.items.length === 0) throw new AppError('invalid_items', ['empty_or_too_many']);
        if (!/^\d{5}$/.test(input.address.postalCode)) throw new AppError('invalid_address', ['postal_code']);
        const courier = COURIERS[input.courierId];
        if (!courier) throw new AppError('invalid_courier', [input.courierId]);

        // validasi stok (per ukuran, gabungkan semua warna)
        const needed = new Map<string, number>();
        for (const i of input.items) {
          const product = productsNow().find((p) => p.id === i.productId);
          if (!product || !product.sizes.some((s) => s.code === i.size)) {
            throw new AppError('item_unavailable', [i.productId, i.size]);
          }
          const key = `${i.productId}|${i.size}`;
          needed.set(key, (needed.get(key) ?? 0) + i.quantity);
        }
        for (const [key, qty] of needed) {
          const available = state.stock.get(key) ?? 0;
          if (available < qty) {
            const [slug, size] = key.split('|');
            throw new AppError('insufficient_stock', [slug, size, String(available)]);
          }
        }

        const lines = input.items.map((i) => {
          const product = productsNow().find((p) => p.id === i.productId)!;
          return { i, product };
        });
        const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.i.quantity, 0);

        let discount = 0;
        const code = input.voucherCode?.trim().toUpperCase();
        if (code) {
          const v = VOUCHERS[code];
          if (!v) throw new AppError('voucher_invalid', ['not_found']);
          const used = state.redemptions.filter((r) => r.code === code && r.userId === u.id).length;
          if (v.perUserLimit !== null && used >= v.perUserLimit) throw new AppError('voucher_invalid', ['user_limit']);
          discount = Math.min(v.amount, subtotal);
        }

        const shippingFee = calculateShippingFee(subtotal, { id: input.courierId, cost: courier.cost });
        const total = subtotal + shippingFee + SERVICE_FEE - discount;
        for (const [key, qty] of needed) state.stock.set(key, (state.stock.get(key) ?? 0) - qty);

        const now = new Date();
        const id = `order-${++idSeq}`;
        const order: StoredOrder = {
          id,
          userId: u.id,
          createdAt: now.toISOString(),
          idempotencyKey: input.idempotencyKey,
          orderNumber: generateOrderNumber(now),
          dateStr: formatDateTimeId(now),
          status: 'PENDING_PAYMENT',
          paymentMethod: input.paymentMethod,
          vaNumber: input.paymentMethod === 'va' ? generateVaNumber() : undefined,
          paymentExpiresAt: new Date(now.getTime() + 15 * 60_000).toISOString(),
          subtotal,
          shippingFee,
          discount,
          voucherCode: code || undefined,
          serviceFee: SERVICE_FEE,
          total,
          courierName: courier.name,
          recipientName: input.address.recipientName,
          recipientPhone: input.address.phone,
          recipientEmail: input.address.email ?? u.email,
          shippingAddress: `${input.address.fullAddress}, ${input.address.postalCode}`,
          items: lines.map(({ i, product }) => ({
            productId: product.id,
            name: product.shortName,
            color: i.color,
            size: i.size,
            sku: `${product.sku}-${i.size}`,
            quantity: i.quantity,
            price: product.price,
            image: product.image,
          })),
        };
        state.orders.unshift(order);
        if (code) state.redemptions.push({ code, userId: u.id, orderId: id });
        return { id, orderNumber: order.orderNumber, total, duplicate: false };
      },

      async cancelOrder(id) {
        const u = requireUser();
        const o = find(id);
        if (!o || o.userId !== u.id) throw new AppError('order_not_found');
        if (o.status !== 'PENDING_PAYMENT') throw new AppError('not_cancellable', [o.status]);
        o.status = 'CANCELLED';
        restoreStock(o);
      },

      async validateVoucher(code, subtotal): Promise<VoucherResult> {
        const u = requireUser();
        const clean = code.trim().toUpperCase();
        const v = state.vouchers.get(clean);
        if (!v || !v.isActive) return { valid: false, code: clean, discount: 0, reason: 'not_found' };
        if (subtotal < v.minSubtotal) return { valid: false, code: clean, discount: 0, reason: 'min_subtotal' };
        const used = state.redemptions.filter((r) => r.code === clean && r.userId === u.id).length;
        if (v.perUserLimit !== null && used >= v.perUserLimit) {
          return { valid: false, code: clean, discount: 0, reason: 'user_limit' };
        }
        return { valid: true, code: clean, discount: Math.min(v.discountAmount, subtotal), reason: null };
      },

      async listAddresses() {
        requireUser();
        return state.addresses.map((a) => ({ ...a }));
      },
      async saveAddress(input) {
        requireUser();
        const base: SavedAddress = {
          id: input.id ?? `addr-new-${++idSeq}`,
          label: input.label,
          isPrimary: Boolean(input.isPrimary),
          recipient: `${input.recipientName} (${input.phone})`,
          phone: input.phone,
          fullAddress: [input.fullAddress, input.postalCode].filter(Boolean).join(', '),
          courierNote: input.courierNote ? `Catatan kurir: ${input.courierNote}` : '',
          recipientName: input.recipientName,
          streetAddress: input.fullAddress,
          province: input.province,
          city: input.city,
          district: input.district,
          postalCode: input.postalCode,
        };
        const idx = state.addresses.findIndex((a) => a.id === base.id);
        if (idx >= 0) {
          base.isPrimary = state.addresses[idx].isPrimary;
          state.addresses[idx] = base;
        } else {
          state.addresses.push(base);
        }
        return base;
      },
      async setPrimaryAddress(id) {
        requireUser();
        if (!state.addresses.some((a) => a.id === id)) throw new AppError('address_not_found');
        state.addresses = state.addresses.map((a) => ({ ...a, isPrimary: a.id === id }));
      },
      async deleteAddress(id) {
        requireUser();
        state.addresses = state.addresses.filter((a) => a.id !== id);
      },

      async getFitProfile() {
        requireUser();
        return state.fitProfile ? { ...state.fitProfile } : null;
      },
      async saveFitProfile(p) {
        requireUser();
        state.fitProfile = { ...INITIAL_FIT_PROFILE, ...p };
      },
      async subscribeNewsletter(email) {
        state.subscribers.push(email);
      },
    },

    admin: {
      async stats() {
        requireAdmin();
        const ordersByStatus: Record<string, number> = {};
        for (const o of state.orders) {
          const key = o.status === 'IN_TRANSIT' ? 'SHIPPED' : o.status;
          ordersByStatus[key] = (ordersByStatus[key] ?? 0) + 1;
        }
        return {
          ordersByStatus,
          revenuePaid: state.orders
            .filter((o) => ['PAID', 'PROCESSING', 'IN_TRANSIT', 'COMPLETED'].includes(o.status))
            .reduce((s, o) => s + o.total, 0),
          customers: users.filter((u) => u.role === 'customer').length,
          activeProducts: PRODUCTS.length - state.inactive.size,
          lowStockVariants: [...state.stock.values()].filter((v) => v <= 3).length,
        };
      },
      async listOrders(): Promise<AdminOrder[]> {
        requireAdmin();
        return state.orders.map((o) => ({ ...publicOrder(o), userId: o.userId, createdAt: o.createdAt }));
      },
      async markOrderPaid(orderId) {
        requireAdmin();
        const o = find(orderId);
        if (!o) throw new AppError('order_not_found');
        if (o.status !== 'PENDING_PAYMENT') throw new AppError('invalid_transition', [o.status, 'PAID']);
        o.status = 'PAID';
      },
      async updateFulfillment(orderId, status, trackingNumber) {
        requireAdmin();
        const o = find(orderId);
        if (!o) throw new AppError('order_not_found');
        const next: Record<string, [OrderStatus, OrderStatus]> = {
          processing: ['PAID', 'PROCESSING'],
          shipped: ['PROCESSING', 'IN_TRANSIT'],
          completed: ['IN_TRANSIT', 'COMPLETED'],
        };
        const [from, to] = next[status];
        if (o.status !== from) throw new AppError('invalid_transition', [o.status, status]);
        if (status === 'shipped') {
          if (!trackingNumber?.trim()) throw new AppError('tracking_required');
          o.trackingNumber = trackingNumber.trim();
        }
        o.status = to;
      },
      async cancelOrder(orderId) {
        requireAdmin();
        const o = find(orderId);
        if (!o) throw new AppError('order_not_found');
        if (!['PENDING_PAYMENT', 'PAID', 'PROCESSING'].includes(o.status)) {
          throw new AppError('not_cancellable', [o.status]);
        }
        o.status = o.status === 'PENDING_PAYMENT' ? 'CANCELLED' : 'REFUNDED';
        restoreStock(o);
      },

      async listProducts(): Promise<AdminProduct[]> {
        requireAdmin();
        return allBaseProducts().map((p) => ({
          id: p.id,
          slug: p.id,
          sku: p.sku,
          name: state.names.get(p.id) ?? p.name,
          category: p.category,
          price: state.prices.get(p.id) ?? p.price,
          originalPrice: state.originalPrices.has(p.id) ? state.originalPrices.get(p.id)! : (p.originalPrice ?? null),
          isActive: !state.inactive.has(p.id),
          imageUrl: p.image,
          variants: p.sizes.map((s) => ({
            id: `${p.id}|${s.code}`,
            size: s.code,
            stock: state.stock.get(`${p.id}|${s.code}`) ?? 0,
          })),
        }));
      },
      async createProduct(input) {
        requireAdmin();
        const id = `prod-custom-${++idSeq}`;
        const sku = input.sku.trim().toUpperCase();
        const name = input.name.trim();
        const shortName = input.shortName?.trim() || name;
        const image = input.imageUrl?.trim() || 'https://placehold.co/600x800';
        const gallery = [image, ...(input.galleryUrls ?? []).map((u) => u.trim()).filter(Boolean)];
        const colors =
          input.colors && input.colors.length > 0
            ? input.colors.map((c) => ({ name: c.name.trim() || 'Hitam', hex: c.hex.trim() || '#111111' }))
            : [{ name: 'Hitam', hex: '#111111' }];
        const sizes = input.variants.map((v) => ({
          code: v.size.trim(),
          stock: v.stock,
          statusLabel: v.stock <= 0 ? 'Habis' : v.stock <= 3 ? `Sisa ${v.stock}` : 'Tersedia',
        }));
        const created: Product = {
          id,
          sku,
          name,
          shortName,
          category: input.category,
          subCategory: input.subCategory?.trim() ?? '',
          tagLabel: input.tagLabel?.trim() ?? '',
          price: input.price,
          originalPrice: input.originalPrice ?? undefined,
          image,
          gallery,
          colors,
          sizes,
          defaultSize: input.defaultSize?.trim() || sizes[0]?.code || 'M',
          isSoldOut: sizes.every((s) => s.stock === 0),
          badges: [],
          specs: {
            density: input.specs?.density?.trim() || '-',
            silhouette: input.specs?.silhouette?.trim() || '-',
            detailLabel: input.specs?.detailLabel?.trim() || 'Detail',
            detailValue: input.specs?.detailValue?.trim() || '-',
            fitNote: input.specs?.fitNote?.trim() || '-',
            materialTag: input.specs?.materialTag?.trim() || '-',
            carePoints: input.specs?.carePoints?.filter((p) => p.trim()) ?? [],
          },
        };
        state.customProducts.push(created);
        state.names.set(id, name);
        state.prices.set(id, input.price);
        state.originalPrices.set(id, input.originalPrice ?? null);
        if (input.isActive === false) state.inactive.add(id);
        for (const s of sizes) state.stock.set(`${id}|${s.code}`, s.stock);
      },
      async updateProduct(productId, patch) {
        requireAdmin();
        if (patch.name !== undefined) state.names.set(productId, patch.name);
        if (patch.price !== undefined) state.prices.set(productId, patch.price);
        if (patch.originalPrice !== undefined) state.originalPrices.set(productId, patch.originalPrice);
        if (patch.isActive !== undefined) {
          if (patch.isActive) state.inactive.delete(productId);
          else state.inactive.add(productId);
        }
      },
      async updateStock(variantId, stock) {
        requireAdmin();
        state.stock.set(variantId, stock);
      },
      async uploadProductImage(_blob, fileName) {
        requireAdmin();
        const url = `/uploads/products/${fileName}`;
        state.uploadedImages.push(url);
        return url;
      },

      async listVouchers() {
        requireAdmin();
        return [...state.vouchers.values()];
      },
      async saveVoucher(input) {
        requireAdmin();
        const code = input.code.trim().toUpperCase();
        if (code.length < 3) throw new AppError('invalid_voucher', ['code']);
        state.vouchers.set(code, {
          code,
          description: input.description.trim(),
          discountAmount: input.discountAmount,
          minSubtotal: input.minSubtotal,
          maxRedemptions: input.maxRedemptions,
          perUserLimit: input.perUserLimit,
          isActive: input.isActive ?? true,
          createdAt: new Date().toISOString(),
        });
      },
      async toggleVoucher(code, isActive) {
        requireAdmin();
        const existing = state.vouchers.get(code);
        if (existing) existing.isActive = isActive;
      },

      async listUsers() {
        requireAdmin();
        return users.map(profileOf);
      },
      async setUserRole(userId, role) {
        const me = requireAdmin();
        if (me.id === userId) throw new AppError('cannot_change_own_role');
        const u = users.find((x) => x.id === userId);
        if (!u) throw new AppError('user_not_found');
        u.role = role;
      },
    },
  };

  return { services, state, users };
}

export type MemoryServices = ReturnType<typeof createMemoryServices>;
