import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast(durationMs = 3400) {
  const [message, setMessage] = useState<string | null>(null);
  const [subtext, setSubtext] = useState<string | undefined>(undefined);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (msg: string, sub?: string) => {
      setMessage(msg);
      setSubtext(sub);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setMessage(null), durationMs);
    },
    [durationMs]
  );

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  return { toastMessage: message, toastSubtext: subtext, showToast };
}
