import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ProductDetailResponse } from '../lib/api';
import { formatPrice } from '../lib/api';
import { useApi } from '../lib/useApi';
import { productHref, goHref } from '../lib/links';
import { ProductCard } from '../components/ProductCard';

const SOURCE_LABEL: Record<string, string> = { WD: 'Weidian', TB: 'Taobao', '1688': '1688' };

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug ?? '';
  const { data, loading, error } = useApi<ProductDetailResponse>(`/api/products/${id}`, [id]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1320px] px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-[28px] bg-line" />
          <div className="space-y-4">
            <div className="h-5 w-24 animate-pulse rounded bg-line" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-line" />
            <div className="h-24 animate-pulse rounded-2xl bg-line/50" />
          </div>
        </div>
      </div>
    );
  }

  if (error?.includes('404') || error?.toLowerCase().includes('not found')) {
    return (
      <div className="mx-auto max-w-[1320px] px-6 py-20 text-center">
        <p className="font-mono text-sm text-mist">[ 404 ]</p>
        <p className="mt-3 font-display text-3xl font-bold text-frost">Signal lost</p>
        <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-mist">
          That listing isn&apos;t in the index — it may have been removed from the source site.
        </p>
        <Link to="/" className="btn-neon mt-8 no-underline">
          ← Back to catalog
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-10">
        <div className="rounded-2xl border border-neon-pink/30 bg-neon-pink/5 px-4 py-4 font-mono text-sm text-neon-pink">
          ! fetch error: {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { product, related } = data;
  const images = product.images.length ? product.images : product.image ? [product.image] : [];
  const shown = activeImage ?? images[0] ?? null;

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-8">
      <nav className="flex items-center gap-2 font-mono text-xs text-mist" aria-label="Breadcrumb">
        <Link to="/" className="text-neon-cyan no-underline hover:underline">
          catalog
        </Link>
        <span className="text-mist/40">/</span>
        <span className="truncate text-frost/80">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="glass relative overflow-hidden rounded-[28px] p-3">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-neon-violet/10 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-panel">
              {shown ? (
                <img
                  src={shown}
                  alt={product.title}
                  className="h-full w-full bg-white/95 object-contain p-3"
                />
              ) : (
                <div className="grid h-full place-items-center font-mono text-xs text-mist/40">
                  NO SIGNAL
                </div>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(src)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white/95 p-1 transition ${
                    shown === src
                      ? 'border-neon-cyan shadow-glow-cyan'
                      : 'border-line opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {product.brand && (
                <span className="rounded-full border border-neon-violet/25 bg-neon-violet/10 px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-neon-violet">
                  {product.brand}
                </span>
              )}
              {product.category && (
                <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-mist">
                  {product.category}
                </span>
              )}
              {product.source && (
                <span className="rounded-full border border-neon-cyan/25 bg-neon-cyan/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-neon-cyan">
                  {SOURCE_LABEL[product.source] ?? product.source}
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-[32px] font-bold leading-tight tracking-tight text-frost">
              {product.title}
            </h1>

            <p className="mt-3 font-display text-3xl font-bold text-gradient">
              {formatPrice(product.price)}
            </p>

            <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-mist">
              Curated from the original marketplace listing — this storefront only points the
              way. Prices can shift between visits; the buy button hops through our tracked
              affiliate link on the way out.
            </p>
          </div>

          <div className="glass space-y-3 rounded-2xl p-5">
            <a
              href={goHref(product.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon w-full rounded-2xl py-3.5 text-base"
            >
              Buy via Kakobuy
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M7 17L17 7M17 7H9m8 0v8"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <p className="text-center font-mono text-[11px] leading-relaxed text-mist/60">
              we don&apos;t sell or ship anything — checkout happens on the marketplace via
              kakobuy. the affiliate hop is assembled server-side; the code never touches this page.
            </p>
          </div>

          <dl className="glass grid grid-cols-2 gap-4 rounded-2xl p-5 font-mono text-xs">
            <div>
              <dt className="uppercase tracking-[0.18em] text-mist/60">listing id</dt>
              <dd className="mt-1 text-frost">{product.itemId ?? '—'}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.18em] text-mist/60">marketplace</dt>
              <dd className="mt-1 text-frost">{product.source ?? '—'}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.18em] text-mist/60">slug</dt>
              <dd className="mt-1 truncate text-frost/80">{product.slug}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.18em] text-mist/60">clicks via /go</dt>
              <dd className="mt-1 tabular-nums text-neon-cyan">{product.clicks}</dd>
            </div>
          </dl>

          <Link
            to="/"
            className="inline-block font-mono text-xs text-neon-cyan underline decoration-neon-cyan/40 underline-offset-2"
          >
            ← back to catalog
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <p className="label-tech">
            // more {product.brand ? `from ${product.brand}` : `in ${product.category ?? 'the index'}`}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.slice(0, 8).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
