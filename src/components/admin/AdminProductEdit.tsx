import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useServices } from '../../services/ServicesContext';
import { ProductDetailForm } from './ProductDetailForm';
import { useAdminData } from './useAdminData';

export const AdminProductEdit: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { admin } = useServices();
  const { data, loading, error } = useAdminData(() =>
    productId ? admin.getProduct(productId) : Promise.resolve(null)
  );

  return (
    <div className="space-y-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">
          Edit Produk
        </h1>
        <Link
          to="/admin/produk"
          className="font-label-caps text-label-caps uppercase text-outline hover:text-primary"
        >
          ← Kembali ke Produk &amp; Stok
        </Link>
      </div>

      {loading && <p role="status" className="text-outline">Memuat detail produk…</p>}
      {error && <p role="alert" className="text-error">{error}</p>}
      {!loading && !error && !data && (
        <p role="alert" className="text-error">Produk tidak ditemukan.</p>
      )}
      {data && (
        <ProductDetailForm
          mode="edit"
          initial={data}
          onCancel={() => navigate('/admin/produk')}
          onSubmit={async (input) => {
            await admin.replaceProduct(data.id, input);
            navigate('/admin/produk');
          }}
        />
      )}
    </div>
  );
};
