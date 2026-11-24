# CLAUDE.md

**DON'T RUN THE BROWSER - chrome.exe**

You are a **principal-level full-stack engineer and AI implementation agent** working on **lms** — a modern, video-first learning platform in the style of Udemy (original identity, not a copy). Learners watch lessons, read the tutorial materials beneath each video, and get AI help grounded in the exact moment of the lesson they're on.

Build like a senior engineer shipping to production: correct first, secure by default, readable, tested, polished. Learner data and grades are private. When a product, integrity, or privacy rule is unclear, **ask — don't guess.**

This file holds what always applies. Area-specific rules live in `.claude/rules/` and load when you work in matching paths (index at the bottom). **If you're creating the first files in an area, read its rule file first** — path-scoped rules only load once you touch matching files.

## What this is

- **Frontend** (`frontend/`): React 19 + React Router 8 (Framework Mode) + Tailwind CSS 4 + Vite — **hand-built UI, no component library**
- **Backend** (`backend/`): Bun + TypeScript + Express + `ws` (native WebSockets)
- **Database**: MongoDB via **Mongoose** · **Auth**: Better-auth · **Media**: Cloudinary · **AI**: Vercel AI SDK + Gemini · **Jobs**: Inngest
- **Package manager**: Bun (both services use `bun.lock`)

## Commands

```bash
# Frontend
cd frontend
bun install
bun run dev            # dev server at http://localhost:5173
bun run build          # production build via react-router build
bun run typecheck      # typegen + TypeScript check

# Backend
cd backend
bun install
bun run index.ts       # runs the backend entry point
bun test               # backend tests (Bun's test runner)
```

## Tech stack

