import { chromium } from 'playwright';

const URL = 'http://localhost:4173/';
const b = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-gpu-compositing'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
p.on('response', (r) => r.status() >= 400 && errs.push(`${r.status()} ${r.url()}`));

await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);

// Descent legs. Lenis owns scroll, so drive it and let the scrub settle.
const legs = [0, 0.12, 0.22, 0.3];
for (let i = 0; i < legs.length; i++) {
  await p.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), legs[i]);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `raw/shot-descent-${i}.png` });
}

// Full page, unpinned: kill the pins so we can see every section at once.
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(800);
const full = await p.evaluate(() => document.body.scrollHeight);
console.log('page height:', full);

for (const [name, sel] of [['listings', '#listings'], ['why', '#why'], ['trust', '#trust'], ['contact', '#contact']]) {
  const el = await p.$(sel);
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `raw/shot-${name}.png` });
}

console.log('errors:', errs.length ? errs : 'none');
await b.close();
