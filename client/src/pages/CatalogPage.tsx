import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductsResponse, SortKey } from '../lib/api';
import { SORT_KEYS, buildProductsQuery } from '../lib/api';
import { useApi } from '../lib/useApi';
import { ProductCard, ProductGridSkeleton } from '../components/ProductCard';
import { FiltersSidebar } from '../components/FiltersSidebar';
import type { AppliedFilters } from '../components/FiltersSidebar';

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest',
  'price-asc': 'Price ↑',
  'price-desc': 'Price ↓',
  name: 'A–Z',
};

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '');

  const applied = useMemo<AppliedFilters>(
    () => ({
      brand: searchParams.get('brand'),
      category: searchParams.get('category'),
      priceMin: searchParams.get('minPrice') ?? '',
      priceMax: searchParams.get('maxPrice') ?? '',
    }),
    [searchParams],
  );

  const query = buildProductsQuery({
    q: searchParams.get('q') ?? undefined,
    brand: applied.brand ?? undefined,
    category: applied.category ?? undefined,
    minPrice: applied.priceMin || undefined,
    maxPrice: applied.priceMax || undefined,
    sort: searchParams.get('sort') ?? 'newest',
    page: searchParams.get('page') ?? undefined,
    limit: '24',
  });

  const url = `/api/products?${query}`;
  const { data, loading, error } = useApi<ProductsResponse>(url, [query]);

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const sort = (searchParams.get('sort') as SortKey | null) ?? 'newest';
  const q = searchParams.get('q') ?? '';

  function updateParams(patch: Record<string, string | null | undefined>) {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || String(v).trim() === '') next.delete(k);
      else next.set(k, String(v));
    }
    if ('q' in patch || 'brand' in patch || 'category' in patch || 'minPrice' in patch || 'maxPrice' in patch) {
      next.delete('page');
    }
    setSearchParams(next, { replace: true });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  }

  return (
    <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-6 py-8">
      {/* Hero */}
      <section className="glass relative overflow-hidden rounded-[28px]">
        {/* Corner glow accents */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-neon-violet/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-neon-cyan/10 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="label-tech">// Curated marketplace index</p>
            <h1 className="mt-4 font-display text-[38px] font-bold leading-[0.95] tracking-tight text-frost sm:text-[52px]">
              Find the piece.
              <br />
              <span className="text-gradient">Skip the noise.</span>
            </h1>
            <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-mist">
              Roughly nine thousand listings from Weidian, Taobao and 1688 — filtered to the
              sellers worth your freight. Search by brand, trim by price, and head out through a
              tracked affiliate hop.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px]">
              <span className="rounded-full border border-neon-cyan/25 bg-neon-cyan/10 px-3 py-1.5 text-neon-cyan">
                ~9 000 items live
              </span>
              <span className="rounded-full border border-line px-3 py-1.5 text-mist">
                partial match · “lacos” → Lacoste
              </span>
              <span className="rounded-full border border-line px-3 py-1.5 text-mist">
                WD · TB · 1688
              </span>
            </div>
          </div>

          <form onSubmit={onSearchSubmit}>
            <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">
              Query the index
            </label>
            <div className="mt-2 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-neon-cyan/70">
                  ⌕
                </span>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="brand, item, keyword…"
                  className="w-full rounded-2xl border border-line bg-void/60 py-3.5 pl-10 pr-4 text-[15px] text-frost placeholder:font-mono placeholder:text-mist/40 outline-none transition focus:border-neon-cyan/50 focus:shadow-glow-cyan"
                />
              </div>
              <button type="submit" className="btn-neon shrink-0 rounded-2xl">
                Scan
              </button>
            </div>
            {q && (
              <p className="mt-3 font-mono text-xs text-mist">
                <span className="text-mist/60">&gt; filtering:</span>{' '}
                <span className="text-neon-cyan">{q}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParams({ q: null });
                  }}
                  className="ml-3 text-neon-pink underline decoration-neon-pink/40 underline-offset-2"
                >
                  clear
                </button>
              </p>
            )}
          </form>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FiltersSidebar
          value={applied}
          onChange={(patch) =>
            updateParams({
              brand: patch.brand !== undefined ? patch.brand ?? null : undefined,
              category: patch.category !== undefined ? patch.category ?? null : undefined,
              minPrice: patch.priceMin !== undefined ? patch.priceMin || null : undefined,
              maxPrice: patch.priceMax !== undefined ? patch.priceMax || null : undefined,
            })
          }
          onClear={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('brand');
            next.delete('category');
            next.delete('minPrice');
            next.delete('maxPrice');
            setSearchParams(next, { replace: true });
          }}
          count={data?.total ?? 0}
          collapsed={filtersCollapsed}
          onToggleCollapse={() => setFiltersCollapsed((c) => !c)}
        />

        <div className="min-w-0 space-y-4">
          <div className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
            <p className="font-mono text-xs text-mist">
              {loading ? (
                <span className="text-neon-cyan">scanning…</span>
              ) : data ? (
                <>
                  <span className="font-semibold text-frost">{data.total.toLocaleString()}</span> hits
                  {data.pages > 1 && (
                    <>
                      {' '}
                      · <span className="tabular-nums text-neon-cyan">p{data.page}</span>
                      <span className="text-mist/60">/{data.pages}</span>
                    </>
                  )}
                  {q && <> · “{q}”</>}
                </>
              ) : (
                '—'
              )}
            </p>
            <label className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Sort</span>
              <select
                value={SORT_KEYS.includes(sort as SortKey) ? sort : 'newest'}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="rounded-xl border border-line bg-void/60 px-3 py-1.5 font-mono text-xs text-frost outline-none transition focus:border-neon-cyan/50"
              >
                {SORT_KEYS.map((k) => (
                  <option key={k} value={k} className="bg-panel">
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-neon-pink/30 bg-neon-pink/5 px-4 py-3 font-mono text-sm text-neon-pink">
              ! index error: {error}
            </div>
          )}

          {loading && <ProductGridSkeleton />}

          {!loading && data && data.items.length === 0 && (
            <div className="glass rounded-2xl px-6 py-14 text-center">
              <p className="font-mono text-sm text-mist">[ 0 results ]</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-sm leading-relaxed text-mist/70">
                Nothing matched. Try clearing a filter or shortening the query — partial
                words match, so a brand fragment is often enough.
              </p>
            </div>
          )}

          {!loading && data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {data.items.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>

              {data.pages > 1 && (
                <nav
                  className="flex flex-wrap items-center justify-center gap-2 pt-2"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="btn-ghost px-4 py-2 font-mono text-xs disabled:opacity-30"
                  >
                    ← prev
                  </button>

                  {pageNumbers(page, data.pages).map((n, i) =>
                    n === null ? (
                      <span key={`gap-${i}`} className="px-1 font-mono text-mist/40">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateParams({ page: String(n) })}
                        aria-current={n === page ? 'page' : undefined}
                        className={`rounded-xl border px-3 py-2 font-mono text-xs transition ${
                          n === page
                            ? 'border-transparent bg-neon-gradient font-semibold text-void shadow-glow-cyan'
                            : 'border-line text-mist hover:border-neon-cyan/40 hover:text-frost'
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    disabled={!data.hasMore}
                    onClick={() => updateParams({ page: String(page + 1) })}
                    className="btn-ghost px-4 py-2 font-mono text-xs disabled:opacity-30"
                  >
                    next →
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function pageNumbers(current: number, last: number): Array<number | null> {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

  const out: Array<number | null> = [1];
  const lo = Math.max(2, current - 1);
  const hi = Math.min(last - 1, current + 1);
  if (lo > 2) out.push(null);
  for (let n = lo; n <= hi; n++) out.push(n);
  if (hi < last - 1) out.push(null);
  out.push(last);
  return out;
}
