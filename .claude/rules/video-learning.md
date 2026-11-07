---
paths:
  - "frontend/app/routes/learn/**"
  - "frontend/app/routes/dashboard/instructor/**"
  - "backend/src/lib/cloudinary/**"
  - "backend/src/**/*{lesson,video,upload,progress,transcript,note,thread}*"
---

# Video learning — player, materials, transcripts, notes, Q&A

## Lesson model

- Course → Section → Lesson. Lesson types: `video | article | quiz | assignment`.
- A **video lesson** = video + **written tutorial** (Markdown) shown beneath it + resources + transcript + optional chapters.
- Lessons have `status` (`draft | published`) and `isPreview` (free-preview lessons are viewable without enrolling; nothing else is).

## Video pipeline

1. Instructor uploads via a **signed direct Cloudinary upload** (chunked for large files, with progress and cancel).
2. Lesson video status: `uploading → processing → ready | failed`. Track it through the verified, idempotent Cloudinary webhook; the UI shows the status.
3. On `ready`, an **Inngest** job (idempotency key: `lessonId + transcriptVersion`) obtains the transcript, then drafts summary and chapters for instructor review.
4. **Publishing is blocked** until at least one lesson is `ready` and the publish checklist passes. Warn (don't block) when a video lesson has no captions.

Limits (max file size, max duration, allowed formats) live in one config — ask for the values.

## Delivery & access

- Stream with Cloudinary adaptive streaming via **signed, expiring URLs**, generated on the server **after** an enrollment/preview check. The client never builds a media URL.
- The player must handle URL expiry (403/401) by requesting a fresh URL and resuming at the same position.
- Resources (files) are downloaded through signed URLs after the same access check.

## Player & layout

- **Start with the native `<video>` element** (`controls`, captions via `<track>` from the transcript VTT). Ask before adding a player library (Cloudinary Video Player, hls.js, Vidstack) or building fully custom controls.
- **Desktop:** player + curriculum sidebar; **tabs beneath the player:** `Overview | Resources | Transcript | Notes | Q&A | AI`. **Mobile:** sticky player, tabs below, curriculum in a drawer.
- **Deep links:** tab and time live in the URL (`?tab=notes&t=135`). Validate `t` (integer seconds, within the video's duration) before seeking.
- Playback speed and volume are remembered per device. Keyboard shortcuts (space/`k` play-pause, `j`/`l` ±10s, `f` fullscreen, `m` mute, `c` captions) are **disabled while the user is typing** in any input.
- Next-lesson auto-advance is opt-out and shows a cancellable countdown.

## Progress & resume

- The server stores `lastPositionMs` and `completedAt` per `{ user, lesson }` (unique index).
- Client sends a **heartbeat** (~every 15s while playing, plus on pause and on page hide) through the `progress` rate-limit preset. Use idempotent upserts, validate `0 ≤ position ≤ duration`, and **never let a stale heartbeat overwrite a newer position**.
- Auto-complete at ≥90% watched **or** manual "mark complete". Course progress % is **derived on the server** from lesson completion — never trusted from the client.
- Resume works across devices.

## Tutorial materials beneath the video

- **Overview tab:** the lesson's Markdown tutorial, rendered through a sanitizing renderer; code blocks get a copy button. Ask before adding a Markdown renderer, syntax highlighter, or rich-text editor (default authoring: Markdown textarea + preview).
- **Timestamp links** in materials (e.g. `?t=135`) seek the player.
- **Resources tab:** `LessonResource` = `{ title, kind: file | link | snippet, ... }`. Files go through Cloudinary (signed delivery); links are validated (https only).

## Transcript

- Stored as `TranscriptSegment { lesson, startMs, endMs, text }` in its own collection, indexed `{ lesson, startMs }`, with a `transcriptVersion` on the lesson. Changing the transcript bumps the version and re-queues dependent AI artifacts.
- **Source** is either an instructor-uploaded VTT/SRT or an AI transcription job — **ask which** before building.
- The Transcript tab supports click-to-seek and search, with an optional "follow along" auto-scroll that users can turn off.

## Notes

- Private, per learner, timestamped, plain text, length-capped. CRUD with jump-to-time. Rate-limited.

## Q&A

- Threads per lesson, optionally anchored to a timestamp. Replies persisted via REST, then broadcast (`realtime-ws.md`). Instructor replies get a badge.
- Instructors can hide/delete posts (audited). Plain text only, length-capped, rate-limited (`qa-post`).
- Ask before adding upvotes or marking answers as accepted.

## Course builder (instructors)

- Reorder sections/lessons with **move up/down controls first**; ask before adding a drag-and-drop library (it needs a keyboard alternative anyway).
- Autosave drafts; show video processing status inline; publish checklist (title, description, ≥1 ready lesson, price/visibility settings as applicable).

## Catalog

- Search/filter/sort server-side with pagination. Default to a MongoDB text index; ask before adding Atlas Search.
- Reviews: only enrolled learners with meaningful progress (threshold: ask); one review per `{ course, user }` (unique index).
