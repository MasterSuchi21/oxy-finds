/**
 * Apply Kakobuy-per-line URL list (oxy / kakobuy affiliate URLs) to the
 * leading rows of data/products.jsonl — updates itemUrl, itemId, source, affiliateUrl.
 *
 * Usage: node scripts/sync-jsonl-from-kakobuy-list.mjs [path-to-url-list.txt]
 * Default list: client/12312412412.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const listPath = path.resolve(process.argv[2] ?? path.join(root, 'client', '12312412412.txt'));
const jsonlPath = path.join(root, 'data', 'products.jsonl');

function inferSource(itemUrl) {
  const u = itemUrl.toLowerCase();
  if (u.includes('weidian.com')) return 'WD';
  if (u.includes('taobao.com') || u.includes('tmall.com')) return 'TB';
  if (u.includes('1688.com')) return '1688';
  return null;
}

function extractItemId(itemUrl) {
  const m =
    itemUrl.match(/[?&]itemID=(\d+)/i) ??
    itemUrl.match(/[?&]id=(\d+)/i) ??
    itemUrl.match(/offer\/(\d+)/i);
  return m ? m[1] : null;
}

function parseKakobuyLine(line, lineNo) {
  const trimmed = line.trim();
  if (!trimmed) throw new Error(`empty line ${lineNo}`);
  let u;
  try {
    u = new URL(trimmed);
  } catch {
    throw new Error(`invalid URL at list line ${lineNo}`);
  }
  let inner = u.searchParams.get('url');
  if (!inner) throw new Error(`missing url= param at list line ${lineNo}`);
  // Unwrap nested kakobuy (same idea as affiliate.ts)
  for (let i = 0; i < 4; i++) {
    let host = '';
    try {
      host = new URL(inner).hostname.toLowerCase();
    } catch {
      break;
    }
    if (!/(^|\.)kakobuy\.com$/.test(host)) break;
    const next = new URL(inner).searchParams.get('url');
    if (!next) break;
    inner = next;
  }
  const itemUrl = inner;
  const source = inferSource(itemUrl);
  if (!source) throw new Error(`unsupported marketplace at list line ${lineNo}`);
  return {
    affiliateUrl: trimmed,
    itemUrl,
    source,
    itemId: extractItemId(itemUrl),
  };
}

const listLines = fs
  .readFileSync(listPath, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);
const jsonlRaw = fs.readFileSync(jsonlPath, 'utf8').split('\n').filter((l) => l.length > 0);

const max = listLines.length;
if (max > jsonlRaw.length) {
  console.error(`[sync] list has ${max} URLs but products.jsonl has only ${jsonlRaw.length} rows`);
  process.exit(1);
}

let updated = 0;
const out = [];

for (let i = 0; i < jsonlRaw.length; i++) {
  const row = jsonlRaw[i];
  let rec;
  try {
    rec = JSON.parse(row);
  } catch (e) {
    console.error(`[sync] bad JSON at jsonl line ${i + 1}`);
    throw e;
  }

  if (i < max) {
    const listLine = listLines[i];
    const parsed = parseKakobuyLine(listLine, i + 1);
    rec.affiliateUrl = parsed.affiliateUrl;
    rec.itemUrl = parsed.itemUrl;
    rec.source = parsed.source;
    rec.itemId = parsed.itemId;
    updated++;
  }

  out.push(JSON.stringify(rec));
}

fs.writeFileSync(jsonlPath, out.join('\n') + '\n', 'utf8');
console.log(`[sync] updated ${updated} rows in ${path.relative(root, jsonlPath)} from ${path.relative(root, listPath)}`);
