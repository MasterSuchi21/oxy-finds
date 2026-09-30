// Parsing + affiliate-link rewriting helpers.
// Shared by probe.mjs and scrape.mjs.

export const AFFCODE = process.env.AFFCODE || 'brmrb';

const NAMED = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED[name.toLowerCase()] ?? m);
}

function stripTags(s) {
  return s.replace(/<[^>]*>/g, '');
}

// Titles on the source site are prefixed with a U+200E LTR mark; drop all
// zero-width / bidi format characters and collapse whitespace.
function cleanText(s) {
  return decodeEntities(stripTags(s))
    .replace(/[​-\u200F\u202A-\u202E\u2066-\u2069﻿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Buy buttons point at two different Kakobuy hosts depending on which
// template the page uses: item.kakobuy.com on the homepage grids,
// www.kakobuy.com on the catalog detail pages. Match either.
const KAKOBUY_HREF_RE =
  /href="(https:\/\/(?:www\.|item\.)?kakobuy\.com\/item\/details[^"]+)"/i;

export function inferSource(itemUrl) {
  const u = itemUrl.toLowerCase();
  if (u.includes('weidian.com')) return 'WD';
  if (u.includes('taobao.com') || u.includes('tmall.com')) return 'TB';
  if (u.includes('1688.com')) return '1688';
  return null;
}

export function extractItemId(itemUrl) {
  const m =
    itemUrl.match(/[?&]itemID=(\d+)/i) ||
    itemUrl.match(/[?&]id=(\d+)/i) ||
    itemUrl.match(/offer\/(\d+)/i);
  return m ? m[1] : null;
}

/**
 * Rebuild a Kakobuy affiliate link with our own affcode.
 * Some source links are nested (the inner `url` is itself a Kakobuy link
 * still carrying someone else's affcode); unwrap until we reach the real
 * Weidian/Taobao listing so no foreign code survives anywhere in the URL.
 */
export function rewriteAffiliate(rawHref, affcode = AFFCODE) {
  const u = new URL(decodeEntities(rawHref));
  let inner = u.searchParams.get('url');
  if (!inner) return null;

  // Unwrap nested kakobuy links (max 3 levels of paranoia).
  for (let i = 0; i < 3; i++) {
    let host = null;
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

  const source = inferSource(inner) || u.searchParams.get('source');

  const out = new URL('https://item.kakobuy.com/item/details');
  out.searchParams.set('url', inner);
  if (source) out.searchParams.set('source', source);
  out.searchParams.set('affcode', affcode);
  return { affiliateUrl: out.toString(), itemUrl: inner, source, itemId: extractItemId(inner) };
}

// WordPress appends -WxH to resized copies; strip it to get the original upload.
export function originalImage(src) {
  if (!src) return null;
  return src.replace(/-\d+x\d+(?=\.[a-z0-9]+(?:$|\?))/i, '');
}

function pickLargest(srcset) {
  if (!srcset) return null;
  let best = null;
  let bestW = -1;
  for (const part of decodeEntities(srcset).split(',')) {
    const m = part.trim().match(/^(\S+)\s+(\d+)w$/);
    if (!m) continue;
    const w = Number(m[2]);
    if (w > bestW) {
      bestW = w;
      best = m[1];
    }
  }
  return best;
}

/**
 * Extract product records from any page containing JetEngine listing cards
 * (the /products/ archive, or the homepage grids).
 */
export function parseCards(html, { affcode = AFFCODE } = {}) {
  const chunks = html.split('<div class="jet-listing-grid__item');
  chunks.shift(); // preamble before the first card
  const out = [];

  for (const chunk of chunks) {
    const aff = chunk.match(KAKOBUY_HREF_RE);
    if (!aff) continue;

    const rewritten = rewriteAffiliate(aff[1], affcode);
    if (!rewritten) continue;

    const postId =
      chunk.match(/jet-listing-dynamic-post-(\d+)/)?.[1] ||
      chunk.match(/data-post-id="(\d+)"/)?.[1] ||
      null;

    const title = cleanText(
      chunk.match(/<h3 class="elementor-heading-title[^"]*">([\s\S]*?)<\/h3>/i)?.[1] || '',
    );

    // Price sits in a heading-title div (not an h3) rendered like "40.76$".
    let price = null;
    let priceRaw = null;
    const headingRe =
      /<div class="elementor-heading-title[^"]*">([\s\S]*?)<\/div>/gi;
    for (const m of chunk.matchAll(headingRe)) {
      const txt = cleanText(m[1]);
      const pm = txt.match(/^([\d]+(?:[.,]\d+)?)\s*\$$/);
      if (pm) {
        priceRaw = txt;
        price = Number(pm[1].replace(',', '.'));
        break;
      }
    }

    const sourcePage = decodeEntities(
      chunk.match(/href="(https:\/\/repgalaxy\.com\/products\/[^"]+)"/i)?.[1] || '',
    ) || null;

    const slug = sourcePage
      ? sourcePage.replace(/\/+$/, '').split('/').pop()
      : null;

    const imgTag = chunk.match(/<img\b[^>]*>/i)?.[0] || '';
    const src = decodeEntities(imgTag.match(/\bsrc="([^"]+)"/i)?.[1] || '') || null;
    const srcset = pickLargest(imgTag.match(/\bsrcset="([^"]+)"/i)?.[1] || '');
    const thumb = src;
    const image = originalImage(srcset || src);

    out.push({
      postId,
      slug,
      title,
      price,
      priceRaw,
      ...rewritten,
      image,
      thumb,
      sourcePage,
    });
  }

  return out;
}

