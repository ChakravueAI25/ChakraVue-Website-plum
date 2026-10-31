import bcrypt from "bcryptjs";
import { configProblems, readConfig } from "./config.ts";
import { connectDb, disconnectDb, ensureCollections } from "./db.ts";
import { Admin } from "./models.ts";

/**
 * Server-side setup commands (run on a machine that holds the .env; there is
 * no public sign-up):
 *
 *   npm run db:init                      create `enquiries` and `admins` and their indexes
 *   npm run admin:create                 create the admin from ADMIN_SEED_NAME / _EMAIL / _PASSWORD
 *   npm run admin:create -- --reset      same, but replace an existing admin's password
 *   npm run admin:deactivate -- <email>  block an admin from signing in
 *   npm run admin:activate -- <email>
 *
 * Remove ADMIN_SEED_PASSWORD from the environment after use.
 */

const MIN_PASSWORD = 12;

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const config = readConfig();
  if (!config) throw new Error(configProblems().join(" "));
  await connectDb(config.mongoUri);
  await ensureCollections();

  if (command === "init") {
    console.log("Collections `enquiries` and `admins` and their indexes are in place.");
    return;
  }

  if (command === "create-admin") {
    const name = process.env.ADMIN_SEED_NAME?.trim();
    const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_SEED_PASSWORD ?? "";
    if (!name || !email || !password) throw new Error("Set ADMIN_SEED_NAME, ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("ADMIN_SEED_EMAIL is not a valid email address.");
    if (password.length < MIN_PASSWORD) throw new Error(`ADMIN_SEED_PASSWORD must be at least ${MIN_PASSWORD} characters.`);
    const passwordHash = await bcrypt.hash(password, 12);
    const existing = await Admin.findOne({ email });
    if (existing && !args.includes("--reset")) throw new Error(`An admin with ${email} already exists. Use --reset to replace the password.`);
    if (existing) {
      existing.set({ name, passwordHash, isActive: true });
      await existing.save();
      console.log(`Password reset for ${email}; their existing sessions are signed out.`);
    } else {
      await Admin.create({ name, email, passwordHash, role: "admin", isActive: true });
      console.log(`Admin ${email} created. Now remove ADMIN_SEED_PASSWORD from the environment.`);
    }
    return;
  }

  if (command === "activate" || command === "deactivate") {
    const email = args[0]?.trim().toLowerCase();
    const active = command === "activate";
    if (!email) throw new Error("Give the admin's email.");
    const result = await Admin.updateOne({ email }, { $set: { isActive: active } });
    if (!result.matchedCount) throw new Error(`No admin with ${email}.`);
    console.log(`${email} is now ${active ? "active" : "deactivated"}.`);
    return;
  }

  throw new Error("Unknown command. Use: init | create-admin [--reset] | activate <email> | deactivate <email>");
}

main()
  .then(() => disconnectDb())
  .catch(async (error: Error) => {
    console.error(error.message);
    await disconnectDb().catch(() => {});
    process.exit(1);
  });
