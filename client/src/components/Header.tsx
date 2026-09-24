import { Link } from 'react-router-dom';
import { useMeta } from '../context/MetaContext';

export function Header() {
  const { meta } = useMeta();

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-baseline gap-2 no-underline">
          <span className="font-display text-[22px] font-bold tracking-tight text-ink">
            {meta?.siteName ?? 'Kakubuy'}
          </span>
          <span className="hidden text-sm font-medium tracking-[0.12em] text-clay sm:inline">
            Curated finds
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {meta?.discountCode && (
            <span className="rounded-full border border-clay/30 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-clay">
              Code {meta.discountCode}
            </span>
          )}
          {meta?.affcode && (
            <span className="hidden text-xs tabular-nums text-moss/60 sm:inline">
              affcode {meta.affcode}
            </span>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-clay/30 to-transparent opacity-80" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-sand bg-white/60">
      <div className="mx-auto max-w-[1320px] px-6 py-8 text-center text-sm text-moss/60">
        <p>
          Prices and availability are fetched from third-party marketplaces and may change.
          Outbound links use our affiliate code so purchases support this site.
        </p>
        <p className="mt-2">
          Product images are served from their original hosts; we claim no rightsholder status.
        </p>
      </div>
    </footer>
  );
}
