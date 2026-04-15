# OlaJesu Kitchen  Complete Website Design Specification
**Version 1.0 | April 2026 | For AI Agent Replication**

This document contains every detail needed to rebuild the OlaJesu Kitchen website pixel-for-pixel. Follow every rule exactly. Do not improvise, substitute, or simplify anything without explicit instruction.

---

## 1. Technology Stack

- **Framework:** React (single `.jsx` file, no separate CSS files)
- **Styling:** Inline React styles only  no Tailwind, no CSS modules, no styled-components, no external UI libraries
- **State:** React hooks only  `useState`, `useEffect`, `useRef`
- **Animations:** JavaScript `IntersectionObserver` + inline style transitions
- **No external dependencies** beyond React itself

---

## 2. Colour System

Every colour used on the site. Use these hex values exactly  no approximations.

| Name | Hex | Usage |
|---|---|---|
| Page background | `#F7F2E8` | Main page background, nav when transparent |
| Card background | `#EDE6D3` | Section cards, form backgrounds |
| Charcoal bg | `#F0EAD9` | Alternate section backgrounds |
| Border / divider | `#DDD6C4` | All horizontal rules, input borders, section dividers |
| Primary green | `#1B4332` | Buttons, accents, active states, prices, rule lines |
| Warm sand | `#9C8B6E` | Secondary labels, tag borders, alternate accents |
| Logo gold | `#D4A843` | Logo cutlery only |
| Primary text | `#1A1A1A` | All headings and dark body text |
| Muted text | `#6B6355` | Descriptions, secondary body copy, labels |
| Body text at 60% | `rgba(26,26,26,0.6)` | Paragraph body copy throughout |
| Button text | `#F7F2E8` | Text on dark green buttons |
| WhatsApp green | `#25D366` | WhatsApp CTA button only |
| Uber green | `#06C167` | Uber Eats CTA button only |
| Copyright text | `rgba(26,26,26,0.35)` | Footer copyright line only |
| Nav scrolled bg | `rgba(247,242,232,0.97)` | Nav background after scroll |
| Stats bar bg | `rgba(237,230,211,0.95)` | Hero stats bar background |
| WhatsApp banner gradient start | `rgba(61,74,46,0.07)` | WhatsApp section left gradient |
| WhatsApp banner gradient end | `rgba(156,139,110,0.07)` | WhatsApp section right gradient |
| WhatsApp banner border | `rgba(61,74,46,0.2)` | WhatsApp section border |

---

## 3. Typography

### Font Families
- **Display / Headings:** `'Georgia', serif`  weight 400 (never bold for headings, only `fontStyle: italic` for emphasis spans)
- **Body / Labels / Buttons / Tags:** `sans-serif`
- **Tags / Badges:** `'Courier New', monospace`

