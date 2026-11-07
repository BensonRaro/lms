---
paths:
  - "backend/src/lib/ai/**"
  - "backend/src/services/ai-*"
  - "backend/src/controllers/ai-*"
  - "backend/src/inngest/**"
  - "frontend/app/components/globals/learning/**"
  - "frontend/app/routes/learn/**"
---

# AI learning assistance

AI **assists**; learners learn and instructors decide. Every AI feature is **grounded** in course content the learner can access, **cited**, **private**, **cost-controlled**, and **fail-safe** (the course works fully without AI).

## Learner features

1. **Ask about this moment** (the flagship). The learner pauses the video, asks a question; the request carries `{ lessonId, positionMs, question, conversationId?, selection? }`.
   - **Authorize first:** enrolled or free-preview lesson; no active timed graded attempt.
   - **Build context on the server** (`lib/ai/context/`, a pure, unit-tested function): transcript window around `positionMs` (default ±90s, tunable), current chapter title, the lesson's written tutorial (trimmed), section/course outline (titles only), and the last few turns of the conversation.
   - **Exclude:** locked/unpublished lessons, other courses, quiz/assignment answer keys, other learners' data.
   - **Respond** with a streamed answer plus structured `sources: [{ kind: "transcript", startMs, endMs } | { kind: "material", heading }]`. The UI renders timestamps as clickable seek links. **Validate every cited timestamp exists in the transcript** and drop invalid ones.
2. **Explain differently** — a fixed `intent` enum (`simpler`, `example`, `analogy`, `deeper`, `recap`) mapped to server-side prompt templates. Users never supply system prompts.
3. **Lesson summary & key takeaways** — generated once per transcript version (Inngest), stored, instructor-editable; learners see it labeled as AI-generated until approved.
4. **Practice questions / flashcards** — generated on demand for the lesson; **formative only** (never graded, never affects grades); cached; count-capped.
5. **Ask the whole course** — needs retrieval. **Ask before** adding embeddings or MongoDB Atlas Vector Search. Until then, AI is lesson-scoped.

Lessons with a graded assignment: AI gives concepts and hints, not complete solutions (default; instructor-configurable).

## Instructor features (draft-only)

Transcripts (if AI-sourced), chapter suggestions, lesson summaries, quiz-question drafts, assignment-feedback drafts, and **anonymized "common learner questions"** insights. Nothing AI-generated is published without instructor review. Store `source: "ai"`, model, and `promptVersion` on every AI artifact.

## Grounding & honesty

- Answer from course material first and cite it. If the course doesn't cover the question, **say so**; any general-knowledge answer is clearly labeled "Not covered in this course".
- Never attribute a statement to the instructor unless it's in the sources.
- Show a short "AI can be wrong — check the lesson" notice. Provide 👍/👎 feedback on answers (stored, no content logging beyond what the learner submits).

## Privacy

- AI conversations are **private to the learner**; instructors never see individual chats — only aggregated, anonymized insights above a minimum cohort size.
- Learners can delete their conversations. Retention policy: **ask**.
- Send no names, emails, or other identifiers to the model. Never use learner content for anything beyond the requested feature.

## Implementation standards

- **Backend only.** The Gemini key never reaches the client.
- **Stream answers over HTTP** (AI SDK `streamText`), not the shared WebSocket. Abort on client disconnect.
- **Structured tasks** use the AI SDK with Zod schemas; validate output and retry/fall back when invalid. Model output is never trusted for authorization or grading.
- **Prompt injection:** transcripts, materials, learner questions, and notes are *data* — delimit them clearly; never treat them as instructions.
- **Prompts** live in `lib/ai/prompts/` as versioned constants. Context builders and citation validators are pure functions with unit tests.
- **Cost & abuse control:** the `ai-ask` rate-limit preset per user, a daily per-learner cap, max context size, max output tokens, request timeouts. Cache summaries. Ask before adopting Gemini context caching.
- **Usage log** (user id, lesson id, intent, token counts, latency, status) without prompt or answer content.
- **Long jobs** run in Inngest with retries and idempotency keys; the UI shows job status.
- **Fail-safe:** if AI is slow or down, show a clear message; every other lesson feature keeps working. A 429 shows a friendly "daily limit reached" state.

## UI

- The **AI tab** sits under the video, plus a contextual **"Ask about this moment"** button that pauses the video and captures the timestamp.
- Streaming render with a **stop** button; clickable citations; the `ai-draft-label` on instructor-facing drafts.
- Designed states for loading, error, rate-limited, empty (suggested prompts), and no-sources.
- Accessibility: `aria-live="polite"` announces **completion**, not every token; fully keyboard operable.
