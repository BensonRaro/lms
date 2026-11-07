---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "backend/tests/**"
---

# Testing

Bun's test runner by default. New backend services get a happy-path test plus the main edge and failure cases. Run typecheck and tests before reporting done.

- **Authorization (every endpoint):** wrong role → 403, out-of-scope course/learner → 403/404, unauthenticated → 401.
- **Injection:** operator payloads (`{ "$ne": null }`) and malformed ObjectIds are rejected.
- **Assessment:** expired attempt rejected, double-submit idempotent, second active attempt blocked, answer key absent from student DTOs, grade change audited.
- **Races:** duplicate enrollment, concurrent state transitions, stale progress heartbeat can't overwrite a newer position.
- **Media:** unauthorized upload-signature request rejected, signature scoped to folder/type, client-sent URLs ignored, locked-lesson video URL refused, expired URL refresh works.
- **AI:**
  - Context builder includes only accessible lessons and the right transcript window; excludes answer keys and other courses.
  - Citation validator drops timestamps that don't exist in the transcript.
  - AI blocked during an active timed graded attempt.
  - Prompt-injection text in a transcript or question is treated as data (use a mocked model).
  - Daily cap and `ai-ask` limiter return 429 with `Retry-After`.
- **Rate limits:** limit exceeded → 429 + `Retry-After`; limits shared across instances (store-backed); authenticated users keyed by id.
- **WebSockets:** unauthenticated/bad-origin upgrade rejected, unauthorized `subscribe` rejected, revoked enrollment removes room membership, invalid message rejected, message flood closed with `1008`, no sensitive data in room broadcasts.
- **Frontend:** test shared hooks and logic (including the WS client's reconnect and the player's progress heartbeat) over one-off UI.
