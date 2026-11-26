# Who uses the Admin Dashboard, and with what access?

Type: grilling
Status: resolved
Blocked by: none

## Given

- A **Master admin** role has every right, including Refunds and kitchen cancellations. Other roles get only the rights given to them (decided in the refunds ticket).

## Question

Who logs into the Admin Dashboard (owner, kitchen staff, a driver, someone handling messages) and does each role see and do different things? For example: who can change prices, Pack discounts and the menu; who can mark a Meal available (given the Allergen check); who can see Customers' personal data; who can issue refunds; and who can add or remove staff. Is two-step login needed for anyone? What does the kitchen need on a phone or tablet on the day (a cook list, a packing list, delivery addresses), and should those screens be simpler than the full dashboard?

## Answer

Decided 2026-11-26 by grilling. The glossary terms Master admin, Kitchen, Driver and Activity log are in [CONTEXT.md](../../CONTEXT.md).

**Today (checked in the code):** one staff collection, with a name field and a lock after 5 failed logins for 10 minutes. No roles yet.

**Roles:** Master admin, Kitchen and Driver. Customer service stays with the Master admin until someone else does it. There can be several Master admins, and the system never lets the last one be removed or switched off.

**Rights**

| | Master admin | Kitchen | Driver |
|---|---|---|---|
| Menu, prices, Pack discounts, settings | ✓ | – | – |
| Record an Allergen check (logged under their own name) | ✓ | ✓ | – |
| Mark a Meal available (needs an Allergen check) | ✓ | ✓ | – |
| Mark a Meal sold out or back in stock | ✓ | ✓ | – |
| Cook and Packing lists; mark Orders preparing or ready | ✓ | ✓ | – |
| Delivery list for the day; mark out for delivery or delivered | ✓ | ✓ | ✓ |
| Customers' names and Order contents | ✓ | ✓ | – |
| Delivery address, phone and notes | ✓ | only on the day | only on the day |
| Customers' emails, Accounts, Marketing consent | ✓ | – | – |
| Refunds and kitchen cancellations | ✓ | – | – |
| Add, change or remove staff | ✓ | – | – |

A Master admin can give a person an extra right later, for example refunds for a trusted manager.

**Two-step login:** required for every Master admin, optional for Kitchen and Driver. Payload doesn't include it as standard, so it is added at build time.

**Screens for the day:** Kitchen and Driver logins open straight onto simple phone and tablet screens:
- today's Cook list
- the Packing list, ticking off each Order as it's packed
- the Delivery list, with each address opening in maps, a tap to call, and "Delivered" buttons

The full dashboard is the Master admin's.

**Logins and the Activity log**
- Everyone has their own login; none are shared. An Allergen check must name a real person, and Refunds must be traceable.
- The Activity log records who did each sensitive action and when: price changes, Meal availability, Allergen checks, Refunds, kitchen cancellations, Account deletions and staff changes.

**When someone leaves:** a Master admin switches off their login, which ends their sessions everywhere. Staff are never deleted, so their name stays on past Allergen checks and in the Activity log.
