import React, { useMemo, useState } from 'react';
import { formatRupiah } from '../../data/storeData';
import { compressImage } from '../../lib/imageCompress';
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

const parseVariants = (raw: string): { size: string; stock: number }[] | null => {
  const entries = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (entries.length === 0) return null;
  const result: { size: string; stock: number }[] = [];
  for (const entry of entries) {
    const [sizeRaw, stockRaw] = entry.split(':').map((s) => s.trim());
    const stock = Number(stockRaw);
    if (!sizeRaw || stockRaw === undefined || !Number.isInteger(stock) || stock < 0) return null;
    result.push({ size: sizeRaw.toUpperCase(), stock });
  }
  return result;
};

const formatBytes = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const AddProductForm: React.FC<{ onCreated: () => Promise<void>; onCancel: () => void }> = ({
  onCreated,
  onCancel,
}) => {
  const { admin } = useServices();
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<'Pria' | 'Wanita' | 'Aksesoris'>('Pria');
  const [subCategory, setSubCategory] = useState('');
  const [tagLabel, setTagLabel] = useState('Esensial');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Charcoal Black', hex: '#1C1C1C' },
    { name: 'Chalk White', hex: '#F5F5F0' },
  ]);
  const [variantsText, setVariantsText] = useState('S:10, M:15, L:15, XL:10');
  const [defaultSize, setDefaultSize] = useState('');
  const [fitNote, setFitNote] = useState('');
  const [materialTag, setMaterialTag] = useState('');
  const [density, setDensity] = useState('');
  const [silhouette, setSilhouette] = useState('');
  const [detailLabel, setDetailLabel] = useState('Kerah');
  const [detailValue, setDetailValue] = useState('');
  const [carePointsText, setCarePointsText] = useState(
    '• Cuci mesin air dingin (maks. 30°C) dengan warna serupa.\n• Jemur mendatar di tempat teduh; hindari pengering panas.'
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadFiles = async (files: FileList | null, target: 'main' | 'gallery') => {
    if (!files || files.length === 0 || uploading) return;
    setUploading(true);
    setError(null);
    try {
      let totalOrig = 0;
      let totalComp = 0;
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file);
        totalOrig += compressed.originalSize;
        totalComp += compressed.compressedSize;
        const url = await admin.uploadProductImage(compressed.blob, compressed.fileName);
        uploadedUrls.push(url);
      }
      if (target === 'main' && uploadedUrls[0]) {
        setImageUrl(uploadedUrls[0]);
      } else if (target === 'gallery' && uploadedUrls.length > 0) {
        setGalleryText((prev) => [prev.trim(), ...uploadedUrls].filter(Boolean).join('\n'));
      }
      setUploadNote(
        `Unggah berhasil (${uploadedUrls.length} foto • dikompresi ${formatBytes(totalOrig)} → ${formatBytes(totalComp)})`
      );
    } catch (err) {
      setError(describeError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || uploading) return;
    const parsedPrice = Number(price);
    const parsedOrig = originalPrice.trim() === '' ? null : Number(originalPrice);
    const variants = parseVariants(variantsText);
    const cleanColors = colors
      .map((c) => ({ name: c.name.trim(), hex: c.hex.trim() }))
      .filter((c) => c.name.length > 0 && /^#[0-9a-fA-F]{6}$/.test(c.hex));

    if (!name.trim()) return setError('Nama produk wajib diisi.');
    if (!sku.trim()) return setError('SKU wajib diisi.');
    if (price.trim() === '' || !Number.isInteger(parsedPrice) || parsedPrice < 0) {
      return setError('Harga harus berupa angka 0 atau lebih.');
    }
    if (parsedOrig !== null && (!Number.isInteger(parsedOrig) || parsedOrig < parsedPrice)) {
      return setError('Harga coret harus lebih besar atau sama dengan harga jual.');
    }
    if (cleanColors.length === 0) {
      return setError('Minimal satu warna valid harus diisi.');
    }
    if (!variants) {
      return setError('Format ukuran & stok tidak valid (contoh: S:10, M:15, L:10).');
    }

    const galleryUrls = galleryText
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);
    const carePoints = carePointsText
      .split('\n')
      .map((pt) => pt.trim())
      .filter(Boolean);

    setBusy(true);
    setError(null);
    try {
      await admin.createProduct({
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        subCategory: subCategory.trim(),
        tagLabel: tagLabel.trim(),
        price: parsedPrice,
        originalPrice: parsedOrig,
        imageUrl: imageUrl.trim() || undefined,
        galleryUrls,
        colors: cleanColors,
        defaultSize: defaultSize.trim().toUpperCase() || variants[0]?.size,
        variants,
        specs: {
          density: density.trim(),
          silhouette: silhouette.trim(),
          detailLabel: detailLabel.trim(),
          detailValue: detailValue.trim(),
          fitNote: fitNote.trim(),
          materialTag: materialTag.trim(),
          carePoints,
        },
      });
      await onCreated();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-canvas-base border border-border-strong p-space-md space-y-space-md"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-label-caps text-label-caps uppercase text-primary font-bold">
          Tambah Produk Baru (Sesuai Halaman Detail Produk)
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="font-label-caps text-label-caps uppercase text-outline hover:text-primary cursor-pointer"
        >
          Tutup
        </button>
      </div>

      {/* Bagian 1: Identitas & Harga */}
      <div className="space-y-space-xs">
        <p className="font-label-caps text-[11px] uppercase text-outline font-bold">
          1. Identitas, Kategori &amp; Harga
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Nama Lengkap Produk
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Minimalist Cargo Pants - Ink"
              aria-label="Nama Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Nama Singkat (Judul PDP)
            <input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Minimalist Cargo Pants"
              aria-label="Nama Singkat Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            SKU
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="URBN-CRG-99"
              aria-label="SKU Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Kategori
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              aria-label="Kategori Produk Baru"
              className={`${inputClass} w-full`}
            >
              <option value="Pria">Pria</option>
              <option value="Wanita">Wanita</option>
              <option value="Aksesoris">Aksesoris</option>
            </select>
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Sub-Kategori
            <input
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="Atasan / Bawahan / Outerwear"
              aria-label="Sub Kategori Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Label Tag
            <input
              value={tagLabel}
              onChange={(e) => setTagLabel(e.target.value)}
              placeholder="Esensial / New"
              aria-label="Label Tag Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Harga Jual (Rp)
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="499000"
              aria-label="Harga Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Harga Coret (opsional)
            <input
              type="number"
              min={0}
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="599000"
              aria-label="Harga Coret Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
        </div>
      </div>

      {/* Bagian 2: Foto & Varian */}
      <div className="space-y-space-xs">
        <p className="font-label-caps text-[11px] uppercase text-outline font-bold">
          2. Foto Galeri, Varian Warna &amp; Ukuran
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            <label className="block">
              URL Foto Utama (atau unggah berkas)
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... atau /uploads/products/..."
                aria-label="URL Foto Produk Baru"
                className={`${inputClass} w-full mt-1`}
              />
            </label>
            <label className="inline-flex items-center gap-space-xs px-space-sm py-1.5 border border-border-strong bg-surface-subtle text-primary cursor-pointer hover:bg-primary hover:text-on-primary transition-colors">
              <span>{uploading ? 'Mengunggah…' : 'Upload & Kompres Foto Utama'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                aria-label="Upload Foto Utama"
                onChange={(e) => void handleUploadFiles(e.target.files, 'main')}
                className="sr-only"
              />
            </label>
          </div>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Ukuran Default Terpilih (opsional)
            <input
              value={defaultSize}
              onChange={(e) => setDefaultSize(e.target.value.toUpperCase())}
              placeholder="M"
              aria-label="Ukuran Default Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <div className="sm:col-span-2 space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                Daftar Warna (Picker)
              </span>
              <button
                type="button"
                onClick={() => setColors((prev) => [...prev, { name: '', hex: '#333333' }])}
                className="px-space-sm py-1 border border-border-strong bg-canvas-base font-label-caps text-label-caps uppercase text-primary hover:bg-primary hover:text-on-primary cursor-pointer transition-colors"
              >
                + Tambah Warna
              </button>
            </div>
            <div className="space-y-space-xs">
              {colors.map((c, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-space-xs">
                  <input
                    type="color"
                    value={c.hex}
                    aria-label={`Pilih warna ${idx + 1}`}
                    onChange={(e) =>
                      setColors((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, hex: e.target.value } : item))
                      )
                    }
                    className="w-10 h-9 p-0.5 bg-canvas-base border border-border-hairline cursor-pointer"
                  />
                  <input
                    type="text"
                    value={c.name}
                    placeholder="Nama warna (mis. Charcoal Black)"
                    aria-label={`Nama warna ${idx + 1}`}
                    onChange={(e) =>
                      setColors((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, name: e.target.value } : item))
                      )
                    }
                    className={`${inputClass} flex-1 min-w-[180px]`}
                  />
                  <span className="font-mono text-body-sm text-outline w-20">
                    {c.hex.toUpperCase()}
                  </span>
                  {colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setColors((prev) => prev.filter((_, i) => i !== idx))}
                      className="px-space-xs py-1 text-error font-label-caps text-label-caps uppercase cursor-pointer hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <label className="sm:col-span-2 space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Ukuran &amp; Stok Awal (Ukuran:Stok, pisahkan koma)
            <input
              value={variantsText}
              onChange={(e) => setVariantsText(e.target.value)}
              placeholder="S:10, M:15, L:15, XL:10"
              aria-label="Ukuran dan Stok Awal"
              className={`${inputClass} w-full`}
            />
          </label>
          <div className="sm:col-span-2 space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            <label className="block">
              URL Foto Galeri Tambahan (1 URL per baris, opsional)
              <textarea
                rows={2}
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
                placeholder="https://.../foto-2.jpg&#10;https://.../foto-3.jpg"
                aria-label="Galeri Foto Produk Baru"
                className={`${inputClass} w-full mt-1`}
              />
            </label>
            <label className="inline-flex items-center gap-space-xs px-space-sm py-1.5 border border-border-strong bg-surface-subtle text-primary cursor-pointer hover:bg-primary hover:text-on-primary transition-colors">
              <span>{uploading ? 'Mengunggah…' : 'Upload & Kompres Foto Galeri'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                aria-label="Upload Foto Galeri"
                onChange={(e) => void handleUploadFiles(e.target.files, 'gallery')}
                className="sr-only"
              />
            </label>
          </div>
          {uploadNote && (
            <p className="sm:col-span-2 font-body-sm text-body-sm text-primary font-medium">
              {uploadNote}
            </p>
          )}
        </div>
      </div>

      {/* Bagian 3: Spesifikasi & Perawatan (tampil di PDP) */}
      <div className="space-y-space-xs">
        <p className="font-label-caps text-[11px] uppercase text-outline font-bold">
          3. Spesifikasi, Catatan Fitting &amp; Perawatan (Halaman Detail Produk)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Catatan Fitting (Overlay Foto)
            <input
              value={fitNote}
              onChange={(e) => setFitNote(e.target.value)}
              placeholder="Model (180cm / 72kg) memakai size L"
              aria-label="Catatan Fitting Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Tag Material
            <input
              value={materialTag}
              onChange={(e) => setMaterialTag(e.target.value)}
              placeholder="100% Combed Cotton 24s"
              aria-label="Material Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Gramasi / Ketebalan
            <input
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              placeholder="240 GSM"
              aria-label="Gramasi Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Siluet / Potongan
            <input
              value={silhouette}
              onChange={(e) => setSilhouette(e.target.value)}
              placeholder="Boxy Oversized"
              aria-label="Siluet Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Label Detail Konstruksi
            <input
              value={detailLabel}
              onChange={(e) => setDetailLabel(e.target.value)}
              placeholder="Kerah / Jahitan"
              aria-label="Label Detail Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Nilai Detail Konstruksi
            <input
              value={detailValue}
              onChange={(e) => setDetailValue(e.target.value)}
              placeholder="Ribbed 2.5cm"
              aria-label="Nilai Detail Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="sm:col-span-2 lg:col-span-3 space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Poin Material &amp; Perawatan (1 poin per baris)
            <textarea
              rows={2}
              value={carePointsText}
              onChange={(e) => setCarePointsText(e.target.value)}
              aria-label="Poin Perawatan Produk Baru"
              className={`${inputClass} w-full`}
            />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-error font-body-sm text-body-sm font-medium">
          {error}
        </p>
      )}
      <div className="flex gap-space-sm">
        <button
          type="submit"
          disabled={busy}
          className="px-space-md py-2 bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent disabled:opacity-60 font-label-caps text-label-caps uppercase font-bold cursor-pointer transition-colors"
        >
          {busy ? 'Menyimpan…' : 'Simpan Produk Baru'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-space-md py-2 border border-border-hairline bg-canvas-base font-label-caps text-label-caps uppercase cursor-pointer"
        >
          Batal
        </button>
      </div>
    </form>
  );
};

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
            placeholder="Cari nama atau SKU…"
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
            <option value="LOW_STOCK">Stok menipis (≤ 3)</option>
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
        <AddProductForm
          onCancel={() => setShowAdd(false)}
          onCreated={async () => {
            setShowAdd(false);
            await reload();
          }}
        />
      )}

      {loading && <p role="status" className="text-outline">Memuat produk…</p>}
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
