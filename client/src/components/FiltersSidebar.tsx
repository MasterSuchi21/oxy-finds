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
    <aside className="glass h-fit rounded-2xl lg:sticky lg:top-24">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="label-tech">// Filters</h2>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg border border-line px-3 py-1 font-mono text-[11px] text-mist transition hover:border-neon-cyan/40 hover:text-frost md:hidden"
        >
          {collapsed ? '[ show ]' : '[ hide ]'}
        </button>
      </div>

      <div className={collapsed ? 'hidden md:block' : 'block'}>
        <div className="space-y-6 px-4 py-4">
          {/* Price */}
          <section>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Price range</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="font-mono text-[11px] text-mist">
                MIN
                <input
                  inputMode="decimal"
                  value={value.priceMin}
                  onChange={(e) => onChange({ priceMin: e.target.value.replace(/[^0-9.]/g, '') })}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-line bg-void/60 px-3 py-2 font-mono text-sm text-frost placeholder:text-mist/40 outline-none transition focus:border-neon-cyan/50 focus:shadow-glow-cyan"
                />
              </label>
              <label className="font-mono text-[11px] text-mist">
                MAX
                <input
                  inputMode="decimal"
                  value={value.priceMax}
                  onChange={(e) => onChange({ priceMax: e.target.value.replace(/[^0-9.]/g, '') })}
                  placeholder="∞"
                  className="mt-1 w-full rounded-xl border border-line bg-void/60 px-3 py-2 font-mono text-sm text-frost placeholder:text-mist/40 outline-none transition focus:border-neon-cyan/50 focus:shadow-glow-cyan"
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
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] transition ${
                      active
                        ? 'border-transparent bg-neon-gradient font-semibold text-void shadow-glow-cyan'
                        : 'border-line text-mist hover:border-neon-cyan/40 hover:text-frost'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
            {data?.priceRange && (
              <p className="mt-2 font-mono text-[11px] text-mist/60">
                dataset · ${data.priceRange.min.toFixed(2)} → ${data.priceRange.max.toFixed(2)}
              </p>
            )}
          </section>

          {/* Brand */}
          <section className="border-t border-line pt-5">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Brand</h3>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="scan brands…"
              className="mt-3 w-full rounded-xl border border-line bg-void/60 px-3 py-2 text-sm text-frost placeholder:font-mono placeholder:text-mist/40 outline-none transition focus:border-neon-violet/50 focus:shadow-glow-violet"
            />
            <div className="mt-3 max-h-56 space-y-0.5 overflow-auto pr-1">
              {loading && <p className="font-mono text-[11px] text-mist/60">loading…</p>}
              {error && <p className="font-mono text-[11px] text-neon-pink">{error}</p>}
              {brands.map((b) => {
                const active = value.brand === b.name;
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => onChange({ brand: active ? null : b.name })}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition ${
                      active
                        ? 'bg-neon-violet/15 text-neon-violet'
                        : 'text-frost/90 hover:bg-white/[0.05] hover:text-frost'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className={`ml-2 font-mono text-[11px] tabular-nums ${active ? 'text-neon-violet/80' : 'text-mist/50'}`}>
                      {b.count}
                    </span>
                  </button>
                );
              })}
              {!loading && !error && brands.length === 0 && (
                <p className="font-mono text-[11px] text-mist/50">no match for “{q}”</p>
              )}
            </div>
            {value.brand && (
              <button
                type="button"
                onClick={() => onChange({ brand: null })}
                className="mt-2 font-mono text-[11px] text-neon-cyan underline decoration-neon-cyan/40 underline-offset-2"
              >
                × clear brand
              </button>
            )}
          </section>

          {/* Category */}
          <section className="border-t border-line pt-5">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Category</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(data?.categories ?? []).slice(0, 16).map((c) => {
                const active = value.category === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onChange({ category: active ? null : c.name })}
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] transition ${
                      active
                        ? 'border-transparent bg-neon-cyan/15 text-neon-cyan shadow-glow-cyan'
                        : 'border-line text-mist hover:border-neon-cyan/40 hover:text-frost'
                    }`}
                  >
                    {c.name} <span className="tabular-nums opacity-50">{c.count}</span>
                  </button>
                );
              })}
              {!data && !error && <span className="font-mono text-[11px] text-mist/60">loading…</span>}
            </div>
            {value.category && (
              <button
                type="button"
                onClick={() => onChange({ category: null })}
                className="mt-2 font-mono text-[11px] text-neon-cyan underline decoration-neon-cyan/40 underline-offset-2"
              >
                × clear category
              </button>
            )}
          </section>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <p className="font-mono text-[11px] tabular-nums text-mist">
              <span className="text-neon-cyan">{count.toLocaleString()}</span> results
            </p>
            <button
              type="button"
              onClick={onClear}
              disabled={!hasActive}
              className="rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] font-medium text-frost transition enabled:hover:border-neon-pink/50 disabled:opacity-30"
            >
              reset
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
