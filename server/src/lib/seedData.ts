/**
 * Catalog import shared by the CLI seeder and server boot.
 *
 * The server runs an in-memory MongoDB when MONGODB_URI is unset, so each
 * boot starts from an empty database. Boot-seeding keeps `npm run dev`
 * working with zero manual steps; the CLI form (npm run seed) exists for
 * real deployments and re-imports.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AnyBulkWriteOperation } from 'mongoose';
import { Product, type ProductDoc } from '../models/Product.js';
import { inferBrand, inferCategory } from './taxonomy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const JSONL_PATH = path.resolve(__dirname, '../../../data/products.jsonl');

const CHUNK = 1000;

/** How many listings the "Best Versions" shelf holds. */
const FEATURED_MAX = 48;

/**
 * A listing's fitness for the curated shelf, from signals the scrape actually
 * carries. Position in the file said nothing about quality; these do:
 *
 *  - Image count is the strongest one available. A seller who shot ten photos
 *    of a piece is a seller worth sending someone to, and the product page has
 *    a gallery to fill either way.
 *  - A recognised brand means the title parsed cleanly and the item is
 *    something shoppers search for by name.
 *  - Colourway/style counts ("6 colorways", "10+ Styles") mark listings that
 *    are a whole line rather than one SKU.
 *  - Sub-$3 prices are nearly always a scrape landing on an accessory or a
 *    decoy listing, so they are pushed off the shelf.
 */
function qualityScore(rec: {
  title: string;
  price: number;
  images: string[];
  brand: string | null;
  category: string | null;
}): number {
  let score = 0;

  score += Math.min(rec.images.length, 10) * 3;
  if (rec.brand) score += 12;
  if (rec.category) score += 4;
  if (/\b(\d+\+?\s*(colorways?|styles?|colors?))\b/i.test(rec.title)) score += 8;

  // Mid-range prices signal real garments; the extremes signal bad scrapes.
  if (rec.price >= 15 && rec.price <= 250) score += 6;
  else if (rec.price < 3) score -= 20;

  return score;
}

interface ScrapedRecord {
  slug?: string;
  title?: string;
  price?: number | null;
  itemUrl?: string;
  source?: string | null;
  itemId?: string | null;
  images?: string[];
}

export async function seedFromJsonl(jsonlPath = JSONL_PATH): Promise<{
  written: number;
  skipped: number;
  total: number;
}> {
  const lines = fs.readFileSync(jsonlPath, 'utf8').split('\n').filter(Boolean);

  let skipped = 0;

  // Pass 1: parse and shape every usable record, scoring as we go.
  const docs: Array<{ doc: Record<string, unknown>; score: number }> = [];

  for (const line of lines) {
    let rec: ScrapedRecord;
    try {
      rec = JSON.parse(line) as ScrapedRecord;
    } catch {
      skipped++;
      continue;
    }

    // Scraper failures: incomplete records are excluded, never half-imported.
    if (!rec.slug || !rec.title || !rec.itemUrl || rec.price == null) {
      skipped++;
      continue;
    }

    const images = (rec.images ?? []).filter((u) => typeof u === 'string');
    const brand = inferBrand(rec.title);
    const category = inferCategory(rec.title);

    docs.push({
      doc: {
        slug: rec.slug,
        title: rec.title,
        price: rec.price,
        brand,
        category,
        itemUrl: rec.itemUrl,
        source: rec.source ?? null,
        itemId: rec.itemId ?? null,
        image: images[0] ?? null,
        images: images.slice(0, 12),
        featured: false,
      },
      score: qualityScore({ title: rec.title, price: rec.price, images, brand, category }),
    });
  }

  // Pass 2: the shelf is the top N by score. Sorting a copy of the indices
  // keeps `docs` in file order, so the catalog's own ordering is untouched.
  // `featured` is written explicitly either way, so a re-import demotes
  // yesterday's picks instead of letting them accumulate.
  const shelf = docs
    .map((entry, i) => ({ i, score: entry.score }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, FEATURED_MAX);

  for (const { i } of shelf) {
    const entry = docs[i];
    if (entry) entry.doc.featured = true;
  }

  const ops: AnyBulkWriteOperation<ProductDoc>[] = docs.map(({ doc }) => ({
    updateOne: { filter: { slug: doc.slug as string }, update: { $set: doc }, upsert: true },
  }));

  let written = 0;
  for (let i = 0; i < ops.length; i += CHUNK) {
    const result = await Product.bulkWrite(ops.slice(i, i + CHUNK), { ordered: false });
    written += result.upsertedCount + result.modifiedCount;
    process.stdout.write(`\r[seed] ${Math.min(i + CHUNK, ops.length)}/${ops.length}`);
  }
  if (ops.length) process.stdout.write('\n');

  const total = await Product.countDocuments();
  return { written, skipped, total };
}
