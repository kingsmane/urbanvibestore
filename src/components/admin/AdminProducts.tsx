import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRupiah } from '../../data/storeData';
import { describeError } from '../../services/errors';
import { useServices } from '../../services/ServicesContext';
import type { AdminProduct } from '../../services/types';
import { ProductDetailForm } from './ProductDetailForm';
import { useAdminData } from './useAdminData';

const inputClass =
  'bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong';

const StockEditor: React.FC<{ id: string; size: string; stock: number; onSaved: () => Promise<void> }> = ({
  id,
  size,
  stock,
  onSaved,
}) => {
  const { admin } = useServices();
  const [value, setValue] = useState(String(stock));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsed = Number(value);
  const valid = value.trim() !== '' && Number.isInteger(parsed) && parsed >= 0;
  const dirty = valid && parsed !== stock;

  const save = async () => {
    if (!dirty || busy) return;
    setBusy(true);
    setError(null);
    try {
      await admin.updateStock(id, parsed);
      await onSaved();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant w-8">{size}</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`Stok ukuran ${size}`}
          className={`${inputClass} w-20`}
        />
        <button
          type="button"
          onClick={save}
          disabled={!dirty || busy}
          aria-label={`Simpan stok ukuran ${size}`}
          className="px-2 py-2 bg-primary text-on-primary disabled:opacity-30 font-label-caps text-label-caps uppercase cursor-pointer"
        >
          {busy ? 'â€¦' : 'Simpan'}
        </button>
      </div>
      {error && <p role="alert" className="text-error font-body-sm text-body-sm">{error}</p>}
    </div>
  );
};

const ProductCard: React.FC<{ product: AdminProduct; onSaved: () => Promise<void> }> = ({ product, onSaved }) => {
  const { admin } = useServices();
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [originalPrice, setOriginalPrice] = useState(
    product.originalPrice != null ? String(product.originalPrice) : ''
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsed = Number(price);
  const priceValid = price.trim() !== '' && Number.isInteger(parsed) && parsed >= 0;
  const parsedOrig = originalPrice.trim() === '' ? null : Number(originalPrice);
  const origValid = parsedOrig === null || (Number.isInteger(parsedOrig) && parsedOrig >= 0);
  const detailsDirty =
    name.trim().length > 0 &&
    priceValid &&
    origValid &&
    (name.trim() !== product.name ||
      parsed !== product.price ||
      parsedOrig !== (product.originalPrice ?? null));

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      await onSaved();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="bg-canvas-base border border-border-hairline p-space-md flex flex-col md:flex-row gap-space-md">
      <img
        alt={product.name}
        src={product.imageUrl}
        referrerPolicy="no-referrer"
        loading="lazy"
        className="w-20 h-24 object-cover bg-surface-muted border border-border-hairline shrink-0"
      />
      <div className="flex-1 space-y-space-sm min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <div className="min-w-0">
            <h2 className="font-body-md text-body-md font-semibold text-primary truncate">{product.name}</h2>
            <p className="font-label-caps text-label-caps uppercase text-outline">
              {product.sku} â€¢ {product.category}
            </p>
          </div>
          <div className="flex items-center gap-space-md">
            <Link
              to={`/admin/produk/${product.id}`}
              className="px-space-sm py-1 border border-border-strong font-label-caps text-label-caps uppercase text-primary hover:bg-primary hover:text-on-primary transition-colors"
            >
              Edit Detail
            </Link>
            <label className="flex items-center gap-space-xs font-label-caps text-label-caps uppercase cursor-pointer">
              <input
                type="checkbox"
                checked={product.isActive}
                disabled={busy}
                onChange={(e) => run(() => admin.updateProduct(product.id, { isActive: e.target.checked }))}
                aria-label={`Aktifkan ${product.name}`}
                className="w-4 h-4 accent-primary"
              />
              {product.isActive ? 'Aktif' : 'Nonaktif'}
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <label className="flex items-center gap-space-xs font-label-caps text-label-caps uppercase text-on-surface-variant">
            Nama
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label={`Nama ${product.name}`}
              className={`${inputClass} w-64`}
            />
          </label>
          <label className="flex items-center gap-space-xs font-label-caps text-label-caps uppercase text-on-surface-variant">
            Harga (Rp)
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-label={`Harga ${product.name}`}
              className={`${inputClass} w-32`}
            />
          </label>
          <label className="flex items-center gap-space-xs font-label-caps text-label-caps uppercase text-on-surface-variant">
            Harga Coret
            <input
              type="number"
              min={0}
              value={originalPrice}
              placeholder="Opsional"
              onChange={(e) => setOriginalPrice(e.target.value)}
              aria-label={`Harga coret ${product.name}`}
              className={`${inputClass} w-32`}
            />
          </label>
          <button
            type="button"
            disabled={!detailsDirty || busy}
            onClick={() =>
              run(() =>
                admin.updateProduct(product.id, {
                  name: name.trim(),
                  price: parsed,
                  originalPrice: parsedOrig,
                })
              )
            }
            className="px-space-md py-2 bg-primary text-on-primary disabled:opacity-30 font-label-caps text-label-caps uppercase cursor-pointer"
          >
            Simpan Harga
          </button>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Saat ini {formatRupiah(product.price)}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-space-lg gap-y-space-sm">
          {product.variants.map((v) => (
            <StockEditor key={`${v.id}-${v.stock}`} id={v.id} size={v.size} stock={v.stock} onSaved={onSaved} />
          ))}
        </div>

        {error && <p role="alert" className="text-error font-body-sm text-body-sm">{error}</p>}
      </div>
    </li>
  );
};

type StockFilter = 'SEMUA' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INACTIVE';


export const AdminProducts: React.FC = () => {
  const { admin } = useServices();
  const { data, loading, error, reload } = useAdminData(() => admin.listProducts());
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('SEMUA');
  const [stockFilter, setStockFilter] = useState<StockFilter>('SEMUA');

  const categories = useMemo(
    () => ['SEMUA', ...Array.from(new Set((data ?? []).map((p) => p.category)))],
    [data]
  );

  const products = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (category !== 'SEMUA' && p.category !== category) return false;
      if (stockFilter === 'LOW_STOCK' && !p.variants.some((v) => v.stock > 0 && v.stock <= 3)) return false;
      if (stockFilter === 'OUT_OF_STOCK' && !p.variants.some((v) => v.stock === 0)) return false;
      if (stockFilter === 'INACTIVE' && p.isActive) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [data, search, category, stockFilter]);

  return (
    <div className="space-y-space-md">
      <div className="flex flex-wrap items-end justify-between gap-space-sm">
        <div>
          <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">Produk &amp; Stok</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Ubah nama, harga, status aktif, dan stok per ukuran. Perubahan langsung berlaku di toko.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau SKUâ€¦"
            aria-label="Cari produk"
            className="bg-canvas-base border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong w-56"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter kategori"
            className="bg-canvas-base border border-border-hairline p-2 font-body-sm text-body-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'SEMUA' ? 'Semua kategori' : c}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            aria-label="Filter stok"
            className="bg-canvas-base border border-border-hairline p-2 font-body-sm text-body-sm"
          >
            <option value="SEMUA">Semua kondisi</option>
            <option value="LOW_STOCK">Stok menipis (â‰¤ 3)</option>
            <option value="OUT_OF_STOCK">Ada ukuran habis</option>
            <option value="INACTIVE">Produk nonaktif</option>
          </select>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="px-space-md py-2 bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent font-label-caps text-label-caps uppercase font-bold cursor-pointer transition-colors"
          >
            + Tambah Produk
          </button>
        </div>
      </div>

      {showAdd && (
        <ProductDetailForm
          mode="create"
          onCancel={() => setShowAdd(false)}
          onSubmit={async (input) => {
            await admin.createProduct(input);
            setShowAdd(false);
            await reload();
          }}
        />
      )}

      {loading && <p role="status" className="text-outline">Memuat produkâ€¦</p>}
      {error && <p role="alert" className="text-error">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="text-on-surface-variant">Tidak ada produk yang cocok dengan filter.</p>
      )}
      <ul className="space-y-space-sm">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onSaved={reload} />
        ))}
      </ul>
    </div>
  );
};
