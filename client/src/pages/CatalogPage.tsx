import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductsResponse, SortKey } from '../lib/api';
import { SORT_KEYS, buildProductsQuery } from '../lib/api';
import { useApi } from '../lib/useApi';
import { ProductCard, ProductGridSkeleton } from '../components/ProductCard';
import { FiltersSidebar } from '../components/FiltersSidebar';
import type { AppliedFilters } from '../components/FiltersSidebar';
import { CatalogHeader } from '../components/CatalogHeader';
import { BestVersionsIntro } from '../components/BestVersionsIntro';

const PAGE_LIMIT = 24;

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
    featured: searchParams.get('featured') === 'true' ? 'true' : undefined,
    sort: searchParams.get('sort') ?? 'newest',
    page: searchParams.get('page') ?? undefined,
    limit: String(PAGE_LIMIT),
  });

  const url = `/api/products?${query}`;
  const { data, loading, error } = useApi<ProductsResponse>(url, [query]);

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const sort = (searchParams.get('sort') as SortKey | null) ?? 'newest';
  const q = searchParams.get('q') ?? '';
  const isFeatured = searchParams.get('featured') === 'true';
  const isHome =
    !q && !applied.brand && !applied.category && !applied.priceMin && !applied.priceMax && !isFeatured;

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

  function clearAllFilters() {
    setSearchInput('');
    updateParams({
      q: null,
      brand: null,
      category: null,
      minPrice: null,
      maxPrice: null,
      featured: null,
      page: null,
      sort: sort,
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      {isHome && (
        <section className="card p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">Marketplace index</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-frost sm:text-4xl">
                Find the piece. Skip the noise.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-mist">
                Thousands of listings from Weidian, Taobao and 1688 — searchable in English with
                prices in USD. Filter by brand, trim by price, and buy through a tracked affiliate
                link.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-mist">
                <span className="rounded-md border border-line bg-raised px-2.5 py-1">~9,000 items</span>
                <span className="rounded-md border border-line px-2.5 py-1">WD · TB · 1688</span>
              </div>
            </div>

            <form onSubmit={onSearchSubmit}>
              <label className="text-xs font-medium text-mist">Search catalog</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Brand, item, keyword…"
                  className="input min-w-0 flex-1"
                />
                <button type="submit" className="btn-primary shrink-0">Search</button>
              </div>
              {q && (
                <p className="mt-2 text-xs text-mist">
                  Filtering by <span className="font-medium text-frost">{q}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateParams({ q: null });
                    }}
                    className="ml-2 text-link hover:underline"
                  >
                    Clear
                  </button>
                </p>
              )}
            </form>
          </div>
        </section>
      )}

      {!isHome && (
        <>
          <CatalogHeader
            filters={{
              q,
              brand: applied.brand,
              category: applied.category,
              priceMin: applied.priceMin,
              priceMax: applied.priceMax,
              featured: isFeatured,
            }}
            result={{
              total: data?.total ?? 0,
              page,
              pages: data?.pages ?? 1,
              limit: data?.limit ?? PAGE_LIMIT,
              shown: data?.items.length ?? 0,
              loading,
              error,
            }}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={onSearchSubmit}
            onPatch={updateParams}
            onClearAll={clearAllFilters}
          />
          {isFeatured && <BestVersionsIntro />}
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
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
          onToggleCollapse={() => setFiltersCollapsed((x) => !x)}
        />

        <div className="min-w-0">
          <div className="mb-4 flex min-h-[36px] flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-mist" aria-live="polite">
              {isHome &&
                (loading ? (
                  <span className="inline-block h-3 w-28 animate-pulse rounded bg-line" aria-hidden />
                ) : error ? (
                  <span className="text-warn">Error loading products</span>
                ) : (
                  <>
                    Showing{' '}
                    <span className="tabular-nums font-medium text-frost">{data?.items.length ?? 0}</span>{' '}
                    of{' '}
                    <span className="tabular-nums font-medium text-frost">
                      {(data?.total ?? 0).toLocaleString()}
                    </span>
                  </>
                ))}
            </p>

            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sort products">
              <span className="text-xs text-subtle">Sort</span>
              {SORT_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateParams({ sort: key, page: null })}
                  aria-pressed={sort === key}
                  className={`rounded-md border px-2.5 py-1 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link ${
                    sort === key
                      ? 'border-accent bg-raised font-medium text-frost'
                      : 'border-line text-mist hover:bg-raised hover:text-frost'
                  }`}
                >
                  {SORT_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {loading && <ProductGridSkeleton />}

          {error && (
            <div className="card p-8 text-center">
              <p className="text-sm font-medium text-warn">Failed to load products</p>
              <p className="mt-1 text-sm text-mist">{String(error)}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {data.items.length === 0 ? (
                <div className="card p-10 text-center">
                  <p className="text-sm font-medium text-frost">No matches</p>
                  <p className="mt-1 text-sm text-mist">
                    {q
                      ? `Nothing matched "${q}"`
                      : 'No products matched the active filters'}
                    . Try broadening your criteria.
                  </p>
                  <button type="button" onClick={clearAllFilters} className="btn-primary mt-5">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    role="list"
                    aria-label="Product results"
                  >
                    {data.items.map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </div>

                  {data.pages > 1 && (
                    <nav
                      className="mt-8 flex items-center justify-center gap-2"
                      role="navigation"
                      aria-label="Pagination"
                    >
                      <button
                        type="button"
                        onClick={() => updateParams({ page: String(page - 1) })}
                        disabled={page <= 1}
                        aria-label="Previous page"
                        className="rounded-md border border-line px-3 py-1.5 text-sm text-frost transition hover:enabled:bg-raised disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="px-3 text-sm tabular-nums text-mist" aria-current="page">
                        {page} / {data.pages}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateParams({ page: String(page + 1) })}
                        disabled={page >= data.pages}
                        aria-label="Next page"
                        className="rounded-md border border-line px-3 py-1.5 text-sm text-frost transition hover:enabled:bg-raised disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </nav>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
