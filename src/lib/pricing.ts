/** Subtotal minimum (sebelum kupon) agar kurir reguler gratis. Lihat kebijakan di halaman produk. */
export const FREE_SHIPPING_MIN_SUBTOTAL = 500000;
/** Hanya kurir reguler yang digratiskan; kurir lebih cepat tetap berbayar penuh. */
export const FREE_SHIPPING_COURIER_ID = 'jnt';

interface CourierLike {
  id: string;
  cost: number;
}

export function qualifiesForFreeShipping(subtotal: number, courier: CourierLike): boolean {
  return courier.id === FREE_SHIPPING_COURIER_ID && subtotal >= FREE_SHIPPING_MIN_SUBTOTAL;
}

export function calculateShippingFee(subtotal: number, courier: CourierLike): number {
  return qualifiesForFreeShipping(subtotal, courier) ? 0 : courier.cost;
}

/** Sisa belanja agar mencapai gratis ongkir; 0 bila sudah tercapai. */
export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_MIN_SUBTOTAL - subtotal);
}
