# How much can be ordered per delivery day, and what's left before building?

Type: grilling
Status: resolved
Blocked by: none

## Question

Should the kitchen be able to cap how much is ordered for a delivery day? Are promo codes part of phase 1? And what happens to the map's remaining open topics (delivery rules, Subscriptions, and the jobs that belong to the user or the kitchen) so that every decision needed to start building is made?

## Answer

Decided 2026-11-26 by grilling. The glossary term Daily limit is in [CONTEXT.md](../../CONTEXT.md).

**Kitchen capacity**
- Each Meal can have an optional Daily limit, for example 40 Egusi. When it is reached, the Meal shows "Sold out" for that delivery day.
- There is also an optional limit on total Meals per delivery day, which closes ordering for that day when it is reached.
- Both are blank (no limit) unless the Master admin sets them. Staff can still mark a Meal sold out by hand.
- The checkout re-check from the Pack edge-cases ticket also enforces these limits.

**Promo codes:** not in phase 1; Packs are the discount. They're ruled out of scope for this map, to revisit after launch.

**Subscriptions:** ruled out of scope for this map. They are phase 2 and get their own map, and the Chef's Pack idea goes with them.

**Delivery rules:** the build includes them as editable dashboard settings, with nothing hard-coded. That covers delivery days, postcodes, fees and any free-delivery threshold, the Cut-off, slots, collection from Mary Street, failed deliveries, and the delivery-day text message. Choosing the actual values is on the map's "Before launch" checklist.

**The rest:** every remaining job belongs to the user or the kitchen, so the map's "Not yet specified" section becomes a "Before launch" checklist. With that, the map has reached its destination.
