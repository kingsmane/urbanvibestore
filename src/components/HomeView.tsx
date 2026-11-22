import React, { useState } from 'react';
import { Product, formatRupiah } from '../data/storeData';
import { filterAndSortProducts, SortOrder } from '../lib/catalog';
import { HeroSection } from './home/HeroSection';
import { TrustStrip } from './home/TrustStrip';
import { CatalogControls } from './home/CatalogControls';
import { ProductGrid } from './home/ProductGrid';
import { LookbookSection } from './home/LookbookSection';

interface HomeViewProps {
  products: Product[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProduct: (productId: string) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onAddBundle: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenProduct,
  onAddToCart,
  onAddBundle,
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('terbaru');
  const [selectedCardSizes, setSelectedCardSizes] = useState<Record<string, string>>({
    'prod-1': 'L',
    'prod-2': 'M',
    'prod-3': '28',
  });
  const [selectedCardColors, setSelectedCardColors] = useState<Record<string, string>>({});

  const filteredProducts = filterAndSortProducts(products, activeCategory, searchQuery, sortOrder);

  const applyQueryFilter = (query: string) => {
    onCategoryChange('Semua');
    onSearchChange(query);
  };

  return (
    <div className="flex flex-col w-full">
      {/* SECTION 1: EDITORIAL HERO BANNER */}
      <HeroSection onOpenProduct={onOpenProduct} />

      {/* SECTION 2: VALUE PROPOSITION STRIP */}
      <TrustStrip />

      {/* SECTION 3: CATEGORY SWITCHER & FILTER BAR */}
      <CatalogControls activeCategory={activeCategory} onCategoryChange={onCategoryChange} searchQuery={searchQuery} onSearchChange={onSearchChange} sortOrder={sortOrder} setSortOrder={setSortOrder} filteredProducts={filteredProducts} applyQueryFilter={applyQueryFilter} />

      {/* SECTION 4: CURATED PRODUCT GRID */}
      <ProductGrid activeCategory={activeCategory} onCategoryChange={onCategoryChange} searchQuery={searchQuery} onSearchChange={onSearchChange} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} selectedCardSizes={selectedCardSizes} setSelectedCardSizes={setSelectedCardSizes} selectedCardColors={selectedCardColors} setSelectedCardColors={setSelectedCardColors} filteredProducts={filteredProducts} />

      {/* SECTION 5: CURATED LOOKBOOK / EDITORIAL STORY */}
      <LookbookSection products={products} onOpenProduct={onOpenProduct} onAddToCart={onAddToCart} onAddBundle={onAddBundle} />
    </div>
  );
};
