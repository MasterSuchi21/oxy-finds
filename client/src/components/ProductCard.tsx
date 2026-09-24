import { Link } from 'react-router-dom';
import type { Product } from '../lib/api';
import { formatPrice } from '../lib/api';
import { productHref, goHref } from '../lib/links';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white transition hover:border-clay/30 hover:shadow-[0_10px_30px_rgba(26,18,16,0.08)]">
      <Link to={productHref(product.slug)} className="block bg-sand/40 p-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-white">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-moss/40">No image</div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          {product.brand && (
            <span className="rounded-full bg-ink px-2 py-0.5 text-white">{product.brand}</span>
          )}
          {product.category && (
            <span className="rounded-full border border-sand bg-paper px-2 py-0.5 text-moss">
              {product.category}
            </span>
          )}
        </div>

        <Link to={productHref(product.slug)} className="no-underline">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight text-ink group-hover:text-clay">
            {product.title}
          </h3>
        </Link>

        <p className="font-display text-[20px] font-bold text-ink">{formatPrice(product.price)}</p>

        <div className="mt-auto flex gap-2">
          <a
            href={goHref(product.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-clay/90"
          >
            View on Kakobuy
          </a>
          <Link
            to={productHref(product.slug)}
            className="inline-flex items-center justify-center rounded-full border border-sand bg-white px-4 py-2.5 text-sm font-medium text-ink no-underline hover:border-ink/20"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-sand bg-white p-3"
          aria-hidden
        >
          <div className="aspect-square rounded-xl bg-sand/60" />
          <div className="mt-4 h-4 w-3/4 rounded bg-sand/80" />
          <div className="mt-2 h-4 w-1/2 rounded bg-sand/60" />
        </div>
      ))}
    </div>
  );
}
