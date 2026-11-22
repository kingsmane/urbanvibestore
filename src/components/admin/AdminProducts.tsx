import React, { useState } from 'react';
import { formatRupiah } from '../../data/storeData';
import { describeError } from '../../services/errors';
import { useServices } from '../../services/ServicesContext';
import type { AdminProduct } from '../../services/types';
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
          {busy ? '…' : 'Simpan'}
        </button>
      </div>
      {error && <p role="alert" className="text-error font-body-sm text-body-sm">{error}</p>}
    </div>
  );
};

const ProductCard: React.FC<{ product: AdminProduct; onSaved: () => Promise<void> }> = ({ product, onSaved }) => {
  const { admin } = useServices();
  const [price, setPrice] = useState(String(product.price));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const parsed = Number(price);
  const priceValid = price.trim() !== '' && Number.isInteger(parsed) && parsed >= 0;

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
              {product.sku} • {product.category}
            </p>
          </div>
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

        <div className="flex flex-wrap items-center gap-space-sm">
          <label className="flex items-center gap-space-xs font-label-caps text-label-caps uppercase text-on-surface-variant">
            Harga (Rp)
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-label={`Harga ${product.name}`}
              className={`${inputClass} w-36`}
            />
          </label>
          <button
            type="button"
            disabled={!priceValid || parsed === product.price || busy}
            onClick={() => run(() => admin.updateProduct(product.id, { price: parsed }))}
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

export const AdminProducts: React.FC = () => {
  const { admin } = useServices();
  const { data, loading, error, reload } = useAdminData(() => admin.listProducts());

  return (
    <div className="space-y-space-md">
      <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">Produk &amp; Stok</h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Ubah harga, status aktif, dan stok per ukuran. Perubahan langsung berlaku di toko.
      </p>
      {loading && <p role="status" className="text-outline">Memuat produk…</p>}
      {error && <p role="alert" className="text-error">{error}</p>}
      <ul className="space-y-space-sm">
        {(data ?? []).map((p) => (
          <ProductCard key={p.id} product={p} onSaved={reload} />
        ))}
      </ul>
    </div>
  );
};
