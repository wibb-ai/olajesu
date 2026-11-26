# Map: Meal-prep ordering for olajesu.com

Label: wayfinder:map · Branch: `meal-prep-ordering`

## Destination

A build-ready plan for **phase 1: one-time ordering** of fresh, locally delivered Meals and Packs on olajesu.com, paid by card through Stripe's hosted checkout and managed from an Admin Dashboard. Every decision needed to start building is made. Subscriptions are sketched as a separate later phase, not decided here.

## Notes

- **Domain:** food e-commerce for a Manchester Nigerian kitchen. Glossary: [CONTEXT.md](../../CONTEXT.md) (Meal, Option, Add-on, Pack, Order, Catering Enquiry, Customer, Account, Login link, Marketing consent, Cut-off, Cancellation, Refund, kitchen lists, Kitchen inbox, Admin Dashboard, Master admin, Kitchen, Activity log, Subscription).
- **Skills:** grilling + domain-modeling for decisions; research for outside facts; prototype for UI questions.
- **Plan, don't do:** tickets produce decisions. Building happens after the map, one phase at a time, together in sessions. No fixed launch date.
- **Settled in charting (2026-11-21/22):**
  - Meal prep becomes the main thing on the site; catering keeps its enquiry form on its own page.
  - Sell single Meals *and* Packs (Packs carry a small per-Meal discount set in the dashboard).
  - Ready-meal menu: each Meal has at most one Option, plus Add-ons. No build-your-own.
  - Pricing and menu modelled on 1207 Kitchen (singles £6–£15) for now; everything editable in the Admin Dashboard.
  - Card payment when ordering, via Stripe's hosted checkout.
  - Guest checkout. Encourage an Account on the confirmation page (one-click, emailed login link, prefilled); never required.
  - Fresh and local delivery (Greater Manchester), not frozen nationwide.
  - Prefer an existing open-source dashboard over building one.
