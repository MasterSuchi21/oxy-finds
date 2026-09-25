import type { ReactNode } from 'react';

export interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
  meta?: string;
}

export interface AccordionProps {
  items: readonly AccordionItemData[];
  openIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
  idPrefix?: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

export function Accordion({
  items,
  openIds,
  onToggle,
  idPrefix = 'accordion',
  headingLevel = 'h3',
  className,
}: AccordionProps) {
  return (
    <div className={className ?? 'space-y-2'}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          isOpen={openIds.has(item.id)}
          onToggle={onToggle}
          idPrefix={idPrefix}
          headingLevel={headingLevel}
        />
      ))}
    </div>
  );
}

interface AccordionRowProps {
  item: AccordionItemData;
  isOpen: boolean;
  onToggle: (id: string) => void;
  idPrefix: string;
  headingLevel: 'h2' | 'h3' | 'h4';
}

function AccordionRow({ item, isOpen, onToggle, idPrefix, headingLevel }: AccordionRowProps) {
  const triggerId = `${idPrefix}-trigger-${item.id}`;
  const panelId = `${idPrefix}-panel-${item.id}`;
  const Heading = headingLevel;

  return (
    <div
      id={item.id}
      className={`card scroll-mt-24 overflow-hidden transition-colors ${
        isOpen ? 'border-line' : ''
      }`}
    >
      <Heading className="m-0">
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(item.id)}
          className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
        >
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-sm transition ${
              isOpen ? 'text-frost' : 'text-subtle'
            }`}
          >
            {isOpen ? '−' : '+'}
          </span>
          <span className="flex-1">
            <span className="block text-base font-medium leading-snug text-frost">{item.title}</span>
            {item.meta ? (
              <span className="mt-1 block text-xs text-subtle">{item.meta}</span>
            ) : null}
          </span>
        </button>
      </Heading>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className={`overflow-hidden ${isOpen ? 'visible' : 'invisible'}`}>
          <div className="border-t border-line px-5 pb-4 pt-3">{item.content}</div>
        </div>
      </div>
    </div>
  );
}
