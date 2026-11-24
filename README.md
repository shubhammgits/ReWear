# ReWear — Wear more. Own less.

A clothing rental site for one launch city. Renters pick occasion wear by the hour or day and book on WhatsApp; lenders fill in a listing form that arrives as a WhatsApp message. There is no backend yet: outfits live in JSON files, organized so a real API can drop in later.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **GSAP + ScrollTrigger** for pinned and scrubbed scroll scenes, **Lenis** for smooth scrolling
- **React Three Fiber + drei** for the WebGL hero (custom cloth-wave shader) and the item 3D viewer
- **Framer Motion** for route transitions, text reveals, magnetic buttons, tilt cards and micro-interactions
- **lucide-react** icons, **next/font** (Fraunces + DM Sans), **next/image** with AVIF/WebP

## Launch setup

All settings are listed in `.env.example`. Copy it to `.env.local` for local runs, and add the same names in the host's environment variables for the live site (then redeploy: `NEXT_PUBLIC_*` values are read at build time). Never commit `.env.local` or paste the two secrets anywhere.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_CITY`, `NEXT_PUBLIC_WHATSAPP` | The one city served; the WhatsApp Business number (country code first, digits only) |
| `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_ADDRESS` | Contact and policy pages (Razorpay checks these before activation) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Database, sign-in and photo storage. Without them the site shows the sample outfits and books on WhatsApp |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Server-side holds, payments and refunds |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Online checkout. `RAZORPAY_KEY_SECRET` is **secret** |
| `RAZORPAY_WEBHOOK_SECRET` | **Secret.** Confirms payments even if the renter closes the browser mid-checkout |
| `NEXT_PUBLIC_GOOGLE_SIGNIN` | `on` shows "Continue with Google" once it's set up in Supabase |

### Supabase (once)

1. Run `supabase/migrations/0001_init.sql` in the SQL Editor.
2. **Authentication → URL Configuration**: Site URL = the live site; Redirect URLs = `http://localhost:3000/**` and `https://<live-domain>/**`.
3. **Authentication → Emails → Magic Link** template: add `{{ .Token }}` so the email carries the 6-digit code (the link keeps working too), e.g. `<p>Your ReWear code is <strong>{{ .Token }}</strong></p>`.
4. Before real customers: Supabase's built-in email sends only a few emails per hour. Add custom SMTP (Authentication → Emails → SMTP Settings), e.g. Resend or Brevo on their free plans.
5. Make yourself admin after your first sign-in: `node --env-file=.env.local scripts/make-admin.mjs you@example.com`, then open `/admin`.

### Razorpay webhook (on the live site)

Razorpay → Settings → Webhooks → Add: URL `https://<live-domain>/api/razorpay/webhook`, a secret (also set as `RAZORPAY_WEBHOOK_SECRET`), events `payment.captured`, `payment.failed`, `refund.processed`, `refund.failed`. Test and live mode each need their own webhook.

### How bookings work

- Renters sign in (email code, or Google), pick a start date on the availability calendar, a time and a duration, then pay with Razorpay Checkout. The price is always recalculated on the server.
- Checkout holds the dates for 15 minutes. Postgres refuses overlapping bookings (`no_double_booking`), cleaning turnaround (24h) included, even if two people pay at the same moment. If a payment lands after its hold lapsed and the dates went to someone else, it is refunded in full automatically.
- Renters cancel from **My bookings**; refunds follow `/refunds` (`src/lib/policy.ts`). The admin can cancel with a full, policy or custom refund.
- Lenders are paid by hand: **Admin → Payouts** lists what each lender is owed (full rent once returned, or the forfeited rent on a late cancellation). Send it by UPI, then mark it paid with the reference.

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
| `/` | The scroll story: 3D hero → closet opening (pinned) → how it works (Renter/Lender toggle) → occasion carousel (pinned horizontal scroll) → featured rentals (tilt + quick view) → price calculator → earnings estimator → trust → impact → FAQ → final CTA |
| `/browse` | Search, filters (occasion, size, city, duration, max price), sort, animated grid. Filters sync to the URL so links are shareable (e.g. `/browse?occasion=Wedding`) |
| `/item/[id]` | Gallery, availability calendar, live price breakdown and Razorpay checkout (or "Book on WhatsApp" when online booking isn't configured), similar items |
| `/login` | Sign in or sign up with an emailed code (and Google, when enabled) |
| `/bookings`, `/bookings/[code]` | A renter's bookings, payment breakdown, refunds and self-service cancellation |
| `/admin` | Admin only: today's handovers and returns, bookings, outfits with photo upload, lenders, payouts |
| `/list-your-clothes` | 4-step form: photos, details, pricing per 4h/day/3 days, availability calendar. Sends the listing to ReWear on WhatsApp; the lender attaches photos in the chat |

## Project structure

```
src/
  app/                    # Routes (App Router)
    template.tsx          # Route transition curtain
    browse/ item/[id]/ list-your-clothes/
  components/
    home/                 # One file per home-page section
    layout/               # Header, Footer, CustomCursor
    product/              # ProductCard, QuickView, Gallery, PriceBreakdown
    three/                # HeroScene (R3F), HeroVisual (lazy loader + fallback), ItemViewer3D
    providers/            # SmoothScroll (Lenis ↔ GSAP ticker)
    ui/                   # Button (magnetic), Reveal, Counter, Slider, Modal, PageHeader
  data/                   # JSON data: items, lenders, reviews, content
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

Sample outfit photos from [Unsplash](https://unsplash.com). The 20 sample outfits are placeholders until `src/data/items.json` holds real listings.
