import mongoose from "mongoose";
import { Admin, Enquiry } from "./models.ts";

/**
 * One shared MongoDB connection. Commands are not buffered: if the database
 * is unreachable a request fails quickly with a safe 503 instead of hanging.
 */

mongoose.set("bufferCommands", false);

let connecting: Promise<typeof mongoose> | null = null;

export function connectDb(uri: string) {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  connecting ??= mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10, autoIndex: false })
    .catch((error) => {
      connecting = null;
      throw error;
    });
  return connecting;
}

export function dbReady() {
  return mongoose.connection.readyState === 1;
}

/** Creates the two collections (if missing) and their indexes. Safe to run repeatedly. */
export async function ensureCollections() {
  await Enquiry.createCollection();
  await Admin.createCollection();
  await Enquiry.syncIndexes();
  await Admin.syncIndexes();
}

export function disconnectDb() {
  connecting = null;
  return mongoose.disconnect();
}
