import type { SupabaseClient } from '@supabase/supabase-js';
import type { FitProfile, Order, Product, SavedAddress } from '../data/storeData';
import { AppError, toAppError } from './errors';
import {
  DbAddressRow,
  DbAdminProductRow,
  DbFitProfileRow,
  DbOrderRow,
  DbProductRow,
  DbProfileRow,
  DbVoucherRow,
  ORDER_SELECT,
  PRODUCT_SELECT,
  mapAddress,
  mapAdminOrder,
  mapAdminProduct,
  mapAdminVoucher,
  mapFitProfile,
  mapOrder,
  mapProduct,
  mapProfile,
} from './mappers';
import type {
  AdminService,
  AuthService,
  AuthUser,
  PlaceOrderInput,
  PlacedOrder,
  Profile,
  ShopService,
  VoucherResult,
} from './types';

/** Lempar AppError bila query gagal; kembalikan data bila berhasil. */
function unwrap(res: { data: unknown; error: { message: string } | null }): unknown {
  if (res.error) throw toAppError(res.error);
  return res.data;
}

const toUser = (u: { id: string; email?: string | null } | null | undefined): AuthUser | null =>
  u ? { id: u.id, email: u.email ?? '' } : null;

/* ------------------------------- Auth ------------------------------- */

function createAuthService(sb: SupabaseClient): AuthService {
  return {
    async getSession() {
      const { data } = await sb.auth.getSession();
      return toUser(data.session?.user);
    },

    onAuthChange(callback) {
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        callback(toUser(session?.user));
      });
      return () => data.subscription.unsubscribe();
    },

    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },

    async signUp(email, password, fullName) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      // Dengan konfirmasi email aktif, email yang sudah terdaftar tidak memunculkan
      // error melainkan user tanpa identitas (anti enumerasi).
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new AppError('email_taken', [], 'email_taken');
      }
      return { needsEmailConfirmation: !data.session };
    },

    async signOut() {
      const { error } = await sb.auth.signOut();
      if (error) throw error;
    },

    async getProfile(userId) {
      const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw toAppError(error);
      return data ? mapProfile(data as DbProfileRow) : null;
    },

    async updateProfile(userId, patch): Promise<Profile> {
      const update: Record<string, unknown> = {};
      if (patch.fullName !== undefined) update.full_name = patch.fullName.trim().slice(0, 120);
      if (patch.phone !== undefined) update.phone = patch.phone?.trim() || null;
      const row = unwrap(
        await sb.from('profiles').update(update).eq('id', userId).select('*').single()
      );
      return mapProfile(row as DbProfileRow);
    },
  };
}

/* ------------------------------- Shop ------------------------------- */

