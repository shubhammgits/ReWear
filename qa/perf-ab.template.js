// Interleaved A/B lab run for the Playwright MCP `browser_run_code_unsafe` tool.
// Same conditions as perf-lab.template.js (Chromium 390x844, 4x CPU, Slow-4G, cold cache), but alternates
// A and B load-by-load, swapping which goes first each round, so machine drift hits both equally.
// Usage: replace __A__, __B__ and __ROUNDS__.
async (page) => {
  const A = "__A__", B = "__B__", ROUNDS = __ROUNDS__;
  const browser = page.context().browser();
  const once = async (url) => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await p.addInitScript(() => {
      window.__perf = { lcp: 0, cls: 0, tbt: 0, fcp: 0 };
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__perf.lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__perf.cls += e.value; })).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.name === "first-contentful-paint") window.__perf.fcp = e.startTime; })).observe({ type: "paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.duration > 50) window.__perf.tbt += e.duration - 50; })).observe({ type: "longtask", buffered: true });
    });
    await p.goto(url, { waitUntil: "load", timeout: 240000 });
    await p.waitForTimeout(5000);
    const m = await p.evaluate(() => ({ ...window.__perf, kb: performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), 0) / 1024 }));
    await ctx.close();
    return m;
  };
  const res = { A: [], B: [] };
  for (let i = 0; i < ROUNDS; i++) {
    const order = i % 2 ? ["B", "A"] : ["A", "B"];
    for (const k of order) res[k].push(await once(k === "A" ? A : B));
  }
  const med = (arr, k) => { const v = arr.map((r) => r[k]).sort((a, b) => a - b); return Math.round(v[Math.floor(v.length / 2)] * 1000) / 1000; };
  const sum = (arr) => ({ fcp: med(arr, "fcp"), lcp: med(arr, "lcp"), tbt: med(arr, "tbt"), cls: med(arr, "cls"), kb: Math.round(med(arr, "kb")), lcpAll: arr.map((r) => Math.round(r.lcp)), tbtAll: arr.map((r) => Math.round(r.tbt)) });
  return { A, B, rounds: ROUNDS, A_median: sum(res.A), B_median: sum(res.B) };
}
