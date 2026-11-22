import React, { useState } from 'react';
import { formatRupiah } from '../../data/storeData';
import { describeError } from '../../services/errors';
import { useServices } from '../../services/ServicesContext';
import type { AdminVoucher } from '../../services/types';
import { formatDateTime, useAdminData } from './useAdminData';

const inputClass =
  'bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong w-full';

const VoucherRow: React.FC<{ voucher: AdminVoucher; onSaved: () => Promise<void> }> = ({
  voucher,
  onSaved,
}) => {
  const { admin } = useServices();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await admin.toggleVoucher(voucher.code, next);
      await onSaved();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="border-b border-border-hairline last:border-0">
      <td className="p-space-sm font-label-caps text-label-caps uppercase font-bold text-primary">
        {voucher.code}
      </td>
      <td className="p-space-sm">{voucher.description || '—'}</td>
      <td className="p-space-sm font-price-display font-semibold">
        {formatRupiah(voucher.discountAmount)}
      </td>
      <td className="p-space-sm text-on-surface-variant">
        {voucher.minSubtotal > 0 ? formatRupiah(voucher.minSubtotal) : 'Tanpa minimum'}
      </td>
      <td className="p-space-sm text-on-surface-variant">
        {voucher.perUserLimit ? `${voucher.perUserLimit}x / akun` : 'Tak terbatas'}
        {voucher.maxRedemptions ? ` • Maks ${voucher.maxRedemptions}` : ''}
      </td>
      <td className="p-space-sm">
        <label className="inline-flex items-center gap-space-xs font-label-caps text-label-caps uppercase cursor-pointer">
          <input
            type="checkbox"
            checked={voucher.isActive}
            disabled={busy}
            onChange={(e) => void toggle(e.target.checked)}
            aria-label={`Aktifkan voucher ${voucher.code}`}
            className="w-4 h-4 accent-primary"
          />
          {voucher.isActive ? 'Aktif' : 'Nonaktif'}
        </label>
        {error && (
          <p role="alert" className="text-error font-body-sm text-body-sm mt-1">
            {error}
          </p>
        )}
      </td>
    </tr>
  );
};

export const AdminVouchers: React.FC = () => {
  const { admin } = useServices();
  const { data, loading, error, reload } = useAdminData(() => admin.listVouchers());

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [minSubtotal, setMinSubtotal] = useState('0');
  const [perUserLimit, setPerUserLimit] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const cleanCode = code.trim().toUpperCase();
    const discount = Number(discountAmount);
    const minSub = Number(minSubtotal || 0);
    const perUser = perUserLimit.trim() ? Number(perUserLimit) : null;
    const maxRedeem = maxRedemptions.trim() ? Number(maxRedemptions) : null;

    if (cleanCode.length < 3 || cleanCode.length > 40 || !/^[A-Z0-9_-]+$/.test(cleanCode)) {
      setFormError('Kode voucher harus 3-40 karakter (huruf, angka, - atau _).');
      return;
    }
    if (!Number.isInteger(discount) || discount <= 0) {
      setFormError('Nominal diskon harus berupa angka positif.');
      return;
    }
    if (!Number.isInteger(minSub) || minSub < 0) {
      setFormError('Minimal belanja harus 0 atau lebih.');
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      await admin.saveVoucher({
        code: cleanCode,
        description: description.trim(),
        discountAmount: discount,
        minSubtotal: minSub,
        perUserLimit: perUser && perUser > 0 ? perUser : null,
        maxRedemptions: maxRedeem && maxRedeem > 0 ? maxRedeem : null,
        isActive: true,
      });
      setCode('');
      setDescription('');
      setDiscountAmount('');
      setMinSubtotal('0');
      setPerUserLimit('');
      setMaxRedemptions('');
      await reload();
    } catch (err) {
      setFormError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-space-lg">
      <div>
        <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">
          Voucher &amp; Promo
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Buat kode promo baru atau aktif/nonaktifkan kupon yang tersedia di checkout.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-canvas-base border border-border-hairline p-space-md space-y-space-md"
      >
        <h2 className="font-label-caps text-label-caps uppercase text-primary font-bold">
          Buat / Perbarui Voucher
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Kode Voucher
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: HEMAT50"
              aria-label="Kode Voucher"
              className={inputClass}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Deskripsi
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Potongan akhir pekan"
              aria-label="Deskripsi Voucher"
              className={inputClass}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Nominal Diskon (Rp)
            <input
              type="number"
              min={1}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              placeholder="50000"
              aria-label="Nominal Diskon"
              className={inputClass}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Min. Belanja (Rp)
            <input
              type="number"
              min={0}
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
              aria-label="Minimal Belanja"
              className={inputClass}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Batas / Pengguna (opsional)
            <input
              type="number"
              min={1}
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
              placeholder="Tak terbatas"
              aria-label="Batas per Pengguna"
              className={inputClass}
            />
          </label>
          <label className="space-y-1 font-label-caps text-label-caps uppercase text-on-surface-variant">
            Kuota Total (opsional)
            <input
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder="Tak terbatas"
              aria-label="Kuota Total"
              className={inputClass}
            />
          </label>
        </div>

        {formError && (
          <p role="alert" className="text-error font-body-sm text-body-sm font-medium">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="px-space-md py-2 bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent disabled:opacity-60 font-label-caps text-label-caps uppercase font-bold cursor-pointer transition-colors"
        >
          {busy ? 'Menyimpan…' : 'Simpan Voucher'}
        </button>
      </form>

      {loading && <p role="status" className="text-outline">Memuat voucher…</p>}
      {error && <p role="alert" className="text-error">{error}</p>}

      {!loading && !error && (
        <div className="bg-canvas-base border border-border-hairline overflow-x-auto">
          <table className="w-full font-body-md text-body-md">
            <thead>
              <tr className="text-left font-label-caps text-label-caps uppercase text-outline border-b border-border-hairline">
                <th className="p-space-sm">Kode</th>
                <th className="p-space-sm">Deskripsi</th>
                <th className="p-space-sm">Diskon</th>
                <th className="p-space-sm">Min. Belanja</th>
                <th className="p-space-sm">Batas</th>
                <th className="p-space-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-space-md text-center text-on-surface-variant">
                    Belum ada voucher.
                  </td>
                </tr>
              ) : (
                (data ?? []).map((v) => <VoucherRow key={v.code} voucher={v} onSaved={reload} />)
              )}
            </tbody>
          </table>
        </div>
      )}
      {data && data.length > 0 && (
        <p className="font-body-sm text-body-sm text-outline">
          Terakhir diperbarui: {formatDateTime(data[0].createdAt)}
        </p>
      )}
    </div>
  );
};
