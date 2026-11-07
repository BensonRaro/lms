---
paths:
  - "frontend/**"
---

# Frontend — structure, UI, standards, design system

## Route organization

Group `frontend/app/routes/` by **feature area**, each folder holding its routes plus route-only components:

```
frontend/app/routes/
├── home/                  # public landing page only
├── auth/                  # login, register, forgot/reset password
├── courses/               # public catalog + course detail pages
├── learn/                 # the player: lesson (video + tabs), quiz attempt, assignment submit (enrolled/preview only)
├── dashboard/
│   ├── student/
│   ├── instructor/        # includes the course builder
│   └── admin/
└── routes.ts              # every route file must be registered here
```

- A component used by only one route folder stays in that folder's `components/`.
- Authenticated views never live in `home/`. `learn/` uses its own distraction-free layout (no dashboard chrome).
- Imports always use `@/`.

## `components/ui` — hand-built primitives

Tailwind-only, token-driven, accessible by default: `button`, `input`, `textarea`, `select`, `checkbox`, `radio`, `switch`, `badge`, `card`, `dialog`, `tabs`, `tooltip`, `progress`, `avatar`, `skeleton`.

- **Prefer native HTML** (`<dialog>`, `<details>`, `<select>`, `popover`, `<progress>`) before custom widgets.
- Custom widgets must handle focus trap/return, `Escape`, arrow-key navigation, and ARIA roles. For genuinely hard widgets (combobox, menu, date picker), **ask before adding a headless library**.
- Variants live in one typed variant map per primitive — no ad-hoc class strings in feature code.

## `components/globals` — reusable UI (2+ features)

```
frontend/app/components/globals/
├── loader/      # spinners, skeletons, page-level loading
├── error/       # error boundaries, inline errors, empty states
├── form/        # labeled inputs, form-field, select wrappers
├── table/       # hand-built DataTable (data-table, table-header, table-pagination, table-toolbar)
├── feedback/    # toast, confirm-dialog, alert-banner
├── learning/    # video-player-shell, curriculum-sidebar, lesson-tabs, progress-bar,
│                # transcript-panel, notes-panel, qa-panel, ai-panel, ai-draft-label, markdown-content
└── layout/      # page-header, section-card, dashboard-shell, connection-status
```

**DataTable (no Tanstack Table):** semantic `<table>` with `scope` headers; typed column config; **server-side** pagination/sorting/filtering driven by URL search params; built-in loading/empty/error states. Never sort or filter large datasets on the client.

## Standards

- **Server state = Tanstack Query only.** Query-key factory per resource (`courseKeys.detail(id)`); mutations invalidate precise keys; optimistic updates only where rollback is safe — never for grades or quiz submissions.
- **Forms:** Zod schemas, inline field errors, pending/disabled submit, no double submits. Confirm dialogs for irreversible actions (delete course, submit quiz, publish).
- **UI is not security.** Hiding a button isn't authorization — the backend enforces everything.
- **Every async view has four states:** loading, error (with retry), empty, data.
- **Performance:** paginate tables server-side, lazy-load heavy routes (course builder, charts), virtualize long lists, memoize only when measured. Never preload video the learner hasn't opened.
- **Accessibility (WCAG AA):** labeled inputs, full keyboard support, visible focus, sufficient contrast, `aria-live` for live updates, captions on video, color never the only signal, respect `prefers-reduced-motion`.
- **Responsive:** mobile-first for student views (learn, quiz, submissions); instructor/admin views desktop-first but fine on tablet. Verify at 360px, 768px, 1280px.
- Dates, durations, timestamps (`mm:ss`), and scores go through shared formatting utils.
- On logout: clear the Tanstack Query cache and close the WebSocket.

## Design system — "focused, warm, modern," original identity

Familiar learning patterns (curriculum sidebar, progress, tabs under the video), but a visual identity of our own — no copied layouts or styling. There's no component library to lean on, so consistency comes from discipline.

- **Tokens:** all color, radius, shadow, and spacing tokens are defined once (Tailwind 4 `@theme` / CSS variables in `app.css`) — never hardcoded hex in components. If no theme exists yet, ask for the primary (and accent) color. Ask whether dark mode is required.
- **Typography:** one restrained scale (one well-weighted family like Inter/Geist), ≤ ~5 font-size steps. The lesson reading view gets a comfortable measure (~65–75 characters) and generous line-height.
- **Spacing:** Tailwind's 4px-based scale — don't eyeball per component.
- **Motion:** subtle and purposeful (150–250ms, ease-out): hover/press, panel open/close, toast in/out. Nothing that distracts from the video.
- **Designed states:** intentional empty, loading (skeleton or spinner), and error states — never a bare "No data."
- **Progress is visible:** consistent progress bars and status badges (always icon + text, never color alone).
- **The player is the hero:** controls, captions, and the tabs beneath it get the most polish.
- **Icons:** lucide-react only.
