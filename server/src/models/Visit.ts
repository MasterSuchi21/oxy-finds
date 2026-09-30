import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    country: { type: String, required: true, index: true },
    path: { type: String, default: '/' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

visitSchema.index({ createdAt: -1 });

export type VisitDoc = mongoose.InferSchemaType<typeof visitSchema> & { _id: mongoose.Types.ObjectId };

export const Visit = mongoose.model('Visit', visitSchema);
