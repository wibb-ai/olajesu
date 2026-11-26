# OlaJesu — Domain Glossary

**Meal**
A single portioned, freshly cooked ready meal from the meal-prep menu, delivered locally (never frozen or shipped by courier). Every Meal comes in one standard **Portion** of 500 g. Can be ordered on its own or as part of a Pack.

**Option**
The protein choice on a Meal that offers one (e.g. Jollof Rice with no protein, chicken, beef or turkey). Each choice carries its own price. A Meal has at most one Option; soups have none.

**Add-on**
An extra item added alongside a Meal (e.g. plantain, Moi Moi, extra protein, a swallow such as eba or pounded yam), priced separately and never discounted by a Pack.

**Batch**
One cooking run of a Meal. Its cook date sets the use-by date printed on each pack's label.

**Pack**
A fixed-size bundle of Meals (5 or 10) where the Customer chooses each Meal. The chosen Meals' prices are reduced by a percentage set in the Admin Dashboard. Add-ons don't count toward a Pack. Any mix of Meals is allowed, including the same Meal several times, and an Order may hold several Packs alongside single Meals. A Pack can only be bought full; a part-filled one is either filled or turned into single Meals at full price, by the Customer's choice.

**Shelf life**
How many days a Meal stays safe to eat after cooking. With the Batch's cook date it sets the use-by date on the label.

**Allergen check**
A named person's dated confirmation that a Meal's ingredients and allergens were checked against every packet label. A Meal can't go on sale without one.

**Order**
A one-time purchase of Meals and/or Packs, paid by card at checkout. Distinct from a Catering Enquiry.

**Cut-off**
The latest time an Order can be placed, or cancelled, for a given delivery day. After it, cooking starts. Its day and time are set by the delivery rules.

**Cancellation**
A Customer withdrawing a paid Order before the Cut-off, for a full refund. Not possible after the Cut-off; the legal 14-day right doesn't apply to fresh food. A paid Order can't be edited, only cancelled and placed again.

**Refund**
Money returned to the Customer's card through Stripe, for a whole Order or only the affected Meals and their Add-ons. Given for a Cancellation, a kitchen cancellation, or a problem the kitchen is responsible for (missing, wrong, damaged, warm or spoiled food, or a missed delivery); a replacement on the next delivery is the alternative.

**Daily limit**
An optional cap, set by the Master admin, on how many of a Meal (or how many Meals in total) can be ordered for one delivery day. When it's reached, the Meal (or the day) shows as sold out. Blank means no limit.

**Cook list, Packing list, Delivery list**
The three kitchen lists for a delivery day, produced at the Cut-off: how many of each Meal and Option to cook; what goes in each Order; and where each Order goes, with delivery notes, in route order. Emailed to the kitchen and shown in the Admin Dashboard.

**Kitchen inbox**
The shared email address where Customer replies land and kitchen notifications go. Set in the Admin Dashboard.

**Catering Enquiry**
A request for a quote for an event, sent via the catering form. Not paid online; no price is shown up front.

**Subscription** _(later phase)_
A recurring Order placed automatically on a schedule. Not part of the one-time ordering phase.

**Customer**
A person who places an Order. A Customer may order as a guest or with an Account.

**Account**
An optional login a Customer is encouraged (never required) to create, to make repeat ordering smoother. Required only for Subscriptions. Holds the Customer's saved details (name, phone, one delivery address, delivery notes), their Order history and reorder. Signed into only by Login link; no password. Exists only once its email is proven by clicking a Login link, and every Order placed with that email (as a guest or not, before or after) appears in it. Kept until deleted or 3 years unused; deleting it keeps the Orders as anonymised sales records.

**Login link**
A single-use link emailed to a Customer that signs them in to their Account. Expires after 15 minutes; the sign-in then lasts 30 days on that device.

**Marketing consent**
A Customer's recorded, opt-in agreement (separate, unticked by default) to receive marketing emails. Order emails never need it.

**Admin Dashboard**
Where OlaJesu staff manage Orders, Meals, Packs and prices. Prices and the menu are changed here, not in code.

**Master admin**
The top staff role in the Admin Dashboard, with every right, including Refunds and kitchen cancellations. Other staff roles get only the rights given to them. There is always at least one, and Master admins must use two-step login.

**Kitchen** (staff role)
Cooks, packs and delivers: records Allergen checks, sets Meal availability, and works from the Cook, Packing and Delivery lists. OlaJesu delivers its own Meals, so there is no separate Driver role. Sees Customers' names and Order contents, and delivery details only on the delivery day. No prices, Refunds or Customer emails.

**Activity log**
The record of who did each sensitive action in the Admin Dashboard, and when: price changes, Meal availability, Allergen checks, Refunds, kitchen cancellations, Account deletions and staff changes. Staff are switched off, never deleted, so their name stays on it.
