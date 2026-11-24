# OlaJesu

Single-page catering site for OlaJesu (Nigerian kitchen, Manchester) at https://olajesu.com.

- **Site:** Next.js (App Router) + React + TypeScript (`src/app`, `src/components`). Security headers in `next.config.ts`; the per-request CSP nonce is set in `src/proxy.ts`
- **Admin Dashboard:** [Payload CMS](https://payloadcms.com) at `/admin` (`src/payload.config.ts`, collections in `src/collections/`), data in Neon Postgres. See `docs/adr/0001-payload-nextjs-single-app.md`
- **Enquiry form API:** route handler `src/app/api/catering-enquiry/route.ts`, sends email via [Resend](https://resend.com)
- **Hosting:** Vercel, deployed automatically from `main` on GitHub (`wibb-ai/olajesu`)

## Development

```sh
npm install
npm run dev        # local site at http://localhost:3000 (put env vars in .env.local)
npm run typecheck
npm run lint
npm run build
```

## Database changes

Locally, `npm run dev` pushes schema changes straight to your **development** Neon branch
(`DATABASE_URL` in `.env.local`, never the production database). Before committing a
schema change, create a migration:

```sh
npm run payload -- migrate:create <name>
npm run generate:types
```

Vercel runs `npm run ci` (`payload migrate`, then `next build`), so committed migrations
are applied to the deployment's database before each build.

## Environment variables

See `.env.example`. Set these in Vercel → Project → Settings → Environment Variables
(Production), then redeploy:

| Variable | Where | Purpose |
|---|---|---|
| `RESEND_API_KEY` | server | Resend API key — **form fails without it** |
| `ENQUIRY_TO_EMAIL` | server | Inbox that receives enquiries |
| `EMAIL_FROM` | server | Sender, on a domain verified in Resend |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | build | Cloudflare Turnstile widget (optional) |
| `TURNSTILE_SECRET_KEY` | server | Enforces Turnstile server-side when set |
| `DATABASE_URL` | server + build | Neon Postgres connection string (set by Vercel's Neon integration) |
| `PAYLOAD_SECRET` | server + build | Long random string that signs admin sessions |
| `NEXT_PUBLIC_SERVER_URL` | build | Public site URL, e.g. `https://olajesu.com` |

## Images

Only files in `public/` are deployed. Full-resolution source photos live in `photos/`
(not deployed) — export web-sized copies into `public/` when adding them to the site.
