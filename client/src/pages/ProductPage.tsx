import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ProductDetailResponse } from '../lib/api';
import { formatPrice } from '../lib/api';
import { useApi } from '../lib/useApi';
import { productHref, goHref } from '../lib/links';
import { ProductCard } from '../components/ProductCard';
import { Seo } from '../components/Seo';

const SOURCE_LABEL: Record<string, string> = { WD: 'Weidian', TB: 'Taobao', '1688': '1688' };

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const id = slug ?? '';
  const { data, loading, error } = useApi<ProductDetailResponse>(`/api/products/${id}`, [id]);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (loading) {
    return (
      <>
        <Seo
          title="Loading Product | Oxy Finds"
          description="Loading a curated marketplace product listing on Oxy Finds."
          path={`/products/${encodeURIComponent(id)}`}
          noindex
        />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-xl bg-line" />
            <div className="space-y-4">
              <div className="h-4 w-20 animate-pulse rounded bg-line" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-line" />
              <div className="h-20 animate-pulse rounded-xl bg-line/50" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error?.includes('404') || error?.toLowerCase().includes('not found')) {
    return (
      <>
        <Seo
          title="Product Not Found | Oxy Finds"
          description="This product listing could not be found on Oxy Finds."
          path={`/products/${encodeURIComponent(id)}`}
          noindex
        />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <p className="text-sm text-subtle">404</p>
          <p className="mt-2 text-2xl font-semibold text-frost">Product not found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-mist">
            That listing isn&apos;t in the index — it may have been removed from the source site.
          </p>
          <Link to="/" className="btn-primary mt-6 no-underline">
            Back to catalog
          </Link>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Seo
          title="Product Unavailable | Oxy Finds"
          description="This product listing could not be loaded from Oxy Finds."
          path={`/products/${encodeURIComponent(id)}`}
          noindex
        />
        <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
          <div className="card border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
            Failed to load product: {error}
          </div>
        </div>
      </>
    );
  }

  if (!data) return null;

  const { product, related } = data;
  const images = product.images.length ? product.images : product.image ? [product.image] : [];
  const shown = activeImage ?? images[0] ?? null;
  const description = `View ${product.title}${product.brand ? ` by ${product.brand}` : ''} on Oxy Finds. Compare curated marketplace listings and shop through Kakobuy.`;
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: images,
    description,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    ...(product.category ? { category: product.category } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      url: `https://www.kakubuy-oxy.shop/products/${encodeURIComponent(product.slug)}`,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Seo
        title={`${product.title} | Oxy Finds`}
        description={description}
        path={`/products/${encodeURIComponent(product.slug)}`}
        image={shown}
        structuredData={productStructuredData}
      />
      <nav className="flex items-center gap-2 text-sm text-mist" aria-label="Breadcrumb">
        <Link to="/" className="text-link no-underline hover:underline">Catalog</Link>
        <span className="text-subtle">/</span>
        <span className="truncate text-frost">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="card p-3">
            <div className="aspect-square overflow-hidden rounded-lg bg-raised">
              {shown ? (
                <img
                  src={shown}
                  alt={product.title}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full bg-white object-contain p-3"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-subtle">No image</div>
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
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white p-0.5 transition ${
                    shown === src
                      ? 'border-accent'
                      : 'border-line opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {product.brand && (
                <span className="rounded bg-raised px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-mist">
                  {product.brand}
                </span>
              )}
              {product.category && (
                <span className="rounded border border-line px-2 py-0.5 text-xs uppercase tracking-wide text-subtle">
                  {product.category}
                </span>
              )}
              {product.source && (
                <span className="rounded border border-line px-2 py-0.5 text-xs uppercase tracking-wide text-mist">
                  {SOURCE_LABEL[product.source] ?? product.source}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-frost sm:text-3xl">
              {product.title}
            </h1>

            <p className="mt-2 text-2xl font-semibold tabular-nums text-frost">
              {formatPrice(product.price)}
            </p>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-mist">
              Curated from the original marketplace listing. Prices can change between visits; the
              buy button opens the item on Kakobuy through our tracked affiliate link.
            </p>
          </div>

          <div className="card space-y-3 p-4">
            <a
              href={goHref(product.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-3 text-base no-underline"
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
            <p className="text-center text-xs leading-relaxed text-subtle">
              We don&apos;t sell or ship anything — checkout happens on the marketplace via Kakobuy.
            </p>
          </div>

          <dl className="card grid grid-cols-2 gap-4 p-4 text-xs">
            <div>
              <dt className="text-subtle">Listing ID</dt>
              <dd className="mt-0.5 text-frost">{product.itemId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-subtle">Marketplace</dt>
              <dd className="mt-0.5 text-frost">{product.source ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-subtle">Slug</dt>
              <dd className="mt-0.5 truncate text-mist">{product.slug}</dd>
            </div>
            <div>
              <dt className="text-subtle">Clicks</dt>
              <dd className="mt-0.5 tabular-nums text-frost">{product.clicks}</dd>
            </div>
          </dl>

          <Link to="/" className="text-sm text-link hover:underline">
            ← Back to catalog
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold text-frost">
            More {product.brand ? `from ${product.brand}` : `in ${product.category ?? 'catalog'}`}
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
