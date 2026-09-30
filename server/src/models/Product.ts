import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

/**
 * A catalog entry. `itemUrl` is the raw marketplace listing; the outbound
 * affiliate link is derived from it per-request (see lib/affiliate.ts) rather
 * than stored, so the affcode is never baked into the data.
 */
const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0, index: true },
    brand: { type: String, default: null, index: true },
    category: { type: String, default: null, index: true },
    itemUrl: { type: String, required: true },
    source: { type: String, enum: ['WD', 'TB', '1688'], default: null },
    itemId: { type: String, default: null },
    image: { type: String, default: null },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Text index powers ?q= search across name and brand.
productSchema.index({ title: 'text', brand: 'text' });
// Supports the default "newest first" listing and brand-filtered sorts.
productSchema.index({ createdAt: -1 });
productSchema.index({ brand: 1, price: 1 });

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDoc> =
  model<ProductDoc>('Product', productSchema);