### Font Scale
| Element | Size | Weight | Line Height | Color | Other |
|---|---|---|---|---|---|
| H1 (hero) | `clamp(42px, 10vw, 72px)` | 400 | 1.05 | `#1A1A1A` | Georgia serif |
| H1 italic span | same | 400 |  | gradient `#1B4332` → `#9C8B6E` | `fontStyle: italic`, `background-clip: text` |
| H2 (section) | `36px` | 400 | 1.1 | `#1A1A1A` | Georgia serif |
| H2 (story section) | `32px` | 400 | 1.2 | `#1A1A1A` | Georgia serif |
| H2 italic span | same | 400 |  | `#1B4332` | `fontStyle: italic` |
| H3 (cards) | `18px` | 400 |  | `#1A1A1A` | Georgia serif |
| H3 (form success) | `24px` | 400 |  | `#1A1A1A` | Georgia serif |
| Body copy | `15px` | 400 | 1.7–1.8 | `rgba(26,26,26,0.6)` | sans-serif |
| Menu item name | `17px` | 400 |  | `#1A1A1A` | Georgia serif |
| Menu item price | `18px` | 700 |  | `#1B4332` | Georgia serif |
| Menu description | `13px` | 400 | 1.6 | `#6B6355` | sans-serif |
| Card body | `13px` | 400 | 1.7 | `#6B6355` | sans-serif |
| Section eyebrow label | `10px` | 400 |  | `#1B4332` or `#9C8B6E` | sans-serif, `letter-spacing: 0.2em`, `text-transform: uppercase` |
| Stats number | `22px` | 700 |  | `#1B4332` | Georgia serif |
| Stats label | `10px` | 400 |  | `#6B6355` | sans-serif, `letter-spacing: 0.12em`, uppercase |
| Button text | `12–13px` | 700 |  | `#F7F2E8` or `#1B4332` | sans-serif, `letter-spacing: 0.06–0.1em`, uppercase |
| Tag text | `9px` | 700 |  | `#1B4332` or `#9C8B6E` | Courier New, `letter-spacing: 0.12em`, uppercase |
| Label (form) | `11px` | 400 |  | `#6B6355` | sans-serif, `letter-spacing: 0.1em`, uppercase |
| Input text | `14px` | 400 |  | `#1A1A1A` | sans-serif |
| Nav link | `12px` | 400 |  | `#6B6355` | sans-serif, `letter-spacing: 0.06em`, uppercase |
| Footer nav heading | `10px` | 400 |  | `#6B6355` | sans-serif, `letter-spacing: 0.15em`, uppercase |
| Footer body | `13px` | 400 | 1.7 | `#6B6355` | sans-serif |
| Footer address | `12px` | 400 |  | `#6B6355` | sans-serif |
| Copyright | `12px` | 400 |  | `rgba(26,26,26,0.35)` | sans-serif |

---

## 4. Spacing System

- **Standard section padding:** `80px 24px`
- **Max content width:** `760px`, centred with `margin: 0 auto`
- **Section dividers:** `1px solid #DDD6C4` as `borderTop` on sections
- **Nav height:** `80px`
- **Nav padding:** `0 24px`
- **Card internal padding:** `32px 24px`
- **Form grid gap:** `16px`
- **Footer padding:** `48px 24px 32px`
- **Footer bottom bar padding-top:** `24px`
- **Footer grid gap:** `40px`
- **Footer grid margin-bottom:** `40px`
- **Hero content padding:** `120px 24px 80px`
- **Hero content max-width:** `640px`
- **Stats bar cell padding:** `20px 16px`
- **Menu tab padding:** `14px 20px`
- **Menu item padding:** `24px 0`
- **WhatsApp banner padding:** `40px 32px`
- **WhatsApp banner internal gap:** `16px`
- **Uber Eats card padding:** `28px 24px`
- **Form success card padding:** `48px 32px`
- **Why Us card padding:** `32px 24px`
- **Why Us grid gap:** `2px`
- **Section eyebrow: rule line width:** `24px` (hero: `32px`), height `1px`
- **Section eyebrow: gap between rule and text:** `12px`
- **Section eyebrow: margin-bottom:** `12–16px`
- **Section heading margin-bottom after eyebrow:** `48px` (Why Us) or `0` (Menu)
- **Hero eyebrow margin-bottom:** `20px`
- **Hero H1 margin-bottom:** `24px`
- **Hero paragraph margin-bottom:** `40px`
- **Hero buttons gap:** `12px`
- **Story section gap between columns:** `40px`

---

## 5. Logo

The logo is the original OlaJesu Kitchen PNG with the black background removed (transparent PNG). It is embedded directly as a base64 data URI inside the component  no external image file.

```jsx
const LOGO_SRC = 'data:image/png;base64,...'; // full base64 string

function OlaJesuLogo({ height = 64 }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Olajesu Kitchen"
      height={height}
      style={{ height: height + 'px', width: 'auto', display: 'block' }}
    />
  );
}
```

- **Nav size:** `height={64}` inside an `80px` tall nav bar
- **Footer size:** `height={64}`
- No border-radius, no background, no shadow on the logo element itself

---

## 6. Reusable Components

### AnimatedSection
Every content section (except the hero and nav) uses this wrapper. It uses `IntersectionObserver` to detect when the element enters the viewport and triggers a fade-up animation.

```jsx
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimatedSection({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}
```

