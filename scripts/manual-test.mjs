/**
 * End-to-end manual test — drives the real app the way a person would and
 * observes what actually happens, not what the code intends. Each step asserts
 * an observable outcome and captures a screenshot for the human record.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = 'http://localhost:4173/';
await mkdir('raw/manual', { recursive: true });

const b = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-gpu-compositing'] });
const results = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); };

// ── desktop journey ──────────────────────────────────────────
{
  console.log('\nDESKTOP JOURNEY (1440x900)');
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));

  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);

  // hero copy present and readable
  const h1 = await p.textContent('.display');
  ok('hero headline renders', h1?.includes('Property in Turkey'), h1);
  await p.screenshot({ path: 'raw/manual/01-hero.png' });

  // scroll through the descent
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.15));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'raw/manual/02-descent.png' });

  // listings: switch every tab, confirm counts + correct tag
  await p.evaluate(() => document.querySelector('#listings').scrollIntoView());
  await p.waitForTimeout(1000);
  for (const [tab, tag] of [['top', 'Top offer'], ['new', 'New'], ['hot', 'Hot price'], ['owners', 'From owner'], ['exclusive', 'Exclusive']]) {
    await p.click(`[data-tab="${tab}"]`);
    await p.waitForTimeout(500);
    const tags = await p.$$eval('.card__tag', (els) => [...new Set(els.map((e) => e.textContent))]);
    const cards = await p.$$eval('.card', (els) => els.length);
    ok(`tab "${tab}" shows ${cards} cards tagged "${tag}"`, cards === 8 && tags.length === 1 && tags[0] === tag, tags.join(','));
  }
  await p.screenshot({ path: 'raw/manual/03-listings.png' });

  // favourite a card, confirm counter + persistence
  await p.click('.card__fav');
  await p.waitForTimeout(300);
  const favN = await p.textContent('[data-fav-n]');
  ok('favouriting updates the header counter', favN === '1', `counter=${favN}`);
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  const favN2 = await p.textContent('[data-fav-n]');
  ok('favourite persists across reload', favN2 === '1', `counter=${favN2}`);

  // currency switch changes prices
  const priceBefore = await p.textContent('.card__price');
  await p.selectOption('[data-cur]', 'GBP');
  await p.waitForTimeout(500);
  const priceAfter = await p.textContent('.card__price');
  ok('currency switch reprices cards', priceBefore !== priceAfter && priceAfter.includes('£'), `${priceBefore} -> ${priceAfter}`);
  await p.selectOption('[data-cur]', 'EUR');

  // search: open more filters, tick amenities, watch match count
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);
  await p.click('[data-more-toggle]');
  await p.waitForTimeout(400);
  const moreVisible = await p.evaluate(() => getComputedStyle(document.querySelector('[data-more]')).display !== 'none');
  ok('"More filters" opens the panel', moreVisible);
  const matchBefore = await p.textContent('[data-match]');
  await p.selectOption('#q-type', 'penthouses');
  await p.waitForTimeout(400);
  const matchAfter = await p.textContent('[data-match]');
  ok('changing a filter updates the live match count', matchBefore !== matchAfter, `${matchBefore} -> ${matchAfter}`);
  await p.screenshot({ path: 'raw/manual/04-filters.png' });

  ok('no console/page errors on desktop', errs.length === 0, errs.join(' | '));
  await p.close();
}

// ── assistant journey ────────────────────────────────────────
{
  console.log('\nASSISTANT');
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.click('[data-ai-open]');
  await p.waitForTimeout(500);

  // A streamed answer is done when its citations render (grounded answers) or
  // the input is refocused. Wait for the real completion signal, not a guess.
  const askAndWait = async (q, { cites } = {}) => {
    const before = await p.$$eval('.msg--bot', (els) => els.length);
    await p.fill('[data-ai-input]', q);
    await p.press('[data-ai-input]', 'Enter');
    // wait for a new bot bubble to appear and stop growing
    await p.waitForFunction((n) => document.querySelectorAll('.msg--bot').length > n, before, { timeout: 30000 });
    if (cites) await p.waitForSelector('.cites a', { timeout: 30000 });
    // let the last token settle
    let last = '';
    for (let i = 0; i < 40; i++) {
      const cur = await p.$$eval('.msg--bot', (els) => els.at(-1)?.textContent || '');
      if (cur === last && cur.length > 5) break;
      last = cur;
      await p.waitForTimeout(400);
    }
    return last;
  };

  const answer = await askAndWait('What is the cheapest property?', { cites: true });
  ok('assistant answers cheapest = €50,500 (12136)', /50[ ,]?500/.test(answer) && /12136/.test(answer), answer.slice(0, 90));
  const sources = await p.$$eval('.cites a', (els) => els.length);
  ok('assistant shows source citations', sources > 0, `${sources} sources`);
  await p.screenshot({ path: 'raw/manual/05-assistant.png' });

  const refusal = await askAndWait('What is the capital of France?');
  ok('assistant refuses off-topic, hands to a human', /manager|549 557|info@/.test(refusal), refusal.slice(0, 80));
  await p.close();
}

// ── language journey ─────────────────────────────────────────
{
  console.log('\nLANGUAGE');
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  await p.selectOption('[data-lang]', 'ru');
  await p.waitForTimeout(1200);
  const d = await p.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelector('.display').textContent.trim(),
    why: document.querySelector('#why .h2').textContent.trim(),
    dealLabel: document.querySelector('label[for=q-deal]')?.textContent,
    tab: document.querySelector('[data-tab]').textContent.trim(),
  }));
  ok('switching to RU sets <html lang> and translates the H1', d.lang === 'ru' && /Недвижимость/.test(d.h1), `${d.lang}: ${d.h1}`);
  ok('RU translates the "why" heading (no joined words)', /Почему покупать в Турции выгодно/.test(d.why), d.why);
  ok('RU translates the search form', /Хочу/.test(d.dealLabel || ''), d.dealLabel);
  await p.screenshot({ path: 'raw/manual/06-russian.png' });
  await p.close();
}

// ── mobile journey ───────────────────────────────────────────
{
  console.log('\nMOBILE (390x844, Russian)');
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.addInitScript(() => localStorage.setItem('ab-lang', 'ru'));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  ok('no horizontal overflow on mobile', !overflow);
  const collide = await p.evaluate(() => {
    const logo = document.querySelector('.hdr__logo').getBoundingClientRect();
    const eyebrow = document.querySelector('.eyebrow').getBoundingClientRect();
    return Math.min(logo.bottom, eyebrow.bottom) - Math.max(logo.top, eyebrow.top) > 4 &&
           Math.min(logo.right, eyebrow.right) - Math.max(logo.left, eyebrow.left) > 4;
  });
  ok('header logo does not collide with hero eyebrow', !collide);
  const fab = await p.evaluate(() => document.querySelector('.ai-fab').getBoundingClientRect().width);
  ok('assistant button is a compact icon on mobile', fab < 70, `${Math.round(fab)}px wide`);
  await p.screenshot({ path: 'raw/manual/07-mobile.png' });
  await p.close();
}

// ── summary ──────────────────────────────────────────────────
const passed = results.filter((r) => r.pass).length;
console.log(`\n${'='.repeat(48)}\n${passed}/${results.length} checks passed`);
if (passed < results.length) {
  console.log('FAILURES:');
  for (const r of results.filter((r) => !r.pass)) console.log(`  - ${r.name}: ${r.detail}`);
  process.exitCode = 1;
}
await b.close();
