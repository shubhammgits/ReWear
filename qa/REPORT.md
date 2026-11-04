# ReWear: mobile, overlap and performance pass

The work was done in six stages. Each stage sits on its own branch, built on the one before (`stage-2` → … → `stage-6`). **Nothing has been merged to `main`.** To ship everything, merge `stage-6`.

Testing:
- Playwright with WebKit 27.2 (build 2370): iPhone 14 at 390x844, iPhone 15 Pro at 430x932, iPhone 14 landscape at 844x390.
- Playwright with Chromium: 360x740, 768x1024, 1024x768, 1024x600, 1440x900 and 1920x1080.

Every stage passed `npm run lint`, `npm run typecheck` and `npm run build`. Every audit run had 0 console errors or warnings.

| Stage | Branch / commit | Notes |
| --- | --- | --- |
| 1. Audit | `qa: mobile/overlap audit` | `qa/AUDIT.md` |
| 2. Overlaps | `stage-2` · 96d8c9e | `qa/STAGE2.md` |
| 3. Mobile-first layout | `stage-3` · 0db44c1 | `qa/STAGE3.md` |
| 4. Touch-safe motion | `stage-4` · 1b7d5f7 | `qa/STAGE4.md` |
| 5. Performance | `stage-5` · 90e7276 | `qa/STAGE5.md` |
| 6. Safari / landscape / contrast / focus | `stage-6` | `qa/STAGE6.md` |

## Issues found → fixed

| Issue | Fix | Stage |
| --- | --- | --- |
| Closet scene: flying photos covered the headline and paragraph; doors left purple slabs at the screen edges on phones; arch read as an empty dark hole | Rebuilt as headline / stage / paragraph grid rows. Photo targets are measured from the stage. Warm plum arch with gold rail. Doors fade once open. | 2 |
| Item page scrolled sideways at 360 and 1024; main photo spilled over the reviews | `minmax(0, …)` columns, `min-w-0`, full-width photo | 2 |
| Browse cards painted over the sticky toolbar at 360 | Toolbar radius/stacking fixed | 2 |
| Hero glow blobs overflowed the viewport (sideways scroll on iOS without `clip`) | `vw`/`clamp()` sizes inside a clipping layer. `@supports` fallback for old iOS (Stage 6: the original fallback had been dropped by the minifier). | 2, 6 |
| Tap targets under 44px (header, footer, chips, toggles, listing steps) | All interactive controls ≥44px | 3 |
| Inputs at 14px triggered iOS zoom on focus | All inputs and selects 16px. Native WebKit select chrome replaced. | 3 |
| Tiny dropdown menu, no scroll lock, no mobile CTA | Full-screen menu sheet with scroll lock, Esc and focus return. Sticky "Rent an outfit" bar on phones. | 3 |
| Phone layouts: off-screen How-it-works track; cramped cards, calculator, item gallery and listing form | Vertical steps; compact cards; swipe gallery with dots; sticky price bar; camera capture; sticky progress and action bars | 3 |
| `vh` jumps with the iOS address bar | `svh`/`dvh` throughout. `ScrollTrigger.config({ ignoreMobileResize: true })`. One refresh after fonts and load. | 3, 4 |
| Hover effects (tilt, magnetic pull) running on touch; Quick view hidden on touch tablets | `useFinePointer()` gate and `pointer-fine:` variant | 4 |
| Text invisible without JS or with reduced motion; counters stuck at 0 | `<noscript>` end-state styles, SSR final counter values, `MotionConfig reducedMotion="user"` | 4 |
| Oversized images (up to w=3840), no placeholders, everything preloaded | Capped `deviceSizes`, correct `sizes`, priority only above the fold, inline SVG blur | 5 |
| Heavy hero on phones (three.js + shader compile ≈ 2.5s main-thread block) | Phones keep the floating photo collage. drei removed from the hero chunk. | 5 |
| Mobile LCP stuck at ≈10s (Stage 4 build) because the intro paragraph faded in from opacity 0 | Intro paragraph renders opaque and slides in | 5 |
| Browse grid rendered client-only; Quick view in first-load JS | Grid in the static HTML; Quick view loaded on demand | 5 |
| Focus ring invisible on dark sections (≈1.4:1) | Gold ring on `.surface-dark` (≥5.9:1) | 6 |
| Gold text on ivory (2.3:1); faint ivory placeholders and footnotes (3.3–4.3:1) | `--gold-deep` (5.8:1); ivory opacities raised (≥6:1) | 6 |
| Landscape phone: headline filled the first screen; occasion card titles off screen | Headline also capped by `17svh`; cards `max-h-[80svh]` | 6 |

## Performance (lab, Playwright)

Setup: Chromium at 390x844 with mobile emulation, 4x CPU throttle, Slow-4G, cold cache, median of 3. PSI wasn't used; the anonymous quota was exhausted, and no key was provided.

| Home | LCP | TBT* | Transfer | CLS |
| --- | --- | --- | --- | --- |
| **Before**: live site, `qa/perf-before.json` | 2.8 s | 3897 ms | 856 KB | 0 |
| Stage 4 build (local) | 10.4 s | 4240 ms | 865 KB | 0 |
| **After**: Stage 5/6 build (local) | **2.2 s** | **1790–2514 ms** | **700 KB** | 0 |

