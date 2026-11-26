# What does a Customer Account do in phase 1?

Type: grilling
Status: resolved
Blocked by: 03 (resolved)

## Question

What does an Account give a Customer in phase 1 (saved address and phone, Order history, one-tap reorder?), how is it created from the confirmation page and signed into (emailed login link), how is a guest's earlier Order linked when they later make an Account with the same email, and what personal data we hold and for how long (UK GDPR)?

## Answer

Decided 2026-11-26 by grilling. The glossary terms Account, Login link and Marketing consent are in [CONTEXT.md](../../CONTEXT.md).

**What an Account gives (phase 1)**
- Saved details: name, phone, one delivery address, delivery notes. Checkout fills them in.
- Order history with each Order's status.
- Reorder: one tap puts a past Order back in the basket at today's prices and flags any Meal no longer on sale.
- Not in phase 1: several addresses, saved cards. Stripe Link already remembers cards on Stripe's page, so we never store them.

**Signing in**
- Only by emailed Login link. No passwords, no social login.
- A link works once and expires after 15 minutes. The sign-in then lasts 30 days on that device.

**Creating an Account and linking Orders**
- The confirmation page's "Save my details" emails a Login link. The Account only exists once the link is clicked, which proves the email address. It is filled in from that Order, and the page says "Check your email to finish saving your details."
- "Sign in" in the header takes an email and sends a Login link. If no Account exists, clicking the link creates one, filled in from the Customer's latest Order if there is one. The screen always says "If that email can be used, we've sent a link", so it never reveals whether an Account exists.
- Every Order placed with the Account's email (ignoring capital letters) appears in its history: guest or signed in, before or after the Account was made.

**Checkout while signed in**
- Saved details are filled in and can be edited. The Order's email is fixed to the Account's.
- A ticked "Update my saved details" box decides whether changes to the address or phone are saved.

**What the Customer can do**
- Edit their details.
- Change their email. It takes effect only after they click a Login link sent to the new address, and linked Orders stay linked.
- Delete their Account with a button, confirmed by email.
- "Download my data" is handled by email request to the kitchen.

**What staff can do (Admin Dashboard)**
- View and edit Customers and their Accounts.
- Delete an Account on request.
- Record Marketing consent changes made by email.
- Staff can never sign in as a Customer or see Login links.

**Personal data (UK GDPR)**
- Orders, including name, email, delivery address and items, are kept 6 years as sales records for tax.
- An Account profile is kept until the Customer deletes it, or for 3 years after their last sign-in or Order, with a warning email first.
- Deleting an Account removes the profile and keeps its Orders as anonymised sales records.
- A privacy page on the site sets this out.

**Marketing**
- A separate opt-in tick-box, unticked by default, at checkout and in the Account. Who agreed, and when, is recorded.
- Phase 1 sends no marketing, only Order and sign-in emails. When to start sending marketing is a later decision.

**Depends on:** Resend verifying olajesu.com (already a launch blocker). Every Login link and confirmation email needs it.
