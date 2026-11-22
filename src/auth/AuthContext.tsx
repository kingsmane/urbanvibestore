import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useServices } from '../services/ServicesContext';
import type { AuthUser, Profile, Role } from '../services/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  profile: Profile | null;
  /** Peran efektif; null selama belum login. Tanpa profil dianggap customer (hak paling rendah). */
  role: Role | null;
  isAdmin: boolean;
  /** Mengembalikan profil agar pemanggil dapat mengarahkan sesuai peran. */
  signIn: (email: string, password: string) => Promise<Profile | null>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: { fullName?: string; phone?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useServices();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  // Id pengguna yang profilnya sudah selesai dimuat (berhasil atau tidak). Selama berbeda dari
  // pengguna aktif, status tetap loading agar peran tidak ditebak sebelum profil diketahui.
  const [profileFor, setProfileFor] = useState<string | null>(null);

  // Sesi awal + perubahan sesi. Callback hanya mengubah state (tidak memanggil
  // API Supabase lain di dalamnya, sesuai rekomendasi untuk menghindari deadlock).
  useEffect(() => {
    let active = true;
    auth
      .getSession()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setSessionChecked(true);
      });
    const unsubscribe = auth.onAuthChange((u) => {
      if (active) setUser(u);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [auth]);

  // Muat profil (dan peran) setiap pengguna berganti.
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileFor(null);
      return;
    }
    let active = true;
    auth
      .getProfile(userId)
      .then((p) => {
        if (active) setProfile(p);
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setProfileFor(userId);
      });
    return () => {
      active = false;
    };
  }, [auth, userId]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await auth.signIn(email.trim(), password);
      const session = await auth.getSession();
      setUser(session);
      if (!session) return null;
      const p = await auth.getProfile(session.id);
      setProfile(p);
      setProfileFor(session.id);
      return p;
    },
    [auth]
  );

  const signUp = useCallback(
    (email: string, password: string, fullName: string) =>
      auth.signUp(email.trim(), password, fullName.trim()),
    [auth]
  );

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
    setProfileFor(null);
  }, [auth]);

  const updateProfile = useCallback(
    async (patch: { fullName?: string; phone?: string | null }) => {
      if (!userId) return;
      setProfile(await auth.updateProfile(userId, patch));
    },
    [auth, userId]
  );

  const status: AuthStatus =
    !sessionChecked || (user && profileFor !== user.id)
      ? 'loading'
      : user
        ? 'authenticated'
        : 'unauthenticated';

  const value = useMemo<AuthContextValue>(() => {
    const role: Role | null = user ? (profile?.role ?? 'customer') : null;
    return {
      status,
      user,
      profile,
      role,
      isAdmin: role === 'admin',
      signIn,
      signUp,
      signOut,
      updateProfile,
    };
  }, [status, user, profile, signIn, signUp, signOut, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  return ctx;
}
