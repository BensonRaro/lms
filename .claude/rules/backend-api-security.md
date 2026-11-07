---
paths:
  - "backend/**"
---

# Backend — API standards & security

## API standards

- **Status codes:** 200/201/204 success, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 429 rate limited.
- **Lists:** paginated, return `{ data, meta }`. Cap `limit` at 100; whitelist sortable/filterable fields.
- **Error shape:** `{ error: { code, message } }` with a defined set of codes. Production errors never expose stack traces or internals.
- Wrap async handlers so rejected promises reach the error middleware. No swallowed errors, no empty `catch`.
- Strict types: no `any`, no `@ts-ignore`; derive types from Zod (`z.infer`) and Mongoose (`InferSchemaType` / `HydratedDocument`).
- Constants/enums for roles, statuses, limits, WS message types, and error codes — defined once.
- Add a `/health` endpoint that checks the DB connection.

## Access control

Deny by default: every route requires `requireAuth`; public routes are explicitly allow-listed. Enforce ownership/scope in the **service layer**, not only in middleware.

| Role | Can access |
|---|---|
| `student` | Published content of courses they're enrolled in, plus free-preview lessons; their own notes, progress, submissions, attempts, grades, AI conversations |
| `instructor` | Their own courses and those courses' enrollments, Q&A, submissions, grades, analytics — never other instructors' courses |
| `admin` | Users, course oversight, platform reports; grade changes only via an audited action |
| `superadmin` | System configuration; role management |

- Scope every query by the acting user (`where: { _id, ...scope }`) — prevents IDOR.
- Never trust the client for role, user id, grade, score, timer, enrollment, completion, or media URLs.
- Students never see other students' submissions, grades, notes, or AI conversations.

## Input & NoSQL injection

- Validate every body, query, and param with Zod `.strict()`; pick fields explicitly — no mass assignment.
- **Never pass `req.body` / `req.query` straight into a Mongoose filter.** Operator payloads like `{ "$ne": null }` bypass checks. Build filters from validated, typed fields; enable Mongoose `sanitizeFilter` as defense in depth.
- Validate ObjectIds (`isValidObjectId`) before querying; malformed id → 404.
- Return DTOs from explicit mappers — never raw documents (no internal fields, other users' data, answer keys).
- Render instructor-, learner-, and AI-generated content only through a sanitizing renderer; plain text for notes, Q&A titles, and comments.
- Use `helmet` and body-size limits.

## Sessions

- Cookies: `httpOnly`, `secure` in production, appropriate `sameSite`. Configure Better-auth `trustedOrigins`.
- On logout the client clears the Tanstack Query cache and closes the WebSocket.

## Uploads & media (Cloudinary)

- **Uploads are signed.** The browser uploads directly to Cloudinary with parameters signed by the backend (`POST /uploads/sign`). `CLOUDINARY_API_SECRET` never leaves the server; only the cloud name and upload preset name may be public.
- **Authorize the signature request** (role + ownership): only the course's instructor can sign lesson-video/resource uploads; only an enrolled student can sign a submission upload. Scope each signature to a fixed folder, resource type, and short-lived timestamp. Restrict formats and size in the upload preset **and** validate on the server.
- **Never trust a client-sent URL.** After upload, verify the asset and store `public_id` + metadata in MongoDB; build delivery URLs on the server.
- **Enrolled-only media is private** (authenticated delivery) and served through signed, expiring URLs generated after an enrollment/ownership check. Free-preview lessons are the only exception, and only for the flagged lesson.
- Verify Cloudinary notification-webhook signatures; make the handler idempotent.

## Rate limiting (`express-rate-limit`)

- Use [`express-rate-limit`](https://github.com/express-rate-limit/express-rate-limit) for all HTTP endpoints. No second limiter library.
- **Define named presets once** in `middlewares/rate-limit.ts` through one `createLimiter()` factory (shared `standardHeaders: 'draft-7'`, `legacyHeaders: false`, `keyGenerator`, `store`, custom `handler`). No inline `rateLimit()` in routes. Presets: `api` (default), `auth`, `ai-ask`, `upload-sign`, `progress`, `qa-post`.
- **Shared store in production.** The default in-memory store is per process and useless across instances. Pick an external store package (MongoDB or Redis) — ask before adding one.
- **Key by user id when authenticated, otherwise IP.** If the key uses the IP, use the library's IPv6-safe helper (`ipKeyGenerator`, if your installed version provides it).
- Configure Express `trust proxy` correctly; heed the library's validation warnings.
- `handler` returns `429` in the standard error shape; `standardHeaders` supplies `Retry-After`. Never reveal which key was limited.
- Strictest on: login/signup/password-reset (use `skipSuccessfulRequests: true` so only failures count), AI endpoints, upload-signature requests, Q&A/note posting.
- Better-auth ships its own rate limiting for `/api/auth/*`: configure that (persistent storage) rather than double-wrapping. Ask which layer owns auth-route limits.
- Store failures: decide per preset whether to fail open (`passOnStoreError`) or closed — closed for auth and AI, open for the general API — and always log store errors.
- Not covered: WebSocket messages and `upgrade` requests bypass Express middleware — see `realtime-ws.md`.

## Secrets & data

- Secrets (MongoDB URI, Better-auth secret, Gemini key, Cloudinary API secret) live in per-service `.env` files — never committed or hardcoded. Keep `.env.example` in sync.
- Validate env vars at startup with Zod and fail fast.
- No secrets, learner data, or tokens in logs. Log errors with context (request id, route, actor id) — never request bodies.
- Collect the minimum learner data needed.
