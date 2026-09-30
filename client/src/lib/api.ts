/**
 * Shared data shapes and API helpers.
 *
 * Server and client share nothing at build time (separate workspaces), so these
 * shapes duplicate the server's Product model deliberately. The server is the
 * source of truth; this file only needs enough to type the responses it parses.
 */

export type MarketSource = 'WD' | 'TB' | '1688';

export interface Product {
  _id: string;
  slug: string;
  title: string;
  price: number;
  brand: string | null;
  category: string | null;
  itemUrl: string;
  source: MarketSource | null;
  itemId: string | null;
  image: string | null;
  images: string[];
  featured: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface ProductDetailResponse {
  product: Product;
  related: Product[];
}

export interface FacetsResponse {
  brands: Array<{ name: string; count: number }>;
  categories: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
}

export interface MetaResponse {
  affcode: string;
  siteName: string;
  discountCode: string;
  promoCode: string;
  signupUrl: string;
}

export interface AdminStatsResponse {
  totalVisits: number;
  uniqueVisitors: number;
  byCountry: Array<{ country: string; visits: number; uniqueVisitors: number }>;
  recent: Array<{
    _id: string;
    sessionId: string;
    country: string;
    path: string;
    createdAt: string;
  }>;
}

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name';
export const SORT_KEYS: readonly SortKey[] = ['newest', 'price-asc', 'price-desc', 'name'] as const;

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

/** Discrete price buckets shown in the filter sidebar. */
export const PRICE_BUCKETS = [
  { label: 'Under $10', max: 10 as const },
  { label: '$10 – $25', min: 10 as const, max: 25 as const },
  { label: '$25 – $50', min: 25 as const, max: 50 as const },
  { label: '$50 – $100', min: 50 as const, max: 100 as const },
  { label: 'Over $100', min: 100 as const },
] as const;

/** Server base URL. In the browser it is empty (Vite proxies /api); tests pass the chosen port. */
export function apiBase(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta: any = typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string> }).env : null;
  return meta?.VITE_API_URL ?? '';
}

export function buildProductsQuery(params: Record<string, string | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && String(v).trim() !== '') qs.set(k, String(v));
  }
  return qs.toString();
}
