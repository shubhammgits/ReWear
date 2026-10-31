# ReWear — Wear more. Own less.

A peer-to-peer clothing rental marketplace front end. Renters book occasion wear by the hour or day; lenders list their wardrobe and earn. Everything runs on mock JSON data, organized so a real API can drop in later.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **GSAP + ScrollTrigger** for pinned and scrubbed scroll scenes, **Lenis** for smooth scrolling
- **React Three Fiber + drei** for the WebGL hero (custom cloth-wave shader) and the item 3D viewer
- **Framer Motion** for route transitions, text reveals, magnetic buttons, tilt cards and micro-interactions
- **lucide-react** icons, **next/font** (Fraunces + DM Sans), **next/image** with AVIF/WebP

## Getting started

Requires Node 18.18+ (Node 20+ recommended).

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

> Tip: if the project lives inside a OneDrive or Dropbox folder, `npm install` can be very slow. Pausing sync or moving the folder helps.

## Routes

| Route | What's there |
| --- | --- |
| `/` | The scroll story: 3D hero → closet opening (pinned) → how it works (Renter/Lender toggle) → occasion carousel (pinned horizontal scroll) → featured rentals (tilt + quick view) → price calculator → earnings estimator → trust + reviews → impact counters → FAQ → final CTA |
| `/browse` | Search, filters (occasion, size, city, duration, max price), sort, animated grid. Filters sync to the URL so links are shareable (e.g. `/browse?occasion=Wedding`) |
| `/item/[id]` | Gallery with hover zoom, lazy 3D viewer, date/time picker, live price breakdown, lender card, reviews, similar items. Statically generated for all 20 items |
| `/list-your-clothes` | 4-step form: photo upload with previews (drag & drop), details, pricing per 4h/day/3 days, availability calendar |
| `/dashboard` | Mock "My rentals" and "My earnings" (stats, bar chart, listings table) |

## Project structure

```
src/
  app/                    # Routes (App Router)
    template.tsx          # Route transition curtain
    browse/ item/[id]/ list-your-clothes/ dashboard/
  components/
    home/                 # One file per home-page section
    layout/               # Header, Footer, CustomCursor
    product/              # ProductCard, QuickView, Gallery, PriceBreakdown
    three/                # HeroScene (R3F), HeroVisual (lazy loader + fallback), ItemViewer3D
    providers/            # SmoothScroll (Lenis ↔ GSAP ticker)
    ui/                   # Button (magnetic), Reveal, Counter, Slider, Modal, PageHeader
  data/                   # Mock JSON: items, lenders, reviews, content, dashboard
  lib/
    api.ts                # Data access layer: swap for fetch() calls later
    pricing.ts            # Rental quote + lender earnings logic
    types.ts, utils.ts, gsap.ts
```

### Swapping in a real API

All reads go through `src/lib/api.ts`. The async functions (`getItems`, `getItem`, `getLender`, `getReviewsForItem`, …) already return Promises with typed shapes, so replace their bodies with `fetch()` calls and the pages keep working.

## Design system

Tokens live as CSS variables in `src/app/globals.css` and are exposed to Tailwind via `@theme`:

| Token | Value |
| --- | --- |
| `--ivory` (background) | `#FAF7F2` |
| `--ink` (text) | `#14110F` |
| `--plum` (primary) | `#4B1D3F` |
| `--gold` (accent) | `#C9A24B` |
| `--blush` (highlight) | `#F3D9D3` |

Headings use Fraunces, body uses DM Sans. Cards are rounded with soft plum-tinted shadows, plus a lightweight SVG film-grain overlay.

## Performance & accessibility

- The hero shows a static image collage first (fast LCP), then lazy-loads WebGL on `requestIdleCallback`. 3D is skipped entirely on low-end devices (≤2 cores, ≤2 GB RAM, Save-Data) and with reduced motion, and its render loop pauses when the hero is off screen.
- Lenis and the custom cursor are disabled on touch devices and with `prefers-reduced-motion`; GSAP scenes are wrapped in `gsap.matchMedia` so reduced-motion users get static layouts.
- Images go through `next/image` (AVIF/WebP, responsive `sizes`).
- Skip link, visible focus rings, ARIA on tabs, accordion, dialogs (focus trap + Esc), carousel and form errors; every content image has alt text.

## Credits

Placeholder photography from [Unsplash](https://unsplash.com). All people, listings, reviews and numbers are fictional demo data.
