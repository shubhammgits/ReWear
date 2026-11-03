// Stage 4 motion checks for the Playwright MCP `browser_run_code_unsafe` tool (pass this file as `filename`).
// Verifies touch vs mouse gating, reduced motion and no-JS fallbacks against a production build.
async (page) => {
  const BASE = "http://localhost:3007";
  const WEBKIT = "C:\\Users\\shubh.LAPTOP-3Q2BEOK5\\AppData\\Local\\ms-playwright\\webkit-2370\\Playwright.exe";
  const pw = page.context().browser().browserType()._playwright;
  const chromium = page.context().browser();
  const webkit = await pw.webkit.launch({ executablePath: WEBKIT });
  const dir = "qa/after-stage4/motion";
  const results = {};

  const open = async (browser, opts, url = "/") => {
    const ctx = await browser.newContext(opts);
    const p = await ctx.newPage();
    const errors = [];
    p.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(m.text().slice(0, 140)));
    p.on("pageerror", (e) => errors.push(e.message.slice(0, 140)));
    await p.goto(BASE + url, { waitUntil: "load", timeout: 180000 });
    await p.waitForTimeout(2500);
    return { ctx, p, errors };
  };
  const scrollTo = (p, sel, offset = 0) =>
    p.evaluate(([s, o]) => {
      const el = document.querySelector(s);
      const target = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
      window.scrollTo(0, target.getBoundingClientRect().top + scrollY + o);
    }, [sel, offset]);
  const state = (p) =>
    p.evaluate(() => {
      const card = document.querySelector("article.group");
      const quick = card?.querySelector("button");
      const counters = [...document.querySelectorAll("[aria-label^='₹'], #impact [aria-label]")]
        .filter((el) => el.querySelector("[aria-hidden]"))
        .map((el) => ({ label: el.getAttribute("aria-label"), shown: el.querySelector("[aria-hidden]").textContent.trim() }));
      return {
        lenis: document.documentElement.classList.contains("lenis"),
        customCursor: document.documentElement.classList.contains("has-custom-cursor"),
        pins: document.querySelectorAll(".pin-spacer").length,
        cardTransform: card ? getComputedStyle(card).transform : null,
        quickViewOpacity: quick ? getComputedStyle(quick).opacity : null,
        counters,
      };
    });
  const closet = (p) =>
    p.evaluate(() => ({
      items: [...document.querySelectorAll(".cs-item")].map((el) => getComputedStyle(el).transform),
      doors: getComputedStyle(document.querySelector(".cs-doors")).opacity,
    }));

  // 1. iPhone (touch): native scroll, no cursor, no tilt, Quick view visible, closet animates without a pin
  {
    const { ctx, p, errors } = await open(webkit, { ...pw.devices["iPhone 14"], viewport: { width: 390, height: 844 } });
    const s = await state(p);
    const before = await closet(p);
    await scrollTo(p, "#idea", -844 * 0.1);
    await p.waitForTimeout(5000);
    const after = await closet(p);
    await p.screenshot({ path: `${dir}/webkit-390-closet-mid-scroll.jpg`, type: "jpeg", quality: 70, scale: "css" });
    await scrollTo(p, "#impact", -200);
    await p.waitForTimeout(6000);
    const impact = await state(p);
    results.iphone = { ...s, closetMoved: JSON.stringify(before.items) !== JSON.stringify(after.items), doorsAfter: after.doors, countersAfterScroll: impact.counters, errors };
    await ctx.close();
  }

  // 2. iPad Pro 11 landscape (touch, 1194px wide): desktop layout but Quick view stays visible, no tilt, no cursor
  {
    const { ctx, p, errors } = await open(webkit, { ...pw.devices["iPad Pro 11 landscape"] });
    await scrollTo(p, "#featured-title", 0);
    await p.waitForTimeout(3000);
    results.ipadLandscape = { ...(await state(p)), errors };
    await p.screenshot({ path: `${dir}/webkit-ipad-landscape-featured.jpg`, type: "jpeg", quality: 70, scale: "css" });
    await ctx.close();
  }

  // 3. Desktop mouse: Lenis, custom cursor, pins, tilt on hover, Quick view hidden until hover
  {
    const { ctx, p, errors } = await open(chromium, { viewport: { width: 1440, height: 900 } });
    await scrollTo(p, "#featured-title", 0);
    await p.waitForTimeout(2500);
    const idle = await state(p);
    const card = p.locator("article.group").first();
    const box = await card.boundingBox();
    await p.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2, { steps: 8 });
    await p.waitForTimeout(900);
    const hovered = await state(p);
    results.desktop = { ...idle, hoverCardTransform: hovered.cardTransform, hoverQuickViewOpacity: hovered.quickViewOpacity, errors };
    await ctx.close();
  }

  // 4. Reduced motion (phone): finished closet scene, no pins, headline words in place, counters final
  {
    const { ctx, p, errors } = await open(chromium, { viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true, isMobile: true });
    await scrollTo(p, "#idea", 0);
    await p.waitForTimeout(1500);
    const c = await closet(p);
    await p.screenshot({ path: `${dir}/reduced-motion-390-closet.jpg`, type: "jpeg", quality: 70, scale: "css" });
    const words = await p.evaluate(() => [...document.querySelectorAll("h2 .inline-block > .inline-block")].slice(0, 30).filter((w) => getComputedStyle(w).transform !== "none").length);
    await scrollTo(p, "#impact", -200);
    await p.waitForTimeout(1500);
    results.reducedMotion = { ...(await state(p)), closetItems: c.items, doors: c.doors, displacedHeadlineWords: words, errors };
    await ctx.close();
  }

  // 5. JavaScript off: reveals show their end state, counters show final values
  {
    const { ctx, p } = await open(chromium, { viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const r = await p.evaluate(() => {
      const hidden = [...document.querySelectorAll("main *")].filter((el) => {
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return el.textContent.trim() && r.width > 0 && (Number(s.opacity) === 0 || /matrix\(1, 0, 0, 1, 0, [1-9]/.test(s.transform));
      });
      const counters = [...document.querySelectorAll("[aria-label]")]
        .filter((el) => el.querySelector(":scope > [aria-hidden]") && /^[₹\d]/.test(el.getAttribute("aria-label")))
        .map((el) => ({ label: el.getAttribute("aria-label"), shown: el.querySelector("[aria-hidden]").textContent.trim() }));
      return { hiddenTextElements: hidden.length, sample: hidden.slice(0, 5).map((e) => e.tagName + " " + e.textContent.trim().slice(0, 30)), counters };
    });
    await p.screenshot({ path: `${dir}/no-js-390-home.jpg`, type: "jpeg", quality: 70, scale: "css", fullPage: false });
    results.noJs = r;
    await ctx.close();
  }

  await webkit.close();
  return results;
}
