/**
 * FAQ content for /faq.
 *
 * Kept out of the page component so the copy can be edited without touching
 * markup, and so the same entries can feed both the rendered accordion and the
 * FAQPage JSON-LD payload.
 *
 * Every entry needs a STABLE `id`:
 *   - it is the DOM id of the accordion row, so `/faq#customs-seizure` works;
 *   - open/closed state is keyed by it, so search and reordering can never
 *     mis-associate a panel with the wrong question.
 */

export type FAQCategoryId = 'basics' | 'ordering' | 'shipping' | 'quality' | 'about';

export interface FAQCategory {
  id: FAQCategoryId;
  /** Shown as the section heading and in the jump-link row. */
  label: string;
  /** One line of context under the section heading. */
  blurb: string;
}

export interface FAQEntry {
  /** Stable kebab-case slug. Doubles as the anchor target. */
  id: string;
  category: FAQCategoryId;
  question: string;
  /** One string per paragraph. */
  answer: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
}

export const FAQ_CATEGORIES: readonly FAQCategory[] = [
  {
    id: 'basics',
    label: 'Basics',
    blurb: 'What this site is, and what it is not.',
  },
  {
    id: 'ordering',
    label: 'Ordering',
    blurb: 'Agents, fees, payment, sizing, and what happens when something goes sideways.',
  },
  {
    id: 'shipping',
    label: 'Shipping & Customs',
    blurb: 'Freight costs, transit times, duties, and lost parcels.',
  },
  {
    id: 'quality',
    label: 'Quality',
    blurb: 'QC photos, seller vetting, and how to read a listing.',
  },
  {
    id: 'about',
    label: 'About This Site',
    blurb: 'Pricing, affiliate links, catalog coverage, and images.',
  },
];

