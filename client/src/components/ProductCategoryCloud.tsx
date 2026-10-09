import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FacetsResponse } from '../lib/api';
import { useApi } from '../lib/useApi';

const COLLAPSED_COUNT = 18;

const QUICK_LINKS = [
  { label: '!Best Batches', to: '/spreadsheet?featured=true' },
  { label: '!Bought', to: '/spreadsheet?sort=newest' },
] as const;

export function ProductCategoryCloud({
  activeCategory,
}: {
  activeCategory: string | null;
}) {
  const { data, loading } = useApi<FacetsResponse>('/api/products/facets', []);
  const [expanded, setExpanded] = useState(false);

  const categories = useMemo(() => data?.categories ?? [], [data]);
  const visible = expanded ? categories : categories.slice(0, COLLAPSED_COUNT);
  const hasMore = categories.length > COLLAPSED_COUNT;

  return (
    <section className="category-cloud" aria-labelledby="products-categories-heading">
      <h2 id="products-categories-heading" className="category-cloud-title">
        Products
      </h2>

      <div className="category-cloud-inner">
        {loading && (
          <p className="py-8 text-center text-sm text-mist">Loading categories…</p>
        )}

        {!loading && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
            {QUICK_LINKS.map((item) => (
              <Link key={item.label} to={item.to} className="category-pill category-pill-accent">
                {item.label}
              </Link>
            ))}
            {visible.map((c) => {
              const active = activeCategory === c.name;
              return (
                <Link
                  key={c.name}
                  to={`/?category=${encodeURIComponent(c.name)}&sort=newest`}
                  className={`category-pill ${active ? 'category-pill-active' : ''}`}
                  aria-current={active ? 'true' : undefined}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((x) => !x)}
              className={expanded ? 'category-toggle category-toggle-less' : 'category-toggle'}
            >
              {expanded ? 'Less' : 'More'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
