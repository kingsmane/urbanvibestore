import React from 'react';
import { Order, OrderItemSnapshot, formatRupiah } from '../../data/storeData';
import { OrderSummaryCard } from './OrderSummaryCard';

interface OrdersTabProps {
  orders: Order[];
  onPayOrder: (order: Order) => void;
  onReorderItem: (item: OrderItemSnapshot) => void;
  onCancelOrder: (orderId: string) => void;
  nowMs: number;
  copiedVa: boolean;
  checkingOrderId: string | null;
  checkResultText: Record<string, string>;
  setTrackingOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  setInvoiceModalOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  formatTimer: (sec: number) => string;
  handleCopyVa: (text: string) => void;
  handleCheckStatus: (orderId: string) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onPayOrder,
  onReorderItem,
  onCancelOrder,
  nowMs,
  copiedVa,
  checkingOrderId,
  checkResultText,
  setTrackingOrder,
  setInvoiceModalOrder,
  formatTimer,
  handleCopyVa,
  handleCheckStatus,
}) => {
  return (
    <>
      <div className="space-y-space-lg">
        {orders.map((ord) => {
          if (ord.status === 'PENDING_PAYMENT') {
            return (
              <div
                key={ord.id}
                className="bg-canvas-base border-2 border-border-strong shadow-[4px_4px_0px_0px_#111827]"
              >
                {/* Order Header Meta */}
                <div className="bg-surface-subtle p-space-md border-b border-border-strong flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                        {ord.orderNumber}
                      </span>
                      <span className="text-outline">/</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {ord.dateStr}
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px]">
                        schedule
                      </span>
                      <span>
                        Batas Bayar:{' '}
                        <strong className="font-semibold">
                          {formatTimer(ord.paymentExpiresAt ? Math.max(0, Math.floor((new Date(ord.paymentExpiresAt).getTime() - nowMs) / 1000)) : 0)}
                        </strong>{' '}
                        tersisa
                      </span>
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-badge-promo text-text-on-accent font-label-caps text-label-caps uppercase font-bold border border-border-strong">
                      <span className="w-2 h-2 rounded-full bg-text-on-accent animate-pulse"></span>
                      Menunggu Pembayaran
                    </span>
                  </div>
                </div>

                {/* Payment Notice Panel (VA Info Direct) */}
                <div className="p-space-md bg-surface-muted border-b border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                  <div className="space-y-1">
                    <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                      Metode: {ord.paymentMethod}
                    </p>
                    <div className="flex items-center gap-space-sm">
                      <span className="font-headline-sm text-headline-sm font-bold tracking-widest text-primary font-mono select-all">
                        {ord.vaNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyVa((ord.vaNumber || '').replace(/\s/g, ''))}
                        className={`inline-flex items-center gap-1 font-label-caps text-label-caps uppercase text-primary hover:text-outline border border-border-hairline px-2 py-1 transition-colors cursor-pointer ${
                          copiedVa ? 'bg-badge-promo' : 'bg-canvas-base'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          content_copy
                        </span>
                        <span>{copiedVa ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                      Total Tagihan
                    </p>
                    <p className="font-price-display text-price-display text-primary">
                      {formatRupiah(ord.total)}
                    </p>
                    <p className="font-label-sm text-label-sm text-outline">
                      Termasuk kode unik verifikasi otomatis
                    </p>
                  </div>
                </div>

                {/* Order Item List */}
                <div className="divide-y divide-border-hairline">
                  {ord.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-space-md flex items-start gap-space-md"
                    >
                      <img
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-20 h-24 object-cover bg-surface-muted border border-border-hairline shrink-0"
                        src={item.image}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-space-xs">
                          <div>
                            <h2 className="font-body-md text-body-md font-semibold text-primary">
                              {item.name}
                            </h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              Warna: {item.color} · Ukuran: {item.size}
                              {item.fitProfileMatch ? ' (Fit My Profile)' : ''}
                            </p>
                            <p className="font-label-sm text-label-sm text-outline mt-1">
                              SKU: {item.sku} · Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-headline-sm text-headline-sm text-primary">
                            {formatRupiah(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="p-space-md bg-canvas-base border-t border-border-hairline flex flex-wrap items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px] text-badge-promo bg-primary p-0.5">
                      notifications_active
                    </span>
                    <span className="font-body-sm text-body-sm">
                      Nomor Virtual Account dan panduan bayar ada di halaman pesanan
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-space-sm w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleCheckStatus(ord.id)}
                      className="flex-1 sm:flex-initial px-space-md py-2.5 font-label-caps text-label-caps uppercase bg-canvas-base text-primary border border-border-strong hover:bg-surface-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          checkingOrderId === ord.id ? 'animate-spin' : ''
                        }`}
                      >
                        sync
                      </span>
                      <span>
                        {checkingOrderId === ord.id
                          ? 'Memverifikasi...'
                          : checkResultText[ord.id] || 'Cek Status Otomatis'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancelOrder(ord.id)}
                      className="flex-1 sm:flex-initial px-space-md py-2.5 font-label-caps text-label-caps uppercase bg-surface-muted text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
                    >
                      Batalkan
                    </button>
                    <button
                      type="button"
                      onClick={() => onPayOrder(ord)}
                      className="flex-1 sm:flex-initial px-space-lg py-2.5 font-label-caps text-label-caps uppercase bg-badge-promo text-text-on-accent hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                    >
                      <span>Bayar Sekarang</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (ord.status !== 'IN_TRANSIT' && ord.status !== 'COMPLETED') {
            return (
              <OrderSummaryCard
                key={ord.id}
                order={ord}
                onReorderItem={onReorderItem}
                onOpenInvoice={setInvoiceModalOrder}
              />
            );
          }

          if (ord.status === 'IN_TRANSIT') {
            return (
              <div
                key={ord.id}
                className="bg-canvas-base border border-border-hairline"
              >
                {/* Meta Header */}
                <div className="p-space-md bg-surface-subtle border-b border-border-hairline flex flex-wrap items-center justify-between gap-space-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-space-xs flex-wrap">
                      <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                        {ord.orderNumber}
                      </span>
                      <span className="text-outline">/</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {ord.dateStr}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Kurir: <strong>{ord.courierName}</strong> · No. Resi:{' '}
                      <span className="font-mono text-primary font-medium">
                        {ord.trackingNumber}
                      </span>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-primary font-label-caps text-label-caps uppercase font-semibold border border-border-hairline">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      local_shipping
                    </span>
                    Dalam Pengiriman
                  </span>
                </div>

                {/* Tracking Progress Flow */}
                <div className="p-space-md bg-canvas-base border-b border-border-hairline">
                  <div className="space-y-space-sm">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="font-medium text-primary flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                        Sedang Transit: Hub Logistik Jakarta Selatan
                      </span>
                      <span className="text-outline font-label-sm text-label-sm">
                        Estimasi Tiba: {ord.estimatedArrival}
                      </span>
                    </div>
                    {/* Linear Segmented Tracker */}
                    <div className="w-full grid grid-cols-4 gap-1 h-1.5 bg-surface-muted">
                      <div className="bg-primary h-full"></div>
                      <div className="bg-primary h-full"></div>
                      <div className="bg-primary h-full animate-pulse"></div>
                      <div className="bg-border-hairline h-full"></div>
                    </div>
                    <div className="flex justify-between text-outline font-label-caps text-[10px] uppercase">
                      <span>Cikarang Hub</span>
                      <span>Tersortir</span>
                      <span className="text-primary font-bold">Kurir Menuju Lokasi</span>
                      <span>Diterima</span>
                    </div>
                  </div>
                </div>

                {/* Item */}
                {ord.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-space-md flex items-start gap-space-md"
                  >
                    <img
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-24 object-cover bg-surface-muted border border-border-hairline shrink-0"
                      src={item.image}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-space-xs">
                        <div>
                          <h2 className="font-body-md text-body-md font-semibold text-primary">
                            {item.name}
                          </h2>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                            Warna: {item.color} · Ukuran: {item.size}
                          </p>
                          <p className="font-label-sm text-label-sm text-outline mt-1">
                            Alamat Tujuan: {ord.shippingAddress}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-headline-sm text-headline-sm text-primary">
                            {formatRupiah(item.price)}
                          </span>
                          <p className="font-label-sm text-label-sm text-secondary font-medium">
                            Bebas Ongkir
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div className="p-space-md bg-surface-subtle border-t border-border-hairline flex flex-wrap items-center justify-between gap-space-md">
                  <span className="font-body-sm text-body-sm text-outline">
                    Metode Pembayaran: {ord.paymentMethod}
                  </span>
                  <div className="flex items-center gap-space-sm">
                    <button
                      type="button"
                      onClick={() => setTrackingOrder(ord)}
                      className="px-space-md py-2 font-label-caps text-label-caps uppercase bg-canvas-base border border-border-strong text-primary hover:bg-surface-muted transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        location_on
                      </span>
                      <span>Lacak Pengiriman Real-Time</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceModalOrder(ord)}
                      className="px-space-md py-2 font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        description
                      </span>
                      <span>Rincian Faktur</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // COMPLETED ORDER
          return (
            <div
              key={ord.id}
              className="bg-canvas-base border border-border-hairline"
            >
              <div className="p-space-md bg-surface-subtle border-b border-border-hairline flex flex-wrap items-center justify-between gap-space-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                      {ord.orderNumber}
                    </span>
                    <span className="text-outline">/</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {ord.dateStr}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Paket telah diterima oleh: <strong>{ord.receivedBy}</strong>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-muted text-primary font-label-caps text-label-caps uppercase font-semibold border border-border-hairline">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    check_circle
                  </span>
                  Selesai
                </span>
              </div>

              {ord.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-space-md flex items-start gap-space-md"
                >
                  <img
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover bg-surface-muted border border-border-hairline shrink-0"
                    src={item.image}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-space-xs">
                      <div>
                        <h2 className="font-body-md text-body-md font-semibold text-primary">
                          {item.name}
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          Warna: {item.color} · Edisi: {item.edition || 'Urban Essentials'}
                        </p>
                        <p className="font-label-sm text-label-sm text-outline mt-1">
                          {item.reviewText || 'Ulasan: 5.0 (Sudah Dinilai)'}
                        </p>
                      </div>
                      <span className="font-headline-sm text-headline-sm text-primary">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-space-md bg-canvas-base border-t border-border-hairline flex flex-wrap items-center justify-between gap-space-md">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOrder(ord)}
                  className="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download Invoice PDF</span>
                </button>
                <div className="flex items-center gap-space-sm">
                  <a
                    className="px-space-md py-2 font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors"
                    href="https://wa.me/628112345678"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Bantuan CS
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const first = ord.items[0];
                      if (first) {
                        onReorderItem(first);
                      }
                    }}
                    className="px-space-md py-2 font-label-caps text-label-caps uppercase bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">replay</span>
                    <span>Beli Lagi</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
