import { Link } from 'react-router-dom';
import { useMeta } from '../context/MetaContext';

export function Header() {
  const { meta } = useMeta();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-void/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="group flex items-center gap-3 no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon-gradient text-void shadow-glow-cyan transition group-hover:shadow-glow-violet">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 17V7l8 6 8-6v10"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-bold tracking-tight text-frost">
              {meta?.siteName ?? 'KAKUBUY'}
              <span className="text-neon-cyan">.</span>
            </span>
            <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.28em] text-mist">
              Neural catalog
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {meta?.discountCode && (
            <span className="rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 font-mono text-xs font-medium text-neon-cyan shadow-glow-cyan">
              {meta.discountCode}
            </span>
          )}
          {meta?.affcode && (
            <span className="hidden font-mono text-xs text-mist/70 sm:inline">
              ref<span className="text-neon-violet">/</span>{meta.affcode}
            </span>
          )}
          <span className="relative flex h-2.5 w-2.5" title="API online">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon-cyan" />
          </span>
        </div>
      </div>

      <div className="h-px w-full bg-neon-gradient opacity-40" />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-panel/40">
      <div className="mx-auto max-w-[1320px] px-6 py-8 text-center">
        <p className="font-mono text-xs leading-relaxed text-mist">
          PRICES SYNCED FROM THIRD-PARTY MARKETPLACES — SUBJECT TO CHANGE
        </p>
        <p className="mx-auto mt-2 max-w-[70ch] text-sm leading-relaxed text-mist/70">
          Outbound links carry our affiliate code; purchases made through them support this site.
          Product imagery is served from its original host — we claim no rightsholder status.
        </p>
      </div>
    </footer>
  );
}
