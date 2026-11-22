import React from 'react';
import { Product } from '../../data/storeData';

interface ZoomModalProps {
  product: Product;
  setZoomModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeHeroImage: string;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({
  product,
  setZoomModalOpen,
  activeHeroImage,
}) => {
  return (
    <>
      <div
        onClick={() => setZoomModalOpen(false)}
        className="fixed inset-0 z-[110] bg-primary/80 backdrop-blur-sm flex items-center justify-center p-margin"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-2xl w-full bg-canvas-base border border-border-strong p-2"
        >
          <button
            type="button"
            onClick={() => setZoomModalOpen(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-primary text-on-primary flex items-center justify-center hover:bg-badge-promo hover:text-text-on-accent cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            alt={product.name}
            referrerPolicy="no-referrer"
            src={activeHeroImage}
            className="w-full max-h-[82vh] object-contain"
          />
        </div>
      </div>
    </>
  );
};
