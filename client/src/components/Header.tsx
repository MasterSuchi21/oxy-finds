import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

const NAV: Array<{
  to: string;
  label: string;
  match: (loc: { pathname: string; search: string }) => boolean;
}> = [
  {
  to: '/',
    label: 'Home',
  match: (l) => l.pathname === '/' && l.search === '',
  },
  {
  to: '/spreadsheet',
    label: 'Products',
    match: (l) =>
    l.pathname === '/spreadsheet' && !l.search.includes('featured=true'),
  },
  {
    to: '/spreadsheet?featured=true',
    label: 'Best Versions',
    match: (l) => l.search.includes('featured=true'),
  },
  { to: '/how-to', label: 'How To', match: (l) => l.pathname === '/how-to' },
  { to: '/faq', label: 'FAQ', match: (l) => l.pathname === '/faq' },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="nav-shell">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link to="/" className="shrink-0 no-underline transition-opacity hover:opacity-90">
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = item.match(location);
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span
            className="relative flex h-2 w-2"
            title="API online"
            aria-label="API online"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-0.5 overflow-x-auto px-4 pb-2.5 lg:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={`nav-link shrink-0 text-xs ${item.match(location) ? 'nav-link-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line/60">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
        <p className="text-xs text-subtle">
          Oxy Finds — prices synced from third-party marketplaces, subject to change
        </p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-mist">
          Outbound links carry our affiliate code. Product imagery is served from its original host.
        </p>
      </div>
    </footer>
  );
}
