/**
 * Brand + category inference.
 *
 * The scraped records carry only a title, so brand and category are derived
 * from it here. This lives in its own module because both the seeder and any
 * future re-import need identical results — a title must always land in the
 * same facet.
 */

/** Escape a literal string for use inside a RegExp. */
function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Match a literal term on word-ish boundaries ("Ami" must not hit "Miami"). */
function hasTerm(text: string, term: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${esc(term)}([^a-z0-9]|$)`, 'i').test(text);
}

/**
 * Brand names as they should be displayed, matched longest-first so a title
 * containing "Ralph Lauren Polo" resolves to "Ralph Lauren", not "Polo".
 */
const BRANDS: string[] = [
  'Acne Studios', 'Adidas', 'Air Force 1', 'Air Jordan', 'Alabaster Industries',
  'Alexander McQueen', 'Ami', 'Arcteryx', 'Armani', 'Asics', 'Balenciaga',
  'Balmain', 'Bape', 'Berluti', 'Bottega Veneta', 'Broken Planet', 'Burberry',
  'Calvin Klein', 'Canada Goose', 'Carhartt', 'Cartier', 'Casablanca', 'Celine',
  'Chanel', 'Chrome Hearts', 'Clarks', 'Comme des Garcons', 'Converse', 'Corteiz',
  'Denim Tears', 'Dickies', 'Dior', 'Dolce & Gabbana', 'Dr Martens', 'Dsquared2',
  'Essentials', 'Essential', 'Fear of God', 'Fendi', 'Ferragamo', 'Gallery Dept',
  'Givenchy', 'Golden Goose', 'Goyard', 'Gucci', 'Hellstar', 'Hermes', 'Hugo Boss',
  'Jacquemus', 'Jordan', 'Kenzo', 'Lacoste', 'Levis', 'Loewe', 'Louis Vuitton',
  'Lululemon', 'Maison Margiela', 'Marni', 'Miu Miu', 'Moncler', 'New Balance',
  'Nike', 'Oakley', 'Off White', 'Palm Angels', 'Patagonia', 'Prada', 'Puma',
  'Purple', 'Ralph Lauren', 'Reebok', 'Represent', 'Rhude', 'Rick Owens',
  'Saint Laurent', 'Salomon', 'Stone Island', 'Stussy', 'Supreme', 'Syna World',
  'Sp5der', 'The North Face', 'Thug Club', 'Tiffany', 'Timberland',
  'Tommy Hilfiger', 'Trapstar', 'Ugg', 'Under Armour', 'Valentino', 'Vans',
  'Versace', 'Vlone', 'Yeezy', 'Zara',
].sort((a, b) => b.length - a.length);

/** Abbreviations the source site uses in place of full brand names. */
const BRAND_ALIASES: Record<string, string> = {
  tnf: 'The North Face',
  'north face': 'The North Face',
  lv: 'Louis Vuitton',
  ysl: 'Saint Laurent',
  cdg: 'Comme des Garcons',
  af1: 'Air Force 1',
  aj1: 'Air Jordan',
  'd&g': 'Dolce & Gabbana',
  rl: 'Ralph Lauren',
  nb: 'New Balance',
};

/**
 * Category keywords. First match wins, so specific garment words come before
 * the generic ones that would otherwise swallow them.
 */
const CATEGORY_RULES: Array<[RegExp, string]> = [
  [/\b(tracksuits?|track suits?|two piece|2 piece)\b/i, 'Tracksuits'],
  [/\b(hoodies?|hoody|sweatshirts?|crewnecks?|half zip|quarter zip|zip up)\b/i, 'Hoodies & Sweatshirts'],
  [/\b(polos?)\b/i, 'Polos'],
  [/\b(t-?shirts?|tees?)\b/i, 'T-Shirts'],
  [/\b(shirts?|blouses?)\b/i, 'Shirts'],
  [/\b(down jackets?|puffers?|jackets?|coats?|parkas?|vests?|windbreakers?)\b/i, 'Jackets & Coats'],
  [/\b(sweatpants?|joggers?|trousers?|pants?|shorts?|jeans?|cargos?|skirts?)\b/i, 'Bottoms'],
  [/\b(sneakers?|shoes?|trainers?|boots?|slides?|sandals?|dunks?|forces?|skates?|ravers?|runners?|mules?)\b/i, 'Shoes'],
  [/\b(wallets?|cardholders?|card holder)\b/i, 'Wallets'],
  [/\b(handbags?|hand bags?|bags?|backpacks?|totes?|purses?|luggage|suitcases?)\b/i, 'Bags'],
  [/\b(belts?)\b/i, 'Belts'],
  [/\b(watch|watches)\b/i, 'Watches'],
  [/\b(glasses|sunglasses|eyewear|shades)\b/i, 'Eyewear'],
  [/\b(bracelets?|necklaces?|rings?|earrings?|chains?|pendants?|jewel\w*)\b/i, 'Jewellery'],
  [/\b(hats?|caps?|beanies?|bucket)\b/i, 'Hats'],
  [/\b(socks?)\b/i, 'Socks'],
  [/\b(underwear|boxers?|briefs?)\b/i, 'Underwear'],
  [/\b(sweaters?|knits?|cardigans?)\b/i, 'Knitwear'],
  [/\b(scarf|scarves|gloves|balaclavas?|towels?)\b/i, 'Accessories'],
];

/** Strip the "(10+ Styles)" / "( 39 Colorways )" noise before matching. */
function core(title: string): string {
  return title
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+\s*\+?\s*(styles?|colorways?|colours?|colors?)\b/gi, ' ')
    .replace(/\b1:1\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function inferBrand(title: string): string | null {
  const text = core(title);
  for (const brand of BRANDS) {
    if (hasTerm(text, brand)) return brand;
  }
  for (const [alias, brand] of Object.entries(BRAND_ALIASES)) {
    if (hasTerm(text, alias)) return brand;
  }
  return null;
}

export function inferCategory(title: string): string | null {
  const text = core(title);
  for (const [re, category] of CATEGORY_RULES) {
    if (re.test(text)) return category;
  }
  return null;
}