**Animation rules:**
- Initial state: `opacity: 0`, `translateY(32px)` (32px below final position)
- Triggered state: `opacity: 1`, `translateY(0)`
- Duration: `0.7s`
- Easing: `ease`
- Delay: configurable via `delay` prop (in seconds)
- Trigger threshold: `0.15` (15% of element visible)
- Animation is **one-way**  once triggered, never reverts
- Stagger for menu items: `delay={i * 0.08}` (0s, 0.08s, 0.16s...)
- Stagger for Why Us cards: `delay={i * 0.1}` (0s, 0.1s, 0.2s...)

### Tag
Small badge component used on menu items and the WhatsApp section.

```jsx
function Tag({ children, color = "#1B4332" }) {
  return (
    <span style={{
      fontSize: "9px",
      fontFamily: "'Courier New', monospace",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color,
      border: `1px solid ${color}`,
      padding: "2px 7px",
      borderRadius: "2px",
      fontWeight: 700,
    }}>
      {children}
    </span>
  );
}
```

---

## 7. Section-by-Section Specification

---

### 7.1 Navigation

**Position:** Fixed to top, full width, `z-index: 100`, `height: 80px`

**Behaviour:**
- Transparent background when page is at top (scrollY ≤ 60px)
- After scrolling past 60px: background becomes `rgba(247,242,232,0.97)` with `backdrop-filter: blur(12px)` and `border-bottom: 1px solid #DDD6C4`
- Transition: `all 0.4s ease` on all properties
- Scroll detection: `window.addEventListener('scroll', ...)` in `useEffect`

**Layout:** `display: flex`, `justifyContent: space-between`, `alignItems: center`, `padding: 0 24px`

**Left side:** Logo at `height={64}`

**Right side:** Two items in a flex row with `gap: 8px`
1. "MENU" link  `href="#menu"`, color `#6B6355`, `fontSize: 12px`, `letterSpacing: 0.06em`, `textTransform: uppercase`, no text decoration, `padding: 8px 12px`
2. "ORDER NOW" button link  `href="#order"`, background `#1B4332`, color `#F7F2E8`, `fontSize: 12px`, `fontWeight: 700`, `letterSpacing: 0.06em`, uppercase, `padding: 8px 16px`, `borderRadius: 2px`, no text decoration

---

### 7.2 Hero Section

**Container:** `position: relative`, `minHeight: 100vh`, `display: flex`, `flexDirection: column`, `justifyContent: flex-end`, `overflow: hidden`

**Background layers (absolute, inset: 0):**

Layer 1  Gradient atmosphere:
```
radial-gradient(ellipse at 30% 40%, rgba(61,74,46,0.08) 0%, transparent 55%),
radial-gradient(ellipse at 70% 60%, rgba(156,139,110,0.12) 0%, transparent 50%),
radial-gradient(ellipse at 50% 80%, rgba(61,74,46,0.06) 0%, transparent 50%),
linear-gradient(180deg, #F7F2E8 0%, #EDE6D3 50%, #F7F2E8 100%)
```

Layer 2  Grain texture overlay: SVG `feTurbulence` noise at `opacity: 0.04`
```jsx
backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
```

Layer 3  Decorative circle 1: `position: absolute`, `top: 10%`, `right: -15%`, `width: 500px`, `height: 500px`, `borderRadius: 50%`, `border: 1px solid rgba(61,74,46,0.1)`, `pointerEvents: none`

Layer 4  Decorative circle 2: `position: absolute`, `top: 15%`, `right: -10%`, `width: 380px`, `height: 380px`, `borderRadius: 50%`, `border: 1px solid rgba(156,139,110,0.08)`, `pointerEvents: none`

**Hero content block:** `position: relative`, `padding: 120px 24px 80px`, `maxWidth: 640px`

**Eyebrow label:** Flex row, `gap: 12px`, `marginBottom: 20px`
- Rule line: `width: 32px`, `height: 1px`, `background: #1B4332`
- Text: `"Manchester · Authentic Nigerian"`, `fontSize: 10px`, `letterSpacing: 0.2em`, uppercase, `color: #1B4332`, sans-serif

