import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { describeError } from '../../services/errors';
import { useServices } from '../../services/ServicesContext';
import type { Role } from '../../services/types';
import { formatDateTime, useAdminData } from './useAdminData';

export const AdminUsers: React.FC = () => {
  const { admin } = useServices();
  const { user } = useAuth();
  const { data, loading, error, reload } = useAdminData(() => admin.listUsers());
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const changeRole = async (userId: string, role: Role) => {
    setBusyId(userId);
    setActionError(null);
    try {
      await admin.setUserRole(userId, role);
      await reload();
    } catch (e) {
      setActionError(describeError(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-space-md">
      <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">Pengguna</h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Admin dapat mengubah peran pengguna. Peran akun Anda sendiri tidak dapat diubah.
      </p>
      {loading && <p role="status" className="text-outline">Memuat pengguna…</p>}
      {error && <p role="alert" className="text-error">{error}</p>}
      {actionError && <p role="alert" className="text-error">{actionError}</p>}

      <div className="bg-canvas-base border border-border-hairline overflow-x-auto">
        <table className="w-full font-body-md text-body-md">
          <thead>
            <tr className="text-left font-label-caps text-label-caps uppercase text-outline border-b border-border-hairline">
              <th className="p-space-sm">Nama</th>
              <th className="p-space-sm">Email</th>
              <th className="p-space-sm">Terdaftar</th>
              <th className="p-space-sm">Peran</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => (
              <tr key={u.id} className="border-b border-border-hairline last:border-0">
                <td className="p-space-sm">{u.fullName || '—'}</td>
                <td className="p-space-sm">{u.email}</td>
                <td className="p-space-sm text-on-surface-variant">{formatDateTime(u.createdAt)}</td>
                <td className="p-space-sm">
                  <select
                    value={u.role}
                    disabled={u.id === user?.id || busyId === u.id}
                    onChange={(e) => changeRole(u.id, e.target.value as Role)}
                    aria-label={`Peran ${u.email}`}
                    className="bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm disabled:opacity-60"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
