# How is the site restructured around meal prep?

Type: grilling
Status: resolved
Blocked by: none

## Question

The ordering prototype (A4) suggests the homepage is the shop: hero, Pack offer and menu on one page, with catering linked from the hero. Confirm that, and decide the rest of the site: which pages exist (home and shop, a page per Meal or not, catering, about and story, FAQ, delivery, terms, privacy, account), what goes in the header and footer, where the catering enquiry form lives and what its URL is, and which old URLs redirect where (today `/` is the catering page and `/catering` redirects to it). How do we keep catering's current search ranking, and what titles, descriptions and social preview images does each page get? Should individual Meals have their own URLs for sharing on Instagram?

## Answer

Decided 2026-11-26 by grilling.

**Today (checked in the code):**
- **Pages:** one page, `/`, the catering page with the enquiry form. Its in-page links go to `#menu` and `#order`.
- **Redirect:** `/catering` permanently redirects to `/` (in `next.config.ts`).
- **Search and sharing:** no sitemap or robots file. One title, description and `og-image.jpg` for the whole site.

**Homepage:** `/` becomes the shop in the A4 design: hero, Pack offer, menu, story, reviews and delivery on one page. Catering is linked from the hero and the header.

**Pages in phase 1**
- `/`: the shop.
- `/meals/[name]`: one page per Meal (see below).
- `/catering`: today's catering page with its enquiry form, moved unchanged.
- `/help`: delivery areas and days, the Cut-off, reheating and storage, allergens, and a short summary of cancellations and refunds.
- `/terms` and `/privacy`.
- `/account`: sign in, saved details, Order history.
- Order pages for confirmation and cancellation, reached from links in the emails.
- No About page: the story stays on the homepage. The basket is a panel that slides up, not a page.

**Meal pages:** each Meal has its own address, for example `olajesu.com/meals/egusi-soup`. The page shows the big photo, the description, the full allergen and ingredient list, reheating instructions and Add to basket. This means:
- a single Meal can be shared from Instagram
- searches like "egusi soup Manchester" can find it
- allergens are in writing before purchase

Tapping a Meal in the shop still opens the panel.

**Header:** logo, Menu, Catering, Help, account icon, and basket with its count.

**Footer**
- Help, Terms and Privacy links.
- Instagram, WhatsApp and email.
- The business details the E-Commerce Regulations require: name, address, registration and contact.
- The food hygiene rating once the council gives one.

**Moving catering and old links**
- Catering moves to `/catering`, and the `/catering → /` redirect is removed.
- Old shared `/#order` links were the enquiry form. The server never sees the `#` part, so a small homepage script sends `#order` on to `/catering#enquiry`.

**Search and sharing**
- **Titles and descriptions:** each page gets its own. The homepage targets "Nigerian meal prep Manchester". `/catering` keeps today's catering wording and targets "Nigerian catering Manchester".
- **Sitemap and robots file:** added.
- **Structured data:** a local business on the homepage, and dish details on each Meal page.
- **Previews:** each Meal page shares its own photo; other pages share the brand image.
- **Google Business Profile:** the user checks it links to `/`, and adds a catering link if it allows one.

**When it switches:** only when ordering goes live. Until then `/` stays the catering page, and the new structure stays on the `meal-prep-ordering` branch, so catering's ranking isn't risked for a shop that can't take orders yet.
