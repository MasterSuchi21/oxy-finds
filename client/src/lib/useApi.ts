import { useEffect, useRef, useState } from 'react';

/**
 * Fetch hook that ties its lifetime to the requesting component.
 *
 * Cancels the in-flight request on unmount or when its deps change, so
 * outdated responses never win the race over the latest navigation.
 */
export function useApi<T>(url: string, deps: unknown[] = []): {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(0);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const generation = ++generationRef.current;
    const ctrl = new AbortController();
    let live = true;

    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          if (!live || generation !== generationRef.current) return;
          throw new Error(text || `${res.status} ${res.statusText}`);
        }
        const json = (await res.json()) as T;
        if (!live || generation !== generationRef.current) return;
        setData(json);
        setError(null);
      } catch (err) {
        if (!live || generation !== generationRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (live && generation === generationRef.current) setLoading(false);
      }
    })();

    return () => {
      live = false;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, nonce, ...deps]);

  return { data, loading, error, reload: () => setNonce((n) => n + 1) };
}
