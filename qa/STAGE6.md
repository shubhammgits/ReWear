# Stage 6: Safari, landscape, contrast, focus

Checked against a production build of this branch with:
- the audit runner: 9 configs, the usual 8 plus a short **1024x600** tablet. All return `findings: {}` with no console errors or warnings.
- a new contrast and keyboard-focus checker (`qa/a11y-check.js`), run at 390x844 and 1440x900.
- focus-ring screenshots before and after: `qa/after-stage6/focus-before/` and `qa/after-stage6/focus-after/`.

## Changes

| Area | Change |
| --- | --- |
| Old iOS overflow | The Stage 3 `overflow-x: hidden` fallback on `html` **never shipped**. The CSS minifier treated it as a duplicate of the `clip` line after it and dropped it. It now lives in `@supports not (overflow-x: clip)`, which survives minification (checked in the built CSS). |
| Focus rings on dark sections | The global plum ring measured about 1.4:1 on ink/plum, which is invisible. A `.surface-dark` class switches it to gold (≥5.9:1). It is applied to the footer, the earn section, the final CTA, the occasions band, the dashboard earnings card and the listing payout note. Light surfaces keep the plum ring. |
| Gold text on light | New token `--gold-deep` (#7a5c18, 5.8:1 on ivory, 5.0:1 on sand) for the listing step numbers and the "How it works" numerals. Brand gold `--gold` (2.3:1 on ivory) stays for icons, stars and text on dark backgrounds. |
| Faint text on dark | Newsletter placeholder ivory/40 → /60 (3.5 → 6:1). Earn-section footnote ivory/50 → /70 (4.3 → 7:1). Footer legal line ivory/50 → /60. |
| Landscape hero | The headline is `clamp(2.75rem, min(11vw, 17svh), 7.5rem)`. On an 844x390 phone it drops from 92px to 66px, so the intro line starts on the first screen. The size is unchanged at 1024x768, 1440x900 and 1920x1080, where the 11vw / 7.5rem bounds still win. |
| Landscape occasions | Cards get `max-h-[80svh]`, so their titles are on screen in landscape. Portrait and desktop are unaffected (the cap is never reached). |

## Checked, no change needed
- `backdrop-filter`: every Tailwind utility ships with `-webkit-backdrop-filter` (checked in the built CSS).
- `position: sticky`: Safari 13+ is unprefixed. The browse toolbar sits inside `body { overflow-x: clip }`, which doesn't create a scroll container, so sticky holds. The WebKit runs confirm the toolbar sticks at 80px.
- `aspect-ratio`: Safari 15+. **No fallback was added.** Tailwind v4 needs Safari 16.4+ (cascade layers, `@property`, `color-mix`), so on any iOS old enough to lack `aspect-ratio` the styles break anyway. That makes iOS 16.4 the real baseline; the `overflow-x` fallback covers iOS 16.0–16.3 users who get partial styling.
- Inputs using `focus:outline-none` still show the ring. The global `:focus-visible` rule is unlayered, so it beats Tailwind's layered utilities.
- Touch targets ≥44px and inputs ≥16px: still clean in every config.

## Contrast results after the fix (WCAG AA)

| Flag | Verdict |
| --- | --- |
| Gold "." in the ReWear logo | Logotype, exempt under WCAG 1.4.3. |
| Active "I want to rent" pill | The checker misses the absolutely positioned plum pill behind the text. It's ivory on plum (12:1), confirmed in `focus-after/home-I-want-to-rent.png`. |
| Occasion card text at 390 ("Party", tagline) | Text over a photo with an ink gradient. The checker can't see the photo in the off-screen part of the swipe strip. Visually, it's ivory on near-black. |

Everything else passes on all five routes at both sizes.

The focus part of the checker samples the background beside the element, which is unreliable next to pills and photos. So it was used only to find candidates, and the screenshots are the evidence.

## WebKit-only notes
- No new issues.
- Headless WebKit (4 fps at DPR 3) caught the landscape hero mid-intro in the audit shot. `qa/after-stage6/landscape-hero-settled.jpg` shows the same page after 7s: headline at 66px, intro paragraph on screen.

## Screenshots
- Per config: `qa/after-stage6/<config>/` (9 configs, including `chromium-1024x600`)
- Focus rings: `qa/after-stage6/focus-before/*.png` vs `qa/after-stage6/focus-after/*.png` (see `home-Join.png` and `home-List-your-clothes.png`)
- Landscape: `qa/after-stage6/landscape-hero-settled.jpg`, `qa/after-stage6/webkit-iphone14-landscape-844x390/home-03-occ-title-1.jpg`
