import React from 'react';
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProductEdit } from './AdminProductEdit';
import { AdminProducts } from './AdminProducts';
import { AdminUsers } from './AdminUsers';
import { AdminVouchers } from './AdminVouchers';

const NAV = [
  { to: '/admin', label: 'Ringkasan', end: true },
  { to: '/admin/pesanan', label: 'Pesanan', end: false },
  { to: '/admin/produk', label: 'Produk & Stok', end: false },
  { to: '/admin/voucher', label: 'Voucher', end: false },
  { to: '/admin/pengguna', label: 'Pengguna', end: false },
];

export default function AdminApp() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/masuk', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md">
      <header className="bg-primary text-on-primary">
        <div className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-sm flex flex-wrap items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-md">
            <span className="font-headline-sm text-headline-sm uppercase tracking-tight font-bold">
              UrbanStore <span className="text-badge-promo">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-space-md font-label-caps text-label-caps uppercase">
            <span className="text-inverse-primary hidden sm:inline">
              {profile?.fullName || user?.email}
            </span>
            <Link to="/" className="hover:text-badge-promo transition-colors">
              Lihat Toko
            </Link>
            <button type="button" onClick={handleSignOut} className="hover:text-badge-promo transition-colors cursor-pointer">
              Keluar
            </button>
          </div>
        </div>
        <nav aria-label="Navigasi admin" className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop flex gap-space-md overflow-x-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `py-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-badge-promo text-badge-promo font-bold'
                    : 'border-transparent text-inverse-primary hover:text-on-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-lg">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="pesanan" element={<AdminOrders />} />
          <Route path="produk" element={<AdminProducts />} />
          <Route path="produk/:productId" element={<AdminProductEdit />} />
          <Route path="voucher" element={<AdminVouchers />} />
          <Route path="pengguna" element={<AdminUsers />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
