# Dovito Ad Display — Static Demo

A **public static demo** of the Dovito Ad Display system — a digital signage
and local advertising platform built on Next.js, React, Tailwind, and
shadcn/ui. This repo is the subject of our first public platform audit case
study.

**Live demo:** https://dovito-public.github.io/dovito-ad-display-demo/

## What this is

A fork of the production Dovito Ad Display codebase with the backend
amputated and replaced by an in-browser mock layer. All data is seeded from
`src/lib/mock-data.ts` and persisted to `localStorage` under the key
`dovito-demo-v1`. Every `/api/*` call is intercepted and routed to the mock
API router (`src/lib/mock-api.ts`).

No database, no auth provider, no payment processor, no email, no uploads.
Nothing you do in this demo is real.

## What was stripped out

- Next.js API routes (`src/app/api/`)
- PostgreSQL + Drizzle ORM (`src/lib/db.ts`, `drizzle.config.ts`, etc.)
- NextAuth v5 (Google OAuth + credentials)
- Stripe (Checkout, Elements, Customer Portal)
- Supabase Storage (image uploads)
- Nodemailer / Mailgun (transactional email)
- Rate limiting, image validation, backend helpers

## What was added

- `src/lib/mock-data.ts` — seed data (users, applications, slides, impressions, etc.)
- `src/lib/mock-store.ts` — localStorage-backed CRUD store
- `src/lib/mock-auth.ts` — client-side auth store (no passwords)
- `src/lib/mock-api.ts` — route-pattern mock API
- `src/lib/mock-fetch.ts` — `window.fetch` interceptor for `/api/*`
- `src/components/demo-banner.tsx` — persistent top banner with a reset button
- `src/app/audit/` — embedded audit report viewer

## How to use the demo

- **Login:** any email works. Emails containing `super` become `super_admin`;
  emails containing `admin` become `admin`; everything else becomes a regular
  `user`.
- **Reset:** click "Reset demo" in the banner at the top of every page to wipe
  localStorage and reseed.
- **Audit reports:** the `/audit` page embeds two HTML reports from
  `public/audit-reports/`.

## Running locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Building

```bash
npm run build
# output: ./out/  (static HTML, Next.js export mode)
```

Deployment happens automatically via `.github/workflows/deploy.yml` on push
to `main`.

## Links

- **Production product:** the backend-connected version runs on AWS ECS Fargate
- **Case study:** (URL TBD — will be published alongside the audit)
- **Dovito:** https://dovito.com/

## License

MIT — see `LICENSE`.
