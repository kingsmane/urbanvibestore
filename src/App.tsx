/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { FullPageLoader, GuestOnly, RequireAuth, RequireRole } from './auth/guards';
import { LoginView, RegisterView } from './components/auth/AuthViews';
import ShopApp from './ShopApp';

const AdminApp = lazy(() => import('./components/admin/AdminApp'));

/** Toko dibuat ulang (key) setiap pengguna berganti agar data tidak bocor antar akun. */
function ShopGate() {
  const { user } = useAuth();
  return <ShopApp key={user?.id ?? 'anon'} />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/masuk"
        element={
          <GuestOnly>
            <LoginView />
          </GuestOnly>
        }
      />
      <Route
        path="/daftar"
        element={
          <GuestOnly>
            <RegisterView />
          </GuestOnly>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RequireRole role="admin">
            <Suspense fallback={<FullPageLoader />}>
              <AdminApp />
            </Suspense>
          </RequireRole>
        }
      />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <ShopGate />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