- **Launch blockers:** see the Before launch checklist below.
- **Competitor reference:** 1207 Kitchen (https://1207kitchen.com), a Shopify store with 14 frozen single meals shipped across GB, no packs or subscriptions.

## Decisions so far

<!-- one line per resolved ticket: [title](issues/NN-slug.md): gist -->

- [Which open-source dashboard can run our orders and menu?](issues/01-dashboard-options.md): none fits as-is; recommended Payload CMS admin over our own collections on Vercel + Neon, with `/api` keeping Stripe Checkout; Directus runner-up; Shopify is the buy option.
- [Which platform and architecture do we build on?](issues/03-platform-architecture.md): one Next.js app holding the shop and a Payload CMS admin, on Neon Postgres and Vercel Pro; Stripe Checkout with prices worked out on the server and a webhook marking Orders paid; Resend for email.
- [What does UK food law require for selling fresh meals online?](issues/02-food-law.md): allergen info for the 14 allergens in writing before purchase and at delivery; full label on every pack recommended; register with the council, show the hygiene rating, state that perishables can't be cancelled, keep deliveries at 8°C or below.
- [What is on the launch meal-prep menu?](issues/04-meal-prep-menu.md): 8 Meals of one 500 g Portion; protein Options on Jollof and Fried Rice (£6–£15); soups and stews £12–£15; swallows and sides as Add-ons; Packs of 5 (10% off) and 10 (15% off); a Meal can't go on sale without an Allergen check; 2-day shelf life to confirm with the council.
- [How should ordering look and feel?](issues/05-ordering-flow-prototype.md): one menu page with a sheet for each Meal; Packs as an opt-in mode whose slots fill as Meals are added; a basket mixing Packs and singles; Stripe hosted checkout; one-tap Account on the confirmation page. The look is A4 "Bold landing", a bold landing page and shop in one, phone first (prototype on `prototype/ordering-flow`).
- [What does a Customer Account do in phase 1?](issues/06-accounts.md): saved details, Order history and reorder; sign-in only by emailed Login link; an Account exists once its email is proven and shows every Order with that email; Orders kept 6 years, profiles until deleted or 3 years unused; Marketing consent is opt-in, and no marketing is sent in phase 1.
- [What happens to an unfinished Pack, and is there a Chef's Pack?](issues/07-pack-edge-cases.md): a part-filled Pack is either filled or turned into single Meals, by the Customer's choice; any mix and any number of Packs; the server checks availability and today's prices at checkout and shows any change; no Chef's Pack in phase 1.
- [What is the refunds and cancellations policy?](issues/08-refunds-cancellations.md): free cancellation up to the Cut-off, none after; no editing paid Orders; refund or replacement for problems the kitchen is responsible for (reports asked for within 24 hours, never as a legal limit); refunds made through Stripe from the dashboard, a role-restricted action the Master admin always has; plain-English terms drafted, solicitor review recommended.
- [What do the Customer and the kitchen get told, and when?](issues/09-notifications.md): email only, through Resend, from orders@olajesu.com; six Customer emails, starting with the legally required confirmation, and no marketing; the kitchen gets each Order, Cancellation and problem report, plus the Cook, Packing and Delivery lists at the Cut-off; wording fixed, a few settings editable; Kitchen inbox address still to confirm.
- [How is the site restructured around meal prep?](issues/10-site-restructure.md): the homepage is the A4 shop; catering moves to `/catering` unchanged; one page per Meal; Help, Terms, Privacy, Account and Order pages; per-page search titles, a sitemap and structured data; old `#order` links sent on to catering; the live site switches only when ordering goes live.
- [Who uses the Admin Dashboard, and with what access?](issues/11-staff-roles.md): two roles, Master admin and Kitchen (no Driver: OlaJesu delivers its own Meals), with a rights table; two-step login required for Master admins; simple screens for the day for Kitchen, including deliveries; individual logins and an Activity log; leavers are switched off, never deleted.
- [How much can be ordered per delivery day, and what's left before building?](issues/12-capacity-and-loose-ends.md): optional Daily limits per Meal and per delivery day, blank unless set; delivery rules built as editable settings, values chosen before launch; promo codes and Subscriptions ruled out of scope; the remaining open topics became the Before launch checklist.

## Not yet specified

Nothing. Every decision needed to start building phase 1 is made. The jobs that remain belong to the user and the kitchen, and are listed below.

## Before launch

Jobs for the user and the kitchen, none of which block building:

- **Accounts and hosting:** verify olajesu.com in Resend (the site can only email the Resend account owner until then, and order confirmations are legally required); upgrade Vercel to Pro; add `PAYLOAD_SECRET` for Production before merging to `main`; reset the Neon database password; turn on database branches for previews.
- **Council:** register with Manchester City Council (28+ days before trading); ask the five questions in the food-law ticket and confirm the 2-day shelf life; then decide how labels and use-by dates are produced per Batch (PPDS versus fully prepacked).
- **Kitchen:** complete the Allergen check for every launch Meal; set the delivery rules in the dashboard: days, postcodes, fees, the Cut-off, slots, collection from Mary Street, failed deliveries, and whether to add a delivery-day text message.
- **Words and photos:** photos of every Meal (single portion plus a wider shot); descriptions; reheating and storage wording; the founder story; real customer reviews; the Help page wording; the footer business details.
- **Legal pages:** Terms (from the refunds ticket) and Privacy (from the Accounts ticket, plus cookies and analytics). Claude drafts, the user and the kitchen check, and a solicitor's review is recommended.
- **Other:** give the Kitchen inbox address; check the Google Business Profile links to the site.

## Out of scope

- Frozen meals shipped nationwide by courier (possible future phase).
- Build-your-own boxes.
- Promo codes and discounts beyond Packs: Packs are the phase 1 discount; revisit after launch ([capacity ticket](issues/12-capacity-and-loose-ends.md)).
- Phase 2, Subscriptions: frequency, pause/skip/cancel, discount, how Accounts manage them, Stripe Billing, and a likely Chef's Pack the kitchen fills each week. Gets its own map ([capacity ticket](issues/12-capacity-and-loose-ends.md)).