**H1:** Three lines with a line break after each
- Line 1: `"Food that carries"`  plain, `color: #1A1A1A`
- Line 2: `"the flavour"`  italic span with gradient text: `background: linear-gradient(90deg, #1B4332, #9C8B6E)`, `WebkitBackgroundClip: text`, `WebkitTextFillColor: transparent`
- Line 3: `"of home."`  plain, `color: #1A1A1A`
- Size: `clamp(42px, 10vw, 72px)`, weight 400, `lineHeight: 1.05`, `margin: 0 0 24px`

**Paragraph:** `"Authentic Nigerian cuisine  cooked from scratch, delivered to your door in 22 minutes. From Jollof Rice to Egusi Soup, this is the real thing."`, `fontSize: 15px`, `lineHeight: 1.7`, `color: rgba(26,26,26,0.6)`, `maxWidth: 420px`, `margin: 0 0 40px`

**Button row:** `display: flex`, `gap: 12px`, `flexWrap: wrap`

Button 1  "Order Direct →":
- `href="#order"`, `display: inline-flex`, `alignItems: center`, `gap: 8px`
- Background `#1B4332`, color `#F7F2E8`, `padding: 14px 28px`
- `fontSize: 13px`, `fontWeight: 700`, `letterSpacing: 0.08em`, uppercase, `borderRadius: 2px`
- Arrow `→` is a separate span with `fontSize: 16px`

Button 2  "View Menu":
- `href="#menu"`, `display: inline-flex`, `alignItems: center`, `gap: 8px`
- `border: 1px solid rgba(61,74,46,0.3)`, `color: #1B4332`, transparent background
- `padding: 14px 28px`, `fontSize: 13px`, `fontWeight: 400`, `letterSpacing: 0.08em`, uppercase, `borderRadius: 2px`

**Stats bar** (sits at the very bottom of the hero, after content block):
- `position: relative`, `borderTop: 1px solid #DDD6C4`
- `display: grid`, `gridTemplateColumns: repeat(3, 1fr)`
- Background: `rgba(237,230,211,0.95)`, `backdropFilter: blur(10px)`
- Three cells: `"500+"` / Orders Delivered, `"22 min"` / Average Delivery, `"4.1 ★"` / Uber Eats Rating
- Each cell: `padding: 20px 16px`, `textAlign: center`
- First two cells have `borderRight: 1px solid #DDD6C4`
- Number: `fontSize: 22px`, `fontWeight: 700`, `color: #1B4332`, Georgia serif, `marginBottom: 4px`
- Label: `fontSize: 10px`, `letterSpacing: 0.12em`, uppercase, `color: #6B6355`, sans-serif

---

### 7.3 Crafted With Care (Our Story)

**Section:** `padding: 80px 24px`, `maxWidth: 760px`, `margin: 0 auto`

Entire section wrapped in `<AnimatedSection>` (no delay).

**Layout:** `display: flex`, `alignItems: flex-start`, `gap: 40px`, `flexWrap: wrap`

**Left column:** `flex: 1`, `minWidth: 260px`
- Eyebrow: rule `24px × 1px` in `#9C8B6E` + label `"Our Story"` in `#9C8B6E`, `letterSpacing: 0.2em`, `marginBottom: 16px`
- H2: `"Crafted"` + `<br/>` + italic span `"With Care"` in `#1B4332`
- `fontSize: 32px`, `fontWeight: 400`, `lineHeight: 1.2`, `margin: 0 0 20px`

**Right column:** `flex: 2`, `minWidth: 260px`
- Two paragraphs at `fontSize: 15px`, `lineHeight: 1.8`, `color: rgba(26,26,26,0.6)`
- Para 1 `margin: 0 0 16px`, Para 2 `margin: 0`

---

### 7.4 Menu Section

**Section:** `id="menu"`, `padding: 80px 0`, `borderTop: 1px solid #DDD6C4`

**Header block:** `padding: 0 24px`, `maxWidth: 760px`, `margin: 0 auto 48px`
Wrapped in `<AnimatedSection>`.
- Eyebrow: rule `24px × 1px` `#1B4332` + `"What We Cook"` `#1B4332`, `marginBottom: 12px`
- H2: `"The Menu"`, `fontSize: 36px`, `fontWeight: 400`, `lineHeight: 1.1`, `margin: 0`

