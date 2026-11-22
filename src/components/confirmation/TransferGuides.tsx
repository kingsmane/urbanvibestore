import React from 'react';
import { Order, formatRupiah } from '../../data/storeData';

interface TransferGuidesProps {
  order: Order;
  activeGuide: 'mobile' | 'klikbca' | 'atm';
  setActiveGuide: React.Dispatch<React.SetStateAction<'mobile' | 'klikbca' | 'atm'>>;
}

export const TransferGuides: React.FC<TransferGuidesProps> = ({
  order,
  activeGuide,
  setActiveGuide,
}) => {
  return (
    <div className="bg-canvas-base shadow-sm p-space-lg">
      <div className="flex items-center justify-between mb-space-md pb-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-[20px] text-primary">
            account_balance
          </span>
          <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
            Panduan Tata Cara Pembayaran
          </h2>
        </div>
        <span className="font-label-sm text-label-sm text-outline uppercase">
          BCA Virtual Account
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-space-xs bg-surface-muted p-1 mb-space-md font-label-caps text-label-caps uppercase">
        {[
          { id: 'mobile' as const, label: 'BCA Mobile (m-BCA)' },
          { id: 'klikbca' as const, label: 'KlikBCA' },
          { id: 'atm' as const, label: 'ATM BCA' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveGuide(t.id)}
            className={`flex-1 py-2 px-space-sm text-center transition-all cursor-pointer ${
              activeGuide === t.id
                ? 'bg-canvas-base text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Guide Contents */}
      {activeGuide === 'mobile' && (
        <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              1
            </span>
            <p>
              Buka aplikasi <strong>BCA Mobile</strong> lalu pilih menu{' '}
              <span className="text-on-surface font-medium">
                m-Transfer &gt; BCA Virtual Account
              </span>
              .
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              2
            </span>
            <p>
              Masukkan kode Virtual Account{' '}
              <span className="font-mono font-bold text-primary">
                {order.vaNumber}
              </span>{' '}
              lalu tekan <strong>Send</strong>.
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              3
            </span>
            <p>
              Periksa detail transaksi: Pastikan nama tertera{' '}
              <span className="text-primary font-semibold">URBANSTORE / NAYA R</span> dan
              jumlah transfer sesuai (
              <span className="font-semibold text-primary">
                {formatRupiah(order.total)}
              </span>
              ).
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              4
            </span>
            <p>
              Masukkan <strong>PIN m-BCA</strong> Anda. Transaksi otomatis diverifikasi
              dalam 1-2 menit tanpa kirim slip manual.
            </p>
          </div>
        </div>
      )}

      {activeGuide === 'klikbca' && (
        <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              1
            </span>
            <p>
              Login ke situs <strong>KlikBCA Individu</strong> (https://ibank.klikbca.com)
              dengan User ID &amp; PIN.
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              2
            </span>
            <p>
              Pilih menu{' '}
              <span className="text-on-surface font-medium">
                Transfer Dana &gt; Transfer ke BCA Virtual Account
              </span>
              .
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              3
            </span>
            <p>
              Input nomor{' '}
              <span className="font-mono font-bold text-primary">
                {order.vaNumber}
              </span>{' '}
              dan klik <strong>Lanjutkan</strong>.
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              4
            </span>
            <p>
              Verifikasi angka tagihan <strong>{formatRupiah(order.total)}</strong> dan
              sahkan menggunakan respon KeyBCA Token APPLI 1.
            </p>
          </div>
        </div>
      )}

      {activeGuide === 'atm' && (
        <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              1
            </span>
            <p>Masukkan kartu ATM BCA dan 6 Digit PIN Anda.</p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              2
            </span>
            <p>
              Pilih menu{' '}
              <span className="text-on-surface font-medium">
                Transaksi Lainnya &gt; Transfer &gt; Ke Rek BCA Virtual Account
              </span>
              .
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              3
            </span>
            <p>
              Ketikkan kode VA{' '}
              <span className="font-mono font-bold text-primary">
                {order.vaNumber}
              </span>{' '}
              lalu tekan <strong>Benar</strong>.
            </p>
          </div>
          <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
            <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
              4
            </span>
            <p>
              Cocokkan data konfirmasi layar (UrbanStore - {formatRupiah(order.total)})
              lalu tekan <strong>Ya</strong> dan simpan struk fisik.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
