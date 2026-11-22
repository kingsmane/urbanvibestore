import React from 'react';
import { Link } from 'react-router-dom';
import { formatRupiah } from '../../data/storeData';
import { ORDER_STATUS_LABEL } from '../../lib/orderStatus';
import { mapOrderStatus } from '../../services/mappers';
import { useServices } from '../../services/ServicesContext';
import { useAdminData } from './useAdminData';

const Tile: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="bg-canvas-base border border-border-hairline p-space-md">
    <p className="font-label-caps text-label-caps uppercase text-outline tracking-wider">{label}</p>
    <p className="font-headline-lg text-headline-lg text-primary mt-1">{value}</p>
    {hint && <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{hint}</p>}
  </div>
);

export const AdminDashboard: React.FC = () => {
  const { admin } = useServices();
  const { data, loading, error } = useAdminData(() => admin.stats());

  if (loading) return <p role="status" className="text-outline">Memuat ringkasan…</p>;
  if (error || !data) return <p role="alert" className="text-error">{error ?? 'Data tidak tersedia.'}</p>;

  const statuses = Object.entries(data.ordersByStatus);
  const pending = data.ordersByStatus.PENDING_PAYMENT ?? 0;
  const toProcess = (data.ordersByStatus.PAID ?? 0) + (data.ordersByStatus.PROCESSING ?? 0);

  return (
    <div className="space-y-space-lg">
      <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">Ringkasan</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
        <Tile label="Pendapatan (dibayar)" value={formatRupiah(data.revenuePaid)} />
        <Tile label="Pelanggan" value={String(data.customers)} />
        <Tile label="Produk aktif" value={String(data.activeProducts)} />
        <Tile
          label="Stok menipis"
          value={String(data.lowStockVariants)}
          hint="Ukuran dengan stok ≤ 3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <div className="bg-canvas-base border border-border-hairline p-space-md">
          <h2 className="font-label-caps text-label-caps uppercase text-primary font-bold mb-space-sm">
            Perlu tindakan
          </h2>
          <ul className="space-y-space-xs font-body-md text-body-md">
            <li>
              <Link to="/admin/pesanan" className="underline">
                {pending} pesanan menunggu pembayaran
              </Link>
            </li>
            <li>
              <Link to="/admin/pesanan" className="underline">
                {toProcess} pesanan dibayar / perlu diproses dan dikirim
              </Link>
            </li>
            <li>
              <Link to="/admin/produk" className="underline">
                {data.lowStockVariants} ukuran dengan stok menipis
              </Link>
            </li>
          </ul>
        </div>

        <div className="bg-canvas-base border border-border-hairline p-space-md">
          <h2 className="font-label-caps text-label-caps uppercase text-primary font-bold mb-space-sm">
            Pesanan per status
          </h2>
          {statuses.length === 0 ? (
            <p className="text-on-surface-variant">Belum ada pesanan.</p>
          ) : (
            <ul className="divide-y divide-border-hairline">
              {statuses.map(([status, count]) => (
                <li key={status} className="flex justify-between py-1.5 font-body-md text-body-md">
                  <span>{ORDER_STATUS_LABEL[mapOrderStatus(status)]}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
