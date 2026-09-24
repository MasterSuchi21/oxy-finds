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

/** Deterministic pick of storefront highlights, by position in the file. */
const FEATURED_EVERY = 700;
const FEATURED_MAX = 16;

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

  const ops: AnyBulkWriteOperation<ProductDoc>[] = [];
  let skipped = 0;
  let featuredSeen = 0;

  lines.forEach((line, i) => {
    let rec: ScrapedRecord;
    try {
      rec = JSON.parse(line) as ScrapedRecord;
    } catch {
      skipped++;
      return;
    }

    // Scraper failures: incomplete records are excluded, never half-imported.
    if (!rec.slug || !rec.title || !rec.itemUrl || rec.price == null) {
      skipped++;
      return;
    }

    const images = (rec.images ?? []).filter((u) => typeof u === 'string');
    const featured = i % FEATURED_EVERY === 0 && featuredSeen < FEATURED_MAX;
    if (featured) featuredSeen++;

    const doc = {
      slug: rec.slug,
      title: rec.title,
      price: rec.price,
      brand: inferBrand(rec.title),
      category: inferCategory(rec.title),
      itemUrl: rec.itemUrl,
      source: rec.source ?? null,
      itemId: rec.itemId ?? null,
      image: images[0] ?? null,
      images: images.slice(0, 12),
      ...(featured ? { featured: true } : {}),
    };

    ops.push({ updateOne: { filter: { slug: rec.slug }, update: { $set: doc }, upsert: true } });
  });

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
