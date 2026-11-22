# Which platform and architecture do we build on?

Type: grilling
Status: resolved
Blocked by: 01

## Question

Given the dashboard research, what do we build phase 1 on? Decide: which dashboard or commerce backend; where Orders, Meals, Packs and Customers are stored; how the site, Stripe Checkout and Stripe webhooks connect to it; how Accounts and emailed login links are handled; and whether the current Vite + React + Vercel setup stays or changes (e.g. a move to Next.js).

## Answer

Decided with the user on 2026-11-22. See [ADR 0001](../../../docs/adr/0001-payload-nextjs-single-app.md).

- **Dashboard: Payload CMS** (MIT), using our own collections (Meal, Option, Add-on, Pack, Batch, Order, Customer) rather than Payload's e-commerce plugin. Chosen over Directus (needs a separate always-on server, licence isn't fully open source) and Shopify (replaces Stripe Checkout, costs more, same platform as the competitor).
- **One app:** the shop moves from Vite into the **same Next.js app** as Payload, with the admin at `/admin`, deployed as the existing Vercel project. Moving the current pages is the first build step and must not change how the site looks. Pages are rendered on the server, which helps SEO.
- **Data:** **Neon Postgres** (through Vercel's marketplace) is the source of truth for the menu and Orders. Stripe only takes the money.
- **Prices are worked out on the server** from the database, never trusted from the browser.
- **Order lifecycle:** created as `awaiting payment` when the Customer goes to Stripe Checkout, marked `paid` by the Stripe webhook (signature verified, safe to receive twice), then moved by staff to `preparing`, `out for delivery`, `delivered`, or `refunded`.
- **Hosting:** upgrade Vercel to **Pro** before launch, since Hobby doesn't allow commercial use. Not needed while building.
- **Email: Resend**, sending from an `@olajesu.com` address. Verifying olajesu.com in Resend becomes a **launch blocker** because order confirmation emails are legally required.
- **Left to "What does a Customer Account do in phase 1?":** how Accounts and emailed login links work.
