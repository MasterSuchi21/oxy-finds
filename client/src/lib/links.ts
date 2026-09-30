/**
 * Client-side URL helpers for _derived_ links only.
 *
 * Raw rightsholder URLs never enter the DOM: every buy button points at
 * GET /api/products/:slug/go so the affiliate code stays on the server and
 * click counts stay authoritative. These helpers build the same endpoints the
 * server exposes.
 */

export function productHref(slug: string): string {
  return `/products/${slug}`;
}

export function goHref(slug: string): string {
  return `/api/products/${slug}/go`;
}
