import React from 'react';
import { Product, formatRupiah } from '../../data/storeData';

interface ProductGridProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProduct: (productId: string) => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  selectedCardSizes: Record<string, string>;
  setSelectedCardSizes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedCardColors: Record<string, string>;
  setSelectedCardColors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  filteredProducts: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onOpenProduct,
  onAddToCart,
  selectedCardSizes,
  setSelectedCardSizes,
  selectedCardColors,
  setSelectedCardColors,
  filteredProducts,
}) => {
  return (
    <section className="w-full bg-canvas-base pb-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop">
        {filteredProducts.length === 0 ? (
          <div className="py-space-xl text-center bg-surface-subtle border border-border-hairline p-space-lg space-y-space-sm">
            <span className="material-symbols-outlined text-[36px] text-outline">search_off</span>
            <h3 className="font-headline-sm text-headline-sm uppercase text-primary">
              Tidak Ada Artikel yang Cocok
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
              Pencarian &ldquo;{searchQuery}&rdquo; pada kategori {activeCategory} tidak ditemukan.
              Silakan atur ulang filter untuk melihat katalog kurasi lengkap.
            </p>
            <button
              type="button"
              onClick={() => {
                onCategoryChange('Semua');
                onSearchChange('');
              }}
              className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
            >
              Tampilkan Semua Koleksi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-space-sm md:gap-x-space-md gap-y-space-lg">
            {filteredProducts.map((product) => {
              const activeSize = selectedCardSizes[product.id] || product.defaultSize;
              const activeColor =
                selectedCardColors[product.id] || product.colors[0]?.name || 'Default';

              if (product.isSoldOut) {
                return (
                  <article
                    key={product.id}
                    onClick={() => onOpenProduct(product.id)}
                    className="product-item group flex flex-col justify-between bg-surface-subtle p-space-xs opacity-75 relative cursor-pointer"
                  >
                    <div className="relative w-full aspect-[3/4] bg-surface-dim overflow-hidden grayscale">
                      <img
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover mix-blend-multiply"
                        src={product.image}
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="bg-badge-soldout text-on-primary px-2.5 py-1 font-label-caps text-[11px] uppercase tracking-wider font-bold">
                          Habis
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                        <span className="bg-badge-soldout text-on-primary px-3 py-1 font-label-caps text-label-caps uppercase tracking-widest">
                          Stok Kosong
                        </span>
                      </div>
                    </div>
                    <div className="pt-space-sm flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center justify-between text-outline mb-1">
                          <span className="font-label-caps text-label-caps uppercase">
                            {product.subCategory}
                          </span>
                          <span className="font-label-caps text-[10px] text-error font-bold uppercase">
                            {product.tagLabel}
                          </span>
                        </div>
                        <h3 className="font-body-md text-body-md text-outline font-semibold line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1.5 my-2">
                          {product.colors.map((c) => (
                            <span
                              key={c.name}
                              style={{ backgroundColor: c.hex }}
                              className="w-3.5 h-3.5 rounded-full inline-block opacity-50 border border-border-hairline"
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="font-price-display text-price-display text-outline">
                            {formatRupiah(product.price)}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled
                          onClick={(e) => e.stopPropagation()}
                          className="w-full py-2 bg-surface-variant text-outline font-label-caps text-label-caps uppercase tracking-wider cursor-not-allowed text-center"
                        >
                          Habis Terjual
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={product.id}
                  className="product-item group flex flex-col justify-between bg-canvas-base p-space-xs transition-shadow duration-200 hover:shadow-lg"
                >
                  <div
                    onClick={() => onOpenProduct(product.id)}
                    className="relative w-full aspect-[3/4] bg-surface-muted overflow-hidden cursor-pointer"
                  >
                    <img
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={product.image}
                    />
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.badges.map((b, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 font-label-caps text-[10px] uppercase font-bold shadow-sm ${
                            b.variant === 'promo'
                              ? 'bg-badge-promo text-text-on-accent'
                              : b.variant === 'dark'
                              ? 'bg-primary text-on-primary'
                              : 'bg-canvas-base text-primary'
                          }`}
                        >
                          {b.text}
                        </span>
                      ))}
                    </div>


                    {/* Hover Action Quick Add */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-x-2 bottom-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block"
                    >
                      <button
                        type="button"
                        onClick={() => onAddToCart(product, activeSize, activeColor)}
                        className="w-full py-2.5 bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-1 shadow-md cursor-pointer font-bold"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          shopping_bag
                        </span>
                        <span>+ Keranjang</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-space-sm flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between text-outline mb-1">
                        <span className="font-label-caps text-label-caps uppercase">
                          {product.subCategory}
                        </span>
                        <span className="font-label-caps text-[11px] text-badge-soldout bg-surface-muted px-1">
                          {product.tagLabel}
                        </span>
                      </div>

                      <h3
                        onClick={() => onOpenProduct(product.id)}
                        className="font-body-md text-body-md text-primary font-semibold line-clamp-1 group-hover:underline cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      {/* Color Swatches */}
                      <div className="flex items-center gap-1.5 my-2">
                        {product.colors.map((c) => {
                          const isSelectedColor = activeColor === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() =>
                                setSelectedCardColors((prev) => ({
                                  ...prev,
                                  [product.id]: c.name,
                                }))
                              }
                              style={{ backgroundColor: c.hex }}
                              className={`w-3.5 h-3.5 rounded-full inline-block cursor-pointer ${
                                isSelectedColor
                                  ? 'ring-1 ring-offset-1 ring-primary'
                                  : 'hover:ring-1 hover:ring-outline'
                              }`}
                              title={c.name}
                            />
                          );
                        })}
                        {product.extraColorCount && (
                          <span className="text-[10px] font-label-caps text-outline ml-1">
                            +{product.extraColorCount} warna
                          </span>
                        )}
                      </div>

                      {/* Size selector pills for top 3 featured cards (matching design) */}
                      {['prod-1', 'prod-2', 'prod-3'].includes(product.id) && (
                        <div className="flex items-center gap-1 my-1.5">
                          {product.sizes
                            .filter((s) => s.stock > 0)
                            .slice(0, 4)
                            .map((s) => (
                              <button
                                key={s.code}
                                type="button"
                                onClick={() =>
                                  setSelectedCardSizes((prev) => ({
                                    ...prev,
                                    [product.id]: s.code,
                                  }))
                                }
                                className={`w-6 h-6 flex items-center justify-center font-label-caps text-[10px] transition-colors cursor-pointer ${
                                  activeSize === s.code
                                    ? 'bg-primary text-on-primary font-bold'
                                    : 'bg-surface-muted hover:bg-primary hover:text-on-primary text-primary'
                                }`}
                              >
                                {s.code}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-price-display text-price-display text-primary">
                          {formatRupiah(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="font-price-strike text-price-strike text-outline line-through">
                            {formatRupiah(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label="Tambah Produk"
                        onClick={() => onAddToCart(product, activeSize, activeColor)}
                        className="md:hidden p-1.5 bg-badge-promo text-text-on-accent cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add_shopping_cart
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
