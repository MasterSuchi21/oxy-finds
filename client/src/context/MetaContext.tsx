import { createContext, useContext, useMemo } from 'react';
import { useApi } from '../lib/useApi';
import type { MetaResponse } from '../lib/api';

type MetaCtx = { meta: MetaResponse | null; loading: boolean };

const Ctx = createContext<MetaCtx>({ meta: null, loading: true });

export function MetaProvider({ children }: { children: React.ReactNode }) {
  const { data } = useApi<MetaResponse>('/api/meta', []);

  const value = useMemo<MetaCtx>(
    () => ({ meta: data ?? null, loading: data === null }),
    [data],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMeta(): MetaCtx {
  return useContext(Ctx);
}
