import { Router } from 'express';
import { z } from 'zod';
import { Visit } from '../models/Visit.js';
import { countryFromRequest } from '../lib/geo.js';

export const analyticsRouter = Router();

const bodySchema = z.object({
  sessionId: z.string().min(8).max(64),
  path: z.string().max(256).optional(),
});

/** Record a site visit once per browser session (client dedupes). */
analyticsRouter.post('/visit', async (req, res, next) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    const { sessionId, path } = parsed.data;
    const country = countryFromRequest(req);

    const existing = await Visit.findOne({ sessionId }).lean();
    if (existing) {
      res.json({ ok: true, recorded: false, country: existing.country });
      return;
    }

    await Visit.create({ sessionId, country, path: path ?? '/' });
    res.json({ ok: true, recorded: true, country });
  } catch (err) {
    next(err);
  }
});
