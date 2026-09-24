/**
 * CLI seeder: npm run seed.
 * The server boot-seeds automatically when its database is empty (see
 * lib/seedData.ts); this command is for re-imports and real deployments.
 */
import { connectDb, disconnectDb } from './lib/db.js';
import { seedFromJsonl } from './lib/seedData.js';
import { Product } from './models/Product.js';

async function main() {
  await connectDb();
  const { written, skipped, total } = await seedFromJsonl();
  const brands = await Product.distinct('brand');
  const categories = await Product.distinct('category');
  console.log(`[seed] done: ${written} written, ${skipped} skipped, ${total} in db`);
  console.log(`[seed] facets: ${brands.length} brands, ${categories.length} categories`);
}

main()
  .then(() => disconnectDb())
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
