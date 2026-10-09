import { useEffect, useRef, useState } from 'react';

async function responseError(res: Response): Promise<Error> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const body: unknown = await res.json();
      if (
        body !== null &&
        typeof body === 'object' &&
        'error' in body &&
        typeof body.error === 'string'
      ) {
        return new Error(body.error);
      }
    } catch {
      // Fall through to a concise status message for malformed error responses.
    }
  }

  if (res.status >= 500) {
    return new Error(
      `API service is temporarily unavailable (HTTP ${res.status}). Please try again shortly.`,
    );
  }

  return new Error(`Request failed (HTTP ${res.status} ${res.statusText}).`);
}

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
          if (!live || generation !== generationRef.current) return;
          throw await responseError(res);
        }
        let json: T;
        try {
          json = (await res.json()) as T;
        } catch {
          throw new Error('API service returned an invalid response. Please try again.');
        }
        if (!live || generation !== generationRef.current) return;
        setData(json);
        setError(null);
      } catch (err) {
        if (!live || generation !== generationRef.current) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(
          err instanceof TypeError
            ? 'Unable to reach the API service. Check your connection and try again.'
            : err instanceof Error
              ? err.message
              : String(err),
        );
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
