# How should ordering look and feel?

Type: prototype
Status: resolved
Blocked by: none

## Question

What does the Customer's path look like, from landing on the site to a paid Order? Prototype the screens roughly: menu browsing, choosing a Meal's Option and Add-ons, building a Pack (picking its Meals), the cart (mixing Packs and single Meals), handing off to Stripe Checkout, and the confirmation page with its one-click Account prompt. Should work well on a phone first, since much traffic comes from Instagram. React to it together and record what the flow must be.

## Answer

Decided 2026-11-26. The prototype is on the throwaway branch `prototype/ordering-flow` at `/prototype/ordering?variant=A4`. To view it, switch to that branch and run `npm run dev`. Earlier rounds are on the same route: A, A1–A3, and B and C, which lost.

**Flow (round 1, Variant A won):** the Customer browses one menu page. Tapping a Meal opens a sheet with its photo, Allergens, Option and Add-ons, and a quantity. Packs are an opt-in mode on the same page, not a separate wizard (B lost) and not applied automatically (C lost). The Customer picks a 5- or 10-Pack, and its slots fill as they add Meals. Tapping a slot removes that Meal. The basket mixes Packs and single Meals and shows the discount. Checkout hands off to Stripe's hosted page, and the confirmation page offers a one-tap Account ("Save my details" sends a login link). Phone first.

**Look (round 2, A4 "Bold landing" won):** inspired by the *structure* of davesmealprep.com, using OlaJesu's own brand, words and Meals. Nothing from that site is copied. From top to bottom:
1. a strip counting down to the order cut-off
2. a hero with a pill label, a heavy two-tone headline, and "Order meals" and "Catering for events" buttons
3. a featured-Meal card with thumbnails
4. three trust checks
5. "Two ways to order", switching between Build a Pack and Single Meals, with Pack cards (the 10 marked best value)
6. a two-column Meal grid with Pack slots that stay at the top of the screen
7. a dark "What's in every pot" panel
8. the kitchen story with a pull quote
9. reviews
10. delivery and collection cards
11. a basket bar fixed to the bottom

It uses a heavy sans display font (Plus Jakarta Sans) on top of the site's cream, green and serif, with jollof orange as the accent.

**Open from this ticket:**
- **Placeholders:** the founder story, real reviews, Meal photos (which carry this style), reheating time, and the cut-off day and time. Photos and copy belong to Launch content; the cut-off to Delivery rules.
- **Chef's Pack:** a Pack the kitchen chooses, as a quick third way to order. It isn't decided and isn't in the menu.
- **Unfinished Packs:** the prototype keeps a part-filled Pack in the basket, and checkout ignores it. Whether to block checkout, warn, or sell the Meals as singles is undecided.
- **Homepage:** A4 is a homepage as well as a shop, which feeds into Site restructure.
