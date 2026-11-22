import React from 'react';

export const HelpCard: React.FC = () => {
  return (
    <div className="bg-canvas-base p-space-md flex items-center justify-between">
      <div className="flex items-center gap-space-sm">
        <span className="material-symbols-outlined text-on-surface text-[24px]">
          support_agent
        </span>
        <div>
          <p className="font-headline-sm text-headline-sm uppercase text-on-surface">
            Butuh Panduan Pesanan?
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            WhatsApp Concierge 24/7 kami siap melayani
          </p>
        </div>
      </div>
      <a
        className="bg-surface-muted hover:bg-surface-variant text-on-surface px-space-sm py-1.5 font-label-caps text-label-caps uppercase tracking-wider"
        href="https://wa.me/62812000000"
        rel="noopener noreferrer"
        target="_blank"
      >
        Hubungi
      </a>
    </div>
  );
};
