# What do the Customer and the kitchen get told, and when?

Type: grilling
Status: resolved
Blocked by: none

## Question

List every message the system sends and decide each one: who gets it, when it goes, by which channel (email only, or SMS or WhatsApp too), and what it must contain. For the Customer: order confirmation (legally required, with allergen info and the cancellation notice), payment failed, Order changed or cancelled, refund made, out for delivery or ready to collect, and a reminder before the cut-off. For the kitchen: a new paid Order, a daily or per-delivery-day summary of what to cook and pack, and a low-stock or sold-out warning. Login link and Account emails are already settled in the Accounts ticket. Which address do emails come from and which do replies go to, and is any of this editable in the Admin Dashboard?

## Answer

Decided 2026-11-26 by grilling. The glossary terms Cook list, Packing list, Delivery list and Kitchen inbox are in [CONTEXT.md](../../CONTEXT.md).

**Channel:** email only in phase 1, sent through Resend. The first addition, once the delivery rules are settled, is a delivery-day text message. That needs the Customer's agreement and an SMS service. WhatsApp is not planned.

**Customer emails**
1. **Order confirmation**, sent as soon as the Stripe webhook marks the Order paid. The law requires it. It lists:
   - the Meals with their Options and Add-ons, the Pack discount and the total
   - the delivery day and address
   - the allergens for each Meal
   - the "Cancel order" link and the notice that fresh food can't be cancelled after the Cut-off
   - the business details
2. **Cancellation confirmed**, with the refund amount.
3. **Refund made**, saying the amount and whether it covers the whole Order or part of it.
4. **Kitchen cancelled your Order**: an apology, the full Refund, and the next delivery day offered.
5. **Out for delivery** or **ready to collect**, on the day. The exact timing depends on the delivery rules.
6. **Login link and Account emails**, as decided in the Accounts ticket.

Not sent:
- **Payment-failed emails:** Stripe's page handles failures, so no Order exists.
- **Cut-off reminders and abandoned-basket emails:** these count as marketing, and phase 1 sends none.

**Kitchen emails**, all sent to the Kitchen inbox:
- **Each new paid Order**, straight away. A dashboard switch turns these off; on at launch.
- **Each Cancellation, and each problem a Customer reports**, straight away.
- **At the Cut-off**, one summary email with the Cook list, Packing list and Delivery list. The dashboard shows the same lists.

**Sender:** "OlaJesu" &lt;orders@olajesu.com&gt;. Replies go to the Kitchen inbox, so a Customer can reply to report a problem. The Kitchen inbox address is still to come from the user. It can be changed in the dashboard.

**Editable in the Admin Dashboard:** the reply-to address, who gets kitchen emails, the per-Order email switch, and a short "note from the kitchen" shown in confirmations. All other wording is fixed in phase 1, so the legally required parts can't be lost by accident.

**Look:** simple branded emails with the logo and the cream and green colours, one column that reads well on a phone, and a plain-text version of each to help them reach the inbox rather than spam. No heavy images.

**Depends on:** Resend verifying olajesu.com, which is already a launch blocker. orders@olajesu.com can only send once the domain is verified.
