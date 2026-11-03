// QA audit runner for the Playwright MCP `browser_run_code_unsafe` tool.
// Generated per config by qa/make-runs.sh (replaces __CONFIG__). Launches its own
// browser (Chromium or WebKit), screenshots each section and returns audit findings.
async (page) => {
  const CONFIG = __CONFIG__;
  const BASE = CONFIG.base || "http://localhost:3001";
  const WEBKIT = "C:\\Users\\shubh.LAPTOP-3Q2BEOK5\\AppData\\Local\\ms-playwright\\webkit-2370\\Playwright.exe";
  const pw = page.context().browser().browserType()._playwright;

  // WebKit: launch the installed build. Chromium: reuse the MCP's own browser (no headless shell installed).
  const browser = CONFIG.engine === "webkit" ? await pw.webkit.launch({ executablePath: WEBKIT }) : page.context().browser();
  const device = CONFIG.device ? pw.devices[CONFIG.device] : {};
  const ctx = await browser.newContext({
    ...device,
    viewport: { width: CONFIG.w, height: CONFIG.h },
    screen: { width: CONFIG.w, height: CONFIG.h },
  });
  const p = await ctx.newPage();
  const consoleMsgs = [];
  p.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") consoleMsgs.push(`${m.type()}: ${m.text().slice(0, 160)}`);
  });
  p.on("pageerror", (e) => consoleMsgs.push(`pageerror: ${e.message.slice(0, 160)}`));

  const dir = `qa/${CONFIG.phase}/${CONFIG.name}`;
  const shot = (file) => p.screenshot({ path: `${dir}/${file}.jpg`, type: "jpeg", quality: 70, scale: "css" });
  const settle = (ms = 900) => p.waitForTimeout(ms);
  // Some pages fire a client-side router.replace on mount; retry if a navigation gets interrupted
  const go = async (url) => {
    for (let i = 0; i < 3; i++) {
      try {
        await p.goto(url, { waitUntil: "load", timeout: 180000 });
        return;
      } catch (e) {
        if (!/interrupted/.test(e.message) || i === 2) throw e;
        await settle(1500);
      }
    }
  };

  // Runs in the page: checks the current viewport for problems.
  const inspect = () =>
    p.evaluate(() => {
      const vw = innerWidth;
      const vh = innerHeight;
      const out = { overflow: [], covered: [], smallTargets: [], smallInputs: [] };
      const visible = (r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
      const label = (el) =>
        `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40)}"`;
      const scrollerAncestor = (el) => {
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (["auto", "scroll", "hidden", "clip"].includes(s.overflowX)) return true;
        }
        return false;
      };

      // 1. Horizontal overflow not contained by a scroller/clipper
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (!visible(r) || getComputedStyle(el).position === "fixed") continue;
        if ((r.right > vw + 1 || r.left < -1) && !scrollerAncestor(el)) out.overflow.push(`${label(el)} [${Math.round(r.left)}..${Math.round(r.right)}]`);
      }

      // 2. Text covered by an image/canvas painted on top (sample 5 points per text block)
      const texts = document.querySelectorAll("h1,h2,h3,p,blockquote,label,dt,dd,li > span,a,button");
      for (const t of texts) {
        if (!t.textContent || !t.textContent.trim()) continue;
        const r = t.getBoundingClientRect();
        if (!visible(r) || r.width < 4 || r.height < 4) continue;
        if (getComputedStyle(t).visibility === "hidden" || Number(getComputedStyle(t).opacity) === 0) continue;
        // Corner samples sit inside the border radius, so round buttons aren't "covered" by what's under their corners
        const rad = parseFloat(getComputedStyle(t).borderTopLeftRadius) || 0;
        const ix = Math.min(Math.max(6, rad * 0.35), r.width / 2 - 1);
        const iy = Math.min(Math.max(6, rad * 0.35), r.height / 2 - 1);
        const pts = [
          [r.left + r.width / 2, r.top + r.height / 2],
          [r.left + ix, r.top + iy],
          [r.right - ix, r.top + iy],
          [r.left + ix, r.bottom - iy],
          [r.right - ix, r.bottom - iy],
        ];
        for (const [x, y] of pts) {
          if (x < 0 || y < 0 || x > vw || y > vh) continue;
          const top = document.elementFromPoint(x, y);
          if (!top || t.contains(top) || top.contains(t)) continue;
          const isMedia = top.closest("img, canvas, picture, video, .cs-item");
          if (isMedia && !isMedia.contains(t)) {
            out.covered.push(`${label(t)} under ${top.tagName.toLowerCase()}${top.getAttribute("alt") ? ' alt="' + top.getAttribute("alt").slice(0, 25) + '"' : ""}`);
            break;
          }
        }
      }

      // 2b. Text blocks whose box intersects a photo, whichever paints on top
      //     (skips overlays that belong to the same card/figure as the photo)
      const shown = (el) => {
        for (let a = el; a && a !== document.body; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) < 0.05) return false;
        }
        return true;
      };
      const media = [...document.querySelectorAll("img, canvas, .cs-item")]
        .filter((m) => !m.closest(".cs-item") || m.classList.contains("cs-item"))
        .map((m) => {
          // What's actually painted: the box clipped by every overflow-hidden ancestor
          const b = m.getBoundingClientRect();
          let r = { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
          for (let a = m.parentElement; a && a !== document.body; a = a.parentElement) {
            const s = getComputedStyle(a);
            if (["hidden", "clip"].includes(s.overflowX) || ["hidden", "clip"].includes(s.overflowY)) {
              const c = a.getBoundingClientRect();
              r = { left: Math.max(r.left, c.left), top: Math.max(r.top, c.top), right: Math.min(r.right, c.right), bottom: Math.min(r.bottom, c.bottom) };
            }
          }
          return { m, r: { ...r, width: r.right - r.left, height: r.bottom - r.top } };
        })
        .filter(({ m, r }) => visible(r) && r.width > 40 && r.height > 40 && shown(m));
      out.intersects = [];
      for (const t of document.querySelectorAll("h1,h2,h3,p,blockquote")) {
        if (!t.textContent.trim() || !shown(t)) continue;
        // Fixed bars (sticky CTA, price bar) float over content by design
        let fixed = false;
        for (let a = t; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).position === "fixed") fixed = true;
        if (fixed) continue;
        const tr = t.getBoundingClientRect();
        if (!visible(tr)) continue;
        for (const { m, r } of media) {
          const owner = m.closest("a, figure, li, article, .group, [data-overlay]");
          if (owner && owner.contains(t)) continue;
          const ix = Math.min(tr.right, r.right) - Math.max(tr.left, r.left);
          const iy = Math.min(tr.bottom, r.bottom) - Math.max(tr.top, r.top);
          if (ix > 8 && iy > 8) {
            out.intersects.push(`${label(t)} x ${m.tagName.toLowerCase()}${m.getAttribute("alt") ? ' alt="' + m.getAttribute("alt").slice(0, 25) + '"' : ""}`);
            break;
          }
        }
      }

      // 3. Tap targets < 44px
      for (const el of document.querySelectorAll("a[href], button, input, select, textarea, [role=button], [role=tab]")) {
        const r = el.getBoundingClientRect();
        if (!visible(r)) continue;
        if (el.matches("input[type=range]")) continue;
        if (r.width <= 2 && r.height <= 2) continue; // visually hidden input; its label/button is the target
        if (el.closest("p") && el.tagName === "A") continue; // inline text links
        if (r.width < 44 || r.height < 44) out.smallTargets.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }

      // 4. Inputs < 16px (iOS zooms on focus)
      for (const el of document.querySelectorAll("input:not([type=range]):not([type=radio]):not([type=checkbox]):not([type=file]), select, textarea")) {
        const r = el.getBoundingClientRect();
        if (!visible(r)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 16) out.smallInputs.push(`${label(el)} ${fs}px`);
      }
      return { ...out, scrollWidth: document.documentElement.scrollWidth, vw };
    });

  const findings = {};
  const merge = (key, r) => {
    const f = (findings[key] ||= { overflow: new Set(), covered: new Set(), intersects: new Set(), smallTargets: new Set(), smallInputs: new Set(), pageScrollsSideways: false });
    for (const k of ["overflow", "covered", "intersects", "smallTargets", "smallInputs"]) (r[k] || []).forEach((x) => f[k].add(x));
    if (r.scrollWidth > r.vw + 1) f.pageScrollsSideways = `${r.scrollWidth} > ${r.vw}`;
  };

  // Home: walk sections, plus extra stops inside pinned scenes
  await go(BASE + "/");
  await settle(2500);
  const sections = await p.evaluate(() =>
    [...document.querySelectorAll("main section, footer")].map((s, i) => ({
      i,
      id: s.id || s.getAttribute("aria-labelledby") || `s${i}`,
      top: s.getBoundingClientRect().top + scrollY,
      // Pinned sections: GSAP wraps them in a .pin-spacer that holds the real scroll length
      h: s.parentElement?.classList.contains("pin-spacer") ? s.parentElement.offsetHeight : s.offsetHeight,
    }))
  );
  for (const s of sections) {
    const stops = s.h > CONFIG.h * 1.6 ? [0, 0.35, 0.7] : [0];
    for (const [k, f] of stops.entries()) {
      await p.evaluate((y) => window.scrollTo(0, y), s.top + f * (s.h - CONFIG.h * 0.5));
      await settle();
      await shot(`home-${String(s.i).padStart(2, "0")}-${s.id}${stops.length > 1 ? "-" + k : ""}`);
      merge(`home:${s.id}`, await inspect());
    }
  }

  // Other routes: top-of-page shot + scroll-through checks + one full-page shot
  for (const route of ["/browse", "/item/rw-001", "/list-your-clothes", "/dashboard"]) {
    const name = route.replace(/\//g, "_").replace(/^_/, "");
    await go(BASE + route);
    await settle(2000);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, k = 0; y < total; y += CONFIG.h * 0.9, k++) {
      await p.evaluate((yy) => window.scrollTo(0, yy), y);
      await settle(600);
      merge(route, await inspect());
      if (k < 3) await shot(`${name}-${k}`);
    }
  }

  // Header menu (mobile) open state
  if (CONFIG.w < 768) {
    await go(BASE + "/");
    await settle(1500);
    const btn = p.getByRole("button", { name: /open menu/i });
    if (await btn.count()) {
      await btn.click();
      // Headless WebKit at DPR 3 renders ~4 fps on this machine, so give the sheet's slide time to finish
      await p.waitForFunction(() => getComputedStyle(document.getElementById("mobile-menu") || document.body).transform === "none", null, { timeout: 15000 }).catch(() => {});
      await settle(800);
      await shot("menu-open");
      merge("menu-open", await inspect());
    }
  }

  if (CONFIG.engine === "webkit") await browser.close();
  else await ctx.close();

  const result = { config: CONFIG.name, console: [...new Set(consoleMsgs)].slice(0, 25), findings: {} };
  for (const [k, f] of Object.entries(findings)) {
    const entry = {};
    for (const key of ["overflow", "covered", "intersects", "smallTargets", "smallInputs"]) if (f[key].size) entry[key] = [...f[key]].slice(0, 12);
    if (f.pageScrollsSideways) entry.pageScrollsSideways = f.pageScrollsSideways;
    if (Object.keys(entry).length) result.findings[k] = entry;
  }
  return result;
}
