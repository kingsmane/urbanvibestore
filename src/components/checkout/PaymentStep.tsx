import React from 'react';
import type { PaymentMethod } from './types';

interface PaymentStepProps {
  setActiveStep: (step: 1 | 2 | 3) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  setActiveStep,
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <section
      onClick={() => setActiveStep(3)}
      className="bg-canvas-base p-space-lg shadow-sm"
    >
      <div className="flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-space-xs">
          <span className="w-2.5 h-2.5 bg-primary inline-block"></span>
          <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
            03. Metode Pembayaran
          </h2>
        </div>
        <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
          Otomatis Terverifikasi
        </span>
      </div>

      <div className="space-y-space-sm">
        {/* Payment Channel 1: QRIS */}
        <div
          onClick={() => setPaymentMethod('qris')}
          className={`p-space-md transition-colors cursor-pointer ${
            paymentMethod === 'qris'
              ? 'bg-surface-container'
              : 'bg-surface-subtle hover:bg-surface-muted'
          }`}
        >
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-space-sm">
              <input
                type="radio"
                name="payment_method"
                checked={paymentMethod === 'qris'}
                onChange={() => setPaymentMethod('qris')}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="font-headline-sm text-headline-sm uppercase text-on-surface block font-bold">
                  QRIS Instant Payment
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  GoPay, OVO, ShopeePay, DANA, BCA Mobile &amp; Seluruh Bank
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-label-caps text-label-caps uppercase bg-badge-promo text-text-on-accent px-1.5 py-0.5 font-bold">
                Bebas Biaya Admin
              </span>
            </div>
          </label>
          {paymentMethod === 'qris' && (
            <div className="mt-space-sm pt-space-sm bg-canvas-base p-space-sm flex flex-col sm:flex-row items-center gap-space-md">
              <div className="w-24 h-24 bg-primary p-2 flex items-center justify-center shrink-0">
                <svg
                  aria-label="Simulasi Kode QRIS"
                  className="w-full h-full text-canvas-base fill-current"
                  viewBox="0 0 100 100"
                >
                  <rect fill="currentColor" height="30" width="30" x="0" y="0"></rect>
                  <rect fill="#000000" height="20" width="20" x="5" y="5"></rect>
                  <rect fill="currentColor" height="10" width="10" x="10" y="10"></rect>
                  <rect fill="currentColor" height="30" width="30" x="70" y="0"></rect>
                  <rect fill="#000000" height="20" width="20" x="75" y="5"></rect>
                  <rect fill="currentColor" height="10" width="10" x="80" y="10"></rect>
                  <rect fill="currentColor" height="30" width="30" x="0" y="70"></rect>
                  <rect fill="#000000" height="20" width="20" x="5" y="75"></rect>
                  <rect fill="currentColor" height="10" width="10" x="10" y="80"></rect>
                  <rect fill="currentColor" height="20" width="10" x="40" y="10"></rect>
                  <rect fill="currentColor" height="10" width="10" x="55" y="5"></rect>
                  <rect fill="currentColor" height="20" width="20" x="40" y="40"></rect>
                  <rect fill="currentColor" height="10" width="15" x="65" y="45"></rect>
                  <rect fill="currentColor" height="25" width="10" x="45" y="70"></rect>
                  <rect fill="currentColor" height="15" width="25" x="65" y="75"></rect>
                </svg>
              </div>
              <div className="space-y-1">
                <span className="font-label-caps text-label-caps uppercase text-primary font-bold block">
                  Pindai kode QR dinamis
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Kode QR instan akan di-generate otomatis setelah Anda menekan tombol
                  &ldquo;Lanjut ke Pembayaran&rdquo;. Validitas transaksi 15 menit.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Channel 2: Virtual Account */}
        <div
          onClick={() => setPaymentMethod('va')}
          className={`p-space-md transition-colors cursor-pointer ${
            paymentMethod === 'va'
              ? 'bg-surface-container'
              : 'bg-surface-subtle hover:bg-surface-muted'
          }`}
        >
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-space-sm">
              <input
                type="radio"
                name="payment_method"
                checked={paymentMethod === 'va'}
                onChange={() => setPaymentMethod('va')}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="font-headline-sm text-headline-sm uppercase text-on-surface block font-bold">
                  Virtual Account Otomatis
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  BCA, Mandiri, BNI, BRI, Permata Bank
                </span>
              </div>
            </div>
            <span className="font-label-caps text-label-caps uppercase text-outline">
              Verifikasi Cepat
            </span>
          </label>
        </div>

        {/* Payment Channel 3: Kartu Kredit / Debit Online */}
        <div
          onClick={() => setPaymentMethod('cc')}
          className={`p-space-md transition-colors cursor-pointer ${
            paymentMethod === 'cc'
              ? 'bg-surface-container'
              : 'bg-surface-subtle hover:bg-surface-muted'
          }`}
        >
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-space-sm">
              <input
                type="radio"
                name="payment_method"
                checked={paymentMethod === 'cc'}
                onChange={() => setPaymentMethod('cc')}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="font-headline-sm text-headline-sm uppercase text-on-surface block font-bold">
                  Kartu Kredit / Debit
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Visa, Mastercard, JCB • 3D Secure Verification
                </span>
              </div>
            </div>
            <span className="font-label-caps text-label-caps uppercase text-outline">
              Cicilan 0%
            </span>
          </label>
        </div>
      </div>

      {/* Trust Badges & Guarantee Micro-Bar */}
      <div className="mt-space-lg pt-space-md bg-surface-muted p-space-sm flex flex-wrap items-center justify-around gap-space-sm">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span className="font-label-caps text-[11px] uppercase tracking-wider">
            Gateway pembayaran: segera hadir
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">encrypted</span>
          <span className="font-label-caps text-[11px] uppercase tracking-wider">
            Mode demo
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">assignment_return</span>
          <span className="font-label-caps text-[11px] uppercase tracking-wider">
            Jaminan Retur 7 Hari
          </span>
        </div>
      </div>
    </section>
  );
};
