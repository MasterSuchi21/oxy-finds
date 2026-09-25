import { useEffect, useRef, useState } from 'react';

export function ProductGallery({
  images,
  title,
  resetKey,
}: {
  images: string[];
  title: string;
  resetKey: string;
}) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, true>>({});
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusThumbRef = useRef(false);

  useEffect(() => {
    setIndex(0);
    setFailed({});
    focusThumbRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (!focusThumbRef.current) return;
    focusThumbRef.current = false;
    thumbRefs.current[index]?.focus();
  }, [index]);

  const total = images.length;
  const current = images[index] ?? null;
  const currentBroken = current != null && failed[current] === true;

  function markFailed(src: string) {
    setFailed((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  }

  function step(delta: number) {
    if (total < 2) return;
    focusThumbRef.current = true;
    setIndex((prev) => (prev + delta + total) % total);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        step(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        step(-1);
        break;
      case 'Home':
        event.preventDefault();
        focusThumbRef.current = true;
        setIndex(0);
        break;
      case 'End':
        event.preventDefault();
        focusThumbRef.current = true;
        setIndex(total - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div className="space-y-3">
      <div className="card p-3">
        <div
          tabIndex={total > 1 ? 0 : -1}
          onKeyDown={onKeyDown}
          role={total > 1 ? 'group' : undefined}
          aria-label={total > 1 ? 'Product images, use arrow keys to browse' : undefined}
          className="relative aspect-square overflow-hidden rounded-lg bg-raised outline-none focus-visible:ring-2 focus-visible:ring-link/40"
        >
          {current && !currentBroken ? (
            <img
              src={current}
              alt={total > 1 ? `${title} — image ${index + 1} of ${total}` : title}
              onError={() => markFailed(current)}
              className="h-full w-full bg-white object-contain p-3"
            />
          ) : (
            <div className="grid h-full place-items-center gap-1 text-center">
              <p className="text-sm text-subtle">No image</p>
              {currentBroken && (
                <p className="text-xs text-subtle">Image unavailable from source</p>
              )}
            </div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md border border-line bg-void/90 text-frost transition hover:bg-raised"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 5l-7 7 7 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md border border-line bg-void/90 text-frost transition hover:bg-raised"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <p
                className="absolute bottom-2 right-2 rounded-md border border-line bg-void/90 px-2 py-0.5 text-xs tabular-nums text-mist"
                aria-live="polite"
              >
                {index + 1} / {total}
              </p>
            </>
          )}
        </div>
      </div>

      {total > 1 && (
        <div
          role="tablist"
          aria-label="Product image thumbnails"
          onKeyDown={onKeyDown}
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {images.map((src, i) => {
            const isActive = i === index;
            return (
              <button
                key={`${src}-${i}`}
                ref={(node) => {
                  thumbRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${total}`}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white p-0.5 transition ${
                  isActive ? 'border-accent' : 'border-line opacity-70 hover:opacity-100'
                }`}
              >
                {failed[src] ? (
                  <span className="grid h-full place-items-center text-[9px] text-subtle">—</span>
                ) : (
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    onError={() => markFailed(src)}
                    className="h-full w-full object-contain"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
