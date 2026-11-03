# Stage 2: overlap fixes

These are the before/after results from the same Playwright runner (`qa/audit.template.js`) against a production build. Screenshots are in `qa/before/<config>/` and `qa/after/<config>/`.

| Audit ID | Fix | Result (all 8 configs) |
| --- | --- | --- |
| C1, C3 | **ClosetStory rebuilt** as three grid rows (headline / closet stage / paragraph). Photos live inside the stage row, and their targets are measured from that row and the arch at runtime. Wide screens put three photos in each gutter; narrow screens fan them like a hand of cards across the open closet. The arch interior is now warm plum with a gold glow, rail and hangers. | 0 text/photo intersections at every scroll stop |
| C2 | Doors fade out once open, so they no longer stay as purple slabs at the screen edges. | — |
| — | **Mobile keeps the story without pinning:** the same timeline scrubs as the section scrolls in (top 80% → top 8%). Frames are in `qa/after/closet-story-webkit-390/`. Desktop (≥1024) still pins. Reduced motion shows the finished scene. | — |
| C4, C5 | Item page grid uses `minmax(0, …)` columns with `min-w-0` on the gallery and info column, and the main photo is `w-full`. | No sideways scroll at 360 / 1024; no photo over the reviews headings |
| C6 | On phones the `/browse` toolbar uses a 1.75rem radius instead of `rounded-full`; the 2-row pill was cutting into the Filters button, so the photos below showed through. | `covered` is empty |
| M7 | Hero glow blobs are sized in `vw`/`clamp()` inside their own clipping layer. | — |

The detector now also flags any text box that intersects a photo's *painted* box (clipped by overflow ancestors), whatever the stacking order. That catches the 1440 closet case the `elementFromPoint` check missed.

**Console:** 0 errors / 0 warnings in all 8 runs.
**Still open (Stage 3 scope):** tap targets under 44px (header nav, footer links, chips, Quick view) and inputs under 16px (newsletter, search, sort, date).
