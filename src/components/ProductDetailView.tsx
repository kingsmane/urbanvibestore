import React, { useState, useEffect } from 'react';
import { Product, formatRupiah } from '../data/storeData';
import { BreadcrumbBar } from './product/BreadcrumbBar';
import { ImageGallery } from './product/ImageGallery';
import { PurchasePanel } from './product/PurchasePanel';
import { ZoomModal } from './product/ZoomModal';
import { SizeGuideModal } from './product/SizeGuideModal';
import { PairingSection } from './product/PairingSection';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onNavigateHome: (category?: string) => void;
  onOpenProduct: (productId: string) => void;
  onOpenFullSizeGuide: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onBuyNow: (product: Product, size: string, color: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onNavigateHome,
  onOpenProduct,
  onOpenFullSizeGuide,
  onAddToCart,
  onBuyNow,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Charcoal Black');
  const [selectedSize, setSelectedSize] = useState(product.defaultSize || 'L');
  const [openMaterialTab, setOpenMaterialTab] = useState(true);
  const [openDeliveryTab, setOpenDeliveryTab] = useState(false);
  const [sizeGuideModalOpen, setSizeGuideModalOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<'CM' | 'INCH'>('CM');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedColor(product.colors[0]?.name || 'Charcoal Black');
    setSelectedSize(product.defaultSize || 'L');
  }, [product]);

  // Thumbnail images: for prod-1, thumb index 0..3 correspond to gallery[1..4], and main starts at gallery[0]
  const thumbnails =
    product.gallery.length > 1 ? product.gallery.slice(1) : product.gallery;
  const activeHeroImage =
    activeImageIdx === 0
      ? product.gallery[0]
      : thumbnails[activeImageIdx - 1] || product.gallery[0];

  const currentSizeObj =
    product.sizes.find((s) => s.code === selectedSize) || product.sizes[0];

  const handleAddClick = () => {
    if (product.isSoldOut || currentSizeObj?.stock === 0) return;
    onAddToCart(product, selectedSize, selectedColor);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const formatDim = (cmVal: number) => {
    if (sizeUnit === 'CM') return `${cmVal} cm`;
    return `${(cmVal / 2.54).toFixed(1)}"`;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Breadcrumb Bar */}
      <BreadcrumbBar product={product} onNavigateHome={onNavigateHome} />

      {/* Main PDP Two-Column Grid */}
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg lg:py-space-xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-gutter-desktop">
          {/* Left Column: Editorial Gallery */}
          <ImageGallery product={product} activeImageIdx={activeImageIdx} setActiveImageIdx={setActiveImageIdx} setZoomModalOpen={setZoomModalOpen} thumbnails={thumbnails} activeHeroImage={activeHeroImage} />

          {/* Right Column: Sticky Product Info & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <PurchasePanel product={product} onBuyNow={onBuyNow} selectedColor={selectedColor} setSelectedColor={setSelectedColor} selectedSize={selectedSize} setSelectedSize={setSelectedSize} openMaterialTab={openMaterialTab} setOpenMaterialTab={setOpenMaterialTab} openDeliveryTab={openDeliveryTab} setOpenDeliveryTab={setOpenDeliveryTab} setSizeGuideModalOpen={setSizeGuideModalOpen} addedFeedback={addedFeedback} currentSizeObj={currentSizeObj} handleAddClick={handleAddClick} />
          </div>
        </div>
      </div>

      {/* ZOOM LIGHTBOX MODAL */}
      {zoomModalOpen && (
        <ZoomModal product={product} setZoomModalOpen={setZoomModalOpen} activeHeroImage={activeHeroImage} />
      )}

      {/* Interactive Visual Size Guide Modal */}
      {sizeGuideModalOpen && (
        <SizeGuideModal onOpenFullSizeGuide={onOpenFullSizeGuide} selectedSize={selectedSize} setSelectedSize={setSelectedSize} setSizeGuideModalOpen={setSizeGuideModalOpen} sizeUnit={sizeUnit} setSizeUnit={setSizeUnit} formatDim={formatDim} />
      )}

      {/* Recommended Pairing Section: Lengkapi Gaya Anda */}
      <PairingSection products={allProducts} onNavigateHome={onNavigateHome} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} />
    </div>
  );
};
