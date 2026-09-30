import 'dotenv/config';

/**
 * Single source of truth for runtime configuration.
 *
 * Everything the app needs is read once, here, so no module reaches into
 * process.env directly and every default lives in one place.
 */
export const config = {
  /** Affiliate code appended to every outbound agent link. */
  affcode: process.env.AFFCODE ?? 'brmrb',

  port: Number(process.env.PORT ?? 4000),

  /**
   * When MONGODB_URI is absent we spin up an in-memory MongoDB so the app runs
   * locally with no credentials or installed database.
   */
  mongoUri: process.env.MONGODB_URI ?? '',

  /** Comma-separated in the environment, an array here for the cors middleware. */
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  nodeEnv: process.env.NODE_ENV ?? 'development',

  siteName: process.env.SITE_NAME ?? 'OXY FINDS',

  /** Shown in the client header; blank hides the banner. */
  discountCode: process.env.DISCOUNT_CODE ?? '',

  /** Protects GET /api/admin/* — set in production. */
  adminPassword: process.env.ADMIN_PASSWORD ?? '',

  /** Home promo code copy (marketing). */
  promoCode: process.env.PROMO_CODE ?? 'OXYFINDS',

  kakobuyRegisterUrl: process.env.KAKOBUY_REGISTER_URL ?? 'https://www.kakobuy.com/register',
} as const;

export type Config = typeof config;
