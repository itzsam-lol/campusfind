# CampusFind

A campus Lost & Found app for IGDTUW + IIIT Delhi. Mobile‑first web app, full
admin dashboard, OTP‑based auth, Prisma + SQLite backend.

Built from the Claude Design handoff bundle (`CampusFind.html`). Pixel‑close to
the design tokens, but production‑shaped (real DB, real auth, real authorization,
security headers, rate limiting, etc).

## Quick start

```bash
# 1. Install
npm install

# 2. First-time DB setup + seed (creates prisma/dev.db with sample data)
npm run setup

# 3. Run
npm run dev
```

Open <http://localhost:3000>. The seed creates these accounts:

| Email                       | Campus     | Role  |
|-----------------------------|------------|-------|
| `admin@igdtuw.ac.in`        | IGDTUW     | admin |
| `anjali.s@igdtuw.ac.in`     | IGDTUW     | user  |
| `riya.m@iiitd.ac.in`        | IIIT Delhi | user  |

Login flow:
1. Enter one of the emails above.
2. The server prints the OTP to the terminal — and in dev mode also returns it
   in the API response, so the verify screen prefills the code.
3. Submit → JWT session cookie is set.

Admin lives at `/admin`. Student app at `/home`.

## Architecture

- **Next.js 14 App Router** — single codebase serves the mobile web app, the
  admin web app, and the JSON API at `/api/*`.
- **Prisma + SQLite** — `prisma/dev.db`. Schema is in `prisma/schema.prisma`.
- **JWT sessions** in httpOnly + SameSite=Strict cookies — JS never sees them
  and CSRF can't carry them across origins.
- **Bcrypt-hashed OTPs** with TTL, attempts counter, and per-email/per-IP rate
  limits.
- **DB-backed sliding-window rate limits** on all sensitive endpoints.
- **Zod** validation on every API input.
- **Edge middleware** sets CSP, X-Frame-Options, Referrer-Policy, and
  Permissions-Policy on every response.

```
src/
  app/
    page.tsx               # Splash
    login/, verify/        # OTP auth
    home/                  # Feed (server-rendered + client filters)
    listings/[id]/         # Detail
    post/                  # 3-step create flow
    claim/[listingId]/     # Claim form
    chat/[claimId]/        # Owner ↔ claimant chat
    activity/              # My listings + claims
    notifications/
    me/
    admin/                 # Admin shell + Overview / Listings / Claims / Users / Broadcasts
    api/
      auth/                # request-otp, verify-otp, logout
      me/
      listings/...         # CRUD + per-listing claim
      claims/...           # decide, confirm-return
      chats/[claimId]/     # message read/send
      notifications/
      admin/...            # stats, listings, users, broadcasts
  components/
    icons.tsx              # Lucide-style icons + Logo
    ui.tsx                 # Button, Input, Card, StatusPill, …
    bottom-nav.tsx         # Mobile tab bar
    header-bar.tsx         # Sticky app bar
  lib/
    env.ts                 # Validated env access
    prisma.ts              # Prisma singleton
    auth.ts                # JWT sign/verify, cookie helpers
    otp.ts                 # OTP issue/verify with bcrypt
    rate-limit.ts          # Sliding-window limiter
    validators.ts          # Zod schemas
    sanitize.ts            # Text + serializer helpers
    http.ts                # API helpers (json/badRequest/requireSession/…)
  middleware.ts            # Security headers + auth-gate redirects
```

## Security model

### Authentication
- Only emails on the allow-list (`ALLOWED_EMAIL_DOMAINS`) can request a code.
- OTPs are 6 digits, **bcrypt-hashed at rest**, single-use, expire after
  `OTP_TTL_SECONDS` (default 5 min).
- Each token has an attempts counter (`OTP_MAX_ATTEMPTS`, default 5). Hitting
  the cap consumes the token.
- Rate-limited per email **and** per IP (`/api/auth/request-otp` and
  `/api/auth/verify-otp`).