**Category tab bar:**
- `display: flex`, `gap: 0`, `overflowX: auto`, `padding: 0 24px`
- `borderBottom: 1px solid #DDD6C4`, `marginBottom: 40px`
- `scrollbarWidth: none` (hidden scrollbar)
- Categories: Rice Dishes, Soup Dishes, Meat Dishes, Swallow Dishes, Pastries
- Default active: `"Rice Dishes"`

Each tab button:
- `background: none`, `border: none`, `cursor: pointer`, `whiteSpace: nowrap`
- `padding: 14px 20px`, `fontSize: 12px`, `letterSpacing: 0.08em`, uppercase
- **Active state:** `fontWeight: 700`, `color: #1B4332`, `borderBottom: 2px solid #1B4332`
- **Inactive state:** `fontWeight: 400`, `color: #6B6355`, `borderBottom: 2px solid transparent`
- `transition: all 0.2s ease`, `marginBottom: -1px` (overlaps the section border)

**Menu item list:** `padding: 0 24px`, `maxWidth: 760px`, `margin: 0 auto`

Each item wrapped in `<AnimatedSection delay={i * 0.08}>`.

Each item row:
- `display: flex`, `justifyContent: space-between`, `alignItems: flex-start`
- `padding: 24px 0`, `borderBottom: 1px solid #DDD6C4`, `gap: 16px`

Left side (`flex: 1`):
- Name + optional Tag in a flex row, `gap: 10px`, `marginBottom: 6px`, `flexWrap: wrap`
- Name: Georgia serif, `fontSize: 17px`, `color: #1A1A1A`
- Description: sans-serif, `fontSize: 13px`, `color: #6B6355`, `lineHeight: 1.6`, `margin: 0`

Right side (`flexShrink: 0`):
- Price: Georgia serif, `fontSize: 18px`, `fontWeight: 700`, `color: #1B4332`
- Add button: transparent bg, `border: 1px solid #1B4332`, `color: #1B4332`
- Button hover: bg fills `#1B4332`, text becomes `#F7F2E8`
- `padding: 6px 14px`, `fontSize: 11px`, `fontWeight: 700`, `letterSpacing: 0.08em`, uppercase, `borderRadius: 2px`, `transition: all 0.2s ease`

**Menu data:**
```
Rice Dishes:
  Jollof Rice  "Smoky, spiced tomato rice  the signature"  £9.50  tag: "Signature"
  Fried Rice  "Nigerian-style with mixed vegetables & seasoning"  £9.50
  Half & Half  "Jollof and fried rice combined"  £10.00

Soup Dishes:
  Egusi Soup  "Ground melon seed soup with leafy greens"  £13.50
  Efo Riro  "Rich Yoruba vegetable stew"  £13.50
  Afang Okazi Stew  "Traditional Cross River delicacy"  £14.00

Meat Dishes:
  Drumsticks  "Peppered & grilled to order"  £8.50
  Andewke Meat in Stew  "Slow-cooked in rich tomato base"  £13.00  tag: "Chef's Pick"
  Grilled Chicken with Jollof & Plantain  "The full OlaJesu experience"  £14.50

Swallow Dishes:
  Amala  "Yam flour swallow, dark & smooth"  £3.50
  Abula Amala, Gbegiri & Ewedu  "Classic Yoruba combination"  £14.50

Pastries:
  Puff Puff  "Fried dough balls  lightly sweet"  £3.50  tag: "100% Rated"
  Moi Moi  "Steamed bean pudding"  £3.50
```

