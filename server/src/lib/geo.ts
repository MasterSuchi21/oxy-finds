import type { Request } from 'express';
import geoip from 'geoip-lite';

/** ISO country code from CDN header or offline GeoIP lookup. */
export function countryFromRequest(req: Request): string {
  const cf = req.headers['cf-ipcountry'];
  if (typeof cf === 'string' && /^[A-Za-z]{2}$/.test(cf)) {
    return cf.toUpperCase();
  }

  const raw = req.ip ?? req.socket.remoteAddress ?? '';
  const ip = raw.replace(/^::ffff:/, '');
  if (!ip || ip === '::1' || ip === '127.0.0.1') return 'LOCAL';

  const hit = geoip.lookup(ip);
  return hit?.country ?? 'XX';
}