- Session JWT (HS256, 7-day expiry) signed with `AUTH_SECRET`. Cookie is
  httpOnly + SameSite=Strict + Secure in production.

### Authorization
- Every API route calls `requireSession()` or `requireAdmin()`.
- Listing owner is the only one who can edit/decide its claims.
- Owner can't claim their own listing (verified in tests).
- A user with a claim can't see the claim's private description from the API
  unless they're the listing owner.
- Chat membership is checked on every read and every send. Admins can **read**
  chats for dispute resolution but can't post into them.

### Input safety
- Zod schemas validate body shape, length, enum values, datetime parsing.
- Free-form text (titles, descriptions, messages) goes through `cleanText` —
  zero-width chars and C0/C1 control bytes stripped, capped length.
- Photos are constrained to PNG/JPEG/WEBP data URLs ≤ ~1.5 MB after base64
  expansion, max 4 per listing.
- SQL injection isn't reachable: every query is via Prisma's typed builder.
- XSS isn't reachable: React escapes everything; we never `dangerouslySetInnerHTML`.

### Transport / headers
Middleware (`src/middleware.ts`) sets on every response:
- `Content-Security-Policy` — restricts script/img/style/connect origins.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` blocks camera/mic/geolocation by default.
- Cookies: `httpOnly`, `Secure` in prod, `SameSite=Strict`.

### Rate limits
| Scope                 | Limit                          |
|-----------------------|--------------------------------|
| `otp:request:email`   | 5 per 15 min per email         |
| `otp:request:ip`      | 20 per 15 min per IP           |
| `otp:verify`          | 10 per 15 min per email        |
| `otp:verify:ip`       | 60 per 15 min per IP           |
| `post:listing`        | 8 per hour per user            |
| `claim:create`        | 10 per hour per user           |
| `chat:send`           | 60 per minute per user         |

State lives in a `RateLimit` table; swap for Redis if you scale horizontally.

## Going to production

You'll want to:
1. Generate a strong `AUTH_SECRET` (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
2. Set `OTP_DEV_ECHO=false` and wire `src/lib/otp.ts` to a real SMTP / transactional
   email provider — the OTP code is logged to stdout right now.
3. Swap the Prisma datasource to PostgreSQL (one line in `schema.prisma`) and
   set `DATABASE_URL` to your hosted DB.
4. Switch from data-URL photo storage to S3 (or similar) — see `Photo` model.
5. Front it with a CDN/edge that terminates TLS; cookies are already
   `Secure`-flagged automatically when `NODE_ENV=production`.

## Scripts

| Command                | What it does                                   |
|------------------------|------------------------------------------------|
| `npm run dev`          | Next.js dev server on port 3000                |
| `npm run build`        | Production build                               |
| `npm start`            | Serve the production build                     |
| `npm run setup`        | `prisma db push` + seed (first-time only)      |
| `npm run prisma:push`  | Sync schema to DB without seeding              |
| `npm run seed`         | Reset listings/claims/etc and re-seed          |
| `npm run prisma:generate` | Regenerate the Prisma client                |

## End-to-end flow (manual)

1. `npm run dev`
2. Open <http://localhost:3000> → Continue → enter `riya.m@iiitd.ac.in`.
3. Watch the server console for the OTP (also shown in the verify page in dev).
4. From the Home feed → FAB → "I Found Something" → post a listing.
5. Sign out, sign in as `anjali.s@igdtuw.ac.in`, open the listing, claim it.
6. Sign out, sign in as the original poster, open Activity → On My Posts →
   approve.
7. Either party opens the chat → Confirm receipt → listing flips to Returned.
8. `admin@igdtuw.ac.in` can see the whole thing under `/admin`.

That maps 1:1 to the screens in the original design bundle: Splash, Login, OTP,
Home Feed, Detail, Post (3 steps), Claim, Chat, Activity, Notifications, and
the Admin Dashboard.
