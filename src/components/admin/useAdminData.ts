import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError } from '../../services/errors';

/** Memuat data admin dengan status loading/error dan fungsi muat ulang. */
export function useAdminData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const alive = useRef(true);

  const reload = useCallback(async () => {
    try {
      const result = await loaderRef.current();
      if (!alive.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (alive.current) setError(describeError(e));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void reload();
    return () => {
      alive.current = false;
    };
  }, [reload]);

  return { data, loading, error, reload };
}

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
