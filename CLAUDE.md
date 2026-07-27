# Frontend — QR Feedback System (Next.js Admin Portal + Public Form)

This is the **frontend repo** for the QR Feedback System. It is its own git repository, separate from the backend repo (`../QRcode-system-backend`). See `../../CLAUDE.md` (root) for the full business context, requirements, and day-by-day project plan.

**Tech stack locked 2026-07-23.**

## Tech Stack
- **Framework:** Next.js + TypeScript + Tailwind CSS
- **Auth:** Supabase Auth (session handling, protected routes)
- **API:** Calls the NestJS backend (`NEXT_PUBLIC_API_BASE_URL`)
- **Media:** Cloudinary (upload widget or signed upload, per Open Decision #6 in root doc)
- **Deployment:** Vercel

## Two Distinct Surfaces in This Repo
1. **Admin Portal** (`/clients`, `/login`, etc.) — internal dashboard for the client's team (including a non-technical VA). Login required. Client/site CRUD, CSV bulk upload UI, QR preview/download, deactivate/delete flows. **Login + client/site CRUD + QR preview/download + delete confirmation modals are built** (Phase A + Day 3 Hr 7, see below) — CSV bulk upload UI is still pending (Phase C, paused — see root `CLAUDE.md` for why).
2. **Public Feedback Form** (`/{slug}`) — the page a customer lands on after scanning a QR code. No login. Auto-populates business/site name from the slug, collects feedback text + optional mobile number + photo/video upload. **Built 2026-07-25** (Day 4 Hr 1–4; Hr 6/8 hardening still pending) — see below.

## Dev Server Port
Runs on **port 3001** (`next dev -p 3001` in `package.json`), not Next's default 3000 — the backend already occupies 3000, and both need to run simultaneously during development. `NEXT_PUBLIC_API_BASE_URL` points at the backend on 3000.

## Environment Variables
See `.env.example`. Never commit `.env*.local` or paste real secrets into a prompt. Required:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_BASE_DOMAIN`.

## Critical Rules
- **Never use the Supabase service role key here.** Only the anon key belongs in the frontend. All privileged writes (ClickUp sync, etc.) go through the backend API.
- **Public form fields must exactly match the client's existing Jotform minus "Business Name" and "Suburb"** — those two are auto-populated from the scanned slug, never typed by the customer.
- **Mobile number is optional** on the public form — do not make it required.
- **Inactive/deleted slug must show a friendly fallback page**, not an error — and must never trigger a ticket/notification.
- **CSV bulk upload UI must show per-row results** (success/error), not just a single pass/fail toast — mirrors the backend's `csv_upload_batches`/`csv_upload_rows` tracking.
- **QR downloads support PNG and PDF (A4/A5) — deliberately no JPG.** JPEG's lossy compression can break QR scannability; matches the backend's PNG-only decision. Don't add JPG later without a real reason.
- **Every `<Link>` in the admin dashboard uses `prefetch={false}`.** See "Known bugs fixed" below — this isn't a style choice, removing it can reintroduce a real auth failure.

## Auth, Dashboard, Client/Site CRUD, QR Preview (Phase A — Day 3 Hr 2, 3, 4, 6, implemented 2026-07-25)

Built as one combined session since they're tightly coupled (nothing else works without auth; the dashboard shell is a prerequisite for every other page).

- **`src/lib/supabase/client.ts` / `server.ts` / `middleware.ts`** — the standard `@supabase/ssr` three-client pattern for Next.js App Router: browser client, Server Component/Action client (reads/writes cookies via `next/headers`), and a middleware/proxy client that refreshes the session on every request.
- **`src/proxy.ts`** — Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` (confirmed via the build's own deprecation warning and the framework's docs) — this project uses the new name from the start, exporting a `proxy` function, not `middleware`. Redirects unauthenticated visitors to `/login`, and authenticated visitors away from `/login` to `/clients`. **Its matcher explicitly excludes `/api/*`** — those routes do their own auth check server-side and must return real JSON (e.g. `401`), not an HTML redirect; the initial version didn't exclude `/api/*` and broke the QR proxy route (see below), caught and fixed 2026-07-25.
- **`src/app/login/`** — `page.tsx` (client component, `useActionState`) + `actions.ts` (`login`/`logout` Server Actions using the server Supabase client, so cookies get set correctly).
- **`src/app/(dashboard)/layout.tsx`** — sidebar/nav shell wrapping all admin routes (route group, doesn't affect the URL).
- **`src/app/(dashboard)/clients/`** — list page (table: name, client code, sites count, status, edit/delete), `new/page.tsx` + `[id]/edit/page.tsx` sharing one `ClientForm.tsx` component (reused for create + edit, per the roadmap's explicit instruction), and `actions.ts` (Server Actions calling the backend via `src/lib/api/server-fetch.ts`).
- **`src/app/(dashboard)/clients/[id]/page.tsx`** — client detail page: sites grid, each card showing a live QR preview, PNG/PDF A4/PDF A5 download links, and edit/delete.
- **`src/app/(dashboard)/clients/[id]/sites/`** — same create/edit-form-reuse pattern as clients (`SiteForm.tsx` + `actions.ts`).
- **`src/lib/api/server-fetch.ts`** (`apiFetch`) — server-side-only helper (Server Components/Actions) that pulls the current session's access token and attaches it as `Authorization: Bearer <token>` when calling the backend. Throws a typed `ApiError` with the backend's message so forms can show it inline.
- **`src/app/api/qr/[siteId]/route.ts`** — a Route Handler that **proxies** the backend's `GET /sites/:id/qr`. This exists because a plain `<img src>` or download `<a href>` can't attach an `Authorization` header — the browser hits this same-origin route instead, which runs server-side, reads the session from cookies, and forwards the request to the backend with the header attached, streaming the image/PDF bytes straight back.

### Known bugs found and fixed during this session
1. **Deprecated `middleware.ts` convention** — Next.js 16 wants `proxy.ts` + an exported `proxy` function instead. Fixed before it ever shipped as `middleware.ts`.
2. **Link prefetching raced Supabase's refresh-token rotation.** Next.js prefetches every visible `<Link>` by default (hover/viewport). Each prefetch re-ran the proxy, which calls `supabase.auth.getUser()` and can trigger a session refresh. Supabase rotates the refresh token on each refresh, invalidating the previous one — several prefetches firing close together could race and invalidate a token the user's next real action then tried to use, surfacing as a `401 Invalid or expired token` error straight out of the backend's `SupabaseAuthGuard`. Reproduced live (user hit it creating a site) and fixed by adding `prefetch={false}` to every dashboard `<Link>` — appropriate for an internal admin tool where prefetch speed doesn't matter. If more `<Link>`s get added later, carry this forward; don't drop it as unnecessary boilerplate.
3. **`/api/*` routes being caught by the proxy's auth redirect** — see the `src/proxy.ts` bullet above. Would have made the QR `<img>` preview silently render as a broken image (HTML redirect body instead of image bytes) the moment a session was near expiry.
4. **Dark-mode CSS var flip made form input text invisible.** `globals.css`'s scaffold-default `@media (prefers-color-scheme: dark)` block flipped the body's text color to near-white; form inputs have no explicit text color of their own, so on a white input background under a dark-mode browser/OS, typed text was white-on-white (invisible). Fixed by removing the dark-mode override entirely — this admin UI is explicitly light-themed throughout (`bg-white`, `text-gray-900`, etc. everywhere), it was never meant to adapt to OS dark mode, so the override was pure liability with no working dark theme behind it anyway.

Verified end-to-end in a real browser 2026-07-25 (screenshots reviewed): login page renders with visible text, sign-in works, client list shows created clients, client detail page renders a real scannable QR code plus all three download links, edit/delete work, sign-out returns to `/login`.

## Delete Confirmation Modals (Day 3 Hr 7 — implemented 2026-07-26)

`src/components/ConfirmDeleteButton.tsx` — used on both the clients list (delete client) and the client detail page (delete site). Previously, "Delete" submitted a plain form immediately with no confirmation step.

- Server Actions can be called **directly as functions** from a Client Component, not just via `<form action={...}>` — that's what makes this component possible. `handleConfirm` calls the bound action (e.g. `deleteClientAction.bind(null, client.id)`) inside `useTransition`, which gives a real pending state ("Deleting…") for the confirm button while the action runs.
- The modal shows a **dynamic warning** when relevant, not just a generic "are you sure": deleting a client with sites shows the site count and a note that deletion will fail if any site has feedback history; deleting a site shows the same feedback-history caveat. This directly reflects the `ON DELETE RESTRICT` behavior already built and verified in the backend (Day 1 Hr 7/8) — the modal is explaining real backend behavior, not inventing a generic disclaimer.
- **Deliberately scoped to Delete only, not "Deactivate."** The roadmap's Day 3 Hr 7 wording bundles "Deactivate/Delete confirmation modals" together, but deactivating happens through the Edit form's status dropdown (open edit page → change status → Save) — that multi-step flow is already a deliberate action with its own friction, so no separate confirmation modal was added for it. Delete is the one that's actually a quick single click with no undo, which is what a confirmation step is for.

Structurally verified (build + page load), same limitation as other client-interactivity features (Server Actions, click-through flows) — the actual open/cancel/confirm click sequence needs a real browser to confirm.

## Admin Dashboard Responsive Polish (Day 3 Hr 8 — implemented 2026-07-26)

The sidebar had no mobile handling at all before this — a fixed `w-56` persistent `<aside>` with no breakpoint logic, which would squeeze page content on any narrow viewport.

- **`src/app/(dashboard)/DashboardNav.tsx`** — replaces the sidebar markup that used to live directly in `layout.tsx`. Below the `md` breakpoint: a slim top bar with a hamburger button that opens a slide-in drawer (backdrop + `Escape`-free close-on-backdrop-click) containing the same nav links. At `md` and above: the original persistent sidebar, unchanged in appearance. `NavLinks` is a single shared sub-component rendered in both places so the drawer and the desktop sidebar can't drift out of sync with each other.
- Clients list table wrapped in `overflow-x-auto` with `min-w-[640px]` on the table itself, so it scrolls horizontally on narrow screens instead of squeezing columns unreadably — a `<table>` genuinely can't reflow into a mobile-friendly shape without becoming a different UI entirely, and horizontal scroll is the standard, low-risk fix.
- Page header rows (clients list toolbar, client detail header, sites section header) changed from a fixed `flex justify-between` to `flex-col gap-3 sm:flex-row sm:justify-between` — stacks vertically on mobile instead of cramping a long client name against an action button.

**A note on debugging this while live-testing:** partway through testing, the user hit a Next.js dev-overlay error ("An unexpected response was received from the server," flagged `(stale)` in the dev overlay) after clicking through the new hamburger menu. This was **not a real bug** — it was a stale-bundle artifact from the dev server having been restarted several times during the session while an old browser tab stayed open, referencing a Server Action ID from a prior server process. Confirmed by closing the tab, opening a fresh one, and reproducing the exact same flow successfully. If this resurfaces during future dev sessions after a server restart, a full tab close-and-reopen (not just a refresh) is the fix — not a code investigation.

## Public Feedback Form (Day 4 Hr 1–8 — implemented 2026-07-25, mobile pass completed 2026-07-26)

- **`src/lib/supabase/middleware.ts` protection model inverted.** Previously "public unless in `PUBLIC_PATHS`" (just `/login`); now "protected only under `PROTECTED_PREFIXES`" (just `/clients`). This had to change the moment a second public surface (`/{slug}`, dynamic, can't be listed as a fixed path) existed — the old allowlist model doesn't work for a route that isn't a fixed string. `/`, `/login`, and every `/{slug}` are public by design now, not "public because nobody protected them."
- **`src/app/[slug]/page.tsx`** — Server Component. Calls the backend's public `GET /public/:slug` (via `src/lib/api/public-fetch.ts` — no session, unlike `server-fetch.ts`). Renders `InactiveFallback` on any non-`200` (same generic-failure handling as the backend — doesn't distinguish "slug never existed" from "slug deactivated"), or `FeedbackForm` with the resolved `clientName`/`siteName` on success.
- **`src/app/[slug]/InactiveFallback.tsx`** — the friendly "this page isn't available" page (Day 4 Hr 5's requirement), rendered directly by the page component rather than a separate route/redirect.
- **`src/app/[slug]/FeedbackForm.tsx`** — the actual form. Key details:
  - `idempotencyKey` uses `generateIdempotencyKey()` (falls back to a manual UUID v4 if `crypto.randomUUID` isn't available — see bug list below for why), generated **once** via `useState` and reused across retries within the same page load — a retry after a network error is a safe idempotent replay, not a new submission, matching the whole point of the backend's idempotency design.
  - Fields: feedback (required, `maxLength=5000` matching the backend), mobile number (optional), file input capped at 5 files, accepting only the discovery doc's allowed types (JPEG/PNG/WebP/HEIC/HEIF images, MP4/MOV/WebM video).
  - Client-side validation (type, per-file size, one-video-per-submission, 60MB running total) runs before any upload starts, mirroring the backend's real checks (`backend/src/cloudinary/media-limits.ts`) — this is UX only, never trusted as security, since the backend independently re-verifies every file against Cloudinary's real bytes/format.
  - Selecting files **accumulates** across multiple browse actions instead of replacing the previous selection (native file inputs replace on every dialog open — real bug found via manual testing, fixed 2026-07-26), and each selected file has a remove (✕) button.
  - On submit: requests **one** Cloudinary signature for the whole batch (`folder: feedback/{slug}`), uploads each file **directly to Cloudinary** via `src/lib/api/cloudinary-upload.ts`, then posts to the backend's feedback endpoint with the resulting `public_id`/`resource_type` per file. Any per-file `rejectionReason` the backend returns (spoofed/oversized/wrong-type/duplicate-video/over-total) is surfaced in the success screen so a customer knows if an attachment didn't make it through.
  - **`src/lib/api/cloudinary-upload.ts` uses `XMLHttpRequest`, not `fetch`.** Deliberate: `fetch` has no upload-progress event; `XMLHttpRequest.upload.onprogress` is the only way to show a real progress bar for a large video on a slow connection, which is the actual point of the Core User Flows doc's "with visible progress" requirement.
  - Success/error/uploading/submitting states handled inline (Day 4 Hr 4) — no separate confirmation route.
- **Hr 6** (retry/backoff) — backend-side, see `backend/CLAUDE.md`'s Retry/Backoff Worker section. Nothing to build here; the frontend just shows whatever status the backend returns.

**Hr 8 (dedicated mobile pass) — completed 2026-07-26, tested on two real Android phones over the LAN, not just DevTools emulation.** Two real, non-obvious bugs found and fixed, both silent (no visible error) and both specific to LAN/non-`localhost` access — worth knowing if this ever needs debugging again:

1. **Next.js blocks cross-origin dev-server requests by default.** Accessing the dev server via this machine's LAN IP (`http://192.168.18.91:3001`, needed to test from a real phone since `localhost` on the phone means the phone itself) got the initial HTML rendered fine, but Next.js silently blocked the hydration/HMR bundle requests from that origin — leaving the page **inert**: native text inputs still worked (that's plain browser behavior, nothing to do with React), but every JS-driven control (the file-picker button, the submit handler) did nothing, with zero visible error since React itself never finished mounting. Fixed via `allowedDevOrigins: ['192.168.18.91']` in `next.config.ts`. Dev-only — irrelevant once deployed behind a real domain, but if this machine's LAN IP ever changes, phone testing will silently break again until this value is updated.
2. **`NEXT_PUBLIC_API_BASE_URL` is inlined into the client bundle at dev-server start.** It was set to `http://localhost:3000`; on a phone, "localhost" means the phone itself, so every client-side `fetch` (Cloudinary signature, feedback submission) failed with a generic "Failed to fetch" — no backend was reachable there. Fixed by setting it to this machine's LAN IP (`http://192.168.18.91:3000`) in `.env.local` for local testing. This is machine/network-specific and gitignored — in production this becomes a real deployed backend URL, so this whole class of bug disappears once deployed.

Both were reproduced and confirmed fixed live on two different Android phones (Chrome), covering: keyboard/zoom behavior on inputs, file picker, adding/removing multiple files, submitting with and without attachments, and landscape rotation.

**Note:** this machine's LAN IP has already changed once since (from `192.168.18.91` to `192.168.18.110`) — exactly the risk flagged above. If phone testing over LAN is needed again, update both `allowedDevOrigins` in `next.config.ts` and `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the current IP (check via `ipconfig`/the frontend dev server's own "Network:" log line) before assuming a bug.

## Error Handling + Validation Pass (Day 4 Hr 7 — implemented 2026-07-27)

Audited first — Server Actions (`clients/actions.ts`, `sites/actions.ts`) already handled `ApiError` correctly (catch, return the message to the form; `redirect()` always called outside the `try/catch`, never inside — a common Next.js footgun since `redirect()` works by throwing internally). Fixed the real gaps found:

- **`src/app/login/actions.ts`** — a genuine Supabase network failure throws rather than returning `{ error }`, surfacing as a raw `"fetch failed"` string on screen (a real bug the user hit and reported). Now wrapped in `try/catch`, mapped to `"Couldn't reach the server. Please check your connection and try again."`
- **`src/lib/api/server-fetch.ts` (`apiFetch`) and `src/lib/api/public-fetch.ts` (`publicFetch`)** — both had the same class of gap: `fetch()` itself throwing on a real network failure (backend unreachable) wasn't caught, so it would've propagated as a raw, unstyled crash instead of a handled error. `apiFetch` now throws a proper `ApiError` with a real message (consistent with every other error path callers already handle); `publicFetch` now returns `{ ok: false, status: 0, body: null }`, which the `[slug]/page.tsx` caller's existing `!ok → InactiveFallback` check already handles with zero page-level changes needed — meaning a backend outage during a real customer's QR scan now shows the friendly "unavailable" page instead of crashing.
- **`src/app/(dashboard)/error.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`** — new. Previously **no `error.tsx` existed anywhere**, so any uncaught error (a thrown `ApiError`, or the raw fetch failures above before they were fixed) crashed straight to Next's generic unstyled error page with no way back into the app. The dashboard one is scoped to `(dashboard)/` so the sidebar/shell isn't affected by a content-area error; the root one is defense-in-depth for anything outside it (`/login`, `/[slug]`). `not-found.tsx`'s practical reach is small in this app specifically — the `[slug]` catch-all route absorbs almost every otherwise-invalid top-level path as "unknown/inactive site" (existing, correct, unrelated behavior) — but it's still correct to have in place for genuinely unmatched paths and any future explicit `notFound()` calls.

Verified: full production build succeeds with all routes (including the new `/_not-found`) present; confirmed via curl that the `[slug]` catch-all and the auth proxy's redirect-before-404 behavior are unaffected.

## Working Style
- One hour-block from the roadmap = one focused session/prompt.
- Review diffs before running anything that writes to Supabase or calls the backend API.
- Commit at the end of every completed task, not just end of day.
- Mobile responsiveness is a hard requirement on the public form (customers scan on phones).
