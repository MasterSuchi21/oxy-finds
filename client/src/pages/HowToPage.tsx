import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HowToNav, ReadingProgressBar, type TocEntry } from '../components/HowToNav';
import { StepCard, Callout, Term } from '../components/StepCard';
import { Seo } from '../components/Seo';

/**
 * Section registry. Ids are semantic rather than positional so deep links stay
 * valid if a step is ever inserted or reordered (e.g. /how-to#qc-photos).
 */
const SECTIONS: TocEntry[] = [
  { id: 'overview', label: 'What an agent does' },
  { id: 'find-item', label: 'Find your item', step: 1 },
  { id: 'choose-agent', label: 'Pick an agent', step: 2 },
  { id: 'submit-link', label: 'Submit the link', step: 3 },
  { id: 'agent-buys', label: 'Agent buys it', step: 4 },
  { id: 'qc-photos', label: 'Check QC photos', step: 5 },
  { id: 'build-haul', label: 'Build your haul', step: 6 },
  { id: 'shipping', label: 'Choose shipping', step: 7 },
  { id: 'submit-parcel', label: 'Ship the parcel', step: 8 },
  { id: 'delivery', label: 'Customs & delivery', step: 9 },
  { id: 'costs', label: 'What it actually costs' },
  { id: 'mistakes', label: 'Common mistakes' },
];

const TOTAL_STEPS = SECTIONS.filter((s) => s.step !== undefined).length;

/** Shipping options, ordered cheapest first. All figures are estimates. */
const SHIPPING_METHODS: Array<{
  name: string;
  cost: string;
  transit: string;
  bestFor: string;
  risk: 'Low' | 'Medium' | 'Higher';
}> = [
  {
    name: 'Sea freight',
    cost: '¥25–45 / kg',
    transit: '35–60 days',
    bestFor: 'Heavy hauls over ~10 kg where you are not in a hurry',
    risk: 'Low',
  },
  {
    name: 'China Post / EMS',
    cost: '¥60–90 / kg',
    transit: '15–30 days',
    bestFor: 'The default for a 2–5 kg haul; cheapest sensible air option',
    risk: 'Low',
  },
  {
    name: 'ePacket / E-EMS',
    cost: '¥70–110 / kg',
    transit: '10–20 days',
    bestFor: 'Small, light parcels with better tracking than EMS',
    risk: 'Low',
  },
  {
    name: 'DHL / FedEx / UPS',
    cost: '¥110–180 / kg',
    transit: '5–10 days',
    bestFor: 'When you need it fast and accept the customs exposure',
    risk: 'Higher',
  },
];

/** Worked example. Rounded at ¥7.2 ≈ $1 — see the note under the table. */
const COST_ROWS: Array<{ label: string; detail: string; cny: string; usd: string }> = [
  { label: 'Hoodie', detail: 'Weidian, size L', cny: '¥180', usd: '$25' },
  { label: 'Sneakers', detail: 'Taobao, EU 43', cny: '¥320', usd: '$44' },
  { label: 'Jacket', detail: '1688, size XL', cny: '¥240', usd: '$33' },
  { label: 'Agent service fee', detail: '3 items', cny: '¥30', usd: '$4' },
  { label: 'Domestic shipping', detail: '3 sellers → warehouse', cny: '¥45', usd: '$6' },
  { label: 'International freight', detail: '3.4 kg chargeable, EMS', cny: '¥265', usd: '$37' },
];

