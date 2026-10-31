# Mr. Popcorn Man — spec website

A six-page, static marketing site built from the October 2026 brief. No framework,
no build step: plain HTML, CSS and a single JavaScript file.

## Run it

From this folder:

```sh
python -m http.server 4317 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4317/>. Serving from the folder root keeps the clean
URLs (`/catering/`, `/flavors/`, …) working; opening `index.html` directly will
break the root-relative asset and page links.

## Pages

| URL | File | Job |
| --- | --- | --- |
| `/` | `index.html` | Hero, two offers, flavors teaser, scroll-driven popcorn section |
| `/catering/` | `catering/index.html` | Event types, packages, booking steps, FAQ |
| `/fundraising/` | `fundraising/index.html` | Pitch, flavors, four-step program, kit request |
| `/flavors/` | `flavors/index.html` | 15 flavors, filterable by category |
| `/about/` | `about/index.html` | Andre's story, values, Instagram |
| `/contact/` | `contact/index.html` | Branching quote form, call/email/hours |
| `/thank-you/` | `thank-you/index.html` | Confirmation page (noindex) |

`robots.txt` and `sitemap.xml` are included.

## The motion

- Hero: floating mascot, staggered popcorn pop-in, subtle scroll parallax.
- **`#how` / `.pop-scroll`:** a 300vh pinned section. Scroll progress pops 16
  kernels out of the bucket and highlights three steps. It falls back to a
  static, readable layout on small screens and for reduced-motion users.
- Sections and cards reveal with IntersectionObserver; the ticker is CSS-only.

All motion is disabled under `prefers-reduced-motion: reduce`.

## The quote form

The form branches between Catering and Fundraising, requires only the fields the
brief specifies, and filters spam with a hidden honeypot.

Out of the box it composes an email to `andre@mrpopcornman.com` in the visitor's
mail app and shows an inline confirmation with a call fallback. To collect
submissions server-side instead, set `formEndpoint` at the top of
`assets/site.js` to a form service or Worker URL (it accepts JSON). With an
endpoint set, a successful request shows the confirmation and then lands on
`/thank-you/` for clean conversion tracking.

`assets/site.js` also exposes `quote_request` and `call_click` analytics events
through `gtag` / `dataLayer` when Google Analytics is added.

## Still needs Andre

The brief's bracketed answers are the remaining content gaps. The design is built
so these drop in without a redesign:

- **Photos** of the truck, Andre and real events. The site currently uses
  licensed stock photography as stand-ins (see below) — see the swap items
  marked `PLACEHOLDER PHOTO` in the HTML. Do not publish the stock shots as
  Andre's truck.
- **Instagram handle** — currently `@mrpopcornman`, pending confirmation between
  `@mrpopcornman` and `@mr_popcorn_man`.
- **Catering prices** — shown as "from $350 / $500 / $1,000" pending confirmation.
- **Fundraising terms** — per-bag price, profit share, minimums, delivery, lead
  time. The site intentionally says these are confirmed per group.
- **Reviews** — no testimonials are invented. Add real Google/Yelp quotes when
  available.
- **Service area** — currently Los Angeles, San Fernando Valley and South Bay.
- **The fundraiser flyer** — no PDF is included yet; the page invites a kit
  request instead.
- **Google Business Profile** link and GA4 measurement ID.

## Stock photo stand-ins

Until Andre's own photos exist, six licensed photos fill the image slots. They are
free to use under the [Pexels License](https://www.pexels.com/license/) — no
attribution required, no reselling unmodified, and no implying endorsement. Every
one is a `PLACEHOLDER PHOTO` comment in the HTML; drop in a same-shape photo and
nothing else changes.

| File | Source | Used on |
|---|---|---|
| `assets/photos/cart.webp` | [Pexels 7603988](https://www.pexels.com/photo/popcorn-cart-in-a-parking-lot-7603988/) | Home Instagram tile, Catering split |
| `assets/photos/cart-night.webp` | [Pexels 9137018](https://www.pexels.com/photo/food-cart-on-the-street-9137018/) | About photo strip |
| `assets/photos/event-crowd.webp` | [Pexels 38431294](https://www.pexels.com/photo/38431294/) | Home "Book the Truck" card, Instagram tile |
| `assets/photos/popcorn-bowl.webp` | [Pexels 6965471](https://www.pexels.com/photo/6965471/) | About photo strip |
| `assets/photos/popcorn-bucket-wide.webp` | [Pexels 7234396](https://www.pexels.com/photo/7234396/) | Home "Raise Money" card, Instagram tile |
| `assets/photos/flavor-bowls.webp` | [Pexels 10638917](https://www.pexels.com/photo/10638917/) | Fundraising split |

The floating kernels, the hero and the scroll animation stay as the drawn SVG
kernels from `assets/sprite.svg#puff` — they animate better than cut-out photos
and match the logo.

The hero and About still show the mascot rather than a person, because a stock
portrait standing in for Andre would be a false claim.

## Notes

- Brand palette is eyedropped from the logo: red `#e82327`, navy `#131f3a`,
  butter `#fed801`, cream `#fff7e8`.
- Fonts are self-hosted: Bebas Neue (display), Caveat (script), Inter (body).
- Canonicals and Open Graph tags assume `https://mrpopcornman.com`.
