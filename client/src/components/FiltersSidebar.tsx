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
    <aside className="rounded-2xl border border-sand bg-white">
      <div className="flex items-center justify-between border-b border-sand px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">Filters</h2>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-full border border-sand px-3 py-1 text-xs font-medium text-moss md:hidden"
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      <div className={`${collapsed ? 'hidden md:block' : 'block'}`}>
        <div className="space-y-6 px-4 py-4">
          {/* Price */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-moss/70">Price</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-moss/70">
                Min
                <input
                  inputMode="decimal"
                  value={value.priceMin}
                  onChange={(e) => onChange({ priceMin: e.target.value.replace(/[^0-9.]/g, '') })}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-sand bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
                />
              </label>
              <label className="text-xs font-medium text-moss/70">
                Max
                <input
                  inputMode="decimal"
                  value={value.priceMax}
                  onChange={(e) => onChange({ priceMax: e.target.value.replace(/[^0-9.]/g, '') })}
                  placeholder="Any"
                  className="mt-1 w-full rounded-xl border border-sand bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PRICE_BUCKETS.map((b) => {
                const min = 'min' in b ? String(b.min) : '';
                const max = 'max' in b ? String(b.max) : '';
                const active = value.priceMin === min && value.priceMax === max;
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => onChange({ priceMin: min, priceMax: max })}
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      active
                        ? 'border-clay bg-clay text-white'
                        : 'border-sand bg-paper text-moss hover:border-clay/30'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            {data?.priceRange && (
              <p className="mt-2 text-xs text-moss/60">
                Range ${data.priceRange.min.toFixed(2)} – ${data.priceRange.max.toFixed(2)}
              </p>
            )}
          </section>

          {/* Brand */}
          <section className="border-t border-sand pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-moss/70">Brand</h3>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter brands…"
              className="mt-3 w-full rounded-xl border border-sand bg-paper px-3 py-2 text-sm text-ink placeholder:text-moss/40 outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
            />
            <div className="mt-3 max-h-56 space-y-1 overflow-auto pr-1">
              {loading && <p className="text-xs text-moss/60">Loading…</p>}
              {error && <p className="text-xs text-clay">{error}</p>}
              {brands.map((b) => {
                const active = value.brand === b.name;
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => onChange({ brand: active ? null : b.name })}
                    className={`flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-sm ${
                      active ? 'bg-ink text-white' : 'hover:bg-sand/60 text-ink'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className={`text-xs tabular-nums ${active ? 'text-white/70' : 'text-moss/50'}`}>
                      {b.count}
                    </span>
                  </button>
                );
              })}
              {!loading && !error && brands.length === 0 && (
                <p className="text-xs text-moss/50">No brands match “{q}”.</p>
              )}
            </div>
            {value.brand && (
              <button
                type="button"
                onClick={() => onChange({ brand: null })}
                className="mt-2 text-xs font-medium text-clay underline decoration-clay/30 underline-offset-2"
              >
                Clear brand
              </button>
            )}
          </section>

          {/* Category */}
          <section className="border-t border-sand pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-moss/70">Category</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(data?.categories ?? []).slice(0, 16).map((c) => {
                const active = value.category === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onChange({ category: active ? null : c.name })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      active ? 'border-ink bg-ink text-white' : 'border-sand bg-paper text-moss hover:border-ink/20'
                    }`}
                  >
                    {c.name} <span className="tabular-nums opacity-60">{c.count}</span>
                  </button>
                );
              })}
              {!data && !error && <span className="text-xs text-moss/60">Loading…</span>}
            </div>
            {value.category && (
              <button
                type="button"
                onClick={() => onChange({ category: null })}
                className="mt-2 text-xs font-medium text-clay underline decoration-clay/30 underline-offset-2"
              >
                Clear category
              </button>
            )}
          </section>

          <div className="flex items-center justify-between border-t border-sand pt-4">
            <p className="text-xs tabular-nums text-moss/60">{count} results</p>
            <button
              type="button"
              onClick={onClear}
              disabled={!hasActive}
              className="rounded-full border border-sand bg-white px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
