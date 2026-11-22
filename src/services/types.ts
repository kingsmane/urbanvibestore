import type { FitProfile, Order, Product, SavedAddress } from '../data/storeData';

export type Role = 'admin' | 'customer';
export type PaymentMethodId = 'qris' | 'va' | 'cc';

export interface AuthUser {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  createdAt: string;
}

export interface AuthService {
  getSession(): Promise<AuthUser | null>;
  /** Mengembalikan fungsi untuk berhenti berlangganan. */
  onAuthChange(callback: (user: AuthUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ needsEmailConfirmation: boolean }>;
  signOut(): Promise<void>;
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, patch: { fullName?: string; phone?: string | null }): Promise<Profile>;
}

/* ------------------------------- Belanja ------------------------------- */

export interface CheckoutItem {
  /** Slug produk (sama dengan Product.id di aplikasi). */
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface CheckoutAddress {
  recipientName: string;
  phone: string;
  email?: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode: string;
  fullAddress: string;
  courierNote?: string;
}

export interface PlaceOrderInput {
  items: CheckoutItem[];
  address: CheckoutAddress;
  courierId: string;
  paymentMethod: PaymentMethodId;
  voucherCode?: string | null;
  /** Kunci unik per percobaan checkout agar klik ganda tidak membuat pesanan ganda. */
  idempotencyKey: string;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  total: number;
  duplicate: boolean;
}

export interface VoucherResult {
  valid: boolean;
  code: string;
  discount: number;
  reason: string | null;
}

export interface AddressInput {
  id?: string;
  label: string;
  recipientName: string;
  phone: string;
  province?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  fullAddress: string;
  courierNote?: string;
  isPrimary?: boolean;
}

export interface ShopService {
  listProducts(): Promise<Product[]>;
  listMyOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  placeOrder(input: PlaceOrderInput): Promise<PlacedOrder>;
  cancelOrder(id: string, reason?: string): Promise<void>;
  validateVoucher(code: string, subtotal: number): Promise<VoucherResult>;

  listAddresses(): Promise<SavedAddress[]>;
  saveAddress(input: AddressInput): Promise<SavedAddress>;
  setPrimaryAddress(id: string): Promise<void>;
  deleteAddress(id: string): Promise<void>;

  getFitProfile(): Promise<FitProfile | null>;
  saveFitProfile(profile: FitProfile): Promise<void>;

  subscribeNewsletter(email: string): Promise<void>;
}

/* -------------------------------- Admin -------------------------------- */

export interface AdminStats {
  ordersByStatus: Record<string, number>;
  revenuePaid: number;
  customers: number;
  activeProducts: number;
  lowStockVariants: number;
}

export interface AdminOrder extends Order {
  userId: string;
  createdAt: string;
}

export interface AdminProductVariant {
  id: string;
  size: string;
  stock: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  isActive: boolean;
  imageUrl: string;
  variants: AdminProductVariant[];
}

export interface AdminProductPatch {
  name?: string;
  price?: number;
  originalPrice?: number | null;
  isActive?: boolean;
}

export interface AdminProductInput {
  name: string;
  shortName?: string;
  sku: string;
  category: 'Pria' | 'Wanita' | 'Aksesoris';
  subCategory?: string;
  tagLabel?: string;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string;
  galleryUrls?: string[];
  colors?: { name: string; hex: string }[];
  defaultSize?: string;
  variants: { size: string; stock: number }[];
  specs?: {
    density?: string;
    silhouette?: string;
    detailLabel?: string;
    detailValue?: string;
    fitNote?: string;
    materialTag?: string;
    carePoints?: string[];
  };
  isActive?: boolean;
}

export interface AdminProductDetail extends AdminProductInput {
  id: string;
  slug: string;
}

export interface AdminVoucher {
  code: string;
  description: string;
  discountAmount: number;
  minSubtotal: number;
  maxRedemptions: number | null;
  perUserLimit: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminVoucherInput {
  code: string;
  description: string;
  discountAmount: number;
  minSubtotal: number;
  maxRedemptions: number | null;
  perUserLimit: number | null;
  isActive?: boolean;
}

export type AdminFulfillmentTarget = 'processing' | 'shipped' | 'completed';

export interface AdminService {
  stats(): Promise<AdminStats>;
  listOrders(): Promise<AdminOrder[]>;
  markOrderPaid(orderId: string, note?: string): Promise<void>;
  updateFulfillment(orderId: string, status: AdminFulfillmentTarget, trackingNumber?: string): Promise<void>;
  cancelOrder(orderId: string, reason?: string): Promise<void>;

  listProducts(): Promise<AdminProduct[]>;
  getProduct(productId: string): Promise<AdminProductDetail | null>;
  createProduct(input: AdminProductInput): Promise<void>;
  replaceProduct(productId: string, input: AdminProductInput): Promise<void>;
  updateProduct(productId: string, patch: AdminProductPatch): Promise<void>;
  updateStock(variantId: string, stock: number): Promise<void>;
  uploadProductImage(blob: Blob, fileName: string): Promise<string>;

  listVouchers(): Promise<AdminVoucher[]>;
  saveVoucher(input: AdminVoucherInput): Promise<void>;
  toggleVoucher(code: string, isActive: boolean): Promise<void>;

  listUsers(): Promise<Profile[]>;
  setUserRole(userId: string, role: Role): Promise<void>;
}

export interface Services {
  auth: AuthService;
  shop: ShopService;
  admin: AdminService;
}