| Other pages (Stage 4 → Stage 5 build) | LCP | TBT* | Transfer |
| --- | --- | --- | --- |
| Browse | 4.7 → **1.6 s** | 1476 → 1387 ms | 835 → **719 KB** |
| Item | 2.2 → 2.2–2.5 s | 1155 → 978–1308 ms | 859 → **692 KB** |

\*TBT here is the sum of (long task − 50 ms) during load plus 5 s. It runs higher than Lighthouse's TBT.

Caveats:
- The "after" numbers come from local production builds (`next start`), not Vercel previews, because the previews sit behind Vercel SSO.
- Single-machine timings vary by about ±15%.
- The Stage 4 LCP regression was found by this measurement and fixed in Stage 5.
- Stage 6 is CSS-only, with no JS or image changes, so it was not re-measured.
- Full data: `qa/perf-before.json` and `qa/perf-stage5.json`.

## Screenshots
- Before: `qa/before/<config>/`
- After each stage: `qa/after/` (Stage 2), `qa/after-stage3/`, `qa/after-stage4/` (plus `motion/`), `qa/after-stage5/`, `qa/after-stage6/`, with one folder per config
- Side-by-side closet and hero: `qa/compare-hero-closet-webkit-390.jpg`, `qa/compare-hero-closet-chromium-1440.jpg`
- Hero on phone vs desktop: `qa/after-stage5/phone-390-hero-collage.jpg`, `qa/after-stage5/desktop-1440-hero-3d.jpg`
- Focus rings: `qa/after-stage6/focus-before/` vs `qa/after-stage6/focus-after/`

## Remaining issues and tradeoffs
1. **Phones show the static photo collage, not the 3D hero.** This was a deliberate performance trade. It's a one-line revert in `src/components/three/HeroVisual.tsx`.
2. **Filtered browse links flash the full grid for one frame.** For example, `/browse?occasion=Wedding` shows all 20 cards before the filter applies on hydration. That's the cost of putting the grid in the static HTML.
3. **Home TBT is still around 2 s at 4x CPU.** It's mostly GSAP, Framer, Lenis and hydration on a long page. Further gains would need splitting below-the-fold sections into lazy chunks.
4. **Supported baseline is iOS 16.4+.** That's Tailwind v4's own requirement. Older iOS gets degraded styling. The `overflow-x` fallback only protects against sideways scrolling.
5. **Not tested on a real iPhone.** All WebKit results are Playwright's WebKit build on Windows. Headless WebKit renders at about 4 fps, so some audit shots catch animations mid-way; settled re-shots are noted per stage. Use the checklist below on a device.
6. **The gold "." in the logo is 2.3:1.** Logotypes are exempt from WCAG contrast rules; it was left as brand.
7. **Vercel previews need a login.** Preview performance couldn't be measured, and the previews must be opened while signed in to Vercel.

## iPhone QA checklist (Safari, real device)

**Portrait (iPhone 14 / 15 Pro)**
- [ ] Home loads with no sideways wobble when swiping horizontally anywhere on the page.
- [ ] Hero: headline, intro, CTAs visible; floating photo collage animates; no 3D canvas.
- [ ] Scroll the closet section: doors open, photos fan in, no text covered, no purple slabs at the edges.
- [ ] Address bar collapse/expand mid-scroll causes no jumps in the closet or occasions sections.
- [ ] Occasions: swipe the cards sideways. The next card peeks and the page doesn't scroll vertically while swiping.
- [ ] The sticky "Rent an outfit" bar appears after the hero, sits above the home indicator, and hides while the menu is open.
- [ ] Menu: opens full screen, the page behind doesn't scroll, and closing returns to the same position.
- [ ] Product cards: tapping shows no tilt; Quick view is always visible, opens, and closes with the ✕ button.
- [ ] Browse: tapping search, sort or city **doesn't zoom the page**. Filters drawer opens, scroll-locks, and applies.
- [ ] `/browse?occasion=Wedding` shows wedding items (a brief full-grid flash is expected).
- [ ] Item page: swipe the gallery and the dots follow. The sticky price bar shows until the booking card is reached. The date and time pickers open the native iOS pickers without zoom.
- [ ] Listing form: "Take a photo" opens the camera. Progress bar and Back/Continue stay pinned, and the keyboard doesn't hide the active field.
- [ ] Dashboard: tabs switch and the charts render.
- [ ] Footer: newsletter field doesn't zoom; links are easy to tap; the last row isn't hidden under the sticky bar.

**Landscape (rotate on Home, Browse and Item)**
- [ ] Hero headline and intro line both fit on the first screen.
- [ ] Occasion card titles are visible without scrolling the card.
- [ ] No sideways scroll. The notch side has safe-area padding on the header.

**Settings**
- [ ] Settings → Accessibility → Motion → Reduce Motion ON: no slide or parallax, the closet shows its finished state, counters show final numbers.
- [ ] Larger Text (Dynamic Type) at one or two steps up: no text clipped in buttons, chips or cards.
- [ ] With a Bluetooth keyboard, or Full Keyboard Access, Tab through Home: a ring is visible on every control, gold on the dark sections.
- [ ] Low Power Mode: scrolling stays smooth and nothing stays invisible.