**Uber Eats CTA card:** `padding: 48px 24px 0`, `maxWidth: 760px`, `margin: 0 auto`
Wrapped in `<AnimatedSection>`.
- Card: background `#EDE6D3`, `border: 1px solid #DDD6C4`, `borderRadius: 4px`, `padding: 28px 24px`
- `display: flex`, `justifyContent: space-between`, `alignItems: center`, `flexWrap: wrap`, `gap: 16px`
- Left: label `"Also available on"` in `#6B6355`, `fontSize: 12px`, uppercase, `letterSpacing: 0.1em` + heading `"Uber Eats"` Georgia `fontSize: 20px` `color: #1A1A1A`
- Right: button `"Order on Uber Eats →"`  background `#06C167`, color `#FFFFFF`, `padding: 12px 24px`, `fontSize: 12px`, `fontWeight: 700`, `letterSpacing: 0.08em`, uppercase, `borderRadius: 2px`

---

### 7.5 Why Choose OlaJesu

**Section:** `padding: 80px 24px`, `borderTop: 1px solid #DDD6C4`

**Container:** `maxWidth: 760px`, `margin: 0 auto`

Header wrapped in `<AnimatedSection>`:
- Eyebrow: rule `24px × 1px` in `#9C8B6E` + `"Why Us"` in `#9C8B6E`
- H2: `"Why Choose OlaJesu"`, `fontSize: 36px`, `fontWeight: 400`, `margin: 0 0 48px`

**Cards grid:** `display: grid`, `gridTemplateColumns: repeat(auto-fit, minmax(200px, 1fr))`, `gap: 2px`

Three cards, each in `<AnimatedSection delay={i * 0.1}>`:

| # | Icon | Title | Body | Top border colour |
|---|---|---|---|---|
| 0 | 🌍 | Authentic Heritage | "Every recipe carries the soul of Nigerian cooking  no shortcuts, no compromises." | `#1B4332` |
| 1 | ⚡ | Flexible Service | "From quick weeknight orders to full event catering. We move at your pace." | `#9C8B6E` |
| 2 | ⭐ | Trusted Reputation | "4.1 stars and climbing  real reviews from real customers across Manchester." | `#1B4332` |

Each card: background `#EDE6D3`, `padding: 32px 24px`, `borderTop: 3px solid [colour above]`
- Icon: `fontSize: 28px`, `marginBottom: 16px`
- H3: Georgia `fontSize: 18px`, `fontWeight: 400`, `margin: 0 0 12px`, `color: #1A1A1A`
- Body: sans-serif `fontSize: 13px`, `lineHeight: 1.7`, `color: #6B6355`, `margin: 0`

---

### 7.6 WhatsApp Banner

**Section:** `padding: 0 24px 80px` (no top padding, flows directly from Why Us)

**Container:** `maxWidth: 760px`, `margin: 0 auto`

Wrapped in `<AnimatedSection>`.

**Banner box:**
- Background: `linear-gradient(135deg, rgba(61,74,46,0.07) 0%, rgba(156,139,110,0.07) 100%)`
- `border: 1px solid rgba(61,74,46,0.2)`, `borderRadius: 4px`, `padding: 40px 32px`
- `display: flex`, `flexDirection: column`, `alignItems: flex-start`, `gap: 16px`

Contents top to bottom:
1. `<Tag color="#1B4332">Exclusive to Direct Customers</Tag>`
2. H3: `"Get offers before anyone else."` + `<br/>` + italic span `"Join our WhatsApp list."` in `#1B4332`  Georgia `fontSize: 26px`, `fontWeight: 400`, `lineHeight: 1.2`, `color: #1A1A1A`
3. Paragraph: `"Weekly specials, new dishes, and first access to The Jollof Box launch  sent directly to your WhatsApp. No spam. Unsubscribe any time."`  sans-serif `fontSize: 14px`, `color: #6B6355`, `lineHeight: 1.7`
4. WhatsApp button: `href="https://wa.me/447000000000?text=I%20want%20offers%20from%20OlaJesu"`  `display: inline-flex`, `alignItems: center`, `gap: 8px`, background `#25D366`, color `#FFFFFF`, `padding: 14px 28px`, `fontSize: 13px`, `fontWeight: 700`, `letterSpacing: 0.06em`, uppercase, `borderRadius: 2px`  text: `💬 Join on WhatsApp`

---

### 7.7 Events & Catering Form

**Section:** `id="order"`, `padding: 80px 24px`, `borderTop: 1px solid #DDD6C4`

**Container:** `maxWidth: 760px`, `margin: 0 auto`

