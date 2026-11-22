import React from 'react';
import { Order, formatRupiah } from '../../data/storeData';

interface InvoiceModalProps {
  onShowToast: (msg: string, sub?: string) => void;
  invoiceModalOrder: Order;
  setInvoiceModalOrder: React.Dispatch<React.SetStateAction<Order | null>>;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  onShowToast,
  invoiceModalOrder,
  setInvoiceModalOrder,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-border-strong/60 flex items-center justify-center p-margin">
        <div className="bg-canvas-base border-2 border-border-strong w-full max-w-lg p-space-lg shadow-[8px_8px_0px_0px_#111827]">
          <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-outline">
                Faktur Resmi UrbanStore Studio
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary uppercase font-bold">
                INVOICE {invoiceModalOrder.orderNumber}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setInvoiceModalOrder(null)}
              className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          <div className="py-space-md space-y-space-sm font-body-sm text-body-sm">
            <div className="flex justify-between">
              <span className="text-outline">Tanggal Transaksi:</span>
              <span className="font-medium text-primary">{invoiceModalOrder.dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Penerima:</span>
              <span className="font-medium text-primary">{invoiceModalOrder.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Metode Pembayaran:</span>
              <span className="font-medium text-primary">{invoiceModalOrder.paymentMethod}</span>
            </div>
            <div className="border-t border-border-hairline pt-space-sm space-y-2">
              {invoiceModalOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {it.name} ({it.size}) × {it.quantity}
                  </span>
                  <span className="font-mono font-semibold">
                    {formatRupiah(it.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border-hairline pt-space-sm flex justify-between font-headline-sm text-primary font-bold">
              <span>Total Lunas (Termasuk PPN)</span>
              <span>{formatRupiah(invoiceModalOrder.total)}</span>
            </div>
          </div>
          <div className="border-t border-border-hairline pt-space-md flex justify-end gap-space-sm">
            <button
              type="button"
              onClick={() => {
                onShowToast(`Faktur ${invoiceModalOrder.orderNumber}.pdf berhasil diunduh`);
                setInvoiceModalOrder(null);
              }}
              className="px-space-md py-2 bg-badge-promo text-text-on-accent font-label-caps text-label-caps uppercase font-bold hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
            >
              Unduh PDF
            </button>
            <button
              type="button"
              onClick={() => setInvoiceModalOrder(null)}
              className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
