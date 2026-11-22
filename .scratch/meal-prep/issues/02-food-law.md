# What does UK food law require for selling fresh meals online?

Type: research
Status: resolved
Blocked by: none

## Question

What do UK (England) food rules require of OlaJesu for selling freshly cooked meals online for local delivery, and what does that mean for the website and the labels?

Cover:
- Allergen information for distance selling: what must be shown on the site before purchase and provided at delivery (the 14 allergens).
- Whether these Meals count as "prepacked for direct sale" (Natasha's Law) or fully prepacked, and the label contents each requires (name, full ingredients with allergens emphasised, use-by, storage, business address, weight).
- Any other mandatory information online: food business registration, hygiene rating display (the FSA encourages showing it online in England), cancellation rights for perishables under the Consumer Contracts Regulations.
- Practical implications for what each Meal record in the system must hold.

Use primary sources (food.gov.uk, legislation.gov.uk). Note anything the business must confirm with Manchester City Council.

## Answer

Full findings: `research/food-law.md` on branch `research/food-law` (commit 0ef1a11). This is research, not legal advice.

- **Allergens:** information on the 14 allergens must be given for free, in writing, **before purchase** (on the Meal's page) and **again at delivery** (a label or an enclosed sheet). The spoken "ask staff" option doesn't apply to online sales.
- **Category:** Meals packed before ordering count as PPDS. Under FSA guidance, the full Natasha's Law ingredients label isn't required for online PPDS sales, but the allergen duties above still apply.
- **Recommendation:** a full label on every pack anyway: name, ingredients with allergens in bold, use-by date, storage, reheating, net weight, business name and address.
- **Must also have:** council food business registration (28+ days before trading, free), a statement that perishables can't be cancelled under the 14-day right, the Consumer Contracts information before ordering (delivery area, payment methods, full total price, a "Pay now" button), an order confirmation email, the business details the E-Commerce Regulations require, and chilled delivery at 8°C or below.
- **Recommended:** show the food hygiene rating before ordering (the FSA widget, or "awaiting inspection" until the first rating).
- **Meal record fields:** listed in section 4 of the file, including a separate **Batch** record so each pack's use-by date can be printed.
- **To confirm with Manchester City Council:** whether self-delivered online sales really count as PPDS, whether the small-producer nutrition-label exemption applies, approval versus registration, shelf life and the delivery cold chain, and inspection timing.
