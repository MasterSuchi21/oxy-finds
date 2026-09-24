import { createApp } from './app.js';
import { connectDb } from './lib/db.js';
import { config } from './config.js';
import { seedFromJsonl } from './lib/seedData.js';
import { Product } from './models/Product.js';

async function main() {
  await connectDb();

  // In-memory MongoDB (zero-config local dev) boots empty — seed it so the
  // store is usable without a separate `npm run seed` step. Skipped when
  // MONGODB_URI points at a real deployment, since its data is already there.
  if (!config.mongoUri) {
    const count = await Product.estimatedDocumentCount();
    if (count === 0) {
      console.log('[db] seeding from data/products.jsonl …');
      const { written, skipped, total } = await seedFromJsonl();
      console.log(`[db] seeded: ${written} written, ${skipped} skipped, ${total} in db`);
    }
  }

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[api] listening on http://localhost:${config.port}`);
    console.log(`[api] affiliate code: ${config.affcode}`);
  });
}

main().catch((err) => {
  console.error('[api] failed to start:', err);
  process.exit(1);
});
