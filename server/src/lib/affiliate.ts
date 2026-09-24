/**
 * Affiliate link construction.
 *
 * Every outbound product link is built here, at request time, from the raw
 * marketplace item URL plus the configured affcode. Storing only the raw item
 * URL in the database (rather than a pre-baked affiliate link) means changing
 * the affcode is a config change and a restart, never a data migration.
 */

import { config } from '../config.js';

export type MarketSource = 'WD' | 'TB' | '1688';

const AGENT_ENDPOINT = 'https://item.kakobuy.com/item/details';

/** Detect which marketplace an item URL belongs to. */
export function inferSource(itemUrl: string): MarketSource | null {
  const u = itemUrl.toLowerCase();
  if (u.includes('weidian.com')) return 'WD';
  if (u.includes('taobao.com') || u.includes('tmall.com')) return 'TB';
  if (u.includes('1688.com')) return '1688';
  return null;
}

/** Pull the numeric listing id out of a marketplace URL, when present. */
export function extractItemId(itemUrl: string): string | null {
  const m =
    itemUrl.match(/[?&]itemID=(\d+)/i) ??
    itemUrl.match(/[?&]id=(\d+)/i) ??
    itemUrl.match(/offer\/(\d+)/i);
  return m ? (m[1] ?? null) : null;
}

function isAgentHost(host: string): boolean {
  return /(^|\.)kakobuy\.com$/.test(host.toLowerCase());
}

/**
 * Reduce a URL to the underlying marketplace listing.
 *
 * Agent links wrap the real listing in a `url` query param, and can be nested
 * more than one level deep. Unwrapping matters for correctness: a nested agent
 * link carries its own `affcode`, so leaving one embedded would credit someone
 * else's code even though the outer link carries ours.
 */
export function unwrapItemUrl(raw: string, maxDepth = 4): string {
  let current = raw;

  for (let i = 0; i < maxDepth; i++) {
    let parsed: URL;
    try {
      parsed = new URL(current);
    } catch {
      return current;
    }
    if (!isAgentHost(parsed.hostname)) return current;

    const inner = parsed.searchParams.get('url');
    if (!inner) return current;
    current = inner;
  }

  return current;
}

/** Build the outbound affiliate link for a marketplace item URL. */
export function buildAffiliateUrl(
  itemUrl: string,
  opts: { affcode?: string; source?: MarketSource | null } = {},
): string {
  const affcode = opts.affcode ?? config.affcode;
  const target = unwrapItemUrl(itemUrl);
  const source = opts.source ?? inferSource(target);

  const out = new URL(AGENT_ENDPOINT);
  out.searchParams.set('url', target);
  if (source) out.searchParams.set('source', source);
  out.searchParams.set('affcode', affcode);
  return out.toString();
}

/**
 * Validate a user-supplied URL for the link converter.
 * Accepts marketplace URLs and agent links wrapping them; rejects everything
 * else so the tool can't be used to mint links to arbitrary hosts.
 */
export function normalizeUserUrl(
  input: string,
): { ok: true; itemUrl: string; source: MarketSource } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'Paste a product link first.' };

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  const itemUrl = unwrapItemUrl(parsed.toString());
  const source = inferSource(itemUrl);
  if (!source) {
    return {
      ok: false,
      error: 'Supported links: Weidian, Taobao/Tmall, 1688, or a Kakobuy link wrapping one.',
    };
  }

  return { ok: true, itemUrl, source };
}
