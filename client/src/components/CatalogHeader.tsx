import { useId } from 'react';

export interface HeaderFilters {
  q: string;
  brand: string | null;
  category: string | null;
  priceMin: string;
  priceMax: string;
  featured: boolean;
}

export interface HeaderResult {
  total: number;
  page: number;
  pages: number;
  limit: number;
  shown: number;
  loading: boolean;
  error: string | null;
}

export interface CatalogHeaderProps {
  filters: HeaderFilters;
  result: HeaderResult;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onPatch: (patch: Record<string, string | null | undefined>) => void;
  onClearAll: () => void;
}

function money(raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function priceLabel(min: string, max: string): string | null {
  if (min && max) return `${money(min)} – ${money(max)}`;
  if (min) return `≥ ${money(min)}`;
  if (max) return `≤ ${money(max)}`;
  return null;
}

function describe(f: HeaderFilters): { eyebrow: string; title: string } {
  if (f.featured) return { eyebrow: 'Curated', title: 'Best Versions' };
  if (f.q) return { eyebrow: 'Search', title: `"${f.q}"` };
  if (f.brand) return { eyebrow: 'Brand', title: f.brand };
  if (f.category) return { eyebrow: 'Category', title: f.category };
  return { eyebrow: 'Catalog', title: 'Products' };
}

interface Chip {
  id: string;
  label: string;
  value: string;
  remove: () => void;
}

function FilterChip({ chip }: { chip: Chip }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-line bg-raised py-1 pl-2.5 pr-1 text-xs text-mist">
      <span className="shrink-0 text-subtle">{chip.label}</span>
      <span className="min-w-0 truncate font-medium text-frost">{chip.value}</span>
      <button
        type="button"
        onClick={chip.remove}
        aria-label={`Remove ${chip.label} filter: ${chip.value}`}
        className="grid h-5 w-5 shrink-0 place-items-center rounded text-subtle transition hover:bg-line hover:text-frost"
      >
        <span aria-hidden>×</span>
      </button>
    </span>
  );
}

export function CatalogHeader({
  filters,
  result,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onPatch,
  onClearAll,
}: CatalogHeaderProps) {
  const searchId = useId();
  const { eyebrow, title } = describe(filters);
  const { total, page, pages, limit, shown, loading, error } = result;

  const chips: Chip[] = [];
  if (filters.featured) {
    chips.push({
      id: 'featured',
      label: 'Shelf',
      value: 'Best Versions',
      remove: () => onPatch({ featured: null, page: null }),
    });
  }
  if (filters.q) {
    chips.push({
      id: 'q',
      label: 'Search',
      value: filters.q,
      remove: () => onPatch({ q: null }),
    });
  }
  if (filters.brand) {
    chips.push({
      id: 'brand',
      label: 'Brand',
      value: filters.brand,
      remove: () => onPatch({ brand: null }),
    });
  }
  if (filters.category) {
    chips.push({
      id: 'category',
      label: 'Category',
      value: filters.category,
      remove: () => onPatch({ category: null }),
    });
  }
  const price = priceLabel(filters.priceMin, filters.priceMax);
  if (price) {
    chips.push({
      id: 'price',
      label: 'Price',
      value: price,
      remove: () => onPatch({ minPrice: null, maxPrice: null }),
    });
  }

  const from = shown > 0 ? (page - 1) * limit + 1 : 0;
  const to = shown > 0 ? from + shown - 1 : 0;

  return (
    <section className="card p-5 sm:p-6" aria-labelledby={`${searchId}-title`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h1
            id={`${searchId}-title`}
            className="mt-1 break-words text-2xl font-semibold tracking-tight text-frost sm:text-3xl"
          >
            {title}
          </h1>

          <p className="mt-2 flex min-h-[20px] items-center text-sm" aria-live="polite" aria-atomic="true">
            {loading ? (
              <span className="inline-block h-3 w-36 animate-pulse rounded bg-line" aria-hidden />
            ) : error ? (
              <span className="text-warn">Could not load results</span>
            ) : shown === 0 ? (
              <span className="text-mist">No matches</span>
            ) : (
              <span className="text-mist">
                Showing{' '}
                <span className="tabular-nums text-frost">
                  {from.toLocaleString()}–{to.toLocaleString()}
                </span>{' '}
                of{' '}
                <span className="tabular-nums font-medium text-frost">{total.toLocaleString()}</span>
                {pages > 1 && (
                  <>
                    <span className="mx-1.5 text-subtle">·</span>
                    Page{' '}
                    <span className="tabular-nums text-frost">{page.toLocaleString()}</span>
                    <span className="text-subtle"> / {pages.toLocaleString()}</span>
                  </>
                )}
              </span>
            )}
          </p>
        </div>

        <form role="search" onSubmit={onSearchSubmit} className="w-full shrink-0 lg:w-80">
          <label htmlFor={searchId} className="text-xs font-medium text-mist">
            Search
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id={searchId}
              type="search"
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              placeholder="Brand, item, keyword…"
              className="input min-w-0 flex-1"
            />
            <button type="submit" className="btn-primary shrink-0">Go</button>
          </div>
        </form>
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="text-xs text-subtle">Active filters</span>
          {chips.map((chip) => (
            <FilterChip key={chip.id} chip={chip} />
          ))}
          {chips.length > 1 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-link hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </section>
  );
}
