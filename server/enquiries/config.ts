/**
 * Settings for the enquiries backend, read from the server's environment
 * (.env via `npm run serve` / `npm run dev`). Nothing here reaches the
 * browser: Vite only exposes VITE_-prefixed variables to client code.
 */

export type EnquiryConfig = {
  mongoUri: string;
  sessionSecret: string;
  /** Extra origins allowed to call the API (the site's own origin always is). */
  allowedOrigins: string[];
  production: boolean;
  sessionHours: number;
};

const MIN_SECRET = 32;

function list(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

/** What is missing or unsafe, in plain words; empty when the backend can run. */
export function configProblems(env: NodeJS.ProcessEnv = process.env) {
  const problems: string[] = [];
  if (!env.MONGODB_URI?.trim()) problems.push("MONGODB_URI is not set.");
  else if (!/^mongodb(\+srv)?:\/\//.test(env.MONGODB_URI.trim())) problems.push("MONGODB_URI must start with mongodb:// or mongodb+srv://.");
  const secret = env.SESSION_SECRET?.trim() ?? "";
  if (!secret) problems.push("SESSION_SECRET is not set.");
  else if (secret.length < MIN_SECRET) problems.push(`SESSION_SECRET must be at least ${MIN_SECRET} characters (use: openssl rand -base64 48).`);
  if (env.NODE_ENV === "production" && list(env.ALLOWED_ORIGINS).some((origin) => origin.startsWith("http://") && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
    problems.push("ALLOWED_ORIGINS must use https:// in production.");
  }
  return problems;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): EnquiryConfig | null {
  if (configProblems(env).length) return null;
  const hours = Number(env.SESSION_HOURS);
  return {
    mongoUri: env.MONGODB_URI!.trim(),
    sessionSecret: env.SESSION_SECRET!.trim(),
    allowedOrigins: list(env.ALLOWED_ORIGINS),
    production: env.NODE_ENV === "production",
    sessionHours: Number.isFinite(hours) && hours > 0 && hours <= 24 ? hours : 8,
  };
}
