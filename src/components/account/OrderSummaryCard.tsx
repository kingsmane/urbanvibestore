import React from 'react';
import { Order, OrderItemSnapshot, formatRupiah } from '../../data/storeData';
import { ORDER_STATUS_LABEL, STATUS_NOTICE } from '../../lib/orderStatus';

interface OrderSummaryCardProps {
  order: Order;
  onReorderItem: (item: OrderItemSnapshot) => void;
  onOpenInvoice: (order: Order) => void;
}

/** Kartu ringkas untuk status selain menunggu bayar / dikirim / selesai. */
export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  order,
  onReorderItem,
  onOpenInvoice,
}) => {
  const closed = order.status === 'CANCELLED' || order.status === 'EXPIRED' || order.status === 'REFUNDED';
  return (
    <div className="bg-canvas-base border border-border-hairline">
      <div className="bg-surface-subtle p-space-md border-b border-border-hairline flex flex-wrap items-center justify-between gap-space-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
              {order.orderNumber}
            </span>
            <span className="text-outline">/</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{order.dateStr}</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{STATUS_NOTICE[order.status]}</p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 font-label-caps text-label-caps uppercase font-bold ${
            closed ? 'bg-surface-muted text-on-surface-variant' : 'bg-badge-promo text-text-on-accent'
          }`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <ul className="divide-y divide-border-hairline">
        {order.items.map((item, idx) => (
          <li key={`${item.sku}-${idx}`} className="p-space-md flex items-center gap-space-md">
            <img
              alt={item.name}
              src={item.image}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-16 h-20 object-cover bg-surface-muted border border-border-hairline"
            />
            <div className="flex-1 min-w-0">
              <p className="font-body-md text-body-md font-semibold text-primary truncate">{item.name}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {item.color} • Ukuran {item.size} • x{item.quantity}
              </p>
            </div>
            <span className="font-price-display text-body-md font-bold text-primary">
              {formatRupiah(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="p-space-md border-t border-border-hairline flex flex-wrap items-center justify-between gap-space-sm">
        <span className="font-body-md text-body-md text-on-surface">
          Total: <strong className="text-primary">{formatRupiah(order.total)}</strong>
        </span>
        <div className="flex gap-space-sm">
          <button
            type="button"
            onClick={() => onOpenInvoice(order)}
            className="px-space-md py-2 font-label-caps text-label-caps uppercase border border-border-hairline hover:border-border-strong cursor-pointer"
          >
            Lihat Invoice
          </button>
          {order.items[0]?.productId && (
            <button
              type="button"
              onClick={() => onReorderItem(order.items[0])}
              className="px-space-md py-2 font-label-caps text-label-caps uppercase bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent cursor-pointer"
            >
              Beli Lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
