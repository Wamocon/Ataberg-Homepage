/**
 * Measures the metrics we set budgets against in ANALYSIS.md §4.
 *
 * Note on video/LCP: not relevant here — we ship no hero video. If one is ever
 * added, re-read §4.4: the Chrome 116 changelog warns video LCP may reach CrUX
 * but not PerformanceObserver, which is exactly what this script reads.
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:4173/';
const b = await chromium.launch({ args: ['--no-sandbox'] });

async function run(label, { width, height, cpu, net }) {
  const ctx = await b.newContext({ viewport: { width, height } });
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

  await p.goto(URL, { waitUntil: 'load' });

  // Let LCP settle, then force the "page hidden" finalisation the same way
  // a real session would end.
  await p.waitForTimeout(3500);

  const m = await p.evaluate(() => new Promise((res) => {
    const out = { lcp: 0, cls: 0, lcpEl: '', reqs: performance.getEntriesByType('resource').length };
    new PerformanceObserver((l) => {
      const e = l.getEntries().at(-1);
      out.lcp = e.startTime;
      out.lcpEl = e.element ? e.element.tagName + (e.element.className ? '.' + String(e.element.className).split(' ')[0] : '') : e.url || '?';
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });

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
  return m;
}

await run('DESKTOP — unthrottled', { width: 1440, height: 900 });
await run('MOBILE — 4x CPU, Fast 3G', {
  width: 390, height: 844, cpu: 4,
  net: { latency: 150, down: 1.6, up: 0.75 },
});

await b.close();
