import type { OrderStatus } from '../data/storeData';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Dibayar',
  PROCESSING: 'Sedang Diproses',
  IN_TRANSIT: 'Dalam Pengiriman',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
  REFUNDED: 'Dana Dikembalikan',
};

/** Pesanan yang masih menunggu pembayaran dari pelanggan. */
export const isAwaitingPayment = (status: OrderStatus): boolean => status === 'PENDING_PAYMENT';

/** Status akhir yang tidak akan berubah lagi karena dibatalkan. */
export const isClosedUnpaid = (status: OrderStatus): boolean =>
  status === 'CANCELLED' || status === 'EXPIRED' || status === 'REFUNDED';

/** Pesan untuk pelanggan di halaman konfirmasi berdasarkan status dari server. */
export const STATUS_NOTICE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Selesaikan pembayaran sebelum batas waktu agar pesanan tidak dibatalkan otomatis.',
  PAID: 'Pembayaran sudah kami terima. Pesanan Anda akan segera diproses.',
  PROCESSING: 'Pesanan Anda sedang disiapkan di gudang.',
  IN_TRANSIT: 'Pesanan Anda sudah dikirim. Pantau dengan nomor resi.',
  COMPLETED: 'Pesanan telah selesai. Terima kasih sudah berbelanja.',
  CANCELLED: 'Pesanan ini dibatalkan. Stok dan kupon sudah dikembalikan.',
  EXPIRED: 'Batas waktu pembayaran terlewati sehingga pesanan dibatalkan otomatis.',
  REFUNDED: 'Pesanan dibatalkan dan pembayaran Anda akan dikembalikan.',
};
