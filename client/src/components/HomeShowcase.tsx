import { Link } from 'react-router-dom';
import type { ProductsResponse } from '../lib/api';
import { useApi } from '../lib/useApi';
import { useMeta } from '../context/MetaContext';
import { ShowcaseProductCard } from './ShowcaseProductCard';

export function HomeShowcase() {
  const { meta } = useMeta();
  const featured = useApi<ProductsResponse>('/api/products?featured=true&limit=4', []);
  const fallback = useApi<ProductsResponse>('/api/products?sort=newest&limit=4', []);
  const loading = featured.loading || fallback.loading;
  const data =
    featured.data && featured.data.items.length > 0 ? featured.data : fallback.data;

  const promo = meta?.promoCode ?? 'OXYFINDS';
  const signupUrl = meta?.signupUrl ?? 'https://www.kakobuy.com/register';

  const items = data?.items ?? [];

  return (
    <section className="showcase-shell animate-fade-up text-center">
      <p className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
        <span className="text-brand-gradient">OXYFINDS</span>
      </p>
      <p className="mt-4 font-display text-lg font-bold tracking-wide text-frost sm:text-xl">
        CODE: {promo} <span className="text-brand">25$ OFF</span>
      </p>

      <div className="showcase-frame relative mx-auto mt-8 max-w-5xl px-2 sm:px-4">
        <div className="showcase-inner flex gap-3 overflow-x-auto pb-2 pt-4 sm:gap-4 sm:justify-center sm:overflow-visible">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="showcase-card min-h-[320px] min-w-[200px] animate-pulse bg-raised/40" />
            ))}
          {!loading && items.length === 0 && (
            <p className="w-full py-12 text-sm text-mist">Featured picks loading soon — browse the full catalog.</p>
          )}
          {items.map((p, index) => (
            <ShowcaseProductCard key={p._id} product={p} priority={index === 0} />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
          <Link to="/spreadsheet?featured=true" className="showcase-view-all pointer-events-auto no-underline">
            View all
          </Link>
        </div>
      </div>

      <p className="mt-10 font-display text-xl font-bold uppercase tracking-wide text-brand-gradient sm:text-2xl">
        Level up your rep game here
      </p>

      <a
        href={signupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="showcase-coupon mt-6 inline-block no-underline"
      >
        Sign up for 525$ coupons
      </a>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link to="/spreadsheet?sort=newest" className="btn-primary no-underline">
          Browse all products
        </Link>
        <Link to="/how-to" className="btn-secondary no-underline">
          How to order
        </Link>
      </div>

      <div className="mx-auto mt-12 max-w-4xl">
        <h2 className="font-display text-xl font-bold text-frost sm:text-2xl">
          Watch the tutorial
        </h2>
        <video
          className="mt-4 aspect-video w-full rounded-2xl border border-line bg-black shadow-xl"
          controls
          playsInline
          preload="metadata"
          aria-label="Oxy Finds tutorial video"
        >
          <source src="/1.mp4" type="video/mp4" />
          Your browser does not support HTML video.
        </video>
      </div>
    </section>
  );
}
