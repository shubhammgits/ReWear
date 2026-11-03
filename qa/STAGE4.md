# Stage 4: touch-safe motion

All checks ran against a production build of this branch:
- the full audit runner (`qa/audit.template.js`, 8 configs)
- a new motion check (`qa/motion-check.js`)

Screenshots are in `qa/after-stage4/<config>/` and `qa/after-stage4/motion/`.

## Changes

| Area | Change |
| --- | --- |
| ScrollTrigger | `ScrollTrigger.config({ ignoreMobileResize: true })` (`src/lib/gsap.ts`), so iOS address-bar show/hide no longer re-measures every trigger mid-scroll. A single `ScrollTrigger.refresh()` runs after `document.fonts.ready` and after window `load`, so pin and closet positions use final font metrics and image sizes. |
| Section timelines | These were already on `gsap.matchMedia` and are unchanged: the closet pins on desktop, scrubs without a pin on mobile, and shows the finished scene under reduced motion. Occasions and How it works animate only at desktop width with no reduced-motion preference. |
| Lenis | Off when `(pointer: coarse), (hover: none)` matches (phones and tablets get native momentum scroll) and under reduced motion. |
| Hover-only effects | New `useFinePointer()` hook (`(hover: hover) and (pointer: fine)`). On touch devices, the magnetic button pull and card tilt/glare don't attach pointer handlers or transforms at all. The custom cursor was already gated. A new Tailwind `pointer-fine:` variant replaces `md:` for the hover-reveal Quick view button, so it stays visible on touch tablets at any width (iPad landscape was hiding it). "Hover to zoom" on the item gallery only shows with a mouse. |
| Reduced motion | `MotionConfig reducedMotion="user"` wraps the app: Framer drops transform animations (menu slide, sticky bars, reveals) and keeps simple fades. GSAP sections, the CSS marquee/grain, the 3D hero and the route curtain were already covered. |
| 3D hero | On phones and coarse pointers ("lite" mode): 3 garments instead of 5, a half-resolution cloth mesh, 400px textures, DPR 1, no MSAA, default GPU power preference. Desktop is unchanged. Low-end devices still get the static collage. |
| Counters | The server HTML renders the final value. The client rewinds a counter to 0 only if it starts below the fold, then counts up when 30% visible. With reduced motion, no JS or failed hydration, the real number shows. |
| No-JS fallback | A `<noscript>` style puts every Framer reveal (`opacity:0` / `translateY(...)` inline styles) in its end state, so headlines and cards are never stuck invisible. |

## Audit results (all 8 configs)

0 overflow · 0 covered/intersects · 0 small targets · 0 small inputs · 0 console errors/warnings

The configs: WebKit 390x844, 430x932 and landscape 844x390; Chromium 360x740, 768x1024, 1024x768, 1440x900 and 1920x1080.

## Motion check (`qa/motion-check.js`)

| Scenario | Lenis | Custom cursor | Pins | Card tilt | Quick view | Other |
| --- | --- | --- | --- | --- | --- | --- |
| WebKit iPhone 14 (touch) | off | off | 0 | none | visible (opacity 1) | Closet animates on scroll without a pin and the doors open (`webkit-390-closet-mid-scroll.jpg`). Counters count up when reached. |
| WebKit iPad Pro 11 landscape (touch) | off | off | 2 (desktop layout) | none | visible | — |
| Chromium 1440 (mouse) | on | on | 2 | tilts on hover | hidden until hover, then shown | — |
| Chromium 390, reduced motion | off | off | 0 | none | visible | Closet shows the finished fan and doors gone. 0 headline words displaced. All counters show final values without animating. |
| Chromium 390, JavaScript off | — | — | — | — | — | All counters show final values. The only "hidden" text is Quick view, which is hover-reveal by design on a mouse device. Headline, hero and cards are visible (`no-js-390-home.jpg`). |

Console: no errors or warnings in any scenario.

## WebKit-only notes

None new in this stage. The closet scrub on iPhone still renders slowly in headless WebKit (about 4 fps at DPR 3), so the mid-scroll frame was taken after a 5s settle.
