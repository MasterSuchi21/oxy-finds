import { useMemo, useState } from 'react';
import { useApi } from '../lib/useApi';
import type { FacetsResponse } from '../lib/api';
import { PRICE_BUCKETS } from '../lib/api';

export type AppliedFilters = {
  brand: string | null;
  category: string | null;
  priceMin: string;
  priceMax: string;
};

export function FiltersSidebar({
  value,
  onChange,
  onClear,
  count,
  collapsed,
  onToggleCollapse,
}: {
  value: AppliedFilters;
  onChange: (patch: Partial<AppliedFilters>) => void;
  onClear: () => void;
  count: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const { data, loading, error } = useApi<FacetsResponse>('/api/products/facets', []);
  const [q, setQ] = useState('');
  const hasActive = value.brand || value.category || value.priceMin || value.priceMax;

  const brands = useMemo(() => {
    const list = data?.brands ?? [];
    if (!q.trim()) return list.slice(0, 12);
    const t = q.trim().toLowerCase();
    return list.filter((b) => b.name.toLowerCase().includes(t)).slice(0, 20);
  }, [data, q]);

  return (
    <aside className="card h-fit lg:sticky lg:top-20">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-frost">Filters</h2>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-md border border-line px-2 py-1 text-xs text-mist transition hover:bg-raised md:hidden"
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      <div className={collapsed ? 'hidden md:block' : 'block'}>
        <div className="space-y-5 px-4 py-4">
          <section>
            <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Price</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="text-xs text-mist">
                Min
                <input
                  inputMode="decimal"
                  value={value.priceMin}
                  onChange={(e) => onChange({ priceMin: e.target.value.replace(/[^0-9.]/g, '') })}
                  placeholder="0"
                  className="input mt-1 tabular-nums"
                />
              </label>
              <label className="text-xs text-mist">
                Max
                <input
                  inputMode="decimal"
                  value={value.priceMax}
                  onChange={(e) => onChange({ priceMax: e.target.value.replace(/[^0-9.]/g, '') })}
                  placeholder="Any"
                  className="input mt-1 tabular-nums"
                />
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRICE_BUCKETS.map((b) => {
                const min = 'min' in b ? String(b.min) : '';
                const max = 'max' in b ? String(b.max) : '';
                const active = value.priceMin === min && value.priceMax === max;
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => onChange({ priceMin: min, priceMax: max })}
                    className={`rounded-md border px-2.5 py-1 text-xs transition ${
                      active
                        ? 'border-accent bg-accent font-medium text-void'
                        : 'border-line text-mist hover:bg-raised hover:text-frost'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            {data?.priceRange && (
              <p className="mt-2 text-xs text-subtle">
                Range: ${data.priceRange.min.toFixed(0)} – ${data.priceRange.max.toFixed(0)}
              </p>
            )}
          </section>

          <section className="border-t border-line pt-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Brand</h3>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brands…"
              className="input mt-2"
            />
            <div className="mt-2 max-h-48 space-y-0.5 overflow-auto">
              {loading && <p className="text-xs text-subtle">Loading…</p>}
              {error && <p className="text-xs text-warn">{error}</p>}
              {brands.map((b) => {
                const active = value.brand === b.name;
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => onChange({ brand: active ? null : b.name })}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition ${
                      active
                        ? 'bg-raised font-medium text-frost'
                        : 'text-mist hover:bg-raised hover:text-frost'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="ml-2 text-xs tabular-nums text-subtle">{b.count}</span>
                  </button>
                );
              })}
              {!loading && !error && brands.length === 0 && (
                <p className="text-xs text-subtle">No brands match “{q}”</p>
              )}
            </div>
            {value.brand && (
              <button
                type="button"
                onClick={() => onChange({ brand: null })}
                className="mt-2 text-xs text-link hover:underline"
              >
                Clear brand
              </button>
            )}
          </section>

          <section className="border-t border-line pt-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-subtle">Category</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(data?.categories ?? []).slice(0, 16).map((c) => {
                const active = value.category === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onChange({ category: active ? null : c.name })}
                    className={`rounded-md border px-2.5 py-1 text-xs transition ${
                      active
                        ? 'border-accent bg-raised font-medium text-frost'
                        : 'border-line text-mist hover:bg-raised hover:text-frost'
                    }`}
                  >
                    {c.name}{' '}
                    <span className="tabular-nums text-subtle">{c.count}</span>
                  </button>
                );
              })}
              {!data && !error && <span className="text-xs text-subtle">Loading…</span>}
            </div>
            {value.category && (
              <button
                type="button"
                onClick={() => onChange({ category: null })}
                className="mt-2 text-xs text-link hover:underline"
              >
                Clear category
              </button>
            )}
          </section>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <p className="text-xs tabular-nums text-mist">
              <span className="font-medium text-frost">{count.toLocaleString()}</span> results
            </p>
            <button
              type="button"
              onClick={onClear}
              disabled={!hasActive}
              className="rounded-md border border-line px-2.5 py-1 text-xs text-mist transition enabled:hover:bg-raised enabled:hover:text-frost disabled:opacity-40"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
