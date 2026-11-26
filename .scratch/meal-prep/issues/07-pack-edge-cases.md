# What happens to an unfinished Pack, and is there a Chef's Pack?

Type: grilling
Status: resolved
Blocked by: none

## Question

A Customer can start a 5- or 10-Pack and leave it part-filled. At checkout, should we block it until it's full, warn and sell the chosen Meals as single Meals at full price, or drop the Pack? What happens when a Meal in a Pack sells out or is taken off the menu before checkout, or when the dashboard changes a Pack's discount while it is in someone's basket? Can a Customer have more than one Pack in an Order, and can the same Meal fill several slots? Separately: should there be a **Chef's Pack**, a Pack the kitchen chooses each week, as a quick third way to order? If so, how is it priced against a Customer-built Pack, and who sets its contents in the Admin Dashboard?

## Answer

Decided 2026-11-26 by grilling. The Pack entry in [CONTEXT.md](../../CONTEXT.md) is updated.

**A part-filled Pack at checkout:** the Customer is asked, never overruled. They choose either "Add N more to save £X" or "Buy these as single Meals", which moves the Meals into the basket as singles at full price. The basket shows the saving they'd miss. Checkout never quietly converts or drops a Pack.

**What a Pack can hold:** any mix of Meals, including the same Meal several times and the same Meal with different Options.

**Several Packs per Order:** any combination of Packs and single Meals. With two 5-Packs, the basket suggests "Make it a 10-Pack and save £X more" but never merges them itself.

**A Meal sells out or leaves the menu while in a basket:** the server checks the whole basket again at checkout. An unavailable Meal is taken out and its Pack slot reopens, and the Customer sees what changed before going to Stripe. Payment never goes ahead for an unavailable Meal.

**Price or discount changes while in a basket:** the Customer pays today's prices and Pack discount, worked out on the server at checkout. If the total changes, the basket shows the new total and why before handing over to Stripe. A basket never keeps an old price.

**Chef's Pack:** not in phase 1. It moves to the Subscriptions topic as a likely subscription product, to revisit once real order data shows which Meals sell.
