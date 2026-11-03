// Lab performance run for the Playwright MCP `browser_run_code_unsafe` tool (PSI fallback).
// Chromium, 390x844 mobile emulation, 4x CPU throttle, Slow-4G (150ms RTT, 1.6 Mbps down, 750 Kbps up).
// Usage: replace __URL__ and __RUNS__, then run. Reports the median of the cold-cache runs.
async (page) => {
  const URL = "__URL__";
  const RUNS = __RUNS__;
  const browser = page.context().browser();
  const results = [];
  for (let i = 0; i < RUNS; i++) {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    // Observers registered before any page script runs
    await p.addInitScript(() => {
      window.__perf = { lcp: 0, cls: 0, tbt: 0, fcp: 0 };
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__perf.lcp = e.startTime))).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__perf.cls += e.value; })).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.name === "first-contentful-paint") window.__perf.fcp = e.startTime; })).observe({ type: "paint", buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.duration > 50) window.__perf.tbt += e.duration - 50; })).observe({ type: "longtask", buffered: true });
    });
    const t0 = Date.now();
    await p.goto(URL, { waitUntil: "load", timeout: 240000 });
    const loadMs = Date.now() - t0;
    await p.waitForTimeout(5000);
    const m = await p.evaluate(() => ({ ...window.__perf, bytes: performance.getEntriesByType("resource").reduce((s, r) => s + (r.transferSize || 0), 0) }));
    results.push({ ...m, loadMs });
    await ctx.close();
  }
  const med = (k) => { const v = results.map((r) => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  return {
    url: URL,
    runs: results.length,
    median: { fcpMs: Math.round(med("fcp")), lcpMs: Math.round(med("lcp")), cls: +med("cls").toFixed(3), tbtMs: Math.round(med("tbt")), loadMs: med("loadMs"), transferKB: Math.round(med("bytes") / 1024) },
    all: results.map((r) => ({ fcp: Math.round(r.fcp), lcp: Math.round(r.lcp), cls: +r.cls.toFixed(3), tbt: Math.round(r.tbt) })),
  };
}
