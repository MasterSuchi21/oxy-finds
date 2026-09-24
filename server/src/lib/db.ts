import mongoose from 'mongoose';
import { config } from '../config.js';

// Held so we can stop the in-memory server on shutdown.
let memoryServer: { stop: () => Promise<boolean> | Promise<void> } | null = null;

/**
 * Connect to MongoDB.
 *
 * Uses MONGODB_URI when set. Otherwise spins up mongodb-memory-server so the
 * app runs locally with no database installed and no credentials — data is
 * seeded on boot and lost on exit, which is fine for development.
 */
export async function connectDb(): Promise<void> {
  let uri = config.mongoUri;

  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    memoryServer = mem;
    uri = mem.getUri('kakubuy');
    console.log('[db] MONGODB_URI not set — using in-memory MongoDB (data is not persisted)');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[db] connected (${mongoose.connection.name})`);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export function isMemoryDb(): boolean {
  return memoryServer !== null;
}
