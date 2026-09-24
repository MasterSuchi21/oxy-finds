import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ProductDetailResponse } from '../lib/api';
import { formatPrice } from '../lib/api';
import { useApi } from '../lib/useApi';
import { productHref, goHref } from '../lib/links';
import { ProductCard } from '../components/ProductCard';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug ?? '';
  const { data, loading, error } = useApi<ProductDetailResponse>(`/api/products/${id}`, [id]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1320px] px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="aspect-square animate-pulse rounded-[24px] bg-sand/60" />
          <div className="space-y-4">
            <div className="h-6 w-24 animate-pulse rounded bg-sand/80" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-sand/60" />
            <div className="h-20 animate-pulse rounded-2xl bg-sand/40" />
          </div>
        </div>
      </div>
    );
  }

  if (error?.includes('404') || error?.includes('not found')) {
    return (
      <div className="mx-auto max-w-[1320px] px-6 py-16 text-center">
        <p className="font-display text-3xl font-bold text-ink">Not found</p>
        <p className="mx-auto mt-3 max-w-[46ch] text-sm leading-relaxed text-moss/60">
          That listing doesn&apos;t exist in this catalog — it may have been removed from the source site.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white no-underline"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-10">
        <div className="rounded-2xl border border-clay/20 bg-clay/5 px-4 py-4 text-sm text-clay">
          Couldn&apos;t load that product: {error}
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
      <nav className="text-sm text-moss/60" aria-label="Breadcrumb">
        <Link to="/" className="font-medium text-clay no-underline hover:underline">
          Catalog
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* Images */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[24px] border border-sand bg-white p-3">
            <div className="aspect-square overflow-hidden rounded-2xl bg-sand/40">
              {shown ? (
                <img src={shown} alt={product.title} className="h-full w-full object-contain bg-white p-2" />
              ) : (
                <div className="grid h-full place-items-center text-sm text-moss/40">No image</div>
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
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 ${
                    shown === src ? 'border-clay' : 'border-sand'
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
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              {product.brand && (
                <span className="rounded-full bg-ink px-2.5 py-1 text-white">{product.brand}</span>
              )}
              {product.category && (
                <span className="rounded-full border border-sand bg-paper px-2.5 py-1 text-moss">
                  {product.category}
                </span>
              )}
              {product.source && (
                <span className="rounded-full border border-sand bg-white px-2.5 py-1 text-moss/60">
                  {product.source}
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-[30px] font-bold leading-tight tracking-tight text-ink">
              {product.title}
            </h1>

            <p className="mt-3 font-display text-[28px] font-bold text-ink">
              {formatPrice(product.price)}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-moss/70">
              Listed on the original marketplace — this storefront only curates the link. Prices can shift between
              visits and the buy button carries our affiliate code. The final listing lands on Kakobuy on the other side.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-sand bg-white p-4">
            <a
              href={goHref(product.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-clay/90"
            >
              View on Kakobuy <span aria-hidden>→</span>
            </a>
            <p className="text-center text-xs leading-relaxed text-moss/50">
              We don&apos;t sell or ship anything ourselves. Buying happens on the marketplace via Kakobuy; we store
              only the raw listing URL — the affiliate hop is assembled server-side so the code never leaks into the
              page.
            </p>
            <Link to="/" className="text-center text-sm font-medium text-clay underline decoration-clay/30 underline-offset-2">
              Back to catalog
            </Link>
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-sand bg-paper p-4 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-moss/60">Listing id</dt>
              <dd className="mt-1 font-mono text-xs text-ink">{product.itemId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-moss/60">Marketplace</dt>
              <dd className="mt-1 text-ink">{product.source ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-moss/60">Slug</dt>
              <dd className="mt-1 font-mono text-xs text-ink">{product.slug}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-moss/60">Clicks (via /go)</dt>
              <dd className="mt-1 tabular-nums text-ink">{product.clicks}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-ink">
            More {product.brand ? `from ${product.brand}` : `in ${product.category ?? 'the catalog'}`}
          </h2>
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
