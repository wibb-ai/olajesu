# Which open-source dashboard can run our orders and menu?

Type: research
Status: resolved
Blocked by: none

## Question

Which existing open-source admin dashboard or commerce backend could we wire into olajesu.com so staff can manage the business without us building a dashboard?

It must let non-technical staff:
- see and update Orders (paid, preparing, out for delivery, delivered, refunded)
- edit Meals, Options, Add-ons, Packs, prices and Pack discounts, and mark items unavailable
- see Customers and their Order history

It must work with **Stripe hosted checkout** (and later Stripe subscriptions), support optional customer Accounts with emailed login links, and fit our stack (Vite + React site on Vercel with serverless functions) or justify replacing it.

Compare at least: Medusa, Saleor, Vendure, Payload CMS (with its e-commerce template), Directus or Strapi as a plain admin over our own database, plus two non-open-source baselines: Shopify (what 1207 Kitchen uses) and "Stripe dashboard only". For each: what it covers out of the box, what we'd still build, hosting needs and monthly cost, database required, maturity, and effort to integrate. Finish with a recommendation.

## Answer

Full findings: `research/dashboard-options.md` on branch `research/dashboard-options` (commit 5eafdc3), sources dated 2026-11-22.

- **No open-source commerce engine fits as-is.** Medusa, Saleor, Vendure and Payload's e-commerce plugin all take payment through Stripe's embedded form, not hosted Checkout (Saleor's docs say outright that Checkout isn't supported). None has bundles that match Packs natively, and none ships emailed login links for customers. Medusa, Saleor and Vendure also need always-on servers plus Redis.
- **Recommended: Payload CMS (MIT)** as the staff admin, with our own collections (Meal, Option, Add-on, Pack, Order with status, Customer, Batch) rather than its e-commerce plugin. Deployed as a second Next.js project on Vercel with a Neon database, at roughly $0–15 a month extra. `/api` keeps creating Stripe Checkout Sessions and writes Orders from Stripe's payment-completed webhook. Emailed login links go in through Payload's custom login hook. The Vite site stays as it is.
- **Risks:** owned by Figma since June 2025; Payload owns its database schema, so leaving later means a migration.
- **Runner-up: Directus** over our own Postgres. The schema stays ours, but it needs a Docker host and its licence is source-available, not open source.
- **Buy instead of build: Shopify.** It covers the most out of the box (Bundles, one-time sign-in codes, Subscriptions) but replaces Stripe Checkout, costs £25–65 a month, and has higher card fees on Basic.
- **Ruled out:** "Stripe dashboard only", which has no order status.
- **Not verified:** the Vercel plan (Hobby is for non-commercial use), Payload admin speed on serverless, Shopify local-delivery statuses.
