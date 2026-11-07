---
paths:
  - "backend/src/models/**"
  - "backend/src/services/**"
  - "backend/src/lib/grading/**"
  - "backend/scripts/**"
---

# Backend — Mongoose data & assessment integrity

## Mongoose rules

- Every schema: `timestamps: true`, `strict: true`, typed, with indexes declared in the schema. Index foreign-key fields and filter/sort fields.
- **Business rules live in unique/compound indexes.** Examples: one enrollment per `{ course, user }`; one progress doc per `{ user, lesson }`; one active attempt per `{ quiz, user }`; transcript segments indexed `{ lesson, startMs }`.
- **Embed only bounded data read together; reference everything that can grow.** Never embed unbounded arrays (submissions, replies, notes, AI messages, transcript segments, attempts) in a parent document.
- **Atomic updates for races.** `findOneAndUpdate` with conditions and `$inc` / `$push` for counters, enrollment limits, and state transitions — never read-modify-write.
- **Denormalized counters** (course lesson count, enrollment count, reply count) are updated atomically and recomputable by a script.
- **Transactions** (`session.withTransaction`) for multi-document writes. The audit-log entry is written in the **same transaction** as the change it records.
- **Reads:** `.lean()` + `.select()` on read paths; avoid N+1 `populate` — prefer one aggregation or one batched query.
- **Soft delete** (`deletedAt`) for records with history (users, courses, submissions, grades); hard delete only for ephemeral data and learner-initiated deletes (notes, AI conversations).
- **Audit log is append-only** — no update/delete endpoints. Store before/after of changed fields only, never secrets.
- **Time:** store UTC; display via one shared util.
- **Migrations:** schema changes are additive and backward-compatible; reshapes go in idempotent scripts under `backend/scripts/migrations/`. `autoIndex` off in production; sync indexes through a reviewed script.

## Assessment integrity

- **Grades are computed server-side** in one place (`lib/grading`), including rounding and weighting. The client never computes or submits a grade.
- **Quiz attempts are server-authoritative.** The server records `startedAt` and the deadline; the client timer is cosmetic. Late/expired submissions are rejected.
- **Answer keys and correct answers never reach the client** before submission and never appear in student DTOs. Reveal only per the instructor's setting, after submission.
- **One active attempt** per student per quiz (unique/partial index); submissions are idempotent; question/option randomization happens on the server.
- **Deadlines and late policy** are enforced server-side in UTC.
- **Grade changes are audited** (who, when, old → new, reason).
- **AI never sets a final grade.** AI feedback on subjective work is a draft for the instructor unless they explicitly enable formative AI feedback for students.
