import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Accordion, type AccordionItemData } from '../components/Accordion';
import {
  FAQ_BY_ID,
  FAQ_CATEGORIES,
  FAQ_ENTRIES,
  faqAnswerText,
  faqSearchText,
  type FAQEntry,
} from '../lib/faqData';

const ID_PREFIX = 'faq';
const MIN_QUERY = 2;

const SEARCH_INDEX: ReadonlyMap<string, string> = new Map(
  FAQ_ENTRIES.map((entry) => [entry.id, faqSearchText(entry)]),
);

const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ENTRIES.map((entry) => ({
    '@type': 'Question',
    name: entry.question,
    acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(entry) },
  })),
}).replace(/</g, '\\u003c');

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function AnswerBody({ entry }: { entry: FAQEntry }) {
  return (
    <div className="space-y-3">
      {entry.answer.map((para, i) => (
        <p key={i} className="text-sm leading-relaxed text-mist">
          {para}
        </p>
      ))}
      {entry.bullets ? (
        <ul className="mt-1 space-y-2 pl-0">
          {entry.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-mist">
              <span aria-hidden="true" className="mt-0.5 text-subtle">•</span>
              <span className="flex-1">{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function FAQPage() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set<string>());

  const trimmed = query.trim();
  const isSearching = trimmed.length >= MIN_QUERY;

  const filtered = useMemo<readonly FAQEntry[]>(() => {
    if (!isSearching) return FAQ_ENTRIES;
    const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    return FAQ_ENTRIES.filter((entry) => {
      const haystack = SEARCH_INDEX.get(entry.id) ?? '';
      return terms.every((term) => haystack.includes(term));
    });
  }, [isSearching, trimmed]);

  const filteredIds = useMemo(() => filtered.map((e) => e.id), [filtered]);
  const matchKey = filteredIds.join(',');

  useEffect(() => {
    setOpenIds(isSearching ? new Set(matchKey ? matchKey.split(',') : []) : new Set<string>());
  }, [isSearching, matchKey]);

  useEffect(() => {
    const id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) return;

    if (FAQ_BY_ID.has(id)) {
      setQuery('');
      setOpenIds((prev) => new Set(prev).add(id));
    }

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [location.hash]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  const sections = useMemo(
    () =>
      FAQ_CATEGORIES.map((category) => ({
        category,
        entries: filtered.filter((entry) => entry.category === category.id),
      })).filter((section) => section.entries.length > 0),
    [filtered],
  );

  const allVisibleOpen = filteredIds.length > 0 && filteredIds.every((id) => openIds.has(id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-16 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }} />

      <div className="mb-8">
        <p className="eyebrow">FAQ</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-frost sm:text-4xl">
          Common questions
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist">
          {FAQ_ENTRIES.length} answers about how OXYGALAXY works, agent fees, shipping, sizing, and
          ordering from Chinese marketplaces.
        </p>
      </div>

      <div className="card mb-6 p-4">
        <label htmlFor="faq-search" className="text-xs font-medium text-mist">
          Search answers
        </label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Customs, sizing, QC photos, agent fees…"
          autoComplete="off"
          aria-describedby="faq-search-status"
          className="input mt-1.5"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p id="faq-search-status" role="status" className="text-sm text-mist">
            {isSearching
              ? `${filtered.length} of ${FAQ_ENTRIES.length} ${
                  filtered.length === 1 ? 'question matches' : 'questions match'
                } "${trimmed}"`
              : `Showing all ${FAQ_ENTRIES.length} questions`}
          </p>
          <div className="flex items-center gap-2">
            {isSearching ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-link hover:underline"
              >
                Clear
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpenIds(allVisibleOpen ? new Set<string>() : new Set(filteredIds))}
              className="text-xs text-link hover:underline"
            >
              {allVisibleOpen ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        </div>
      </div>

      {sections.length > 1 ? (
        <nav aria-label="FAQ categories" className="mb-8">
          <ul className="flex flex-wrap gap-2 pl-0">
            {sections.map(({ category, entries }) => (
              <li key={category.id}>
                <a
                  href={`#${ID_PREFIX}-cat-${category.id}`}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-raised px-3 py-1.5 text-sm text-frost no-underline transition hover:bg-line"
                >
                  {category.label}
                  <span className="text-xs text-subtle">{entries.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {sections.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-medium text-frost">No matching questions</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-mist">
            Nothing matches "{trimmed}". Try a broader term, or check the How To guide.
          </p>
          <button type="button" onClick={() => setQuery('')} className="btn-secondary mt-5">
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map(({ category, entries }) => {
            const items: AccordionItemData[] = entries.map((entry) => ({
              id: entry.id,
              title: entry.question,
              content: <AnswerBody entry={entry} />,
            }));

            return (
              <section
                key={category.id}
                id={`${ID_PREFIX}-cat-${category.id}`}
                aria-labelledby={`${ID_PREFIX}-cat-${category.id}-heading`}
                className="scroll-mt-24"
              >
                <div className="mb-4">
                  <h2
                    id={`${ID_PREFIX}-cat-${category.id}-heading`}
                    className="text-xl font-semibold text-frost"
                  >
                    {category.label}
                  </h2>
                  <p className="mt-1 text-sm text-mist">{category.blurb}</p>
                </div>
                <Accordion
                  items={items}
                  openIds={openIds}
                  onToggle={toggle}
                  idPrefix={ID_PREFIX}
                  headingLevel="h3"
                />
              </section>
            );
          })}
        </div>
      )}

      <div className="card mt-10 p-6 text-center">
        <h2 className="text-xl font-semibold text-frost">Still have questions?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist">
          Check the{' '}
          <Link to="/how-to" className="text-link hover:underline">How To guide</Link> for
          step-by-step instructions, or browse{' '}
          <a
            href="https://reddit.com/r/FashionReps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:underline"
          >
            r/FashionReps
          </a>{' '}
          for community advice.
        </p>
        <Link to="/?sort=newest" className="btn-primary mt-5 inline-block no-underline">
          Browse catalog
        </Link>
      </div>
    </div>
  );
}
