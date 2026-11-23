# Support Desk (frontend)

Web app for the Support Desk API: customers raise and follow tickets, agents work a queue, admins manage the team and read the audit log.

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Data | Plain `fetch` against the backend API |
| Auth | Better Auth bearer token, kept in `localStorage` |
| Deploy | Vercel |

Backend and API reference: [`../backend/README.md`](../backend/README.md), [`../docs/api.md`](../docs/api.md).

## Quick start

```bash
cd frontend
npm install
```

Create `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
```

```bash
npm run dev        # http://localhost:3001
```

Start the backend first (`cd backend && npm run dev`) and make sure its `TRUSTED_ORIGINS` includes `http://localhost:3001`.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL, no trailing slash. Inlined at **build time**, so redeploy after changing it. |

The browser calls the API directly. There is no proxy, so the backend must allow this app's origin (CORS and `TRUSTED_ORIGINS`).

## Try it with the demo data

Seed the backend (`npm run seed:demo`), then sign in with password `Passw0rd!123`:

| Role | Email | Lands on |
|---|---|---|
| Customer | `amina@example.com` | My tickets |
| Agent | `wanjiru@acme-store.example` | Queue |
| Admin | `admin@acme-store.example` | Queue, Team, Audit log |

New customers sign up at `/signup` with a store ID. A shareable link pre-fills it: `/signup?store=acme-store`.

## Screens

| Route | Who | What |
|---|---|---|
| `/login`, `/signup` | public | Sign in, create a customer account under a store |
| `/dashboard` | all | Role-aware shortcuts |
| `/tickets` | customer | My tickets, status filter, pagination |
| `/tickets/new` | customer | Create a ticket (type, priority) |
| `/tickets/[id]` | customer | Detail, progress, conversation, files |
| `/queue` | agent, admin | All tickets: filters (status, type, priority, assignee), search, sort, pagination |
| `/queue/[id]` | agent, admin | Work a ticket: pick up, assign, change status, priority and type, reply, files |
| `/team` | admin | Staff and customers list, create an agent with a temporary password |
| `/audit` | admin | Who did what and when, filter by ticket |

Queue and audit filters live in the URL, so refresh, Back and shared links keep their state.

## How it works

- **Session:** sign-in stores the token from the `set-auth-token` header under `support-desk.token`. On every page load the app restores the session with `GET /api/auth/get-session`.
- **Expired session:** any `401` clears the token and signs the user out.
- **Route guards:** `RequireAuth` in each section's `layout.tsx` (client side) redirects to `/login?next=…` and shows "Not allowed" for the wrong role. It only shapes the UI, since the backend enforces every permission.
- **Conflicts:** when two people change a ticket at once, the second save is rejected (409) with a Reload button, and nothing is overwritten.
- **Downloads:** files need the token, so they are fetched as a blob and saved by the browser.

The token lives in `localStorage`, so a script injected into the page could read it. Keep dependencies and any future content security policy tight.

## Project structure

```
src/
  app/
    (auth)/login, signup
    (app)/dashboard, tickets, queue, team, audit     each section has a layout.tsx guard
  components/
    ui/          one component per file: alert, avatar, button, card, confirm-button, copy-button,
                 field, file-button, full-page-spinner, form-control, link-button, pagination,
                 pill, search-input, select-field, skeleton, spinner, tabs, textarea-field
    auth/        login-form, signup-form
    tickets/     list, detail, new-ticket-form, badges, status-progress, comments, attachments
    queue/       queue-view, filters, table, ticket-workspace, manage-panel, properties form
    team/        team-view, table, create-member-form, credentials-card, role-badge
    audit/       audit-view, audit-table
    AppShell.tsx, RequireAuth.tsx
  context/       auth-context.tsx (session state, useAuth, useUser)
  lib/           api.ts, auth.ts, config.ts, token.ts, use-query.ts, nav.ts, types.ts, utils.ts,
                 tickets.ts, comments.ts, attachments.ts, queue.ts, team.ts, audit.ts,
                 ticket-permissions.ts
postcss.config.mjs
```

### Conventions

- One UI component per file in `components/ui/`, imported individually (`@/components/ui/card`). No barrel file.
- `type` aliases for props, double quotes, `cx` from `@/lib/utils`.
- Pages stay thin. Feature components do the work, and `lib/<feature>.ts` holds that feature's API calls and helpers.
- Data loading uses `useQuery` (abort on change, loading and error state, refetch). No stale responses.

### Adding a feature

1. API calls and types: `lib/<feature>.ts`, `lib/types.ts`.
2. Components: `components/<feature>/`.
3. Route: `app/(app)/<feature>/page.tsx`, plus a `layout.tsx` with `<RequireAuth roles={[…]}>` if it is role-restricted.
4. Menu entry: one line in `lib/nav.ts`.

## Deploy on Vercel

| Setting | Value |
|---|---|
| Root directory | `frontend` (if the repo also holds the backend) |
| Environment variable | `NEXT_PUBLIC_API_URL=https://<your-api>.onrender.com` |

After the first deploy, add the Vercel URL to the backend's `TRUSTED_ORIGINS` and redeploy the backend. Preview deployments have different URLs and cannot sign in until they are added.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Pages render as unstyled plain text | `postcss.config.mjs` is missing from `frontend/` (not `src/`, not the repo root). It must contain `"@tailwindcss/postcss": {}`. Also check `src/app/globals.css` starts with `@import "tailwindcss";`. Commit the file, then redeploy without the build cache. |
| CORS error or `403 Invalid origin` | The app's URL is not in the backend's `TRUSTED_ORIGINS` (exact scheme and host). Redeploy the backend. |
| "Cannot reach the server" | `NEXT_PUBLIC_API_URL` is wrong, or the API is down. Check it, then rebuild (it is inlined at build time). |
| Sign-in works, then you are signed out on refresh | The token was not saved. Check the `set-auth-token` header is exposed (backend CORS) and that localStorage is allowed. |
| Seeded user cannot sign in | The seed did not run against the API's database: `npm run seed:demo` in `backend`. |
| Slow first request after idle | Render's free tier is waking up. |
| Hydration warning mentioning `chrome-extension` | A browser extension changes the page. Harmless. Try a private window. |

## Not built yet

Change and reset password, deactivating users, live updates (use Refresh), agent-logged tickets with a tracking link, saved replies, frontend tests, and the error, not-found and loading pages.