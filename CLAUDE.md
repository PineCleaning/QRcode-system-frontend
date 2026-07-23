# Frontend — QR Feedback System (Next.js Admin Portal + Public Form)

This is the **frontend repo** for the QR Feedback System. It is its own git repository, separate from the backend repo (`../backend`). See `../CLAUDE.md` (root) for the full business context, requirements, and day-by-day project plan.

## Tech Stack
- **Framework:** Next.js + TypeScript + Tailwind CSS
- **Auth:** Supabase Auth (session handling, protected routes)
- **API:** Calls the FastAPI backend (`NEXT_PUBLIC_API_BASE_URL`)

## Two Distinct Surfaces in This Repo
1. **Admin Portal** (`/admin` or similar) — internal dashboard for the client's team (including a non-technical VA). Login required. Client/site CRUD, CSV bulk upload UI, QR preview/download, deactivate/delete flows.
2. **Public Feedback Form** (`/{slug}`) — the page a customer lands on after scanning a QR code. No login. Auto-populates business/site name from the slug, collects feedback text + optional mobile number + photo/video upload.

## Environment Variables
See `.env.example`. Never commit `.env*.local` or paste real secrets into a prompt. Required:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_BASE_DOMAIN`.

## Critical Rules
- **Never use the Supabase service role key here.** Only the anon key belongs in the frontend. All privileged writes (ClickUp sync, etc.) go through the backend API.
- **Public form fields must exactly match the client's existing Jotform minus "Business Name" and "Suburb"** — those two are auto-populated from the scanned slug, never typed by the customer.
- **Mobile number is optional** on the public form — do not make it required.
- **Inactive/deleted slug must show a friendly fallback page**, not an error — and must never trigger a ticket/notification.
- **CSV bulk upload UI must show per-row results** (success/error), not just a single pass/fail toast — mirrors the backend's `csv_upload_batches`/`csv_upload_rows` tracking.
- QR downloads must support PNG/JPG and PDF (A4/A5 sized for printing).

## Working Style
- One hour-block from the roadmap = one focused session/prompt.
- Review diffs before running anything that writes to Supabase or calls the backend API.
- Commit at the end of every completed task, not just end of day.
- Mobile responsiveness is a hard requirement on the public form (customers scan on phones).
