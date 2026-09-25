import type { ReactNode } from 'react';

interface StepCardProps {
  id: string;
  step: number;
  of: number;
  title: string;
  timing?: string;
  children: ReactNode;
}

export function StepCard({ id, step, of, title, timing, children }: StepCardProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="card scroll-mt-24 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-raised text-sm font-semibold tabular-nums text-frost"
        >
          {step}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-subtle">
            Step {step} of {of}
          </p>
          <h2 id={`${id}-heading`} className="mt-0.5 text-xl font-semibold text-frost">
            {title}
          </h2>
        </div>

        {timing && (
          <span className="hidden shrink-0 rounded-md border border-line px-2.5 py-1 text-xs text-mist sm:inline-block">
            {timing}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed text-mist">{children}</div>
    </section>
  );
}

interface CalloutProps {
  kind: 'warn' | 'tip';
  title: string;
  children: ReactNode;
}

const CALLOUT_STYLES: Record<CalloutProps['kind'], string> = {
  warn: 'border-warn/30 bg-warn/5',
  tip: 'border-line bg-raised',
};

export function Callout({ kind, title, children }: CalloutProps) {
  return (
    <aside className={`rounded-lg border p-4 ${CALLOUT_STYLES[kind]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-frost">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-mist">{children}</div>
    </aside>
  );
}

export function Term({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-frost">{children}</strong>;
}
