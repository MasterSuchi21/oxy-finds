import { Link } from 'react-router-dom';
import type { Product } from '../lib/api';
import { formatPrice } from '../lib/api';
import { productHref, goHref } from '../lib/links';

const SOURCE_LABEL: Record<string, string> = { WD: 'Weidian', TB: 'Taobao', '1688': '1688' };

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group card card-hover flex flex-col overflow-hidden">
      <Link to={productHref(product.slug)} className="block p-3 pb-0">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-raised">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-subtle">No image</div>
          )}
          {product.source && (
            <span className="absolute left-2 top-2 rounded bg-void/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist">
              {SOURCE_LABEL[product.source] ?? product.source}
            </span>
          )}
          {product.featured && (
            <span className="absolute right-2 top-2 rounded-md bg-brand-gradient px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-void">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {product.brand && (
            <span className="rounded bg-raised px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mist">
              {product.brand}
            </span>
          )}
          {product.category && (
            <span className="rounded border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-subtle">
              {product.category}
            </span>
          )}
        </div>

        <Link to={productHref(product.slug)} className="no-underline">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-frost transition group-hover:text-brand">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <p className="text-base font-semibold tabular-nums text-frost">{formatPrice(product.price)}</p>
          <a
            href={goHref(product.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon h-8 w-8 shrink-0"
            aria-label={`Open ${product.title} on Kakobuy`}
            title="Buy via Kakobuy"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M7 17L17 7M17 7H9m8 0v8"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-3" aria-hidden>
          <div className="aspect-square animate-pulse rounded-lg bg-line" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-line" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-line/60" />
        </div>
      ))}
    </div>
  );
}
