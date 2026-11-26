# What is the refunds and cancellations policy?

Type: grilling
Status: resolved
Blocked by: none

## Question

Fresh perishable Meals are exempt from the 14-day cancellation right (see the food-law ticket), but the site must say so. Until when can a Customer cancel or change a paid Order (for example, before the order cut-off), and do they get a full refund? What counts as a problem worth a refund or replacement (missing item, wrong Meal, damaged pack, late or failed delivery, a Meal arriving above 8°C), and within what time must it be reported (1207 Kitchen uses 24 hours)? Do they need to send a photo? Is it a refund to the card, credit on the next Order, or a replacement? Who decides, and how is the refund made (from the Admin Dashboard through Stripe)? And what is the final wording for the terms page?

## Answer

Decided 2026-11-26 by grilling. The glossary terms Cut-off, Cancellation, Refund and Master admin are in [CONTEXT.md](../../CONTEXT.md).

**Legal frame (from the food-law ticket and the Consumer Rights Act 2015)**
- Fresh food is exempt from the 14-day cancellation right, and the site must say so.
- Faulty food still carries a legal right to a refund that our terms can't remove.
- Stripe keeps its card fee when a payment is refunded.

**Cancelling**
- A Customer can cancel a paid Order free, for a full refund, up to the Cut-off. They use a "Cancel order" link in the confirmation email or their Account.
- After the Cut-off, cooking has started and they can't cancel.
- The kitchen pays the Stripe fee on these refunds.

**Changing an Order**
- A paid Order can't be edited in phase 1.
- Before the Cut-off, the Customer cancels and orders again. The cancel page says so.

**What gets put right**
- A missing item, the wrong Meal, a damaged or leaking pack, food that arrived above 8°C, a missed delivery that was our fault, or a Meal that went off before its use-by date.
- Not liking the taste or changing their mind doesn't count. The kitchen may still refund as goodwill.

**Reporting a problem**
- We ask Customers to tell us within 24 hours of delivery, by replying to the confirmation email or using a form, with a photo where possible.
- The wording is a request and never claims their legal rights end after 24 hours.

**The remedy**
- The Customer chooses a Refund to their card or a replacement on the next delivery.
- A Refund can be partial: only the affected Meals and their Add-ons.
- No credit balance in phase 1.

**When the kitchen cancels** (illness, ingredient shortage, missed delivery day)
- An automatic full Refund and an apology email, with the next delivery day offered instead.

**Who refunds, and how**
- Refunds and kitchen cancellations are made in the Admin Dashboard. Staff choose the whole Order or chosen items. The refund goes through Stripe, and the Order is marked refunded or partly refunded.
- These are role-restricted actions. The Master admin can always do them; other roles only if given that right (ticket 11).

**Terms page**
- I draft it in plain English once the remaining policy tickets are settled. The user and the kitchen check it.
- A solicitor's review before launch is recommended, since the terms also cover allergens and food safety.

**Left to the delivery rules:** what happens when a delivery fails through the Customer's fault, such as nobody home or a wrong address.
