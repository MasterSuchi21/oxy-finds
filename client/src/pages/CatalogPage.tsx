import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ProductsResponse, SortKey } from '../lib/api';
import { SORT_KEYS, buildProductsQuery } from '../lib/api';
import { useApi } from '../lib/useApi';
import { ProductCard, ProductGridSkeleton } from '../components/ProductCard';
import { FiltersSidebar } from '../components/FiltersSidebar';
import type { AppliedFilters } from '../components/FiltersSidebar';

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest',
  'price-asc': 'Price: low → high',
  'price-desc': 'Price: high → low',
  name: 'Name A–Z',
};

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
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
      <section className="overflow-hidden rounded-[24px] border border-sand bg-white">
        <div className="grid gap-6 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">
              Kakobuy finds · Weidian · Taobao · 1688
            </p>
            <h1 className="mt-3 font-display text-[34px] font-bold leading-[0.95] tracking-tight text-ink sm:text-[42px]">
              A curated shelf of the sellers worth your freight.
            </h1>
            <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-moss/70">
              Search by brand or category, trim by price, and head out through a tracked affiliate hop.
              Every outbound link carries the store&apos;s code and clicks are counted on the way out.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-clay/30 bg-clay/10 px-3 py-1.5 font-semibold text-clay">
                ~9 000 items
              </span>
              <span className="rounded-full border border-sand bg-paper px-3 py-1.5 text-moss">
                Partial names match · try &ldquo;lacos&rdquo; → Lacoste
              </span>
            </div>
          </div>

          <form onSubmit={onSearchSubmit} className="self-stretch">
            <label className="text-xs font-semibold uppercase tracking-wide text-moss/70">Search titles</label>
            <div className="mt-2 flex gap-2">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='e.g. Lacoste, TNf vest, Chrome Heart…'
                className="min-w-0 flex-1 rounded-full border border-sand bg-paper px-5 py-3 text-[15px] text-ink placeholder:text-moss/40 outline-none focus:border-clay/40 focus:ring-2 focus:ring-clay/20"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90"
              >
                Search
              </button>
            </div>
            {q && (
              <p className="mt-3 text-sm text-moss/60">
                Showing matches for <span className="font-semibold text-ink">{q}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateParams({ q: null });
                  }}
                  className="ml-2 text-sm font-semibold text-clay underline decoration-clay/30 underline-offset-2"
                >
                  Clear
                </button>
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-moss/50">
              Filters (brand, category, price) are OR-free and stack — the count below is always the true result set.
            </p>
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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand bg-white px-4 py-3">
            <p className="text-sm text-moss/60">
              {loading ? (
                'Loading…'
              ) : data ? (
                <>
                  <span className="font-semibold text-ink">{data.total.toLocaleString()}</span> items
                  {data.pages > 1 && (
                    <>
                      {' '}
                      · page <span className="tabular-nums">{data.page}</span> of {data.pages}
                    </>
                  )}
                  {q && (
                    <>
                      {' '}
                      · for &ldquo;<span className="font-medium text-ink">{q}</span>&rdquo;
                    </>
                  )}
                </>
              ) : (
                '—'
              )}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-moss/60">Sort</span>
              <select
                value={SORT_KEYS.includes(sort as SortKey) ? sort : 'newest'}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="rounded-full border border-sand bg-paper px-4 py-1.5 text-sm font-medium text-ink outline-none focus:border-clay/40"
              >
                {SORT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-clay/20 bg-clay/5 px-4 py-3 text-sm text-clay">
              Couldn&apos;t load the catalog: {error}
            </div>
          )}

          {loading && <ProductGridSkeleton />}

          {!loading && data && data.items.length === 0 && (
            <div className="rounded-2xl border border-sand bg-white px-6 py-12 text-center">
              <p className="font-display text-xl font-bold text-ink">No matches.</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-sm leading-relaxed text-moss/60">
                Try clearing a filter or shortening the search — remember, brand and category filters narrow the results.
              </p>
            </div>
          )}

          {!loading && data && data.items.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {data.items.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>

              {data.pages > 1 && (
                <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="rounded-full border border-sand bg-white px-4 py-2 text-sm font-medium text-ink disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {/* Page numbers — keep the list short, centered on `page`. */}
                  {pageNumbers(page, data.pages).map((n, i) =>
                    n === null ? (
                      <span key={`gap-${i}`} className="px-1 text-moss/40">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateParams({ page: String(n) })}
                        aria-current={n === page ? 'page' : undefined}
                        className={`rounded-full border px-3 py-2 text-sm font-medium ${
                          n === page
                            ? 'border-ink bg-ink text-white'
                            : 'border-sand bg-white text-ink hover:border-ink/20'
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
                    className="rounded-full border border-sand bg-white px-4 py-2 text-sm font-medium text-ink disabled:opacity-40"
                  >
                    Next
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

  // Window around current, clamped to [2, last-1].
  const lo = Math.max(2, current - 1);
  const hi = Math.min(last - 1, current + 1);

  if (lo > 2) out.push(null);
  for (let n = lo; n <= hi; n++) out.push(n);
  if (hi < last - 1) out.push(null);

  out.push(last);
  return out;
}
