# OlaJesu

Single-page catering site for OlaJesu (Nigerian kitchen, Manchester) at https://olajesu.com.

- **Site:** Next.js (App Router) + React + TypeScript (`src/app`, `src/components`). Security headers in `next.config.ts`; the per-request CSP nonce is set in `src/proxy.ts`
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

## Images

Only files in `public/` are deployed. Full-resolution source photos live in `photos/`
(not deployed) — export web-sized copies into `public/` when adding them to the site.
