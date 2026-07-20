/**
 * Measures the metrics we set budgets against in ANALYSIS.md §4.
 *
 * Note on video/LCP: not relevant here — we ship no hero video. If one is ever
 * added, re-read §4.4: the Chrome 116 changelog warns video LCP may reach CrUX
 * but not PerformanceObserver, which is exactly what this script reads.
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:4173/';

async function run(label, { width, height, cpu, net, mobile }) {
  // A fresh browser per profile. Running the desktop and mobile passes in one
  // shared instance let them contend for CPU and inflated the throttled mobile
  // LCP by ~1s; isolation gives the real number.
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width, height }, isMobile: !!mobile, hasTouch: !!mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);

  if (cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  if (net) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: net.latency,
      downloadThroughput: (net.down * 1024 * 1024) / 8,
      uploadThroughput: (net.up * 1024 * 1024) / 8,
    });
  }

  const bytes = { total: 0, by: {} };
  p.on('response', async (r) => {
    try {
      const h = r.headers();
      const len = Number(h['content-length'] || 0);
      const ct = (h['content-type'] || '').split(';')[0];
      const kind =
        ct.startsWith('image/') ? 'image' :
        ct.includes('javascript') ? 'js' :
        ct.includes('css') ? 'css' :
        ct.includes('html') ? 'html' :
        ct.includes('font') ? 'font' : 'other';
      bytes.total += len;
      bytes.by[kind] = (bytes.by[kind] || 0) + len;
    } catch {}
  });

  // Observe LCP/CLS from the very first byte, not retroactively at the end.
  // The retroactive `buffered` read was catching late reflow noise and reporting
  // a spurious LCP element; capturing entries as they occur is the correct method.
  await p.addInitScript(() => {
    window.__perf = { lcp: 0, lcpEl: '', cls: 0 };
    new PerformanceObserver((l) => {
      const e = l.getEntries().at(-1);
      window.__perf.lcp = e.startTime;
      window.__perf.lcpEl = e.element ? e.element.tagName + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : '') : e.url || '?';
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await p.goto(URL, { waitUntil: 'load' });

  // Let LCP settle (it finalises at the first interaction; we never interact).
  await p.waitForTimeout(3500);

  const m = await p.evaluate(() => new Promise((res) => {
    const out = { ...window.__perf, reqs: performance.getEntriesByType('resource').length };

    const nav = performance.getEntriesByType('navigation')[0];
    out.ttfb = nav?.responseStart ?? 0;
    out.fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
    setTimeout(() => res(out), 400);
  }));

  const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' KB';
  console.log(`\n=== ${label} ===`);
  console.log(`  TTFB          ${m.ttfb.toFixed(0)} ms`);
  console.log(`  FCP           ${m.fcp.toFixed(0)} ms`);
  console.log(`  LCP           ${m.lcp.toFixed(0)} ms   ${m.lcp <= 2500 ? 'PASS (<=2500)' : 'FAIL (>2500)'}`);
  console.log(`  LCP element   ${m.lcpEl}`);
  console.log(`  CLS           ${m.cls.toFixed(4)}   ${m.cls <= 0.1 ? 'PASS (<=0.1)' : 'FAIL (>0.1)'}`);
  console.log(`  requests      ${m.reqs}   ${m.reqs <= 50 ? 'PASS (<=50)' : 'FAIL (>50)'}`);
  console.log(`  transferred   ${kb(bytes.total)}`);
  for (const [k, v] of Object.entries(bytes.by).sort((a, c) => c[1] - a[1])) {
    console.log(`    ${k.padEnd(6)}      ${kb(v)}`);
  }
  await ctx.close();
  await b.close();
  return m;
}

await run('DESKTOP — unthrottled', { width: 1440, height: 900 });
await run('MOBILE — 4x CPU, Fast 3G', {
  width: 390, height: 844, cpu: 4, mobile: true,
  net: { latency: 150, down: 1.6, up: 0.75 },
});
