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
1. **Admin Portal** (`/clients`, `/login`, etc.) — internal dashboard for the client's team (including a non-technical VA). Login required. Client/site CRUD, CSV bulk upload UI, QR preview/download, deactivate/delete flows. **Login + client/site CRUD + QR preview/download are built** (Phase A, see below) — CSV bulk upload UI and deactivate/delete *confirmation modals* are still pending (delete currently works but with no confirmation step yet).
2. **Public Feedback Form** (`/{slug}`) — the page a customer lands on after scanning a QR code. No login. Auto-populates business/site name from the slug, collects feedback text + optional mobile number + photo/video upload. **Not built yet** — this is Phase B (Day 4).

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

## Working Style
- One hour-block from the roadmap = one focused session/prompt.
- Review diffs before running anything that writes to Supabase or calls the backend API.
- Commit at the end of every completed task, not just end of day.
- Mobile responsiveness is a hard requirement on the public form (customers scan on phones).