export const FAQ_ENTRIES: readonly FAQEntry[] = [
  /* ------------------------------------------------------------------ Basics */
  {
    id: 'what-is-oxygalaxy',
    category: 'basics',
    question: 'What is OXYGALAXY?',
    answer: [
      'A searchable index of roughly 9,000 replica and budget fashion listings pulled from Weidian, Taobao, and 1688. Think of it as a front-end for marketplaces that were never designed for you to browse: the listings are already in Chinese, already domestic-only, and already impossible to search unless you know the exact product name in Mandarin.',
      'We do not sell, hold, or ship inventory. Every listing links back to the seller\'s own page, which you then hand to a freight forwarder ("agent") who buys it for you. We earn a commission when you sign up with an agent through one of our tracked links, and nothing when you do not.',
    ],
  },
  {
    id: 'do-you-ship',
    category: 'basics',
    question: 'Do you ship products?',
    answer: [
      'No. Chinese domestic marketplaces will not ship to an address outside mainland China, so there is nothing for us to ship even if we wanted to.',
      'The flow is: copy the item link from our page, paste it into your agent\'s order form, pay them, and they buy it from the seller on your behalf. The item lands in their warehouse in Guangdong or Zhejiang, they photograph it, you approve it, and then you pay a second time for international freight. The How To guide walks the whole sequence with screenshots.',
    ],
  },
  {
    id: 'authentic-products',
    category: 'basics',
    question: 'Are these authentic products?',
    answer: [
      'No. Assume everything indexed here is a replica, an unbranded factory piece, or grey-market stock. Some listings are genuinely good — heavy fabric, correct patterns, clean stitching — and some are dire. The price is usually a reliable signal: a ¥80 hoodie is a ¥80 hoodie.',
      'Nothing on this site is sold by, endorsed by, or connected to the brands whose designs it resembles. If you need authenticity — for resale, for warranty, for anything legally consequential — buy from the brand.',
    ],
  },
  {
    id: 'why-agent',
    category: 'basics',
    question: 'Why do I need an agent?',
    answer: [
      'Because Weidian, Taobao, and 1688 are built for buyers who live in China. The interfaces are Chinese-only, checkout expects a mainland phone number and an Alipay or WeChat Pay account tied to a Chinese bank, and shipping options stop at the border.',
      'An agent solves all of that at once: they hold the local payment rails, they read the listing and message the seller when a variant is unclear, they receive the parcel, they consolidate multiple orders into one box, and they ship internationally with tracking. You pay them in your own currency.',
    ],
  },

  /* ---------------------------------------------------------------- Ordering */
  {
    id: 'agent-fees',
    category: 'ordering',
    question: 'What do agents actually charge on top of the item price?',
    answer: [
      'Agents make money in one of two ways, and it is worth knowing which model yours uses before you build a large haul.',
      'Percentage agents take a cut of the item price (commonly 5–10%) and tend to quote cheaper freight. Zero-fee agents waive the service fee entirely and make their margin on the shipping line instead. For a cheap, heavy haul (hoodies, shoes, denim) a zero-fee agent usually loses; for an expensive, light haul (tees, accessories) it usually wins.',
    ],
    bullets: [
      'Service fee: ¥0–20 flat per item, or 5–10% of item value.',
      'Domestic China shipping, seller to agent warehouse: ¥8–15 per parcel, occasionally free on larger orders.',
      'Extra QC photos or a video: ¥5–10 per request; the standard photo set is free.',
      'Repack, debox, or remove tags to cut volumetric weight: ¥5–15.',
      'Storage: typically free for the first 30–90 days, then roughly ¥1–5 per day per parcel.',
      'Payment processing: 3–5% if you pay by card or PayPal. Bank transfer and crypto are usually free.',
    ],
  },
  {
    id: 'payment-methods',
    category: 'ordering',
    question: 'What payment methods do agents accept?',
    answer: [
      'Most accept credit and debit cards, PayPal, Wise, bank transfer, and at least one cryptocurrency. Card and PayPal carry a 3–5% processing surcharge; bank transfer and crypto normally do not, which matters on a $400 haul.',
      'You never touch CNY yourself. Agents work on a wallet model: you top up a balance in your own currency, they convert internally and pay the seller in yuan, and the item cost is deducted from that balance. Freight is charged separately once the parcel is weighed, so expect two payments per order, not one.',
      'A word of caution on PayPal: paying an agent via "friends and family" waives your buyer protection. Some agents ask for exactly that. Decline.',
    ],
  },
  {
    id: 'sizing-measurements',
    category: 'ordering',
    question: 'How do I get the sizing right?',
    answer: [
      'Ignore the letter on the tag and use the measurement table in the listing. Chinese sizing typically runs one to two sizes smaller than US or EU sizing — a listing\'s XL is often a comfortable US M, and a 2XL or 3XL is not unusual for a Western large.',
      'The reliable method is to take a garment you already own and like, lay it flat, measure it, and match those numbers against the listing chart. Every chart worth reading gives centimetres for chest or bust, shoulder width, sleeve length, and total body length. If the listing has no chart, ask your agent to measure the item at the warehouse before it ships.',
    ],
    bullets: [
      'Tops: match shoulder width first, then chest. Shoulder is the measurement that cannot be forgiven by a looser fit.',
      'Shoes: go by insole length in centimetres, not by a claimed US size. Add 0.5cm over your bare foot length for a normal fit.',
      'Trousers: match waist flat-measure and inseam. Chinese waist sizes are often listed in inches but cut slim.',
      'Charts usually carry a 2–3cm tolerance, so treat a 1cm difference as noise.',
    ],
  },
  {
    id: 'spreadsheets',
    category: 'ordering',
    question: 'How does this compare to community spreadsheets?',
    answer: [
      'Community spreadsheets and link dumps are curated by hand, which makes them strong on consensus picks and weak on coverage and freshness. A popular sheet might hold a few hundred links, many of which are dead because the seller delisted the item months ago.',
      'This index is crawled in bulk, so it is far broader and carries structured data a spreadsheet cannot: live price, images, seller, and platform, all searchable and filterable. The tradeoff is that breadth is not curation — a spreadsheet entry usually means somebody actually received the item and liked it, while an entry here only means the listing exists.',
      'Use both. Find candidates here, then search the item or seller name on the forums to see whether anyone has posted photos of the real thing.',
    ],
  },
  {
    id: 'out-of-stock',
    category: 'ordering',
    question: 'What happens if an item is out of stock after I pay?',
    answer: [
      'This is common, especially for a specific colour or size — listings stay live long after stock is gone. Your agent finds out when they place the order, usually within 24–72 hours, and then messages you with options.',
      'You can accept a substitute variant the seller does offer, wait for a restock (ask for an estimate; "next week" frequently means never), or cancel. On cancellation the money returns to your agent wallet balance, typically within 1–3 business days, not to your card. That is worth planning for: wallet balance is easy to spend on more items and awkward to withdraw, and some agents charge a withdrawal fee.',
      'Practical habit: order the risky size or colour early and separately, so a stockout does not hold up an otherwise complete haul that is already paying storage.',
    ],
  },
  {
    id: 'return-to-agent',
    category: 'ordering',
    question: 'Can I return something to the seller after it reaches the warehouse?',
    answer: [
      'Yes, but only before you approve the QC photos and pay for international shipping. While the parcel is still in the agent\'s warehouse they can send it back to the seller and request a refund or exchange. You pay the domestic return shipping, around ¥10–20, and the seller may withhold a handling cut.',
      'Sellers accept returns for the wrong item, a clear defect, or a wrong variant. They generally refuse returns because you changed your mind or guessed the size wrong, which is exactly why the measurement chart matters more than the size letter.',
      'Once the parcel leaves China, returning it is effectively impossible. Return freight often costs more than the item, customs paperwork on the way back is worse than on the way in, and no agent will front that cost for you. Treat the QC approval click as final.',
    ],
  },

  /* -------------------------------------------------------- Shipping & Customs */
  {
    id: 'shipping-cost',
    category: 'shipping',
    question: 'How much does shipping cost?',
    answer: [
      'International freight is the single largest variable in a haul and it is charged by weight, so plan around it rather than being surprised by it. Budget ¥60–150 per kilogram ($8–21 USD) depending on line and destination. A typical 3kg box lands somewhere around $40–80 shipped.',
      'Watch volumetric weight. Bulky low-density items — puffer jackets, shoe boxes, anything with air in it — are billed on volume, not mass, which is why agents offer to remove shoe boxes and vacuum-compress padding. On a puffer that single choice can halve the bill.',
      'Consolidating helps: one 4kg box is meaningfully cheaper than four 1kg boxes because each parcel carries its own base charge. Every agent has a freight calculator that gives you exact quotes per line once your items are weighed in their warehouse, and you should compare two or three lines before paying.',
    ],
  },
  {
    id: 'delivery-time',
    category: 'shipping',
    question: 'How long does delivery take?',
    answer: [
      'Count three separate stages rather than one number. Seller to agent warehouse inside China takes 3–7 days. Your own QC review and payment adds however long you take. International freight then runs 7–20 days for air express, 15–30 for economy air, and 30–60 for sea freight.',
      'Realistically a first order takes three to five weeks door to door. Sea freight is dramatically cheaper per kilogram and only worth it on heavy hauls you are in no hurry to receive.',
      'Chinese New Year is the one hard scheduling constraint: factories and sellers close for one to three weeks in late January or February, warehouses back up, and everything slows for a month around it. Order well before, or wait until after.',
    ],
  },
  {
    id: 'customs-seizure',
    category: 'shipping',
    question: 'Can my parcel be seized by customs?',
    answer: [
      'Yes. Replicas are counterfeit goods, and customs authorities are entitled to seize and destroy them. In practice the rate on small personal parcels is low, but "low" is not "zero" and the risk is genuinely yours: if a parcel is seized you normally lose the goods with no refund from either the seller or the agent, and you may receive a notice letter.',
      'Duty rules have tightened. The United States ended its $800 de minimis exemption in 2025, so low-value imports can now owe duty regardless of value and carriers collect it on delivery. The EU removed its low-value VAT exemption back in 2021, and the UK applies VAT from the first pound with duty above £135. Any advice you read that still leans on a generous duty-free threshold is out of date — check your own country\'s current rules before you build a large order.',
      'Agents will offer to declare a lower value or mark the parcel as a gift. Understand what that is: it is a false declaration, made in your name, and it does not remove the counterfeit problem that actually triggers seizures. Several agents sell insurance at roughly 2–5% of declared value that pays out on loss or seizure, which is the honest way to price this risk.',
      'Lower-risk habits: keep parcels modest in size, split large hauls, and prefer unbranded or plain items over obvious logo pieces.',
    ],
  },
  {
    id: 'lost-parcels',
    category: 'shipping',
    question: 'What if my parcel is lost in transit?',
    answer: [
      'First, be patient with quiet tracking. Numbers routinely stall for one to three weeks during transfer between the Chinese carrier and your local post, especially on economy lines. A stalled parcel is usually not a lost parcel.',
      'If tracking has genuinely not moved for around 30 days, open a claim with your agent — they are the shipper of record, so the claim is theirs to file with the carrier, not yours. Send them the order number, the tracking number, and a screenshot of the last scan.',
      'Payout depends entirely on whether you bought insurance. Insured at 2–5% of declared value, you can generally recover the declared value plus freight. Uninsured, most agents cap compensation at a token amount or at whatever the carrier pays, which is frequently close to nothing. Insurance is a straightforward buy on any haul worth more than about $150, and note that an undervalued declaration also caps your payout.',
    ],
  },

  /* ----------------------------------------------------------------- Quality */
  {
    id: 'qc-photos',
    category: 'quality',
    question: 'What are QC photos and what should I look for?',
    answer: [
      'When your item reaches the agent\'s warehouse, staff unpack it and photograph it — typically three to eight shots plus the shipping label — then hold the parcel until you either approve it or ask for a return. This is your only inspection opportunity, and it is free. Use it properly.',
      'Zoom in. Most rejections come from things that are obvious at full resolution and invisible in a thumbnail.',
    ],
    bullets: [
      'Correct colour, size, and variant against what you actually ordered.',
      'Stitching: skipped stitches, crooked seams, loose threads at cuffs and hems.',
      'Prints and embroidery: alignment, cracking, density, and spelling on any text.',
      'Hardware: zips that run, snaps that seat, no scratched or discoloured metal.',
      'Shoes specifically — glue bleed along the midsole, symmetry between the pair, uneven toe box shape, and the size stamped inside the tongue.',
      'Stains, scuffs, and transit creases that will not hang out.',
    ],
  },
  {
    id: 'defective-item',
    category: 'quality',
    question: 'What if the item is defective or the wrong thing arrives?',
    answer: [
      'Reject it at the QC stage. Message your agent with the specific defect and the photo it appears in and ask for an exchange or a return. They negotiate with the seller on your behalf; a clear defect or a genuinely wrong item is usually resolved without argument.',
      'Set expectations sensibly. Replica manufacturing tolerances are wide, and agents will push back on subjective complaints — a slightly off shade, a 1cm measurement difference, a marginally soft print — because sellers refuse those. Hard defects, wrong variants, and visible damage are the winnable cases.',
      'After you approve QC and pay freight, you own the outcome. There is no recourse once the box leaves China, so spend the extra two minutes on the photos.',
    ],
  },
  {
    id: 'seller-reliability',
    category: 'quality',
    question: 'How do I know if a seller is reliable?',
    answer: [
      'Read the seller\'s own marketplace page, which is linked from every listing here. Look for a high transaction count in the thousands rather than the dozens, a rating at or above 4.8, and a store that has been trading for more than a year. A brand-new store with fifty sales and perfect feedback is not evidence of anything.',
      'The buyer photo section is the most useful part of any Chinese listing. Real customers post unedited photos of the actual garment, which tells you far more than the seller\'s studio shots. Machine translation handles the comments well enough to spot a pattern of complaints.',
      'Then cross-check on the forums. Search the seller name on r/FashionReps or r/QualityReps; established sellers accumulate years of threads, and the bad ones accumulate warnings.',
    ],
  },
  {
    id: 'best-versions',
    category: 'quality',
    question: 'What does "Best Versions" mean?',
    answer: [
      'It is our curation filter, applied from the data we can actually see: strong seller ratings and transaction volume, detailed product imagery, and in some cases community vouches for that seller or item.',
      'It is explicitly not a quality guarantee. Nobody here has handled the item. A flagged listing is a better starting bet than an unflagged one, and it still needs your QC photos before you approve anything.',
    ],
  },

  /* --------------------------------------------------------- About This Site */
  {
    id: 'prices-usd',
    category: 'about',
    question: 'Why are prices in USD if these are Chinese sites?',
    answer: [
      'For comparison at a glance. Listings are priced in CNY and we convert to USD when the catalog is seeded, so everything on a results page shares one unit.',
      'Treat the number as an estimate, not a quote. It moves with the exchange rate after seeding, sellers change prices without warning, and your agent applies its own conversion rate with a small spread. The seller\'s page is always the authority on the current price, and the number you finally pay also includes service fees and freight.',
    ],
  },
  {
    id: 'affiliate-links',
    category: 'about',
    question: 'Do your affiliate links cost me more?',
    answer: [
      'No. The seller sets the item price and the agent sets the service and freight fees; our referral code changes neither. It only tells the agent that the signup came from here, which is how they credit us a commission out of their own margin.',
      'If you would rather not use them, copy the item URL and strip the tracking parameter, or go to the agent directly. Nothing on the site is gated behind a referral. Affiliate revenue is what funds the crawling and hosting, which is also why we would rather tell you plainly that replicas carry seizure risk than sell you a comfortable story.',
    ],
  },
  {
    id: 'request-product',
    category: 'about',
    question: 'Can I request that a product be added?',
    answer: [
      'Not individually. Listings are crawled and seeded in batches from the source marketplaces, so the catalog reflects what the crawler has reached rather than a hand-picked selection. An item or seller missing today may appear after the next run.',
      'If an item is not indexed, you are not blocked: the workflow is identical for any Weidian, Taobao, or 1688 link. Paste the URL straight into your agent\'s order form.',
    ],
  },
  {
    id: 'product-images',
    category: 'about',
    question: 'Who owns the product images?',
    answer: [
      'The original seller or photographer. Images are served from their original host — the seller\'s storefront or our crawl source — and we claim no copyright over them.',
      'If you are a rightsholder and want an image removed, the effective route is the marketplace that hosts it, since removing it at the source removes it here and everywhere else that mirrors the listing.',
    ],
  },
];

/** Lookup for hash deep-linking and JSON-LD assembly. */
export const FAQ_BY_ID: ReadonlyMap<string, FAQEntry> = new Map(
  FAQ_ENTRIES.map((entry) => [entry.id, entry]),
);

/** Answer flattened to one plain-text string (used for JSON-LD and search). */
export function faqAnswerText(entry: FAQEntry): string {
  const parts = [...entry.answer, ...(entry.bullets ?? [])];
  return parts.join(' ');
}

/** Lowercased haystack covering question + answer, for the client-side filter. */
export function faqSearchText(entry: FAQEntry): string {
  return `${entry.question} ${faqAnswerText(entry)}`.toLowerCase();
}