Header wrapped in `<AnimatedSection>`:
- Eyebrow: rule `24px × 1px` `#1B4332` + `"Events & Catering"` `#1B4332`
- H2: `"Elevate Your Event"`, `fontSize: 36px`, `fontWeight: 400`, `margin: 0 0 12px`
- Subtitle: `"Planning something special? We cater for events across Greater Manchester. Get a quote below."`  sans-serif `fontSize: 15px`, `color: #6B6355`, `margin: 0 0 48px`, `lineHeight: 1.7`

**Form state:** Two states  form visible (default) or success card (after submit)

**Success card** (shown after submit):
- Background `#EDE6D3`, `border: 1px solid #1B4332`, `borderRadius: 4px`, `padding: 48px 32px`, `textAlign: center`
- ✅ emoji at `fontSize: 40px`, `marginBottom: 16px`
- H3: `"Quote Request Received"` Georgia `fontSize: 24px` `color: #1A1A1A` `margin: 0 0 12px`
- Para: `"We'll be in touch within 24 hours."` sans-serif `fontSize: 14px` `color: #6B6355`

**Form grid:** `display: grid`, `gridTemplateColumns: 1fr 1fr`, `gap: 16px`

Fields (in order):
| Field | Label | Type | Grid span |
|---|---|---|---|
| name | Full Name | text | half |
| email | Email Address | email | half |
| phone | Phone Number | tel | half |
| event | Event Type | text | half |
| guests | Number of Guests | number | half |
| date | Event Date | date | half |
| message | Additional Details | textarea (4 rows) | full width |

Each field:
- Label: sans-serif `fontSize: 11px`, `letterSpacing: 0.1em`, uppercase, `color: #6B6355`, `display: block`, `marginBottom: 8px`
- Input/textarea: `width: 100%`, `background: #FFFFFF`, `border: 1px solid #DDD6C4`, `color: #1A1A1A`, `padding: 14px 16px`, sans-serif `fontSize: 14px`, `borderRadius: 2px`, `outline: none`, `boxSizing: border-box`
- Textarea adds: `resize: vertical`

**Submit button:** Full width (`gridColumn: 1 / -1`), background `#1B4332`, color `#F7F2E8`, `border: none`, `padding: 16px`, `fontSize: 13px`, `fontWeight: 700`, `letterSpacing: 0.1em`, uppercase, `borderRadius: 2px`, `cursor: pointer`
Text: `"Submit Quote Request →"`

**Submit behaviour:** `onClick` sets `submitted` state to `true`, replaces form with success card. No API call in base version.

---

### 7.8 Footer

**Element:** `<footer>`, `borderTop: 1px solid #DDD6C4`, `padding: 48px 24px 32px`

**Container:** `maxWidth: 760px`, `margin: 0 auto`

**Main grid:** `display: grid`, `gridTemplateColumns: 1fr 1fr`, `gap: 40px`, `marginBottom: 40px`

**Left column:**
- Logo at `height={64}`, `marginBottom: 16px`
- Tagline: `"Authentic Nigerian cuisine, delivered from our Manchester kitchen to your door."`  sans-serif `fontSize: 13px`, `color: #6B6355`, `lineHeight: 1.7`, `margin: 0 0 16px`
- Address: `"20-22 Mary Street, Unit 3"` + `<br/>` + `"Manchester, UK"`  sans-serif `fontSize: 12px`, `color: #6B6355`, `margin: 0`

**Right column:**
- Heading: `"Contact"`  sans-serif `fontSize: 10px`, `letterSpacing: 0.15em`, uppercase, `color: #6B6355`, `margin: 0 0 16px`
- Three links stacked in a flex column with `gap: 8px`: Instagram, WhatsApp, olajesu@gmail.com
- Links: `color: #6B6355`, no text decoration, sans-serif `fontSize: 13px`

**Bottom bar:** `borderTop: 1px solid #DDD6C4`, `paddingTop: 24px`
- `display: flex`, `justifyContent: space-between`, `alignItems: center`, `flexWrap: wrap`, `gap: 8px`
- Left: `"© 2026 OlaJesu Ghost Kitchen"`  sans-serif `fontSize: 12px`, `color: rgba(26,26,26,0.35)`
- Right: `"Manchester, UK"`  same style

