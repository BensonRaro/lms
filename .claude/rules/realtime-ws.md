---
paths:
  - "backend/src/ws/**"
  - "frontend/app/lib/ws/**"
---

# Real-time — native WebSockets (`ws`)

Native WebSockets give you no rooms, acks, or reconnect — build them deliberately, in small files under `backend/src/ws/` and `frontend/app/lib/ws/`.

## What goes over the socket

New Q&A replies, notifications, announcements, presence/typing in threads, and the instructor live-progress view. **Not** over the socket: video progress heartbeats (REST), AI answer streaming (HTTP via the AI SDK), and mutations.

## Connection & auth

- **Authenticate before accepting the connection** using the Better-auth session. Prefer `noServer: true` with a manual `upgrade` handler; if the host only supports `new WebSocketServer({ server })`, authenticate in the `connection` handler and close with `1008` before registering the socket anywhere.
- **Check `Origin` against the allow-list** (prevents cross-site WebSocket hijacking). Cookie auth works same-site; for cross-site, use a short-lived single-use ticket from an authenticated REST endpoint — ask which.
- Set `maxPayload` and drop slow consumers (check `bufferedAmount`).
- **Rate limiting:** `express-rate-limit` doesn't cover WebSockets. Keep a small per-connection message counter in `ws/` (close with `1008` on abuse) and a lightweight per-user/IP limit on upgrade attempts — ask before adding a library for this.

## Protocol

- One envelope: `{ v: 1, type, id?, payload }`. Define every message type once in a shared Zod discriminated union (`.strict()`), validate **both directions**, reject unknown types.
- **Default split:** mutations go through REST (validated, audited), then the server broadcasts. Client→server messages are limited to `subscribe`, `unsubscribe`, `typing`, and `presence`. Ask before moving mutations onto the socket.
- **Persist first, then emit.** Replies, notifications, and announcements are saved to MongoDB before broadcast. Typing and presence are ephemeral.

## Rooms & authorization

- Server-managed registry (`Map<room, Set<WebSocket>>`): `user:{id}`, `lesson:{id}` (Q&A), `course:{id}` (announcements). Rooms are never client-chosen.
- **Re-check authorization on every `subscribe`** (enrolled? instructor of the course? lesson accessible?). When enrollment is revoked or a lesson/course is unpublished, remove the user from its rooms immediately.
- **Never broadcast sensitive data to a shared room.** Grades and feedback go to `user:{id}` only, as an id + type notification; the client refetches via REST.
- Clean up on `close`/`error` so the registry never leaks.

## Reliability

- Server heartbeat: `ping` every ~30s, terminate sockets that miss a `pong`.
- Client reconnects with exponential backoff + jitter, resubscribes, then **refetches via REST to catch missed events** (WebSockets don't replay). Use a `since` cursor for Q&A catch-up.
- Show connection state (`connecting | open | reconnecting | closed`) and a clear banner when live updates are paused.

## Client

- **One shared `WsClient`** in `frontend/app/lib/ws/` with a typed `on(type, handler)` API.
- Handlers invalidate Tanstack Query keys — they never become a second source of server state.
- Clean up subscriptions on unmount; close the socket on logout.
