# Stage 5: performance

Checked against a local production build of this branch (`next start`), using:
- the 8-config audit runner: all configs report `findings: {}` and no console errors or warnings
- the lab perf script (`qa/perf-lab.template.js`)

Screenshots are in `qa/after-stage5/<config>/`, plus these three:
- `qa/after-stage5/phone-390-hero-collage.jpg`
- `qa/after-stage5/desktop-1440-hero-3d.jpg`
- `qa/after-stage5/browse-quickview-390.jpg`

## Changes

| Area | Change |
| --- | --- |
| Image widths | `next.config.ts`: `deviceSizes [360, 414, 640, 750, 828, 1080, 1280, 1920]` and `imageSizes [48, 96, 128, 256, 384]`. Previously the image optimizer could serve up to w=3840. |
| `sizes` | Occasions cards now declare `(min-width:1024px) 30vw, (min-width:640px) 42vw, 78vw`, which matches the swipe-strip width on phones. |
| Priority | Browse preloads only the first 2 cards (was 3). The hero collage keeps its single `priority` image. |
| Blur placeholders | Shared `BLUR` in `src/lib/utils.ts`: a 3x4 sand-to-blush SVG data URI with zero network cost. Used on ProductCard, Occasions, Gallery and the hero collage. |
| Hero on phones | Phones (<768px) and low-end devices keep the floating photo collage and never load three.js. On a 4x-throttled phone, the WebGL chunk plus shader compile blocked the main thread for about 2.5s. Desktop and touch tablets keep the 3D hero (tablets get the lite version). |
| Hero chunk | `HeroScene` uses fiber's `useLoader(TextureLoader)` instead of drei's `useTexture`, so drei and three-stdlib stay out of the hero chunk. drei is still used only by the item 3D viewer. |
| Hero LCP | The intro paragraph (the mobile LCP element) starts fully opaque and only slides in. Before, it faded from opacity 0, which pushed LCP to ~10s. |
| Quick view | `QuickView` loads with `next/dynamic` (`ssr:false`) only after the first tap, on both Home and Browse. |
| Browse SSR | The static HTML now contains the 20-card grid, so the first photos preload and paint before hydration. Before, the whole grid sat behind `useSearchParams` and rendered client-only. `AnimatePresence initial={false}` stops the first grid from fading in from opacity 0. |
| Fonts | Fraunces loads only the `opsz` axis. The unused `SOFT` axis cost about 100KB. |
| Lint | `.next-*` QA build dirs and `qa/` are excluded from ESLint. |

First-load JS (from the `next build` output): home 240 → 233 kB, browse 225 → 173 kB, item 222 → 223 kB.

## Lab perf (lab, Playwright)

Method: Chromium at 390x844, 4x CPU throttle, Slow-4G, median of 3 cold loads. Raw numbers and the method are in `qa/perf-stage5.json`.

Both columns come from local production builds, because Vercel previews are behind SSO. Single-machine timings vary by roughly ±15% between runs.

| Page | Metric | Before (stage 4) | After (stage 5) |
| --- | --- | --- | --- |
| Home | LCP | 10.4 s | **2.2 s** |
| Home | TBT | 4240 ms | **1790–2514 ms** |
| Home | Transfer | 865 KB | **700 KB** |
| Browse | LCP | 4.7 s | **1.6 s** |
| Browse | TBT | 1476 ms | 1387 ms |
| Browse | Transfer | 835 KB | **719 KB** |
| Item | LCP | 2.2 s | 2.2–2.5 s (noise) |
| Item | TBT | 1155 ms | 978–1308 ms |
| Item | Transfer | 859 KB | **692 KB** |

CLS is 0 on every page, before and after.

For reference, the live site (`qa/perf-before.json`) measured LCP 2.8 s, TBT 3897 ms and 856 KB on home.

## Tradeoffs and known issues

- **Phones no longer show the 3D hero.** They get the static floating collage, which was already the fallback. This is the biggest single TBT win on phones. If you want the 3D back on phones, revert the `max-width: 767px` check in `HeroVisual.tsx`; the lite scene is still there.
- **Browse with a filter in the URL:** a link such as `/browse?occasion=Wedding` shows the unfiltered grid for one frame, then swaps to the filtered grid on hydration. This is the cost of putting the grid in the static HTML.
- **Home TBT is still around 2s at 4x CPU.** What's left is mostly GSAP/Framer/Lenis setup and hydration of a long page. Splitting below-the-fold sections further is possible, but has diminishing returns.

## WebKit-only notes

None this stage. WebKit at 390x844, 430x932 and 844x390 is clean, with no console output.
