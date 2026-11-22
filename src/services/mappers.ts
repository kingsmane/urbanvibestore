/**
 * Pemetaan baris database (snake_case) -> tipe domain aplikasi.
 * Fungsi murni agar mudah diuji tanpa jaringan.
 */
import type {
  ColorVariant,
  FitProfile,
  Order,
  OrderItemSnapshot,
  OrderStatus,
  Product,
  SavedAddress,
  SizeVariant,
} from '../data/storeData';
import { formatDateTimeId } from '../data/storeData';
import type { AdminOrder, AdminProduct, PaymentMethodId, Profile } from './types';

/* ------------------------------ Produk ------------------------------ */

export interface DbProductRow {
  slug: string;
  sku: string;
  name: string;
  short_name: string;
  category: Product['category'];
  sub_category: string;
  tag_label: string;
  price: number;
  original_price: number | null;
  image_url: string;
  default_size: string | null;
  extra_color_count: number;
  badges: Product['badges'] | null;
  specs: Partial<Product['specs']> | null;
  sort_order?: number;
  product_colors?: { name: string; hex: string; sort_order: number }[];
  product_variants?: { size: string; stock: number; sort_order: number }[];
  product_images?: { url: string; sort_order: number }[];
}

export const stockLabel = (stock: number): string =>
  stock <= 0 ? 'Habis' : stock <= 3 ? `Sisa ${stock}` : 'Tersedia';

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;

export function mapProduct(row: DbProductRow): Product {
  const sizes: SizeVariant[] = [...(row.product_variants ?? [])].sort(bySort).map((v) => ({
    code: v.size,
    stock: v.stock,
    statusLabel: stockLabel(v.stock),
  }));
  const colors: ColorVariant[] = [...(row.product_colors ?? [])]
    .sort(bySort)
    .map((c) => ({ name: c.name, hex: c.hex }));
  const gallery = [...(row.product_images ?? [])].sort(bySort).map((i) => i.url);
  const firstAvailable = sizes.find((s) => s.stock > 0)?.code;
  const specs = row.specs ?? {};

  return {
    id: row.slug,
    sku: row.sku,
    name: row.name,
    shortName: row.short_name,
    category: row.category,
    subCategory: row.sub_category,
    tagLabel: row.tag_label,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    isSoldOut: sizes.length > 0 && sizes.every((s) => s.stock === 0),
    badges: row.badges ?? [],
    image: row.image_url,
    gallery: gallery.length > 0 ? gallery : row.image_url ? [row.image_url] : [],
    colors,
    extraColorCount: row.extra_color_count || undefined,
    sizes,
    defaultSize: row.default_size ?? firstAvailable ?? sizes[0]?.code ?? '',
    specs: {
      density: specs.density ?? '',
      silhouette: specs.silhouette ?? '',
      detailLabel: specs.detailLabel ?? '',
      detailValue: specs.detailValue ?? '',
      fitNote: specs.fitNote ?? '',
      materialTag: specs.materialTag ?? '',
      carePoints: specs.carePoints ?? [],
    },
  };
}

export const PRODUCT_SELECT =
  '*, product_colors(name, hex, sort_order), product_variants(size, stock, sort_order), product_images(url, sort_order)';

/* ------------------------------ Pesanan ------------------------------ */

export interface DbOrderItemRow {
  product_id?: string | null;
  name: string;
  sku: string;
  color: string;
  size: string;
  unit_price: number;
  quantity: number;
  image_url: string;
  products?: { slug: string } | null;
}

export interface DbOrderRow {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  payment_method: PaymentMethodId;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  service_fee: number;
  total: number;
  voucher_code: string | null;
  courier_name: string;
  tracking_number: string | null;
  estimated_arrival: string | null;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  ship_district: string | null;
  ship_city: string | null;
  ship_postal_code: string | null;
  ship_address: string;
  va_number: string | null;
  payment_expires_at: string | null;
  created_at: string;
  order_items?: DbOrderItemRow[];
}

export const ORDER_SELECT = '*, order_items(*, products(slug))';

/** Status database -> status tampilan (SHIPPED dipakai UI sebagai IN_TRANSIT). */
export function mapOrderStatus(dbStatus: string): OrderStatus {
  switch (dbStatus) {
    case 'SHIPPED':
      return 'IN_TRANSIT';
    case 'PAID':
    case 'PROCESSING':
    case 'COMPLETED':
    case 'CANCELLED':
    case 'EXPIRED':
    case 'REFUNDED':
    case 'PENDING_PAYMENT':
      return dbStatus;
    default:
      return 'PENDING_PAYMENT';
  }
}

