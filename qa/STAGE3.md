# Stage 3: mobile-first layout

The same Playwright runner (`qa/audit.template.js`) was run against a production build of this branch. Screenshots are in `qa/after-stage3/<config>/`.

## Changes

| Area | Change |
| --- | --- |
| Global | `html` gets `overflow-x: hidden`, then `clip` (old iOS fallback). Body text is 1rem. `viewport-fit=cover`. `.pb-safe` keeps bottom bars clear of the home indicator. The header respects `safe-area-inset-top`. `vh` is replaced by `svh`/`dvh` in the hero, occasions, browse, 404, modal and drawer. |
| Header | Below `md`, a full-screen sheet with large serif links and a "Rent an outfit" / "Earn from your wardrobe" pair pinned to the bottom. While open, the page scroll is locked (`html.menu-open` + `lenis.stop()`). Esc closes it, and focus moves into the sheet and back to the toggle. Logo, nav links and toggle are ≥44px. |
| Sticky CTA | A "Rent an outfit" bar on phones, shown after the hero. It hides while the menu is open, and on `/browse`, `/item/*` and `/list-your-clothes`. The footer has bottom padding so the bar never covers its last row. |
| Type | Hero h1 is `clamp(2.75rem, 11vw, 7.5rem)`. All inputs and selects are 16px (no iOS focus zoom). Selects drop the native WebKit chrome and use a drawn chevron. |
| Sliders | On coarse pointers: 30px thumb, 8px track. |
| Product card | On phones, a single "from ₹X / 4 hrs" line. The 3-chip grid shows from `sm`. Quick view is a 44px icon button on phones. |
| How it works | On phones, a vertical list (icon beside card). The tab toggle is full width. |
| Calculator | Unit tabs are full width on phones, 44px tall. |
| Occasions | Native swipe with `snap-start`. Cards are `78vw` (max 22rem) so the next one peeks. `overscroll-x-contain`. |
| Item page | The gallery is a swipe strip with snap and dots (44px tap areas) plus a "View in 3D" toggle below `lg`. Desktop keeps the thumbnails and hover zoom. The 3D viewer only mounts in the visible layout. A sticky price bar (total + "Choose dates") shows on phones while the booking card is off screen, and its button scrolls to the card. |
| Listing form | Sticky progress bar on phones; only the current step's name shows. "Take a photo" (`capture="environment"`) and "Choose from device" buttons; the drag-and-drop hint is hidden on touch. The Back/Continue bar sticks to the bottom (solid, safe-area padded). All controls are ≥44px. |
| Browse | Chips and size chips ≥44px. 16px search, sort and city controls. The filter drawer locks the page and gets safe-area padding. The URL sync no longer re-replaces an unchanged query. |
| Footer | Newsletter input/button are 44px; links are 44px rows. |

## Results

| Config | Overflow | Covered / intersects | Small targets | Small inputs | Console |
| --- | --- | --- | --- | --- | --- |
| webkit-iphone14-390x844 | 0 | 0 | 0 | 0 | 0 |
| webkit-iphone15pro-430x932 | 0 | 0 | 0 | 0 | 0 |
| webkit-iphone14-landscape-844x390 | 0 | 0 | 0 | 0 | 0 |
| chromium-360x740 | 0 | 0 | 0 | 0 | 0 |
| chromium-768x1024 | 0 | 0 | 0 | 0 | 0 |
| chromium-1024x768 | 0 | 0 | 0 | 0 | 0 |
| chromium-1440x900 | 0 | 0 | 0 | 0 | 0 |
| chromium-1920x1080 | 0 | 0 | 0 | 0 | 0 |

Detector refinements in this stage:
- Corner samples are inset by the border radius.
- Text inside `position: fixed` bars is skipped for the photo-intersection check, because those bars float over content by design.
- 1–2px visually hidden inputs are skipped as tap targets; their buttons are the target.
- The menu shot waits for the sheet's slide to finish.

## WebKit-only notes

- **Fixed:** an animated `clip-path` on the menu sheet looked stuck in WebKit. It now uses a transform.
- **Fixed:** native selects rendered as grey squares in WebKit. The global `appearance: none` and a chevron fix this.
- **Fixed:** the slider thumb padding / `background-clip` trick hid the track in WebKit and was removed.
- **Fixed:** the listing form's 95%-opaque action bar let text show through in WebKit. It is now solid with a top border.
- **Harness artifact, not a bug:** headless WebKit at iPhone DPR 3 renders at about 4 fps on this machine, so some shots catch transitions mid-way. One example is `item_rw-001-1.jpg`, where the header is still sliding away over the title. `item-settled.jpg` is the same scroll position after 6s: the header is fully hidden (`translateY(-83.6px)`).

## Key screenshots

- Menu: `qa/after-stage3/webkit-iphone14-390x844/menu-open.jpg`, `webkit-iphone15pro-430x932/menu-open.jpg`
- Item page + gallery: `qa/after-stage3/webkit-iphone14-390x844/item_rw-001-0.jpg`, `item-settled.jpg`
- Listing form: `qa/after-stage3/webkit-iphone14-390x844/list-your-clothes-0.jpg`
- Calculator / sticky CTA: `qa/after-stage3/webkit-iphone14-390x844/home-05-calc-title-1.jpg`
- Landscape: `qa/after-stage3/webkit-iphone14-landscape-844x390/`
- Desktop unchanged: `qa/after-stage3/chromium-1440x900/`, `chromium-1920x1080/`

**Gates:** `npm run lint`, `npm run typecheck` and `npm run build` all pass.
