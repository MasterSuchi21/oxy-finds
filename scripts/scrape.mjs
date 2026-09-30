// Scrape the RepGalaxy product catalog with our affiliate code.
//
// Flow: sitemap -> product URLs -> one request per product page -> JSONL.
// Resumable: slugs already present in data/products.jsonl are skipped.
//
//   node scripts/scrape.mjs            # full run
//   node scripts/scrape.mjs --limit 25 # smoke test on first N products

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDetail } from './parse.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const OUT = path.join(DATA, 'products.jsonl');
const URLS = path.join(DATA, 'product-urls.json');

const BASE = 'https://repgalaxy.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const CONCURRENCY = Number(process.env.CONCURRENCY || 4);
const DELAY_MS = Number(process.env.DELAY_MS || 250); // per-worker pause between requests
const RETRIES = 3;

const argv = process.argv.slice(2);
const limitIdx = argv.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : null;

fs.mkdirSync(DATA, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, tries = RETRIES) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'text/html' },
        signal: AbortSignal.timeout(20_000),
      });
      if (res.ok) return await res.text();
      // 404 = gone for good; don't retry other 4xx either
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        return { error: res.status };
      }
    } catch (e) {
      if (i === tries) return { error: e.message };
    }
    await sleep(1000 * i * (i === 1 ? 1 : 2)); // 1s, 3s, 5s backoff
  }
  return { error: 'retries-exhausted' };
}

// ---------- 1. product URLs ----------

async function getProductUrls() {
  if (fs.existsSync(URLS)) {
    const cached = JSON.parse(fs.readFileSync(URLS, 'utf8'));
    console.log(`[urls] cached: ${cached.length} product URLs`);
    return cached;
  }

  console.log('[urls] fetching sitemap index...');
  const index = await fetchText(`${BASE}/sitemap_index.xml`);
  if (typeof index !== 'string') throw new Error(`sitemap index failed: ${JSON.stringify(index)}`);

  const productsMap = index.match(/<loc>([^<]*products-sitemap[^<]*)<\/loc>/)?.[1];
  if (!productsMap) throw new Error('products sitemap not listed in index');

  console.log(`[urls] fetching ${productsMap} ...`);
  const sm = await fetchText(productsMap);
  if (typeof sm !== 'string') throw new Error(`products sitemap failed: ${JSON.stringify(sm)}`);

  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => /\/products\/[a-z0-9-]+\/$/.test(u) && !/\/products\/(feed|page)\//.test(u));

  fs.writeFileSync(URLS, JSON.stringify(urls, null, 2));
  console.log(`[urls] ${urls.length} product URLs saved`);
  return urls;
}

// ---------- 2. scrape loop ----------

function loadDone() {
  const done = new Map(); // slug -> record
  if (fs.existsSync(OUT)) {
    for (const line of fs.readFileSync(OUT, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const rec = JSON.parse(line);
        if (rec.slug) done.set(rec.slug, rec);
      } catch {
        // tolerate a truncated last line from a killed run
      }
    }
  }
  return done;
}

async function main() {
  const urls = await getProductUrls();
  const todo = LIMIT ? urls.slice(0, LIMIT) : urls;

  const done = loadDone();
  const queue = todo.filter((u) => !done.has(slugOf(u)));
  console.log(`[scrape] ${todo.length} targets, ${done.size} already done, ${queue.length} to go`);
  console.log(`[scrape] concurrency=${CONCURRENCY} delay=${DELAY_MS}ms`);

  let ok = 0;
  let fail = 0;
  const failures = [];
  const stream = fs.createWriteStream(OUT, { flags: 'a' });
  const started = Date.now();

  async function worker(id) {
    while (queue.length) {
      const url = queue.shift();
      if (!url) return;
      const slug = slugOf(url);

      const res = await fetchText(url);
      if (typeof res !== 'string') {
        fail++;
        failures.push({ url, error: res.error });
        console.log(`  [w${id}] FAIL ${slug} (${res.error}) — ${fail} fails, ${queue.length} left`);
        continue;
      }

      let rec;
      try {
        rec = parseDetail(res, slug, { url });
      } catch (e) {
        fail++;
        failures.push({ url, error: `parse: ${e.message}` });
        continue;
      }

      if (!rec.title || !rec.affiliateUrl) {
        fail++;
        failures.push({ url, error: 'incomplete: missing title or affiliate link' });
        console.log(`  [w${id}] INCOMPLETE ${slug} — ${queue.length} left`);
        continue;
      }

      stream.write(JSON.stringify(rec) + '\n');
      ok++;
      if (ok % 50 === 0) {
        const rate = ok / ((Date.now() - started) / 60000);
        const etaMin = Math.round(queue.length / rate);
        console.log(`  [w${id}] ${ok} ok, ${fail} fail, ${queue.length} left (~${etaMin} min ETA)`);
      }
      await sleep(DELAY_MS);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));
  stream.end();

  const minutes = ((Date.now() - started) / 60000).toFixed(1);
  console.log(`\n[scrape] done in ${minutes} min: ${ok} scraped, ${fail} failed (this run)`);
  if (failures.length) {
    const fpath = path.join(DATA, 'failures.json');
    fs.writeFileSync(fpath, JSON.stringify(failures, null, 2));
    console.log(`[scrape] failures written to ${fpath} — re-run the script to retry them`);
  }
}

function slugOf(u) {
  return u.replace(/\/+$/, '').split('/').pop();
}

main().catch((e) => {
  console.error('[scrape] fatal:', e.message);
  process.exit(1);
});
