import { Link } from 'react-router-dom';

const EXTRA = [
  ['Agent service fee', 'charged by the agent for buying and handling on your behalf'],
  ['Domestic China shipping', 'seller to the agent’s warehouse'],
  ['International freight', 'warehouse to you — usually the largest single line'],
  ['Import duty or VAT', 'depends on your country, collected on arrival'],
] as const;

export function BuyingContext() {
  return (
    <section aria-labelledby="buying-context-heading" className="card p-5">
      <p className="eyebrow">Before you buy</p>
      <h2 id="buying-context-heading" className="mt-1 text-lg font-semibold text-frost">
        What this price covers
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-mist">
        The figure above is the <span className="text-frost">item price only</span> — what the
        seller charges on the original marketplace listing. Your final cost adds:
      </p>

      <ul className="mt-3 space-y-2">
        {EXTRA.map(([label, detail]) => (
          <li key={label} className="flex gap-2 text-sm leading-relaxed text-mist">
            <span aria-hidden className="mt-0.5 shrink-0 text-subtle">+</span>
            <span>
              <span className="font-medium text-frost">{label}</span>
              <span className="text-mist"> — {detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-mist">
        Once the agent receives the item they will photograph it. Check those QC photos and
        confirm them <span className="text-frost">before the parcel ships</span> — after it leaves
        the warehouse a return is impractical.
      </p>

      <Link to="/how-to" className="mt-4 inline-flex items-center gap-1 text-sm text-link hover:underline">
        Full walkthrough with a worked cost example →
      </Link>
    </section>
  );
}
