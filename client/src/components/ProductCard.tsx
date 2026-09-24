import { Link } from 'react-router-dom';
import type { Product } from '../lib/api';
import { formatPrice } from '../lib/api';
import { productHref, goHref } from '../lib/links';

const SOURCE_LABEL: Record<string, string> = { WD: 'Weidian', TB: 'Taobao', '1688': '1688' };

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.03] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-neon-cyan/30 hover:shadow-card">
      {/* Top edge glow line on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-neon-gradient opacity-0 transition duration-300 group-hover:opacity-100" />

      <Link to={productHref(product.slug)} className="block p-3 pb-0">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-panel">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center font-mono text-xs text-mist/40">
              NO SIGNAL
            </div>
          )}
          {product.source && (
            <span className="absolute left-2 top-2 rounded-md border border-line bg-void/80 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-neon-cyan backdrop-blur">
              {SOURCE_LABEL[product.source] ?? product.source}
            </span>
          )}
          {product.featured && (
            <span className="absolute right-2 top-2 rounded-md bg-neon-gradient px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-void">
              Drop
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {product.brand && (
            <span className="rounded-full border border-neon-violet/25 bg-neon-violet/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-neon-violet">
              {product.brand}
            </span>
          )}
          {product.category && (
            <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mist">
              {product.category}
            </span>
          )}
        </div>

        <Link to={productHref(product.slug)} className="no-underline">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-frost transition group-hover:text-neon-cyan">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="font-display text-lg font-bold text-frost">{formatPrice(product.price)}</p>
          <a
            href={goHref(product.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neon-gradient text-void shadow-glow-cyan transition hover:shadow-glow-violet active:scale-95"
            aria-label={`Open ${product.title} on Kakobuy`}
            title="Buy via Kakobuy"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-line bg-white/[0.03] p-3" aria-hidden>
          <div className="aspect-square animate-pulse rounded-xl bg-line" />
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-line" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-line/60" />
        </div>
      ))}
    </div>
  );
}
