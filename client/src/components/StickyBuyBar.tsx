import { formatPrice } from '../lib/api';

export function StickyBuyBar({ price, href }: { price: number; href: string }) {
  return (
    <div
      aria-hidden
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-void/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs text-subtle">Price</p>
          <p className="text-lg font-semibold tabular-nums leading-tight text-frost">
            {formatPrice(price)}
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          className="btn-primary ml-auto shrink-0 px-5 py-2.5 no-underline"
        >
          Buy via Kakobuy
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
  );
}