---

## 8. Scroll & Motion Behaviour

### Scroll animations (all sections except hero and nav)
- Every major content block is wrapped in `<AnimatedSection>`
- On page load: all animated sections are invisible (`opacity: 0`) and `32px` below their final position
- As the user scrolls and each section reaches 15% visibility in the viewport, it animates in: `opacity 0→1` + `translateY(32px→0)` over `0.7s ease`
- Once visible, sections stay visible  they do not re-animate
- Multiple items in a list (menu items, cards) stagger with incremental delays

### Nav scroll behaviour
- Scrolling past 60px triggers the nav background and border
- Scroll back to top: nav returns to transparent (transition: `all 0.4s ease`)

### Menu tab switching
- Clicking a category tab: `activeCategory` state updates instantly, menu items re-render
- Each new set of menu items re-triggers `AnimatedSection` because keys change

### Button hover states
- Add button: instant fill on hover via `onMouseEnter`/`onMouseLeave` inline handlers
- `transition: all 0.2s ease` on the button

### No other animations
There are no parallax effects, no page transitions, no loading spinners, no number count-ups. All motion is limited to the scroll-reveal fade-up and the nav/button transitions.

---

## 9. Responsive Behaviour

The site is built mobile-first. Key responsive rules:

- `maxWidth: 760px` containers centre on wide screens, fill edge-to-edge on mobile with `24px` horizontal padding
- H1 uses `clamp(42px, 10vw, 72px)`  scales fluidly with viewport width
- Hero content max-width `640px`  never wider than this
- Why Us cards grid: `repeat(auto-fit, minmax(200px, 1fr))`  single column on mobile, three columns on desktop
- Footer grid: `1fr 1fr`  two columns always (may need to add `auto-fit` breakpoint for very small screens)
- Menu tabs: `overflowX: auto` with hidden scrollbar  scrollable on mobile
- Button row: `flexWrap: wrap`  stacks on very narrow screens
- Stats bar: always 3 equal columns regardless of screen width
- Story section columns: `flexWrap: wrap`, each `minWidth: 260px`  stack on small screens
- Form grid: `1fr 1fr` always  on very small screens this may be tight (no breakpoint currently defined)

---

## 10. State Management

Three pieces of state:

```jsx
const [activeCategory, setActiveCategory] = useState("Rice Dishes");
const [scrolled, setScrolled] = useState(false);
const [formData, setFormData] = useState({
  name: "", email: "", phone: "", event: "", guests: "", date: "", message: ""
});
const [submitted, setSubmitted] = useState(false);
```

- `activeCategory`  controls which menu tab and items are shown
- `scrolled`  controls nav appearance
- `formData`  controlled form inputs
- `submitted`  switches form to success state

---

## 11. Component & File Structure

Everything lives in a single `.jsx` file in this order:

1. Imports (`useState`, `useEffect`, `useRef`)
2. `colors` object
3. `LOGO_SRC` constant (base64 PNG)
4. `OlaJesuLogo` component
5. `menuData` object
6. `whyUs` array
7. `useInView` custom hook
8. `AnimatedSection` component
9. `Tag` component
10. `OlaJesuWebsite` default export (main component)

---

## 12. Things That Must Not Change

1. The font stack  Georgia for all headings, sans-serif for all body/UI, Courier New for tags only
2. The `#1B4332` green  this is extracted directly from the actual logo. Do not substitute
3. The `clamp(42px, 10vw, 72px)` hero heading  this fluid scaling is intentional
4. The `2px` border-radius on all buttons  sharp but not square
5. The `gap: 2px` between Why Us cards  this creates a tight grid feel
6. The `marginBottom: -1px` on tab buttons  this makes the active border-bottom merge with the section border
7. The one-way scroll animation  sections never animate out, only in
8. The stats bar sitting flush at the bottom of the hero viewport
9. The `overflowX: hidden` on the root div  prevents the decorative circles from causing horizontal scroll
10. Inline styles only  no external CSS