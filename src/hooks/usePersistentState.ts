import { useEffect, useState } from 'react';

/**
 * useState yang disimpan ke localStorage. `validate` menolak data lama/rusak
 * sehingga aplikasi kembali ke `initial` alih-alih crash saat render.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T
) {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (validate(parsed)) return parsed;
      }
    } catch {
      // storage tidak tersedia / JSON rusak
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // abaikan (private mode, quota)
    }
  }, [key, state]);

  return [state, setState] as const;
}

export const isArrayOf =
  <T,>(check: (item: unknown) => boolean) =>
  (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(check);

export const isObjectWith =
  <T extends object>(...keys: (keyof T)[]) =>
  (value: unknown): value is T =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    keys.every((k) => k in (value as object));
