import { Router, type NextFunction, type Request, type Response } from 'express';
import { Visit } from '../models/Visit.js';
import { config } from '../config.js';

export const adminRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!config.adminPassword) {
    res.status(503).json({ error: 'Admin not configured (set ADMIN_PASSWORD)' });
    return;
  }
  const key = req.headers['x-admin-key'];
  const provided = Array.isArray(key) ? key[0] : key;
  if (provided !== config.adminPassword) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

adminRouter.use(requireAdmin);

adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [totalVisits, uniqueVisitors, byCountry] = await Promise.all([
      Visit.countDocuments(),
      Visit.distinct('sessionId').then((ids) => ids.length),
      Visit.aggregate([
        {
          $group: {
            _id: '$country',
            visits: { $sum: 1 },
            sessions: { $addToSet: '$sessionId' },
          },
        },
        {
          $project: {
            _id: 0,
            country: '$_id',
            visits: 1,
            uniqueVisitors: { $size: '$sessions' },
          },
        },
        { $sort: { visits: -1 } },
      ]),
    ]);

    const recent = await Visit.find()
      .sort({ createdAt: -1 })
      .limit(25)
      .select({ sessionId: 1, country: 1, path: 1, createdAt: 1 })
      .lean();

    res.json({
      totalVisits,
      uniqueVisitors,
      byCountry,
      recent,
    });
  } catch (err) {
    next(err);
  }
});
