import React from 'react';
import { Order, formatRupiah } from '../../data/storeData';
import { ORDER_STATUS_LABEL } from '../../lib/orderStatus';

interface ReceiptCardProps {
  order: Order;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  order,
}) => {
  return (
    <div className="bg-canvas-base shadow-sm p-space-lg relative">
      <div className="flex items-center justify-between pb-space-sm">
        <div>
          <span className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary font-bold">
            URBANSTORE / {order.orderNumber.replace('#', '')}
          </span>
          <span className="font-label-sm text-label-sm uppercase text-outline block">
            Zurich • Tokyo • Jakarta Edition
          </span>
        </div>
        <div className="text-right">
          <span className="bg-surface-muted text-on-surface px-2 py-1 font-label-caps text-[11px] uppercase tracking-wider font-semibold">
            Status: {ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      {/* Items Ordered Section */}
      <div className="pt-space-md">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-space-sm">
          Kurasi Item Terpilih ({order.items.length})
        </span>
        <div className="space-y-space-md">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-space-sm items-start pb-space-md bg-surface-subtle p-space-sm"
            >
              <div className="w-16 h-20 bg-surface-muted overflow-hidden shrink-0 relative">
                <img
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  src={item.image}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body-md text-body-md text-on-surface font-semibold truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5 text-on-surface-variant font-label-sm text-label-sm uppercase">
                  <span>Warna: {item.color}</span>
                  <span>•</span>
                  <span>Ukuran: {item.size}</span>
                  <span>•</span>
                  <span>Jml: {item.quantity}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase font-mono">
                    SKU: {item.sku}
                  </span>
                  <span className="font-price-display text-price-display text-primary font-bold">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping and Consignee Details */}
      <div className="pt-space-md space-y-space-sm">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block">
          Data Pengiriman &amp; Kurir
        </span>
        <div className="bg-surface-subtle p-space-sm space-y-space-xs font-body-sm text-body-sm">
          <div className="flex justify-between items-start">
            <span className="text-outline uppercase font-label-sm text-label-sm">
              Penerima
            </span>
            <span className="text-on-surface font-medium text-right">
              {order.recipientName} (
              <span className="font-mono">{order.recipientPhone}</span>)
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-outline uppercase font-label-sm text-label-sm shrink-0 mr-4">
              Alamat
            </span>
            <span className="text-on-surface-variant text-right">
              {order.shippingAddress}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-outline uppercase font-label-sm text-label-sm">
              Layanan
            </span>
            <span className="text-primary font-medium text-right flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-badge-promo bg-primary px-0.5">
                local_shipping
              </span>
              {order.courierName}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-outline uppercase font-label-sm text-label-sm">
              Estimasi Tiba
            </span>
            <span className="text-on-surface font-medium text-right">
              {order.estimatedArrival || '18 – 20 Nov 2026'}
            </span>
          </div>
          <div className="flex justify-between items-start pt-1">
            <span className="text-outline uppercase font-label-sm text-label-sm">
              No. Resi Pelacakan
            </span>
            <span className="font-mono text-outline italic text-right">
              Terbit setelah verifikasi dana
            </span>
          </div>
        </div>
      </div>

      {/* Cost Summary Breakdown */}
      <div className="pt-space-md space-y-space-xs font-body-sm text-body-sm">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-1">
          Rincian Finansial
        </span>
        <div className="flex justify-between text-on-surface-variant">
          <span>Subtotal Item ({order.items.length} produk)</span>
          <span className="font-mono font-medium text-on-surface">
            {formatRupiah(order.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>Biaya Pengiriman ({order.courierName})</span>
          <span className="font-mono font-medium text-on-surface">
            {formatRupiah(order.shippingFee)}
          </span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-secondary font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">sell</span>
              Kupon: {order.voucherCode || '-'}
            </span>
            <span className="font-mono font-bold">-{formatRupiah(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-on-surface-variant">
          <span>Biaya Layanan Gerbang Pembayaran</span>
          <span className="font-mono text-on-surface">
            {formatRupiah(order.serviceFee)}
          </span>
        </div>

        {/* Grand Total Highlight Bar */}
        <div className="bg-primary text-on-primary p-space-sm mt-space-md flex items-center justify-between">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-surface-variant tracking-wider block">
              Total yang Harus Dibayar
            </span>
            <span className="font-label-sm text-label-sm text-badge-promo uppercase">
              Termasuk Pajak Pertambahan Nilai (PPN 11%)
            </span>
          </div>
          <span className="font-price-display text-price-display font-display text-badge-promo font-bold tracking-tight">
            {formatRupiah(order.total)}
          </span>
        </div>
      </div>

      {/* Decorative Tear Edge Receipt Effect */}
      <div className="w-full flex justify-between items-center mt-space-md pt-space-xs text-outline opacity-40 font-mono text-xs overflow-hidden select-none">
        <span>
          ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
        </span>
      </div>
      <div className="mt-space-sm flex items-center justify-between text-outline font-label-caps text-label-caps uppercase">
        <span>Waktu Cetak: {order.dateStr}</span>
        <span>Auth: SIGNED-SEC-SHA256</span>
      </div>
    </div>
  );
};
