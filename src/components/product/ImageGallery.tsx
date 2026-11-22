import React from 'react';
import { Product } from '../../data/storeData';

interface ImageGalleryProps {
  product: Product;
  activeImageIdx: number;
  setActiveImageIdx: React.Dispatch<React.SetStateAction<number>>;
  setZoomModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  thumbnails: string[];
  activeHeroImage: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  product,
  activeImageIdx,
  setActiveImageIdx,
  setZoomModalOpen,
  thumbnails,
  activeHeroImage,
}) => {
  return (
    <div className="lg:col-span-7 flex flex-col md:flex-row gap-space-md">
      {/* Thumbnail Bar */}
      <div className="order-2 md:order-1 flex md:flex-col gap-space-sm shrink-0 overflow-x-auto md:overflow-visible pb-space-xs md:pb-0">
        {thumbnails.map((thumbUrl, idx) => {
          const isSelected = activeImageIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIdx(idx)}
              className={`w-16 h-20 md:w-20 md:h-24 bg-surface-muted shrink-0 overflow-hidden relative transition-all cursor-pointer ${
                isSelected
                  ? 'border-2 border-primary'
                  : 'border border-border-hairline hover:border-outline'
              }`}
            >
              <img
                alt={`${product.shortName} view ${idx + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                src={thumbUrl}
              />
            </button>
          );
        })}
      </div>

      {/* Main Display Canvas */}
      <div className="order-1 md:order-2 flex-1 flex flex-col">
        <div className="relative w-full aspect-[3/4] bg-surface-muted overflow-hidden group">
          <span className="absolute top-space-sm left-space-sm z-10 bg-badge-promo text-text-on-accent px-space-xs py-0.5 font-label-caps text-label-caps uppercase font-bold tracking-wider">
            {product.isSoldOut ? 'HABIS' : 'NEW DROP'}
          </span>
          <button
            type="button"
            aria-label="Perbesar foto"
            onClick={() => setZoomModalOpen(true)}
            className="absolute top-space-sm right-space-sm z-10 w-10 h-10 bg-canvas-base/90 backdrop-blur-sm border border-border-hairline text-on-surface flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">zoom_in</span>
          </button>

          <img
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-opacity duration-300"
            src={activeHeroImage}
          />

          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent p-space-md text-on-primary flex items-end justify-between">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-wider opacity-80">
                Catatan Fitting
              </p>
              <p className="font-body-sm text-body-sm font-medium">
                {product.specs.fitNote}
              </p>
            </div>
            <span className="font-label-caps text-[10px] tracking-widest uppercase bg-canvas-base/20 px-2 py-1 backdrop-blur-xs">
              {product.specs.materialTag}
            </span>
          </div>
        </div>

        {/* Secondary Micro-feature strip */}
        <div className="grid grid-cols-3 gap-space-xs mt-space-sm text-center">
          <div className="bg-surface-subtle border border-border-hairline p-space-xs">
            <span className="font-label-caps text-[11px] uppercase tracking-wider block text-outline">
              Kerapatan Kain
            </span>
            <span className="font-headline-sm text-body-md font-bold text-primary">
              {product.specs.density}
            </span>
          </div>
          <div className="bg-surface-subtle border border-border-hairline p-space-xs">
            <span className="font-label-caps text-[11px] uppercase tracking-wider block text-outline">
              Potongan Siluet
            </span>
            <span className="font-headline-sm text-body-md font-bold text-primary">
              {product.specs.silhouette}
            </span>
          </div>
          <div className="bg-surface-subtle border border-border-hairline p-space-xs">
            <span className="font-label-caps text-[11px] uppercase tracking-wider block text-outline">
              {product.specs.detailLabel}
            </span>
            <span className="font-headline-sm text-body-md font-bold text-primary">
              {product.specs.detailValue}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
