# OlaJesu

Single-page catering site for OlaJesu (Nigerian kitchen, Manchester) at https://olajesu.com.

- **Frontend:** Vite + React + TypeScript (`src/`)
- **Enquiry form API:** Vercel serverless function `api/catering-enquiry.js`, sends email via [Resend](https://resend.com)
- **Hosting:** Vercel, deployed automatically from `main` on GitHub (`wibb-ai/olajesu`)

## Development

```sh
npm install
npm run dev        # local site (the /api route needs `vercel dev`)
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
| `VITE_TURNSTILE_SITE_KEY` | build | Cloudflare Turnstile widget (optional) |
| `TURNSTILE_SECRET_KEY` | server | Enforces Turnstile server-side when set |

## Images

Only files in `public/` are deployed. Full-resolution source photos live in `photos/`
(not deployed) — export web-sized copies into `public/` when adding them to the site.
