import { Router } from 'express';
import { Product } from '../models/Product.js';
import { config } from '../config.js';
import { buildAffiliateUrl } from '../lib/affiliate.js';
export const productsRouter = Router();

const MAX_LIMIT = 60;

function parsePaging(query: Record<string, unknown>) {
  const page = Math.max(1, Number(query.page) || 1);
  const rawLimit = Number(query.limit) || 24;
  const limit = Math.min(MAX_LIMIT, Math.max(1, rawLimit));
  return { page, limit, skip: (page - 1) * limit };
}

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1, _id: -1 },
  'price-asc': { price: 1, _id: 1 },
  'price-desc': { price: -1, _id: -1 },
  name: { title: 1, _id: 1 },
};

/**
 * GET /api/products
 * Paginated catalog with search, brand/category filters and sorting.
 */
productsRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaging(req.query);
    const filter: Record<string, unknown> = {};

    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (q) {
      // Regex rather than $text so partial words match ("lacos" -> "Lacoste").
      filter.title = { $regex: escapeRegex(q), $options: 'i' };
    }

    const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
    if (brand) filter.brand = brand;

    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    if (category) filter.category = category;

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      const price: Record<string, number> = {};
      if (!Number.isNaN(minPrice)) price.$gte = minPrice;
      if (!Number.isNaN(maxPrice)) price.$lte = maxPrice;
      filter.price = price;
    }

    if (req.query.featured === 'true') filter.featured = true;

    const sortKey = typeof req.query.sort === 'string' ? req.query.sort : 'newest';
    const sort = SORTS[sortKey] ?? SORTS.newest;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
      hasMore: skip + items.length < total,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/facets
 * Brand + category lists and the price range, for the filter sidebar.
 */
productsRouter.get('/facets', async (_req, res, next) => {
  try {
    const [brands, categories, range] = await Promise.all([
      Product.aggregate([
        { $match: { brand: { $nin: [null, ''] } } },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 60 },
        { $project: { _id: 0, name: '$_id', count: 1 } },
      ]),
      Product.aggregate([
        { $match: { category: { $nin: [null, ''] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $project: { _id: 0, name: '$_id', count: 1 } },
      ]),
      Product.aggregate([
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
        { $project: { _id: 0, min: 1, max: 1 } },
      ]),
    ]);

    res.json({
      brands,
      categories,
      priceRange: range[0] ?? { min: 0, max: 0 },
    });
  } catch (err) {
    next(err);
  }
});

/** GET /api/products/:slug */
productsRouter.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      ...(product.brand ? { brand: product.brand } : { category: product.category }),
    })
      .limit(8)
      .lean();

    res.json({ product, related });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:slug/go
 * Outbound redirect. Keeps the affiliate code server-side and gives us a
 * single place to count clicks.
 */
productsRouter.get('/:slug/go', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select({ itemUrl: 1, source: 1 })
      .lean();
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Built per-request from the raw listing URL so the affcode is never
    // baked into stored data.
    const target = buildAffiliateUrl(product.itemUrl, { source: product.source });

    // Fire-and-forget: a failed counter must never block the redirect.
    Product.updateOne({ _id: product._id }, { $inc: { clicks: 1 } }).catch(() => {});

    res.redirect(302, target);
  } catch (err) {
    next(err);
  }
});

export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Exposed so the client can show the active discount code / agent. */
export const metaRouter = Router();
metaRouter.get('/', (_req, res) => {
  res.json({
    affcode: config.affcode,
    siteName: config.siteName,
    discountCode: config.discountCode,
    promoCode: config.promoCode,
    signupUrl: `${config.kakobuyRegisterUrl}?affcode=${encodeURIComponent(config.affcode)}`,
  });
});
