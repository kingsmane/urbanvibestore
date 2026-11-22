import React from 'react';

interface CheckoutHeaderProps {
  activeStep: 1 | 2 | 3;
  setActiveStep: (step: 1 | 2 | 3) => void;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  activeStep,
  setActiveStep,
}) => {
  return (
    <section className="mb-space-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-md">
        <div>
          <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block mb-space-xs">
            Checkout Transparan
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
            Penyelesaian Pesanan
          </h1>
        </div>
        <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm bg-surface-muted px-space-sm py-1">
          <span className="material-symbols-outlined text-[18px] text-on-surface">lock</span>
          <span>Mode demo — belum ada transaksi nyata</span>
        </div>
      </div>

      {/* Swiss Grid Stepper Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xs">
        {[
          {
            step: 1 as const,
            tag: activeStep === 1 ? 'Langkah 01 — Aktif' : 'Langkah 01 — Selesai',
            title: 'Kontak & Pengiriman',
            icon: activeStep === 1 ? 'radio_button_checked' : 'check_circle',
          },
          {
            step: 2 as const,
            tag: activeStep === 2 ? 'Langkah 02 — Aktif' : 'Langkah 02 — Lanjutan',
            title: 'Opsi Ekspedisi',
            icon: activeStep === 2 ? 'radio_button_checked' : 'schedule',
          },
          {
            step: 3 as const,
            tag: activeStep === 3 ? 'Langkah 03 — Aktif' : 'Langkah 03 — Final',
            title: 'Pembayaran & Review',
            icon: activeStep === 3 ? 'radio_button_checked' : 'credit_card',
          },
        ].map((st) => {
          const isCurrent = activeStep === st.step;
          return (
            <button
              key={st.step}
              type="button"
              onClick={() => setActiveStep(st.step)}
              className={`p-space-md flex items-center justify-between transition-all text-left cursor-pointer ${
                isCurrent
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-muted text-on-surface hover:bg-surface-variant'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <span
                  className={`w-6 h-6 font-headline-sm text-headline-sm flex items-center justify-center font-bold ${
                    isCurrent
                      ? 'bg-badge-promo text-text-on-accent'
                      : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  {st.step}
                </span>
                <div className="flex flex-col">
                  <span
                    className={`font-label-caps text-label-caps uppercase tracking-wider ${
                      isCurrent ? 'text-badge-promo' : 'text-on-surface-variant'
                    }`}
                  >
                    {st.tag}
                  </span>
                  <span
                    className={`font-headline-sm text-headline-sm uppercase tracking-tight ${
                      isCurrent ? 'text-on-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              </div>
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isCurrent ? 'text-badge-promo' : 'text-outline'
                }`}
              >
                {st.icon}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
