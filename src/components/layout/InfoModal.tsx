import React from 'react';
import { InfoContent } from './types';

interface InfoModalProps {
  infoModal: InfoContent;
  setInfoModal: React.Dispatch<React.SetStateAction<InfoContent | null>>;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  infoModal,
  setInfoModal,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[110] bg-primary/60 backdrop-blur-xs flex items-center justify-center p-margin">
        <div className="bg-canvas-base border-2 border-border-strong w-full max-w-lg p-space-lg shadow-[8px_8px_0px_0px_#111827]">
          <div className="flex items-start justify-between border-b border-border-hairline pb-space-sm">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-outline">
                {infoModal.subtitle}
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary uppercase font-bold mt-0.5">
                {infoModal.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setInfoModal(null)}
              className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
          <div className="py-space-md space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
            {infoModal.content.map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="border-t border-border-hairline pt-space-md flex justify-end gap-space-sm">
            <button
              type="button"
              onClick={() => setInfoModal(null)}
              className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