/**
 * Extract a product record from a product detail page.
 * Detail pages are hand-built Elementor layouts: first h1 = title,
 * a heading div like "40.76$" = price, one kakobuy link, product images
 * under wp-content/uploads (logos excluded).
 */
export function parseDetail(html, slug, { affcode = AFFCODE, url = '' } = {}) {
  const aff = html.match(KAKOBUY_HREF_RE);
  const rewritten = aff ? rewriteAffiliate(aff[1], affcode) : null;

  const h1s = [...html.matchAll(/<h1 class="elementor-heading-title[^"]*">([\s\S]*?)<\/h1>/gi)]
    .map((m) => cleanText(m[1]))
    .filter(Boolean);

  const ogTitle = html.match(/property="og:title" content="([^"]*)"/i)?.[1];
  const titleTag = html.match(/<title>([^<]*)<\/title>/i)?.[1];

  const title =
    h1s[0] ||
    cleanText(ogTitle) ||
    cleanText(titleTag?.replace(/\s*[-–]\s*RepGalaxy.*$/i, '')) ||
    null;

  let price = null;
  let priceRaw = null;
  const headingRe = /<div class="elementor-heading-title[^"]*">([\s\S]*?)<\/div>/gi;
  for (const m of html.matchAll(headingRe)) {
    const txt = cleanText(m[1]);
    const pm = txt.match(/^([\d]+(?:[.,]\d+)?)\s*\$$/);
    if (pm) {
      priceRaw = txt;
      price = Number(pm[1].replace(',', '.'));
      break;
    }
  }

  const images = new Set();
  for (const tag of html.matchAll(/<img\b[^>]*>/gi)) {
    const t = tag[0];
    const src =
      decodeEntities(t.match(/\bdata-src="([^"]+)"/i)?.[1] || '') ||
      decodeEntities(t.match(/\bsrc="([^"]+)"/i)?.[1] || '');
    if (!src || !src.includes('/wp-content/uploads/')) continue;
    if (/logo/i.test(src)) continue;
    images.add(originalImage(src.split(' ')[0]));
  }
  const ogImage = html.match(/property="og:image" content="([^"]*)"/i)?.[1];
  if (ogImage && !/logo/i.test(ogImage)) {
    images.add(originalImage(decodeEntities(ogImage)));
  }

  return {
    slug,
    ...(url ? { sourcePage: url } : {}),
    title,
    price,
    priceRaw,
    ...(rewritten || { affiliateUrl: null, itemUrl: null, source: null, itemId: null }),
    images: [...images],
  };
}
