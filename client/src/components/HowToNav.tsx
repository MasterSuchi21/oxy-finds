import { useEffect, useState } from 'react';

export interface TocEntry {
  id: string;
  label: string;
  step?: number;
}

function useScrollSpy(ids: string[], offset = 120): string {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    if (typeof window === 'undefined' || ids.length === 0) return;

    const pick = () => {
      let current = ids[0] ?? '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - offset <= 0) {
          current = id;
        }
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 120;
      if (atBottom && ids.length > 0) current = ids[ids.length - 1]!;
      setActiveId(current);
    };

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        pick();
      });
    };

    pick();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ids.join('|'), offset]);

  return activeId;
}

function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let queued = false;
    const measure = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      setProgress(scrollable <= 0 ? 1 : Math.min(1, Math.max(0, window.scrollY / scrollable)));
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        measure();
      });
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}

export function ReadingProgressBar() {
  const progress = useReadingProgress();

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-0.5 bg-line" aria-hidden>
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

interface HowToNavProps {
  entries: TocEntry[];
}

export function HowToNav({ entries }: HowToNavProps) {
  const ids = entries.map((e) => e.id);
  const activeId = useScrollSpy(ids);
  const activeIndex = Math.max(0, ids.indexOf(activeId));
  const steps = entries.filter((e) => e.step !== undefined);
  const activeStep = entries[activeIndex]?.step;

  return (
    <nav aria-label="Guide contents" className="sticky top-20 self-start">
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">Contents</p>

      <p className="mt-1 text-xs text-mist">
        {activeStep !== undefined ? (
          <>Step {activeStep} of {steps.length}</>
        ) : (
          'Overview'
        )}
      </p>

      <ol className="mt-3 space-y-0.5 border-l border-line pl-0">
        {entries.map((entry) => {
          const active = entry.id === activeId;
          return (
            <li key={entry.id} className="relative">
              <a
                href={`#${entry.id}`}
                aria-current={active ? 'true' : undefined}
                className={`block rounded-r-md py-1 pl-3 pr-2 text-sm leading-snug no-underline transition ${
                  active
                    ? 'bg-raised font-medium text-frost'
                    : 'text-mist hover:text-frost'
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute left-0 top-1 h-[calc(100%-0.5rem)] w-0.5 rounded-full ${
                    active ? 'bg-accent' : 'bg-transparent'
                  }`}
                  style={{ marginLeft: '-1px' }}
                />
                {entry.step !== undefined && (
                  <span className="mr-1.5 text-xs tabular-nums text-subtle">
                    {String(entry.step).padStart(2, '0')}
                  </span>
                )}
                {entry.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
