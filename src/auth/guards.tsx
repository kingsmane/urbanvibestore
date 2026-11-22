import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../services/types';
import { useAuth } from './AuthContext';

export const homePathFor = (role: Role | null | undefined): string =>
  role === 'admin' ? '/admin' : '/';

export const FullPageLoader: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-screen flex items-center justify-center bg-surface font-label-caps text-label-caps uppercase tracking-widest text-outline"
  >
    Memuat…
  </div>
);

/** Hanya untuk pengguna yang sudah masuk. */
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullPageLoader />;
  if (status === 'unauthenticated') {
    return <Navigate to="/masuk" replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
};

/** Hanya untuk peran tertentu; peran lain diarahkan ke beranda miliknya. */
export const RequireRole: React.FC<{ role: Role; children: React.ReactNode }> = ({
  role,
  children,
}) => {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'loading') return <FullPageLoader />;
  if (auth.status === 'unauthenticated') {
    return <Navigate to="/masuk" replace state={{ from: location.pathname + location.search }} />;
  }
  if (auth.role !== role) return <Navigate to={homePathFor(auth.role)} replace />;
  return <>{children}</>;
};

/** Halaman masuk/daftar: pengguna yang sudah login diarahkan sesuai perannya. */
export const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, role } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullPageLoader />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    const safeFrom = from && from.startsWith('/') && !from.startsWith('//') ? from : null;
    // Admin tidak dikembalikan ke halaman toko; customer tidak diarahkan ke /admin.
    const target =
      role === 'admin'
        ? safeFrom?.startsWith('/admin')
          ? safeFrom
          : '/admin'
        : safeFrom && !safeFrom.startsWith('/admin')
          ? safeFrom
          : '/';
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
};
