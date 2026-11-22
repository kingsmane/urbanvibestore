import React, { useMemo, useState } from 'react';
import { formatRupiah, OrderStatus } from '../../data/storeData';
import { ORDER_STATUS_LABEL } from '../../lib/orderStatus';
import { describeError } from '../../services/errors';
import { useServices } from '../../services/ServicesContext';
import type { AdminOrder } from '../../services/types';
import { formatDateTime, useAdminData } from './useAdminData';

const STATUS_FILTERS: ('SEMUA' | OrderStatus)[] = [
  'SEMUA',
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'IN_TRANSIT',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
];

const badgeClass = (status: OrderStatus) =>
  status === 'PENDING_PAYMENT'
    ? 'bg-badge-promo text-text-on-accent'
    : status === 'CANCELLED' || status === 'EXPIRED' || status === 'REFUNDED'
      ? 'bg-surface-muted text-on-surface-variant'
      : 'bg-primary text-on-primary';

interface OrderActionsProps {
  order: AdminOrder;
  onDone: () => Promise<void>;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order, onDone }) => {
  const { admin } = useServices();
  const [tracking, setTracking] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      await onDone();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const btn =
    'px-space-md py-2 font-label-caps text-label-caps uppercase font-bold disabled:opacity-60 cursor-pointer transition-colors';
  const primary = `${btn} bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent`;
  const danger = `${btn} bg-surface-muted text-error hover:bg-error-container`;

  return (
    <div className="space-y-space-sm">
      <div className="flex flex-wrap items-center gap-space-sm">
        {order.status === 'PENDING_PAYMENT' && (
          <>
            <button type="button" disabled={busy} className={primary} onClick={() => run(() => admin.markOrderPaid(order.id))}>
              Tandai Lunas
            </button>
            <button type="button" disabled={busy} className={danger} onClick={() => run(() => admin.cancelOrder(order.id, 'Dibatalkan admin'))}>
              Batalkan
            </button>
          </>
        )}
        {order.status === 'PAID' && (
          <>
            <button type="button" disabled={busy} className={primary} onClick={() => run(() => admin.updateFulfillment(order.id, 'processing'))}>
              Proses Pesanan
            </button>
            <button type="button" disabled={busy} className={danger} onClick={() => run(() => admin.cancelOrder(order.id, 'Dibatalkan admin'))}>
              Batalkan &amp; Refund
            </button>
          </>
        )}
        {order.status === 'PROCESSING' && (
          <>
            <label className="flex items-center gap-space-xs">
              <span className="sr-only">Nomor resi</span>
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Nomor resi"
                aria-label="Nomor resi"
                className="bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong"
              />
            </label>
            <button type="button" disabled={busy} className={primary} onClick={() => run(() => admin.updateFulfillment(order.id, 'shipped', tracking))}>
              Tandai Dikirim
            </button>
            <button type="button" disabled={busy} className={danger} onClick={() => run(() => admin.cancelOrder(order.id, 'Dibatalkan admin'))}>
              Batalkan &amp; Refund
            </button>
          </>
        )}
        {order.status === 'IN_TRANSIT' && (
          <button type="button" disabled={busy} className={primary} onClick={() => run(() => admin.updateFulfillment(order.id, 'completed'))}>
            Tandai Selesai
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="font-body-sm text-body-sm text-error font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export const AdminOrders: React.FC = () => {
  const { admin } = useServices();
  const { data, loading, error, reload } = useAdminData(() => admin.listOrders());
  const [filter, setFilter] = useState<'SEMUA' | OrderStatus>('SEMUA');
  const [openId, setOpenId] = useState<string | null>(null);

  const orders = useMemo(
    () => (data ?? []).filter((o) => filter === 'SEMUA' || o.status === filter),
    [data, filter]
  );

  return (
    <div className="space-y-space-md">
      <div className="flex flex-wrap items-end justify-between gap-space-sm">
        <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">Pesanan</h1>
        <label className="flex items-center gap-space-xs font-label-caps text-label-caps uppercase text-on-surface-variant">
          Status
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-canvas-base border border-border-hairline p-2 font-body-sm text-body-sm normal-case"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'SEMUA' ? 'Semua status' : ORDER_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p role="status" className="text-outline">Memuat pesanan…</p>}
      {error && <p role="alert" className="text-error">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="text-on-surface-variant">Tidak ada pesanan untuk filter ini.</p>
      )}

      <ul className="space-y-space-sm">
        {orders.map((o) => {
          const open = openId === o.id;
          return (
            <li key={o.id} className="bg-canvas-base border border-border-hairline">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o.id)}
                aria-expanded={open}
                className="w-full text-left p-space-md grid grid-cols-2 md:grid-cols-5 gap-space-sm items-center cursor-pointer"
              >
                <span className="font-label-caps text-label-caps uppercase font-bold text-primary">{o.orderNumber}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{formatDateTime(o.createdAt)}</span>
                <span className="font-body-md text-body-md truncate">{o.recipientName}</span>
                <span className="font-price-display text-body-md font-bold">{formatRupiah(o.total)}</span>
                <span className={`justify-self-start px-3 py-1 font-label-caps text-label-caps uppercase font-bold ${badgeClass(o.status)}`}>
                  {ORDER_STATUS_LABEL[o.status]}
                </span>
              </button>

              {open && (
                <div className="border-t border-border-hairline p-space-md space-y-space-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div>
                      <h3 className="font-label-caps text-label-caps uppercase text-outline mb-1">Penerima</h3>
                      <p className="font-body-md text-body-md">{o.recipientName} • {o.recipientPhone}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{o.recipientEmail}</p>
                      <p className="font-body-sm text-body-sm mt-1">{o.shippingAddress}</p>
                    </div>
                    <div>
                      <h3 className="font-label-caps text-label-caps uppercase text-outline mb-1">Pembayaran &amp; pengiriman</h3>
                      <p className="font-body-md text-body-md">{o.paymentMethod}{o.vaNumber ? ` • VA ${o.vaNumber}` : ''}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {o.courierName}{o.trackingNumber ? ` • Resi ${o.trackingNumber}` : ''}
                      </p>
                    </div>
                  </div>

                  <table className="w-full font-body-sm text-body-sm">
                    <thead>
                      <tr className="text-left text-outline font-label-caps text-label-caps uppercase">
                        <th className="py-1">Item</th>
                        <th className="py-1">Ukuran / Warna</th>
                        <th className="py-1 text-right">Qty</th>
                        <th className="py-1 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.items.map((i, idx) => (
                        <tr key={`${i.sku}-${idx}`} className="border-t border-border-hairline">
                          <td className="py-1">{i.name}</td>
                          <td className="py-1">{i.size} / {i.color}</td>
                          <td className="py-1 text-right">{i.quantity}</td>
                          <td className="py-1 text-right">{formatRupiah(i.price * i.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <dl className="grid grid-cols-2 max-w-xs ml-auto gap-x-space-md font-body-sm text-body-sm">
                    <dt>Subtotal</dt><dd className="text-right">{formatRupiah(o.subtotal)}</dd>
                    <dt>Ongkir</dt><dd className="text-right">{formatRupiah(o.shippingFee)}</dd>
                    <dt>Biaya layanan</dt><dd className="text-right">{formatRupiah(o.serviceFee)}</dd>
                    {o.discount > 0 && (<><dt>Diskon {o.voucherCode}</dt><dd className="text-right">-{formatRupiah(o.discount)}</dd></>)}
                    <dt className="font-bold">Total</dt><dd className="text-right font-bold">{formatRupiah(o.total)}</dd>
                  </dl>

                  <OrderActions order={o} onDone={reload} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
