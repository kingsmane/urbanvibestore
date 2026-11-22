import type { Product } from '../data/storeData';

export type SortOrder = 'terbaru' | 'harga-rendah' | 'harga-tinggi';

/** Filter kategori + pencarian (nama, kategori, sub-kategori, tag) lalu urutkan. */
export function filterAndSortProducts(
  products: Product[],
  category: string,
  query: string,
  sortOrder: SortOrder
): Product[] {
  const q = query.toLowerCase().trim();
  return products
    .filter((item) => {
      const matchesCat = category === 'Semua' || item.category === category;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subCategory.toLowerCase().includes(q) ||
        item.tagLabel.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'harga-rendah') return a.price - b.price;
      if (sortOrder === 'harga-tinggi') return b.price - a.price;
      return 0;
    });
}