const PAYMENT_LABEL: Record<PaymentMethodId, string> = {
  qris: 'QRIS / E-Wallet',
  va: 'Virtual Account BCA',
  cc: 'Kartu Kredit / Debit 3DS',
};

export const paymentMethodLabel = (m: PaymentMethodId): string => PAYMENT_LABEL[m] ?? m;

/** 8277123456789012 -> 8277 1234 5678 9012 */
export const formatVa = (va: string | null): string | undefined =>
  va ? va.replace(/(\d{4})(?=\d)/g, '$1 ').trim() : undefined;

export function mapOrderItem(row: DbOrderItemRow): OrderItemSnapshot {
  return {
    productId: row.products?.slug,
    name: row.name,
    color: row.color,
    size: row.size,
    sku: row.sku,
    quantity: row.quantity,
    price: row.unit_price,
    image: row.image_url,
  };
}

export function mapOrder(row: DbOrderRow): Order {
  const address = [row.ship_address, row.ship_district, row.ship_city, row.ship_postal_code]
    .filter(Boolean)
    .join(', ');
  return {
    id: row.id,
    orderNumber: `#${row.order_number}`,
    dateStr: formatDateTimeId(new Date(row.created_at)),
    status: mapOrderStatus(row.status),
    paymentMethod: paymentMethodLabel(row.payment_method),
    vaNumber: formatVa(row.va_number),
    paymentExpiresAt: row.payment_expires_at ?? undefined,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    discount: row.discount,
    voucherCode: row.voucher_code ?? undefined,
    serviceFee: row.service_fee,
    total: row.total,
    courierName: row.courier_name,
    trackingNumber: row.tracking_number ?? undefined,
    estimatedArrival: row.estimated_arrival ?? undefined,
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    recipientEmail: row.recipient_email,
    shippingAddress: address,
    items: (row.order_items ?? []).map(mapOrderItem),
  };
}

export const mapAdminOrder = (row: DbOrderRow): AdminOrder => ({
  ...mapOrder(row),
  userId: row.user_id,
  createdAt: row.created_at,
});

/* -------------------------- Alamat, fit, profil -------------------------- */

export interface DbAddressRow {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  province: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  full_address: string;
  courier_note: string | null;
  is_primary: boolean;
}

export function mapAddress(row: DbAddressRow): SavedAddress {
  const place = [row.district, row.city, row.province].filter(Boolean).join(', ');
  const full = [row.full_address, place, row.postal_code].filter(Boolean).join(', ');
  return {
    id: row.id,
    label: row.label,
    isPrimary: row.is_primary,
    recipient: `${row.recipient_name} (${row.phone})`,
    phone: row.phone,
    fullAddress: full,
    courierNote: row.courier_note ? `Catatan kurir: ${row.courier_note}` : '',
    recipientName: row.recipient_name,
    streetAddress: row.full_address,
    province: row.province ?? undefined,
    city: row.city ?? undefined,
    district: row.district ?? undefined,
    postalCode: row.postal_code ?? undefined,
  };
}

export interface DbFitProfileRow {
  height_cm: number;
  weight_kg: number;
  preference: FitProfile['preference'];
  recommended_top: string;
  recommended_bottom: string;
  calculated_size: string;
}

export const mapFitProfile = (row: DbFitProfileRow): FitProfile => ({
  height: row.height_cm,
  weight: row.weight_kg,
  preference: row.preference,
  recommendedTop: row.recommended_top,
  recommendedBottom: row.recommended_bottom,
  calculatedSize: row.calculated_size,
});

export interface DbProfileRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Profile['role'];
  created_at: string;
}

export const mapProfile = (row: DbProfileRow): Profile => ({
  id: row.id,
  email: row.email,
  fullName: row.full_name,
  phone: row.phone,
  role: row.role,
  createdAt: row.created_at,
});

/* -------------------------------- Admin -------------------------------- */

export interface DbAdminProductRow {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  is_active: boolean;
  image_url: string;
  product_variants?: { id: string; size: string; stock: number; sort_order: number }[];
}

export const mapAdminProduct = (row: DbAdminProductRow): AdminProduct => ({
  id: row.id,
  slug: row.slug,
  sku: row.sku,
  name: row.name,
  category: row.category,
  price: row.price,
  originalPrice: row.original_price,
  isActive: row.is_active,
  imageUrl: row.image_url,
  variants: [...(row.product_variants ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
});