function createShopService(sb: SupabaseClient): ShopService {
  return {
    async listProducts(): Promise<Product[]> {
      const rows = unwrap(
        await sb
          .from('products')
          .select(PRODUCT_SELECT)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      );
      return (rows as DbProductRow[]).map(mapProduct);
    },

    async listMyOrders(): Promise<Order[]> {
      const rows = unwrap(
        await sb.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false })
      );
      return (rows as DbOrderRow[]).map(mapOrder);
    },

    async getOrder(id) {
      const { data, error } = await sb.from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle();
      if (error) throw toAppError(error);
      return data ? mapOrder(data as DbOrderRow) : null;
    },

    async placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
      const { data, error } = await sb.rpc('place_order', {
        p_items: input.items.map((i) => ({
          product_slug: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
        p_address: {
          recipient_name: input.address.recipientName,
          phone: input.address.phone,
          email: input.address.email,
          province: input.address.province,
          city: input.address.city,
          district: input.address.district,
          postal_code: input.address.postalCode,
          full_address: input.address.fullAddress,
          courier_note: input.address.courierNote,
        },
        p_courier_id: input.courierId,
        p_payment_method: input.paymentMethod,
        p_voucher_code: input.voucherCode ?? null,
        p_idempotency_key: input.idempotencyKey,
      });
      if (error) throw toAppError(error);
      const r = data as { id: string; order_number: string; total: number; duplicate: boolean };
      return { id: r.id, orderNumber: `#${r.order_number}`, total: r.total, duplicate: r.duplicate };
    },

    async cancelOrder(id, reason) {
      const { error } = await sb.rpc('cancel_order', { p_order_id: id, p_reason: reason ?? null });
      if (error) throw toAppError(error);
    },

    async validateVoucher(code, subtotal): Promise<VoucherResult> {
      const { data, error } = await sb.rpc('validate_voucher', {
        p_code: code,
        p_subtotal: subtotal,
      });
      if (error) throw toAppError(error);
      return data as VoucherResult;
    },

    async listAddresses(): Promise<SavedAddress[]> {
      const rows = unwrap(
        await sb
          .from('addresses')
          .select('*')
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true })
      );
      return (rows as DbAddressRow[]).map(mapAddress);
    },

    async saveAddress(input): Promise<SavedAddress> {
      const { data: auth } = await sb.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new AppError('not_authenticated');
      const payload = {
        user_id: userId,
        label: input.label.trim() || 'Rumah',
        recipient_name: input.recipientName.trim(),
        phone: input.phone.trim(),
        province: input.province?.trim() || null,
        city: input.city?.trim() || null,
        district: input.district?.trim() || null,
        postal_code: input.postalCode?.trim() || null,
        full_address: input.fullAddress.trim(),
        courier_note: input.courierNote?.trim() || null,
      };
      if (input.id) {
        const { user_id: _omit, ...patch } = payload;
        void _omit;
        const row = unwrap(
          await sb.from('addresses').update(patch).eq('id', input.id).select('*').single()
        );
        return mapAddress(row as DbAddressRow);
      }
      const row = unwrap(
        await sb
          .from('addresses')
          .insert({ ...payload, is_primary: Boolean(input.isPrimary) })
          .select('*')
          .single()
      );
      return mapAddress(row as DbAddressRow);
    },

    async setPrimaryAddress(id) {
      const { error } = await sb.rpc('set_primary_address', { p_id: id });
      if (error) throw toAppError(error);
    },

    async deleteAddress(id) {
      const { error } = await sb.from('addresses').delete().eq('id', id);
      if (error) throw toAppError(error);
    },

    async getFitProfile(): Promise<FitProfile | null> {
      const { data, error } = await sb.from('fit_profiles').select('*').maybeSingle();
      if (error) throw toAppError(error);
      return data ? mapFitProfile(data as DbFitProfileRow) : null;
    },

    async saveFitProfile(p) {
      const { data: auth } = await sb.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new AppError('not_authenticated');
      const { error } = await sb.from('fit_profiles').upsert(
        {
          user_id: userId,
          height_cm: p.height,
          weight_kg: p.weight,
          preference: p.preference,
          recommended_top: p.recommendedTop,
          recommended_bottom: p.recommendedBottom,
          calculated_size: p.calculatedSize,
        },
        { onConflict: 'user_id' }
      );
      if (error) throw toAppError(error);
    },

    async subscribeNewsletter(email) {
      const { error } = await sb.from('newsletter_subscribers').insert({ email: email.trim() });
      // 23505 = sudah terdaftar; anggap berhasil agar tidak membocorkan daftar pelanggan.
      if (error && (error as { code?: string }).code !== '23505') throw toAppError(error);
    },
  };
}

/* ------------------------------- Admin ------------------------------- */