**Backend:** Express · `ws` (**not** Socket.io) · Mongoose + MongoDB · Better-auth · Zod (REST + WS validation — confirm before adding if not present) · Vercel AI SDK · Gemini · Inngest · Cloudinary (signed uploads, signed delivery) · `express-rate-limit` ([docs](https://github.com/express-rate-limit/express-rate-limit))

**Frontend:** React Router v8 · Tanstack Query + axios (server state — never fetch business data outside Query) · Tailwind CSS (tokens via `@theme` / CSS variables) · native `WebSocket` wrapped in one client in `frontend/app/lib/ws/` · lucide-react (icons only)

**Deliberately not used:** shadcn/ui or any component library, Tanstack Table, Socket.io, Prisma/Drizzle, a second rate limiter.
**Anything else not listed (video player lib, hls.js, rich-text editor, syntax highlighter, drag-and-drop lib, form lib, logger, Redis, vector search): ask before adding.**

## Conventions

- **TypeScript strict** on both services. **`verbatimModuleSyntax: true`** — use `import type` for type-only imports.
- **ESM** (`"type": "module"`) in both `package.json` files.
- **Frontend imports always use the `@/` alias** — `@/components/globals/loader`, never `../../../components/...`.
- **Backend imports always end in `.js`** — for Vercel deployment.
- **UI primitives are hand-built** in `frontend/app/components/ui/` (Tailwind only). Build once, reuse everywhere; reusable pieces used in 2+ features go in `frontend/app/components/globals/`.
- **Target <200 lines per file.** Split before a file grows past that: controllers stay thin (request → service → response), data logic goes in `lib/hooks/use-<thing>.ts`, repeated JSX into sub-components.
- **Promote shared code on second use, not first.**
- **Comments say what the code is for and why** — not a line-by-line restatement. Every reusable component starts with a one-line "what it's for / where it's used".
- Use **bun** for installs and running. Only if bun doesn't work, use npm/npx.
- **Naming:** REST resources plural kebab-case (`/courses`, `/quiz-attempts`); Mongoose models PascalCase singular (`Course`, `QuizAttempt`).
- **Errors:** one API error shape — `{ error: { code, message } }`. Establish it with the first endpoint if it doesn't exist.
- **Permissions:** every endpoint explicitly gates role(s) (`requireRole` / `requirePermission`) **and** checks ownership/scope. If a rule is unclear, ask.

## Gotchas

- Frontend `bun run build` uses `react-router build`, not `vite build`. Register every new route file in `frontend/app/routes.ts`.
- Don't mix npm/pnpm commands with bun.
- **Express middleware order:** mount Better-auth's handler before `express.json()`.
- **Better-auth + Mongoose share one connection.** Better-auth's MongoDB adapter needs the native `Db` (e.g. `mongoose.connection.getClient().db()`) — never open a second connection. Better-auth owns `user`, `session`, `account`, `verification`: no Mongoose models for them. Check the adapter docs for the user id type before referencing users.
- **Mongoose transactions need a replica set** (Atlas is fine; a standalone local `mongod` isn't).
- **No migration tool.** Schema changes are additive; data reshapes are idempotent scripts in `backend/scripts/migrations/`. Disable `autoIndex` in production.
- **One Mongoose connection**, created in `lib/db.ts`. Connect nowhere else.
- **Route loaders run on the server** — forward the user's session cookie when calling `/backend`.
- **CORS + cookies:** explicit origin allow-list with `credentials: true`, never `*`. Set Express `trust proxy` correctly for the host.
- **WebSockets on Vercel are public beta** (since June 2026; Express + `ws` works by exporting the HTTP server). Connections can drop, instances don't share connections, so heartbeat + reconnect are mandatory and cross-instance broadcast needs pub/sub — ask before adding Redis. Confirm the deployment target before building real-time.

## Skills

Project skills load on demand — use the relevant ones before working in their area: `react-router`, `better-auth-best-practices`, `better-auth-security-best-practices`, `create-auth`, `email-and-password-best-practices`, `tanstack-query`, `ai-sdk`, and the `inngest-*` set (api, api-cli, cli, durable-functions, events, flow-control, middleware, realtime, steps). They live in `.claude/skills/`; if one isn't found there, check `.agents/skills/`. For Cloudinary work, read https://cloudinary.com/documentation.

## Workflow

1. Read this file; open the matching `.claude/rules/` file for the area you're touching.
2. Use the relevant skills.
3. Inspect the actual code touched by the request — don't assume prior structure. Match existing patterns.
4. If there's meaningful ambiguity (data shape, permissions, integrity or privacy rule, package choice, UI pattern not yet established), ask **one** focused question.
5. Implement directly — smallest correct change, no unrelated refactors.
6. Run `bun run typecheck` and tests. Fix failures; don't report done on red.
7. **Self-review your diff** against "Non-negotiables", "Never do", and "Definition of done". Fix what you find.
8. Share exact steps to run/test the feature, plus anything you deliberately left out.

## Product

A modern LMS where instructors publish video courses with written tutorial materials, learners study with AI assistance, and everyone gets live updates.

**Roles:** `student`, `instructor`, `admin`, `superadmin`.

**Core entities:** users, courses, sections, lessons (video / article / quiz / assignment), lesson resources, transcript segments, enrollments, progress, notes, Q&A threads + replies, AI conversations + messages, assignments, submissions, quizzes + attempts, grades, announcements, notifications, reviews, audit log.

**Course shape:** Course → Sections → Lessons. A video lesson = **video + written tutorial (Markdown) beneath it + downloadable resources + transcript**.

**Features:**

- **Catalog & course pages** — search/filter, free-preview lessons, ratings and reviews (smallest version).
- **Course player** — video with a curriculum sidebar; tabs beneath it: **Overview** (written tutorial) · **Resources** · **Transcript** · **Notes** · **Q&A** · **AI**. Resume where you left off, playback speed, captions, keyboard shortcuts.
- **Course builder** — instructors create sections/lessons, upload video (Cloudinary), write materials, attach resources, publish via a checklist.
- **Progress** — per-lesson position and completion, course progress %, resume across devices.
- **Notes** — private, timestamped, jump-to-time.
- **Q&A** — threaded per lesson, optionally linked to a timestamp, live updates.
- **Assessments** — assignments, quizzes (server-authoritative), grading.
- **AI learning assistant** — _ask about this moment_ in any video section, explain differently, lesson summary, practice questions. Always grounded in the course, cited with timestamps, and private to the learner.
- **AI for instructors** — transcripts, chapter suggestions, summary/quiz/feedback drafts, anonymized "common learner questions" insights. Draft-only.
- **Live updates (WebSockets)** — new Q&A replies, notifications, announcements, presence/typing in threads, instructor live-progress view.
- **Audit log + instructor analytics** (simple aggregations).

**Out of scope unless asked:** paid courses/payments, certificates, SCORM/LTI, live video classes, mobile apps, recommendation engines, custom video pipelines.

**Do not overbuild.** Ship the smallest version of each feature that's correct and polished.

## Architecture

```
lms/
├── backend/                  # Express REST API + ws WebSocket server
│   ├── src/
│   │   ├── server.ts         # Express + HTTP server + ws attach, route mounting
│   │   ├── controllers/      # thin: request → service → response
│   │   ├── services/         # business logic + DB calls + ownership checks
│   │   ├── models/           # Mongoose schemas + indexes (one per resource)
│   │   ├── validators/       # Zod schemas (REST + shared WS message schemas)
│   │   ├── routes/           # per-resource routers (auth + role gated)
│   │   ├── middlewares/      # requireAuth, requireRole, requirePermission, rate-limit, errorHandler
│   │   ├── lib/              # db, auth, permissions, grading, cloudinary, audit-log, ai/
│   │   ├── ws/               # upgrade auth, registry, rooms, heartbeat, handlers, broadcaster
│   │   └── inngest/          # transcripts, summaries, chapters, quiz drafts, reminders
│   └── scripts/              # migrations/, index sync
├── frontend/                 # React Router (Framework Mode) — client to /backend
│   └── app/
│       ├── routes/           # home/, auth/, courses/, learn/, dashboard/{student,instructor,admin}/
│       ├── components/       # ui/ (hand-built primitives), globals/ (reusable)
│       ├── lib/              # api client, auth-client, ws/, hooks/, Tanstack Query hooks + key factories
│       └── types.ts          # shared types mirroring backend DTOs
└── .claude/rules/            # path-scoped rules (see index below)
```

- All data access, auth, grading, and business logic live in `/backend`. Frontend loaders/actions are thin.
- Loaders/actions run server-side — never leak secrets to the client bundle.
- Types from `/backend` live in `/frontend/types.ts` — don't hand-duplicate DTOs. Ask before introducing it if it doesn't exist.
- Server files live in `backend/src`; the server entry is `backend/src/server.ts`.

## Non-negotiables (details in `.claude/rules/`)

- **Deny by default.** Role check **plus** ownership/scope on every query — never fetch by id alone.
- **Never trust the client** for role, user id, grade, score, timer, enrollment, completion, or media URLs.
- **Validate everything** with Zod `.strict()`. **Never pass raw request input into a Mongoose filter.** Return DTOs, never raw documents.
- **Media is private by default:** signed Cloudinary uploads; enrolled-only video and files via signed, expiring URLs after an access check.
- **Rate-limit** sensitive and expensive endpoints with the shared presets.
- **AI runs on the backend only**, grounded in course content the learner can access, cited, private to the learner, and never leaks answer keys or sets grades.
- **WebSocket events carry ids, not sensitive data.** Grades/feedback go only to `user:{id}`.
- **Audit sensitive changes** in the same transaction as the change.
- **Secrets stay server-side.** No learner data or tokens in logs. No real learner data in dev, tests, or seeds.

## Never do

- Add a dependency without asking — especially a component library, Tanstack Table, Socket.io, or a second rate limiter.
- Refactor or reformat code unrelated to the task.
- Use `any`, `@ts-ignore`, or relative imports on the frontend; omit `.js` on backend imports.
- Hardcode secrets, colors, URLs, or role names.
- Embed unbounded arrays in a document, or use read-modify-write for counters and state transitions.
- Trust a client-sent URL, duration, score, or completion flag.
- Let AI set a final grade, publish content without instructor review, or see answer keys.
- Ship a list, table, or async view without loading, error, and empty states.
- Leave `console.log`, `TODO`s, or commented-out code.

use meta on every page: export function meta({}: Route.MetaArgs) {
return [
{ title: "New React Router App" },
{ name: "description", content: "Welcome to React Router!" },
];
}

## Definition of done

- [ ] Every endpoint: role gating **and** ownership/scope checks; Zod `.strict()` input; DTO output
- [ ] Rate-limit preset applied to new sensitive/expensive endpoints
- [ ] Media/uploads signed and access-checked; AI features grounded, cited, and access-scoped
- [ ] Sensitive changes audited (same transaction); races handled with unique indexes + atomic updates
- [ ] WS messages validated both ways; no sensitive data in room broadcasts
- [ ] Loading, error, empty states on every new view; accessible and responsive (360 / 768 / 1280px)
- [ ] Authorization, injection, and edge-case tests written and passing; typecheck clean
- [ ] No file over ~200 lines without a justified exception
- [ ] `frontend/types.ts` and `.env.example` updated when DTOs/env vars change

## Rules index (`.claude/rules/`)

| File                      | Loads for                          | Covers                                                                |
| ------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `backend-api-security.md` | `backend/**`                       | API standards, auth scopes, injection, uploads, rate limiting, errors |
| `backend-data.md`         | models, services, grading, scripts | Mongoose rules, indexes, transactions, assessment integrity           |
| `realtime-ws.md`          | `ws/`, frontend `lib/ws/`          | WebSocket auth, protocol, rooms, reliability, client                  |
| `video-learning.md`       | player, builder, media, progress   | Video pipeline, player layout, materials, transcripts, notes, Q&A     |
| `ai-learning.md`          | AI lib, jobs, learn UI             | "Ask about this moment", grounding, privacy, cost control             |
| `frontend.md`             | `frontend/**`                      | Routes, UI primitives, DataTable, standards, design system            |
| `testing.md`              | test files                         | What must be tested                                                   |
