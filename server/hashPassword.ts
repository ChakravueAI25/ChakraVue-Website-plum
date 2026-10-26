import { hashPassword } from "./assistant/auth.ts";

/**
 * Prints an ADMIN_PASSWORD_HASH line for .env, so the admin password itself
 * never has to be stored: `npm run admin:password -- "your password"`.
 */
const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run admin:password -- "a password of at least 10 characters"');
  process.exit(1);
}
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
