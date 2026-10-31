import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * A throwaway local MongoDB for trying the backend without Atlas:
 *   npm run db:local
 * prints a MONGODB_URI to put in .env; data is gone when you stop it.
 */
const mongo = await MongoMemoryServer.create({ instance: { port: Number(process.env.LOCAL_MONGO_PORT) || 27027 } });
console.log(`Local MongoDB running. Put this in .env:\nMONGODB_URI=${mongo.getUri("chakravue")}\nPress Ctrl+C to stop.`);
process.on("SIGINT", async () => {
  await mongo.stop();
  process.exit(0);
});
