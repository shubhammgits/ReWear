// WCAG AA contrast + keyboard focus check for the Playwright MCP `browser_run_code_unsafe` tool (Chromium).
// Copy to qa/runs/ and set CONFIG (w, h, base, out). Returns failures; writes nothing but optional screenshots.
async (page) => {
  const CONFIG = { w: 1440, h: 900, base: "http://localhost:3010", out: "qa/after-stage6/a11y" };
  const ctx = await page.context().browser().newContext({ viewport: { width: CONFIG.w, height: CONFIG.h }, reducedMotion: "reduce" });
  const p = await ctx.newPage();

  // Runs in the page: contrast of every text element whose centre is in the viewport.
  const scan = () =>
    p.evaluate(() => {
      const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      // Any CSS colour syntax (oklab, color-mix, rgba) → [r,g,b,a 0..1]
      const rgba = (c) => {
        cv.clearRect(0, 0, 1, 1);
        cv.fillStyle = "#000";
        cv.fillStyle = c;
        cv.fillRect(0, 0, 1, 1);
        const d = cv.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3] / 255];
      };
      const over = (top, under) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3])).concat(1);
      const lum = (c) => {
        const [r, g, b] = c.slice(0, 3).map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a, b) => {
        const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (l1 + 0.05) / (l2 + 0.05);
      };
      const hex = (c) => "#" + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

      // Background behind a point: composite every layer under it (decorative pointer-events:none layers included)
      const lock = document.createElement("style");
      lock.textContent = "*{pointer-events:auto!important}";
      document.head.appendChild(lock);
      const bgAt = (x, y, self) => {
        const layers = [];
        let media = null;
        for (const el of document.elementsFromPoint(x, y)) {
          if (self && el !== self && self.contains(el)) continue; // the element's own background counts, its children's don't
          const s = getComputedStyle(el);
          if (s.visibility === "hidden" || Number(s.opacity) < 0.05) continue;
          if (el.matches("img, canvas, video, picture")) { media = el.tagName.toLowerCase(); break; }
          if (s.backgroundImage !== "none" && !s.backgroundImage.startsWith("url(\"data:image/svg")) { media = "gradient"; break; }
          const c = rgba(s.backgroundColor);
          if (c[3] > 0) {
            layers.push(c);
            if (c[3] >= 0.99) break;
          }
        }
        let bg = [255, 255, 255, 1];
        for (const c of layers.reverse()) bg = over(c, bg);
        return { bg, media };
      };

      const out = [];
      const vh = innerHeight;
      const vw = innerWidth;
      for (const el of document.body.querySelectorAll("*")) {
        if (el.closest("[aria-hidden=true], .sr-only, svg, noscript, script, style")) continue;
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
        const field = el.matches("input:not([type=range]):not([type=checkbox]):not([type=radio]), select, textarea") && (el.value || el.placeholder);
        if (!own && !field) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const cx = r.left + Math.min(r.width / 2, 12);
        const cy = r.top + r.height / 2;
        if (cy < 0 || cy > vh || cx < 0 || cx > vw) continue;
        let op = 1;
        for (let a = el; a; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (s.visibility === "hidden" || s.display === "none") op = 0;
          op *= Number(s.opacity);
        }
        if (op < 0.95) continue; // mid-animation or intentionally hidden
        const s = getComputedStyle(el);
        if (el.closest("[disabled], [aria-disabled=true]")) continue;
        // Text currently scrolled under a fixed bar (mobile CTA, price bar) isn't visible; it's checked at another scroll stop
        const top = document.elementsFromPoint(cx, cy).find((e) => !e.classList.contains("grain"));
        if (top && top !== el && !el.contains(top) && !top.contains(el)) continue;
        const { bg, media } = bgAt(cx, cy, el);
        let fg = rgba(s.color);
        const placeholder = field && !el.value;
        if (placeholder) fg = rgba(getComputedStyle(el, "::placeholder").color);
        fg = over(fg, bg);
        const size = parseFloat(s.fontSize);
        const bold = Number(s.fontWeight) >= 700;
        const large = size >= 24 || (bold && size >= 18.66);
        const need = large ? 3 : 4.5;
        const cr = ratio(fg, bg);
        const text = (field ? (el.value || el.placeholder) : el.textContent).trim().replace(/\s+/g, " ").slice(0, 40);
        if (media) out.push({ kind: "over-" + media, text, fg: hex(fg), size });
        else if (cr < need) out.push({ kind: "fail", text, fg: hex(fg), bg: hex(bg), ratio: Math.round(cr * 100) / 100, need, size, cls: (typeof el.className === "string" ? el.className : "").slice(0, 120) });
      }
      lock.remove();
      return out;
    });

  // Runs in the page: the focused element's indicator and its contrast against what's around it.
  const focusInfo = () =>
    p.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const rgba = (c) => {
        cv.clearRect(0, 0, 1, 1);
        cv.fillStyle = "#000";
        cv.fillStyle = c;
        cv.fillRect(0, 0, 1, 1);
        const d = cv.getImageData(0, 0, 1, 1).data;
        return [d[0], d[1], d[2], d[3] / 255];
      };
      const lum = (c) => {
        const [r, g, b] = c.slice(0, 3).map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a, b) => {
        const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
        return (l1 + 0.05) / (l2 + 0.05);
      };
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      // What sits just outside the element, where an offset outline is drawn
      let bg = [255, 255, 255, 1];
      const x = Math.max(0, r.left - 4);
      const y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
      for (const u of document.elementsFromPoint(x, y)) {
        if (u === el || el.contains(u)) continue;
        const c = rgba(getComputedStyle(u).backgroundColor);
        if (c[3] > 0.5) { bg = c; break; }
      }
      const label = `${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") || el.textContent || el.placeholder || "").trim().replace(/\s+/g, " ").slice(0, 30)}"`;
      const outline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
      const ring = s.boxShadow !== "none";
      const visible = r.width > 0 && r.height > 0 && s.visibility !== "hidden";
      return { label, outline, ring, visible, cr: outline ? Math.round(ratio(rgba(s.outlineColor), bg) * 100) / 100 : null, key: label + Math.round(r.top + scrollY) };
    });

  const result = { viewport: `${CONFIG.w}x${CONFIG.h}`, contrast: {}, overMedia: {}, focus: {} };
  for (const route of ["/", "/browse", "/item/rw-001", "/list-your-clothes", "/dashboard"]) {
    await p.goto(CONFIG.base + route, { waitUntil: "load", timeout: 120000 });
    await p.waitForTimeout(1500);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    const fails = new Map();
    const media = new Map();
    for (let y = 0; y < total; y += CONFIG.h * 0.8) {
      await p.evaluate((yy) => window.scrollTo(0, yy), y);
      await p.waitForTimeout(500);
      for (const f of await scan()) {
        if (f.kind === "fail") fails.set(`${f.fg}/${f.bg}/${f.size}`, f);
        else media.set(f.text, f.kind);
      }
    }
    result.contrast[route] = [...fails.values()];
    result.overMedia[route] = [...media.entries()].slice(0, 15);

    // Keyboard walk from the top
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.locator("body").click({ position: { x: 1, y: 1 } }).catch(() => {});
    const seen = new Set();
    const bad = [];
    for (let i = 0; i < 90; i++) {
      await p.keyboard.press("Tab");
      const f = await focusInfo();
      if (!f) continue;
      if (seen.has(f.key)) break;
      seen.add(f.key);
      if (!f.visible) bad.push(`${f.label}: focused but not visible`);
      else if (!f.outline && !f.ring) bad.push(`${f.label}: no focus indicator`);
      else if (f.outline && f.cr < 3) bad.push(`${f.label}: outline contrast ${f.cr}`);
    }
    result.focus[route] = { stops: seen.size, problems: bad };
  }
  await ctx.close();
  return result;
}