function createAdminService(sb: SupabaseClient): AdminService {
  const rpc = async (fn: string, args: Record<string, unknown>) => {
    const { error } = await sb.rpc(fn, args);
    if (error) throw toAppError(error);
  };

  return {
    async stats() {
      const { data, error } = await sb.rpc('admin_dashboard_stats');
      if (error) throw toAppError(error);
      const s = data as {
        orders_by_status: Record<string, number>;
        revenue_paid: number;
        customers: number;
        active_products: number;
        low_stock_variants: number;
      };
      return {
        ordersByStatus: s.orders_by_status,
        revenuePaid: s.revenue_paid,
        customers: s.customers,
        activeProducts: s.active_products,
        lowStockVariants: s.low_stock_variants,
      };
    },

    async listOrders() {
      const rows = unwrap(
        await sb
          .from('orders')
          .select(ORDER_SELECT)
          .order('created_at', { ascending: false })
          .limit(200)
      );
      return (rows as DbOrderRow[]).map(mapAdminOrder);
    },

    markOrderPaid: (orderId, note) =>
      rpc('admin_mark_order_paid', { p_order_id: orderId, p_note: note ?? null }),

    updateFulfillment: (orderId, status, trackingNumber) =>
      rpc('admin_update_fulfillment', {
        p_order_id: orderId,
        p_status: status,
        p_tracking: trackingNumber ?? null,
        p_note: null,
      }),

    cancelOrder: (orderId, reason) =>
      rpc('cancel_order', { p_order_id: orderId, p_reason: reason ?? null }),

    async listProducts() {
      const rows = unwrap(
        await sb
          .from('products')
          .select(
            'id, slug, sku, name, category, price, original_price, is_active, image_url, product_variants(id, size, stock, sort_order)'
          )
          .order('sort_order', { ascending: true })
      );
      return (rows as DbAdminProductRow[]).map(mapAdminProduct);
    },

    async createProduct(input) {
      const baseSlug = input.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'produk';
      const slug = `${baseSlug}-${Date.now().toString(36)}`;
      const cleanName = input.name.trim();
      const cleanShortName = input.shortName?.trim() || cleanName;
      const cleanImage = input.imageUrl?.trim() ?? '';
      const defaultSize = input.defaultSize?.trim() || input.variants[0]?.size || 'M';
      const specs = {
        density: input.specs?.density?.trim() || '-',
        silhouette: input.specs?.silhouette?.trim() || '-',
        detailLabel: input.specs?.detailLabel?.trim() || 'Detail',
        detailValue: input.specs?.detailValue?.trim() || '-',
        fitNote: input.specs?.fitNote?.trim() || '-',
        materialTag: input.specs?.materialTag?.trim() || '-',
        carePoints: input.specs?.carePoints?.filter((p) => p.trim()) ?? [],
      };

      const productRow = unwrap(
        await sb
          .from('products')
          .insert({
            slug,
            sku: input.sku.trim().toUpperCase(),
            name: cleanName,
            short_name: cleanShortName,
            category: input.category,
            sub_category: input.subCategory?.trim() ?? '',
            tag_label: input.tagLabel?.trim() ?? '',
            price: input.price,
            original_price: input.originalPrice ?? null,
            image_url: cleanImage,
            default_size: defaultSize,
            specs,
            is_active: input.isActive ?? true,
          })
          .select('id')
          .single()
      ) as { id: string };

      const allImages = [cleanImage, ...(input.galleryUrls ?? []).map((u) => u.trim())]
        .filter(Boolean);
      if (allImages.length > 0) {
        const { error: imgErr } = await sb.from('product_images').insert(
          allImages.map((url, idx) => ({ product_id: productRow.id, url, sort_order: idx }))
        );
        if (imgErr) throw toAppError(imgErr);
      }

      const colors =
        input.colors && input.colors.length > 0
          ? input.colors
          : [{ name: 'Hitam', hex: '#111111' }];
      const { error: colorErr } = await sb.from('product_colors').insert(
        colors.map((c, idx) => ({
          product_id: productRow.id,
          name: c.name.trim() || 'Hitam',
          hex: /^#[0-9a-fA-F]{6}$/.test(c.hex.trim()) ? c.hex.trim() : '#111111',
          sort_order: idx,
        }))
      );
      if (colorErr) throw toAppError(colorErr);

      if (input.variants.length > 0) {
        const { error: varErr } = await sb.from('product_variants').insert(
          input.variants.map((v, idx) => ({
            product_id: productRow.id,
            size: v.size.trim(),
            stock: v.stock,
            sort_order: idx,
          }))
        );
        if (varErr) throw toAppError(varErr);
      }
    },

    async updateProduct(productId, patch) {
      const update: Record<string, unknown> = {};
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.price !== undefined) update.price = patch.price;
      if (patch.originalPrice !== undefined) update.original_price = patch.originalPrice;
      if (patch.isActive !== undefined) update.is_active = patch.isActive;
      const { error } = await sb.from('products').update(update).eq('id', productId);
      if (error) throw toAppError(error);
    },

    async updateStock(variantId, stock) {
      const { error } = await sb.from('product_variants').update({ stock }).eq('id', variantId);
      if (error) throw toAppError(error);
    },

    async uploadProductImage(blob, fileName) {
      const buffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      const dataBase64 = btoa(binary);

      // 1. Coba unggah ke server lokal (/api/upload pada Vite dev/preview)
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, dataBase64 }),
        });
        if (res.ok) {
          const payload = (await res.json()) as { url?: string };
          if (payload.url) return payload.url;
        }
      } catch {
        /* lanjut ke Supabase Storage bila endpoint lokal tidak tersedia */
      }

      // 2. Fallback ke Supabase Storage bucket product-images
      const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { error } = await sb.storage
        .from('product-images')
        .upload(`products/${safeName}`, blob, { contentType: blob.type || 'image/webp' });
      if (error) throw toAppError(error);
      const { data } = sb.storage.from('product-images').getPublicUrl(`products/${safeName}`);
      return data.publicUrl;
    },

    async listVouchers() {
      const rows = unwrap(
        await sb.from('vouchers').select('*').order('created_at', { ascending: false })
      );
      return (rows as DbVoucherRow[]).map(mapAdminVoucher);
    },

    async saveVoucher(input) {
      const cleanCode = input.code.trim().toUpperCase();
      const { error } = await sb.from('vouchers').upsert(
        {
          code: cleanCode,
          description: input.description.trim(),
          discount_amount: input.discountAmount,
          min_subtotal: input.minSubtotal,
          max_redemptions: input.maxRedemptions,
          per_user_limit: input.perUserLimit,
          is_active: input.isActive ?? true,
        },
        { onConflict: 'code' }
      );
      if (error) throw toAppError(error);
    },

    async toggleVoucher(code, isActive) {
      const { error } = await sb.from('vouchers').update({ is_active: isActive }).eq('code', code);
      if (error) throw toAppError(error);
    },

    async listUsers() {
      const rows = unwrap(
        await sb.from('profiles').select('*').order('created_at', { ascending: false }).limit(500)
      );
      return (rows as DbProfileRow[]).map(mapProfile);
    },

    setUserRole: (userId, role) => rpc('admin_set_user_role', { p_user_id: userId, p_role: role }),
  };
}

export function createSupabaseServices(sb: SupabaseClient) {
  return {
    auth: createAuthService(sb),
    shop: createShopService(sb),
    admin: createAdminService(sb),
  };
}
