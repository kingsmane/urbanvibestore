import React from 'react';
import { Order, formatRupiah } from '../../data/storeData';

interface PaymentCardProps {
  order: Order;
  copiedVa: boolean;
  statusNotice: string | null;
  uploadedFileName: string | null;
  handleCopyVa: () => void;
  handleCheckStatus: () => void;
  handleUploadProof: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  order,
  copiedVa,
  statusNotice,
  uploadedFileName,
  handleCopyVa,
  handleCheckStatus,
  handleUploadProof,
}) => {
  return (
    <div className="bg-canvas-base shadow-sm p-space-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-surface-muted px-3 py-1 font-label-caps text-label-caps uppercase text-outline">
        Metode: BCA Virtual Account
      </div>
      <div className="mb-space-md">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-1">
          Total Kewajiban Pembayaran
        </span>
        <div className="flex items-baseline gap-space-xs flex-wrap">
          <span className="font-display text-display text-primary tracking-tight font-bold">
            {formatRupiah(order.total)}
          </span>
          <span className="bg-badge-promo text-text-on-accent px-1.5 py-0.5 font-label-caps text-[10px] font-bold uppercase tracking-wider">
            Tepat Hingga 3 Digit Terakhir
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Mohon pastikan transfer sejumlah nominal persis di atas agar verifikasi otomatis
          UrbanEngine berjalan tanpa kendala manual.
        </p>
      </div>

      {/* VA Number Display Box */}
      <div className="bg-surface-subtle p-space-md my-space-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-outline block">
              Nomor Virtual Account BCA
            </span>
            <span className="font-headline-lg text-headline-lg tracking-wider font-mono text-primary font-bold">
              {order.vaNumber}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
              Atas Nama:{' '}
              <strong className="text-on-surface font-semibold">
                URBANSTORE / NAYA R
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyVa}
            className="bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary px-space-md py-3 font-label-caps text-label-caps uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-space-xs shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">content_copy</span>
            <span>{copiedVa ? 'Tersalin!' : 'Salin Nomor VA'}</span>
          </button>
        </div>
      </div>

      {/* Dual Action CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
        <button
          type="button"
          onClick={handleCheckStatus}
          className="w-full bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent py-3 px-space-md font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          <span>Cek Status Pembayaran</span>
        </button>
        <button
          type="button"
          onClick={handleUploadProof}
          className="w-full bg-surface-muted hover:bg-surface-variant text-on-surface py-3 px-space-md font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          <span>
            {uploadedFileName
              ? 'Bukti Terunggah ✓'
              : 'Unggah Bukti Transfer (Opsional)'}
          </span>
        </button>
      </div>
      {statusNotice && (
        <p className="font-body-sm text-body-sm text-secondary font-medium mt-space-sm">
          {statusNotice}
        </p>
      )}
    </div>
  );
};
