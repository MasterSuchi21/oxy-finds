import { Link } from 'react-router-dom';
import type { Product } from '../lib/api';
import { formatPrice } from '../lib/api';
import { goHref, productHref } from '../lib/links';

export function ShowcaseProductCard({ product }: { product: Product }) {
  return (
    <article className="showcase-card group flex min-w-[200px] max-w-[220px] flex-1 flex-col sm:min-w-[220px]">
      <Link to={productHref(product.slug)} className="block p-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-raised/80">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-subtle">No image</div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-frost">{product.title}</p>
        <p className="text-sm font-semibold tabular-nums text-brand">{formatPrice(product.price)}</p>
        <div className="mt-auto flex flex-col gap-1.5">
          <a
            href={goHref(product.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full py-2 text-xs no-underline"
          >
            Buy on Kakobuy
          </a>
          <Link
            to={productHref(product.slug)}
            className="btn-secondary w-full py-2 text-center text-xs no-underline"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