export function HowToPage() {
  // App-level ScrollToTop only watches pathname/search, so an inbound deep link
  // such as /how-to#qc-photos lands at the top. Nudge it to the target once.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    const raf = window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <Seo
        title="How to Buy from Chinese Marketplaces | Oxy Finds"
        description="Learn how to order from Weidian, Taobao, and 1688 using a shopping agent, from finding an item to QC photos and international shipping."
        path="/how-to"
      />
      <ReadingProgressBar />

      <div className="mx-auto max-w-[1200px] px-6 py-12 pb-20">
        {/* ---------------------------------------------------------------- */}
        {/* Masthead                                                          */}
        {/* ---------------------------------------------------------------- */}
        <header className="mb-12 max-w-[68ch]">
          <p className="eyebrow">Guide</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-frost sm:text-4xl">
            How to order from{' '}
            <span className="text-brand-gradient">Chinese marketplaces</span>
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-mist">
            Weidian, Taobao and 1688 sell to buyers inside China only. To order from anywhere else
            you use a <Term>shopping agent</Term> — a company that buys the item with a Chinese
            account, receives it at their warehouse, photographs it for you, then forwards it
            abroad. Nine steps, about three to five weeks end to end, and roughly four points where
            first-timers lose money. All of them are below.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#find-item" className="btn-primary no-underline">
              Start at step 1
            </a>
            <a href="#costs" className="btn-secondary no-underline">
              Jump to the costs
            </a>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Two-column shell: sticky ToC + guide body                        */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid gap-10 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-14">
          <div className="hidden xl:block">
            <HowToNav entries={SECTIONS} />
          </div>

          <div className="min-w-0 max-w-[72ch] space-y-8">
            {/* ------------------------------------------------------------ */}
            <section
              id="overview"
              aria-labelledby="overview-heading"
              className="card scroll-mt-24 p-5 sm:p-6"
            >
              <h2
                id="overview-heading"
                className="text-xl font-semibold text-frost"
              >
                What an agent actually does
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-mist">
                An agent is a proxy buyer plus a warehouse plus a freight forwarder. You send them a
                product link; they pay the Chinese seller, take delivery, and hold the item for you.
                Nothing ships to your country until you tell it to. That pause is the whole point of
                the model: it is where you inspect the goods and where you combine several orders
                into one parcel.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-mist">
                Oxy Finds is the catalogue layer in front of that. We index around 9,000 listings so
                they are searchable in English with prices in USD. We do not sell, stock or ship
                anything — every buy button hands you off to{' '}
                <Term>Kakobuy</Term> with the item pre-filled. Whether you order is between you and
                the agent.
              </p>

              <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { k: 'Typical total', v: '3–5 weeks', d: 'order to doorstep' },
                  { k: 'Two separate bills', v: 'Item + freight', d: 'paid weeks apart' },
                  { k: 'Point of no return', v: 'QC approval', d: 'step 5' },
                ].map((item) => (
                  <div key={item.k} className="rounded-2xl border border-line bg-white/[0.03] p-4">
                    <dt className="text-xs uppercase tracking-wide text-subtle">
                      {item.k}
                    </dt>
                    <dd className="mt-1.5 text-lg font-semibold leading-tight text-frost">
                      {item.v}
                      <span className="mt-0.5 block font-body text-[12px] font-normal text-mist">
                        {item.d}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* ------------------------------------------------------------ */}
            <StepCard id="find-item" step={1} of={TOTAL_STEPS} title="Find your item" timing="~10 min">
              <p>
                Search the <Link to="/?sort=newest" className="text-link hover:underline">catalog</Link>{' '}
                by brand or keyword, or filter down from the sidebar. Each product page shows the
                price we recorded, the seller's images, the source marketplace and a buy button that
                opens the item on Kakobuy.
              </p>
              <p>
                Read the original listing before you commit. Sizing is the usual trap: Chinese
                sellers publish a measurement chart in centimetres (chest, shoulder, length) and
                those matter far more than the S/M/L label, which often runs one to two sizes small
                against EU or US sizing. Measure a garment you already own and compare numbers.
              </p>
              <Callout kind="warn" title="Prices drift">
                Our figures are snapshots from the last crawl, converted to USD at that moment.
                Sellers change prices and run out of stock without notice, so treat the catalogue
                number as a guide and trust the live agent page.
              </Callout>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="choose-agent" step={2} of={TOTAL_STEPS} title="Pick an agent and fund it" timing="~20 min">
              <p>
                Our links point at <Term>Kakobuy</Term>, so if you follow them you are already set
                up for the rest of this guide. Other agents in common use include Superbuy, CSSBuy,
                Sugargoo, Hoobuy and Allchinabuy. They all perform the same job and differ mainly in
                interface quality, English support, warehouse storage limits and the freight rates
                they negotiate.
              </p>
              <p>
                Open an account and add funds. Most take PayPal and cards; several also take crypto.
                Your balance is held in yuan and drawn down as the agent pays sellers on your behalf.
                Expect a small currency-conversion spread on top of the mid-market rate — a few
                percent, buried in the exchange rate rather than itemised.
              </p>
              <Callout kind="tip" title="Two bills, not one">
                Funding covers the goods and the agent's service fee. International freight is
                quoted and charged <em>later</em>, once everything is weighed at the warehouse. Do
                not spend your whole budget on items and leave nothing for shipping — freight is
                frequently a quarter to a third of the total.
              </Callout>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="submit-link" step={3} of={TOTAL_STEPS} title="Submit the link" timing="~5 min">
              <p>
                Paste the product URL into the agent's order form — our buy button does this for
                you. Then fill in the variant fields exactly: size, colourway, quantity. These are
                free-text or dropdown fields that the agent copies straight into the seller's order,
                so a blank or vague entry means someone guesses on your behalf.
              </p>
              <p>
                The seller-notes box reaches a real person at the store. Short, specific requests
                work ("please check for loose stitching", "do not include the branded box"). Long
                English paragraphs usually do not.
              </p>
              <p>
                Service fees are modest and per-item — commonly around ¥10–20 ($1.50–3) each, or a
                small percentage of order value depending on the agent's model. The bigger line is
                the seller's own domestic shipping to the warehouse, typically ¥10–20 per seller,
                which is one reason ordering several things from one store is cheaper than one thing
                from several.
              </p>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="agent-buys" step={4} of={TOTAL_STEPS} title="The agent buys and receives it" timing="3–7 days">
              <p>
                The agent places the order and the seller ships domestically to their warehouse.
                Your dashboard walks through states along the lines of purchasing → purchased →
                shipped by seller → arrived at warehouse. Three to seven days is normal; it stretches
                during Chinese New Year and the November sales peak, when warehouses back up badly.
              </p>
              <p>
                If the seller is out of stock in your size, the agent will message you to pick a
                substitute or take a refund to your balance. Answer promptly — orders sit frozen
                until you reply.
              </p>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="qc-photos" step={5} of={TOTAL_STEPS} title="Check the QC photos" timing="1–2 days">
              <p>
                When the parcel lands at the warehouse, staff unbox it and photograph it —{' '}
                <Term>QC photos</Term>, for quality check. You typically get five to ten shots: the
                whole item front and back, the labels and size tag, the soles or hardware, and a
                measuring tape across a key dimension. Some agents add a short video on request.
                This is the only look you get before the goods cross a border.
              </p>
              <p className="font-medium text-frost">What to actually look at:</p>
              <ul className="space-y-2">
                {[
                  'The size tag, against what you ordered. Mismatches here are the single most common QC failure.',
                  'Measurements in the tape shots, against your own garment. A label is a claim; the tape is evidence.',
                  'Stitching along seams, cuffs and hems — skipped stitches, loose threads, puckering.',
                  'Logos and lettering: spacing, weight, spelling. Compare against an official product photo, not memory.',
                  'Colour, allowing for warehouse lighting. If it looks ambiguous, ask for a daylight reshoot.',
                  'Glue seepage, scuffs, creasing and sole alignment on footwear.',
                ].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span aria-hidden className="mt-0.5 text-subtle">
                      •
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p>
                Extra photos are usually free — ask. If something is wrong you can request an
                exchange or a return to the seller, and the agent negotiates it. Expect that to add
                one to two weeks and, on a change-of-mind return rather than a genuine defect,
                probably the return postage.
              </p>
              <Callout kind="warn" title="Approving is irreversible">
                Once you approve QC and the parcel leaves China, there is no practical route back.
                The seller will not accept an international return, and the agent's liability ends
                at your approval. Spending ten minutes zoomed in here is the highest-value thing you
                will do in this entire process.
              </Callout>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="build-haul" step={6} of={TOTAL_STEPS} title="Build your haul" timing="Days to weeks">
              <p>
                A <Term>haul</Term> is simply several approved items shipped as one parcel. Freight
                is priced per kilogram with a fixed handling component and a minimum charge, so one
                3 kg box costs far less than three 1 kg boxes — the saving comes from paying the
                fixed part once. Consolidating a handful of items rather than shipping each alone
                routinely halves the per-item freight.
              </p>
              <p>
                Warehouses store approved goods free for a period — commonly 90 to 180 days, varying
                by agent — so you can accumulate over weeks. Check your own agent's limit and the
                fee after it lapses.
              </p>
              <Callout kind="tip" title="Volumetric weight">
                Air freight charges whichever is greater: real weight, or volume ÷ 6000 with
                centimetres (a common divisor; some carriers use 5000). A puffer jacket weighing
                1.2 kg can fill 12,000 cm³ and bill as 2 kg. That is why agents vacuum-seal
                clothing and bin shoeboxes — removing air removes cost. Bulky, light goods are where
                freight estimates surprise people.
              </Callout>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="shipping" step={7} of={TOTAL_STEPS} title="Choose a shipping method" timing="~15 min">
              <p>
                Once items are grouped the agent quotes every available line for your actual weight
                and destination. The quote is the number that matters; the table below is for
                orientation only.
              </p>

              <div className="-mx-2 overflow-x-auto sm:mx-0">
                <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
                  <caption className="sr-only">
                    Estimated cost, transit time and customs risk by shipping method
                  </caption>
                  <thead>
                    <tr className="border-b border-line">
                      {['Method', 'Est. cost', 'Transit', 'Customs risk'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-3 py-2.5 text-xs font-medium uppercase tracking-wide text-subtle"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SHIPPING_METHODS.map((m) => (
                      <tr key={m.name} className="border-b border-line/50 align-top last:border-0">
                        <th scope="row" className="px-3 py-3.5 font-semibold text-frost">
                          {m.name}
                          <span className="mt-1 block font-body text-[12px] font-normal text-mist">
                            {m.bestFor}
                          </span>
                        </th>
                        <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-frost">
                          {m.cost}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-mist">
                          {m.transit}
                        </td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-xs uppercase tracking-wide ${
                              m.risk === 'Higher'
                                ? 'border-warn/30 bg-warn/10 text-warn'
                                : 'border-line bg-raised text-mist'
                            }`}
                          >
                            {m.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[13px] text-mist">
                Estimates for a typical 2–5 kg parcel to Western Europe or North America, collected
                from agent rate tables. Lines are region-specific, rates move, and fuel surcharges
                apply — your quote is authoritative.
              </p>
              <p>
                Transit times are warehouse to door and exclude any customs hold. Express carriers
                are faster but file formal electronic customs data, which is precisely why they draw
                more duty assessments than postal lines.
              </p>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="submit-parcel" step={8} of={TOTAL_STEPS} title="Submit the parcel" timing="1–3 days">
              <p>
                Confirm the address in Latin characters with a phone number the carrier can reach —
                a bad phone number is a leading cause of failed delivery. Then pick your optional
                services. Worth the money: vacuum sealing for clothing (cuts volumetric weight),
                reinforced packing for anything fragile, and removing branded boxes unless you
                specifically want them.
              </p>
              <p>
                Insurance is usually a few percent of declared value and pays out against that
                declared figure, not what you actually paid. Undervalue the parcel and you have also
                capped your own claim — that trade-off is the real cost of a low declaration.
              </p>
              <p>
                You pay freight now, and the parcel is handed to the carrier with a tracking number.
                The first few days of tracking often look stalled while the shipment consolidates and
                clears export; that is normal.
              </p>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            <StepCard id="delivery" step={9} of={TOTAL_STEPS} title="Customs, then delivery" timing="1–8 weeks">
              <p>
                On arrival the parcel enters your country's import process. Most go straight through.
                Some are held for a duty or VAT assessment, which you pay to the carrier or the post
                office before release — typically a few days' delay.
              </p>
              <p>
                Thresholds vary sharply and change, so check your own country's current rules rather
                than trusting a forum post. As of writing, the EU charges VAT on essentially all
                imported goods with no low-value exemption, the UK applies VAT from the first pound
                with duty above £135, and the US <em>de minimis</em> exemption that long let sub-$800
                parcels in duty-free was revoked in 2025 — so assume you may be billed regardless of
                value. Confirm before you order.
              </p>
              <p>
                A hold is not a seizure. Customs may request an invoice, in which case supply one and
                wait. Genuine seizure is a different matter and applies to goods that infringe
                trademarks or are otherwise prohibited: you get a notice, the goods are destroyed,
                and neither the agent nor the seller refunds you. That risk sits with you and is the
                reason people ship replica goods by postal lines rather than express.
              </p>
              <p>
                When it lands, open everything and compare against your QC photos. Note what the
                photos did not reveal — fabric weight, smell, real-world fit — and carry that into
                your next order. Sellers are the variable worth learning.
              </p>
            </StepCard>

            {/* ------------------------------------------------------------ */}
            {/* Cost breakdown — styled as a receipt                         */}
            {/* ------------------------------------------------------------ */}
            <section
              id="costs"
              aria-labelledby="costs-heading"
              className="card scroll-mt-24 p-5 sm:p-6"
            >
              <p className="eyebrow">Worked example</p>
              <h2
                id="costs-heading"
                className="mt-2 text-xl font-semibold text-frost"
              >
                What it actually costs
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-mist">
                Three items from three different sellers, consolidated into one 3.4 kg EMS parcel.
                Every figure is an estimate at ¥7.2 to the dollar.
              </p>

              <dl className="mt-6 text-sm">
                {COST_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline gap-3 border-b border-line/40 py-2.5"
                  >
                    <dt className="min-w-0 flex-1">
                      <span className="text-frost">{row.label}</span>
                      <span className="ml-2 font-body text-[12px] text-mist">{row.detail}</span>
                    </dt>
                    <dd className="shrink-0 tabular-nums text-mist">{row.cny}</dd>
                    <dd className="w-14 shrink-0 text-right tabular-nums text-frost">{row.usd}</dd>
                  </div>
                ))}

                <div className="mt-1 flex items-baseline gap-3 border-t border-line pt-3">
                  <dt className="flex-1 font-semibold uppercase tracking-[0.12em] text-frost">
                    Total
                  </dt>
                  <dd className="shrink-0 tabular-nums text-mist">¥1,080</dd>
                  <dd className="w-14 shrink-0 text-right text-base font-bold tabular-nums text-frost">
                    $149
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-[15px] leading-relaxed text-mist">
                About $50 per item delivered, of which roughly $47 — near a third — is fees and
                freight rather than goods. Any import duty or VAT is on top and depends on your
                country. Ship those same three items separately and freight alone would land closer
                to $90.
              </p>
              <Callout kind="tip" title="Sanity-check before you commit">
                Agents publish freight calculators, and several offer a paid pre-weigh so you see the
                exact figure before paying. For a first order, price the shipping <em>before</em> you
                buy three bulky coats.
              </Callout>
            </section>

            {/* ------------------------------------------------------------ */}
            <section
              id="mistakes"
              aria-labelledby="mistakes-heading"
              className="card scroll-mt-24 p-5 sm:p-6"
            >
              <p className="eyebrow">Common mistakes</p>
              <h2
                id="mistakes-heading"
                className="mt-2 text-xl font-semibold text-frost"
              >
                Common first-order mistakes
              </h2>
              <ul className="mt-5 space-y-4 text-[15px] leading-relaxed text-mist">
                {[
                  {
                    t: 'Ordering by letter size',
                    d: 'Use the centimetre chart and compare against a garment you own. Sizing is the top reason a haul disappoints.',
                  },
                  {
                    t: 'Rushing QC approval',
                    d: 'It is the last reversible moment. Zoom in, ask for reshoots, compare tags against the listing.',
                  },
                  {
                    t: 'Forgetting freight exists',
                    d: 'Shipping is a separate bill, charged weeks later, often a quarter to a third of the total.',
                  },
                  {
                    t: 'Shipping items one at a time',
                    d: 'Each parcel repays the fixed handling cost. Consolidate, or pay for the privilege.',
                  },
                  {
                    t: 'Ignoring seller reputation',
                    d: 'Check the rating and transaction count on the original listing. Thousands of sales with a high score is a much safer bet than a new store.',
                  },
                  {
                    t: 'Starting big',
                    d: 'Make your first order one or two cheap items. You will learn the interface, the timelines and the real freight cost for far less money.',
                  },
                ].map((item) => (
                  <li key={item.t} className="flex gap-3">
                    <span aria-hidden className="mt-0.5 shrink-0 text-subtle">
                      →
                    </span>
                    <span>
                      <Term>{item.t}.</Term> {item.d}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[14px] leading-relaxed text-mist">
                Community forums such as{' '}
                <a
                  href="https://reddit.com/r/FashionReps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline"
                >
                  r/FashionReps
                </a>{' '}
                and{' '}
                <a
                  href="https://reddit.com/r/RepSneakers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link hover:underline"
                >
                  r/RepSneakers
                </a>{' '}
                keep seller lists and QC archives. Read a few threads on an item before you buy it.
              </p>
            </section>

            {/* ------------------------------------------------------------ */}
            {/* Closing CTA                                                   */}
            {/* ------------------------------------------------------------ */}
            <section
              aria-labelledby="cta-heading"
              className="card p-6 text-center sm:p-8"
            >
              <h2 id="cta-heading" className="text-xl font-semibold text-frost">
                That is the whole process
              </h2>
              <p className="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed text-mist">
                Nine steps, one QC checkpoint that matters more than the rest, and a freight bill to
                plan for. Start with something cheap and see the pipeline through once.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/?sort=newest" className="btn-primary no-underline">
                  Browse the catalog →
                </Link>
                <Link to="/faq" className="btn-secondary no-underline">
                  Read the FAQ
                </Link>
              </div>
              <p className="mt-6 text-[13px] leading-relaxed text-mist">
                Questions about payment, authenticity or our affiliate links are answered on the{' '}
                <Link
                  to="/faq"
                  className="text-link hover:underline"
                >
                  FAQ page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
