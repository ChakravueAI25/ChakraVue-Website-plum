# Enquiries backend: setup and deployment

Every form on the site saves to MongoDB; administrators read the
submissions at `/admin/enquiries`. The backend is part of this project's own
Node server (`server/`), so the site and its API are deployed together as
one Node process. There are exactly two collections: `enquiries` and
`admins`.

## 1. Requirements

- Node.js 22.9 or newer (the server runs TypeScript directly).
- A MongoDB database: MongoDB Atlas (recommended) or your own MongoDB 6+.
- HTTPS in front of the server in production (any host or reverse proxy
  that terminates TLS).

## 2. Install

```bash
npm install
```

## 3. MongoDB Atlas

1. Create a cluster (the free M0 tier is enough to start).
2. **Database Access** → add a database user with a strong generated
   password and the built-in role **readWrite** on the `chakravue`
   database only (not `atlasAdmin`, not "any database").
3. **Network Access** → add only your server's outbound IP address(es).
   Avoid `0.0.0.0/0`. For local development add your own IP temporarily.
4. **Connect** → Drivers → copy the `mongodb+srv://` connection string and
   put the database name `chakravue` in it.

## 4. Configure

```bash
cp .env.example .env
```

Fill in at least:

| Variable | What |
| --- | --- |
| `MONGODB_URI` | The connection string from step 3. |
| `SESSION_SECRET` | 32+ random characters: `openssl rand -base64 48`. Changing it signs every admin out. |
| `NODE_ENV` | `production` on the live server. |
| `ALLOWED_ORIGINS` | Optional. Only if forms are sent from another origin than the site itself, e.g. both `https://chakravue.ai` and `https://www.chakravue.ai` served by one server. |

`.env` is git-ignored; never commit it. These variables are read only by
the server and never reach the browser (Vite exposes only `VITE_` ones).

## 5. Create the collections and the first admin

```bash
npm run db:init
```

creates `enquiries` and `admins` with their indexes (safe to run again).

Then, on the server (or any machine with the production `.env`), set the
seed variables for one command only:

```bash
ADMIN_SEED_NAME="Your Name" ADMIN_SEED_EMAIL="you@chakravue.ai" ADMIN_SEED_PASSWORD="a long unique password" npm run admin:create
```

The password must be at least 12 characters and is stored only as a bcrypt
hash. There is no sign-up page. Other commands:

```bash
npm run admin:create -- --reset    # replace that admin's password (signs out their sessions)
npm run admin:deactivate -- you@chakravue.ai
npm run admin:activate -- you@chakravue.ai
```

Deactivating takes effect on the admin's next request.

## 6. Run locally

```bash
npm run db:local     # optional: a throwaway local MongoDB; copy the MONGODB_URI it prints into .env
npm run dev          # site + API on http://127.0.0.1:5175
```

The dashboard is at http://127.0.0.1:5175/admin/enquiries. Without
`MONGODB_URI` and `SESSION_SECRET` the site still runs and the forms answer
"temporarily unavailable".

## 7. Build and run in production

```bash
npm run build
NODE_ENV=production npm run serve      # PORT (default 4175) and HOST from .env
```

`npm run serve` serves `dist/` and the API from one process and refuses to
start if `MONGODB_URI` or `SESSION_SECRET` is missing or unsafe.

### Hosting

The site needs a host that runs a Node process (it is not a static-only
site any more, because the forms post to `/api/enquiries`). Simple options:

- **A VM or VPS** (any provider): run `npm run serve` under a process
  manager (systemd or pm2) behind Nginx or Caddy with HTTPS.
- **Render, Railway, Fly.io or similar**: build command `npm install && npm
  run build`, start command `npm run serve`, set the environment variables
  in the dashboard, and add the service's outbound IPs to Atlas Network
  Access.

If the site's static files stay on a static host (Netlify, Vercel, S3) and
the API runs elsewhere, put both behind the same domain (a proxy rule from
`/api/*` to the Node service) so the admin cookie stays same-site. The admin
API deliberately refuses cross-origin requests.

Behind a reverse proxy, set `TRUST_PROXY=1` so rate limits see each
visitor's address (only when the proxy is yours and overwrites
`X-Forwarded-For`).

## 8. What protects it, and what's left to you

In the code:

- Server-side validation of every field (types, lengths, allowed values),
  trimmed text, normalised email, control characters removed; operator
  objects can't reach a query (only strings are accepted, and Mongoose's
  `sanitizeFilter` is on).
- 16 KB request limit, JSON only.
- Rate limits: form submissions (8 per visitor per 15 minutes by default),
  sign-ins (20 per address per 15 minutes) and a 15-minute lock after 5
  wrong passwords for one account.
- A hidden anti-spam field on every form; repeated identical submissions
  within two minutes return the first record instead of a copy.
- Origins: the site's own origin, plus `ALLOWED_ORIGINS` for forms; the
  admin API is same-origin only.
- Admin sessions: signed HTTP-only cookie, SameSite=Strict, `__Host-` and
  Secure in production, 8 hours by default; every admin request re-reads the
  admin (inactive admins are refused) and must carry the
  `X-Requested-With: chakravue-admin` header (CSRF). Changing an admin's
  password ends their sessions. No tokens in local storage.
- Security headers on every response (HSTS in production, nosniff,
  frame and referrer policies; a strict CSP on API responses); the dashboard
  is `noindex`.
- Errors are generic to the visitor; logs record only the error type,
  never form contents or credentials.

Still needed in deployment:

- HTTPS on the public domain (required for the Secure cookie).
- Atlas Network Access restricted to the server, a least-privilege database
  user, and Atlas backups switched on.
- Rate limits and login locks are kept in memory: they reset on restart and
  aren't shared between several server instances. Run one instance, or put
  limits at the proxy/CDN as well.
- A Content-Security-Policy for the site's pages (not set, because the
  site uses inline styles and third-party fonts; add one at the proxy if
  your policy requires it).
- Decide how long enquiries are kept and add it to the Privacy Policy;
  delete old records in Atlas as that policy says.

## 9. Tests

```bash
npm test               # Product Assistant + enquiries backend
npm run test:backend   # backend only
```

The backend tests start a real temporary MongoDB (mongodb-memory-server
downloads a MongoDB binary on first run) and cover: storing and normalising
valid enquiries, rejecting invalid and malicious payloads, optional fields,
each form's mapping, duplicate handling, no public read access, CORS,
authentication (wrong credentials, lockout, tampered cookies, inactive
admins, password changes, CSRF), search, filters, sorting, pagination,
status updates, malformed ids and queries, and database outages (503, no
details).
