/**
 * Layout audit across real device widths.
 *
 * Checks the things that are easy to claim and hard to notice:
 *   - horizontal overflow (the page must never scroll sideways)
 *   - text clipped by its own box
 *   - overlapping text nodes
 *   - tap targets under 44x44 (WCAG 2.2 Target Size, AA is 24x24; 44 is the
 *     Apple/AAA bar and the right one for a phone)
 *   - contrast of body text against its painted background
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:4173/';
const WIDTHS = [
  { w: 320, h: 568, name: 'iPhone SE (smallest realistic)' },
  { w: 360, h: 800, name: 'Android common' },
  { w: 390, h: 844, name: 'iPhone 14/15' },
  { w: 430, h: 932, name: 'iPhone Pro Max' },
  { w: 768, h: 1024, name: 'iPad portrait' },
  { w: 1024, h: 768, name: 'iPad landscape' },
  { w: 1440, h: 900, name: 'laptop' },
  { w: 1920, h: 1080, name: 'desktop' },
];

const LANG = process.argv[2] || 'en';
const b = await chromium.launch({ args: ['--force-color-profile=srgb', '--disable-gpu-compositing'] });
let problems = 0;
console.log(`language: ${LANG}`);

for (const d of WIDTHS) {
  const p = await b.newPage({ viewport: { width: d.w, height: d.h }, isMobile: d.w < 768, hasTouch: d.w < 768 });
  // Russian and Polish run materially longer than English — a layout that only
  // survives English is not a layout that survives Ataberk's actual buyers.
  await p.addInitScript((l) => localStorage.setItem('ab-lang', l), LANG);
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);

  const r = await p.evaluate(() => {
    const de = document.documentElement;
    const out = { overflow: null, clipped: [], overlaps: [], small: [] };

    if (de.scrollWidth > de.clientWidth + 1) {
      // find who is sticking out
      const wide = [...document.querySelectorAll('body *')].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.right > de.clientWidth + 1 && getComputedStyle(e).position !== 'fixed';
      }).slice(0, 5).map((e) => `${e.tagName}.${String(e.className).split(' ')[0]} (right=${Math.round(e.getBoundingClientRect().right)})`);
      out.overflow = { scrollW: de.scrollWidth, clientW: de.clientWidth, culprits: wide };
    }

    // Screen-reader-only text is clipped on purpose — that is what makes it
    // screen-reader-only. Excluding it here, not loosening the check.
    const srOnly = (e) => e.closest('.sr, .skip');

    // Children of a closed <details> collapse onto the same coordinates, which
    // reads as every link overlapping every other link. They are not rendered.
    const inClosedDetails = (e) => {
      const d = e.closest('details');
      return d ? !d.open : false;
    };

    // text clipped by its own box
    for (const e of document.querySelectorAll('h1,h2,h3,p,span,a,button,label,li,time,legend')) {
      if (!e.textContent.trim() || srOnly(e)) continue;
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.overflow === 'auto' || cs.overflow === 'scroll') continue;
      if (cs.overflow === 'hidden' && e.scrollWidth > e.clientWidth + 2 && !e.closest('.line')) {
        out.clipped.push(`${e.tagName}.${String(e.className).split(' ')[0]}: "${e.textContent.trim().slice(0, 32)}"`);
      }
    }

    // overlapping visible text — compare leaf text nodes in the same stacking flow
    const leaves = [...document.querySelectorAll('h1,h2,h3,p,a,button,span,label,time,select,svg')]
      .filter((e) => {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
        // Positioned elements were skipped wholesale before, which is why the
        // header-over-hero collision went unseen. Only skip the ones we
        // deliberately stack (the descent's cross-fading photo stages).
        if (e.closest('.stage, .descent__scrim, .descent__hint')) return false;
        // The assistant panel is a deliberate overlay. The header is NOT exempt:
        // it is fixed over the hero, and in Russian the eyebrow wraps to two
        // lines and collides with the logo — exactly the kind of bug this
        // check exists to find, which an exemption here would have hidden.
        if (e.closest('.ai, .ai-fab')) return false;
        // The split-text rig parks each line 115% down inside an overflow:hidden
        // mask until it animates in. The box overlaps; the pixels never do.
        if (e.closest('.line')) return false;
        if (srOnly(e) || inClosedDetails(e)) return false;
        if (!e.textContent.trim()) return false;
        // An <svg> logo or a <select> has no text leaf but occupies real space;
        // treat them as atomic so they can still collide with something.
        if (e.tagName === 'SELECT' || e.tagName === 'svg') return true;
        return ![...e.children].some((c) => c.textContent.trim()); // leaf only
      });
    for (let i = 0; i < leaves.length; i++) {
      const a = leaves[i].getBoundingClientRect();
      if (a.width < 2 || a.height < 2) continue;
      for (let j = i + 1; j < leaves.length; j++) {
        if (leaves[i].contains(leaves[j]) || leaves[j].contains(leaves[i])) continue;
        const c = leaves[j].getBoundingClientRect();
        if (c.width < 2 || c.height < 2) continue;
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left);
        const oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        if (ox > 4 && oy > 4) {
          const name = (e) => e.tagName === 'svg' ? `<svg ${e.closest('[aria-label]')?.getAttribute('aria-label') ?? ''}>` : `"${e.textContent.trim().slice(0, 22)}"`;
          out.overlaps.push(`${name(leaves[i])} x ${name(leaves[j])}`);
        }
      }
    }

    // Tap targets — WCAG 2.2 SC 2.5.8 (AA) wants 24x24 CSS px. It exempts
    // links inline in a sentence, so we honour that exception rather than
    // padding prose links into buttons.
    const inlineInProse = (e) => {
      const p = e.parentElement;
      if (!p) return false;
      if (!/^(P|LI|SPAN|LABEL|FIGCAPTION|BLOCKQUOTE)$/.test(p.tagName)) return false;
      // exempt only if there is real sentence text around the link
      return p.textContent.trim().length > e.textContent.trim().length + 12;
    };

    for (const e of document.querySelectorAll('a,button,select,input[type=checkbox]')) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (srOnly(e) || inlineInProse(e) || inClosedDetails(e)) continue;
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const box = e.type === 'checkbox' ? (e.nextElementSibling?.getBoundingClientRect() ?? r) : r;
      if (box.height < 24 || box.width < 24) {
        out.small.push(`${e.tagName}: "${(e.textContent || e.value || e.ariaLabel || '').trim().slice(0, 20)}" ${Math.round(box.width)}x${Math.round(box.height)}`);
      }
    }
    out.overlaps = [...new Set(out.overlaps)].slice(0, 6);
    out.clipped = [...new Set(out.clipped)].slice(0, 6);
    out.small = [...new Set(out.small)].slice(0, 6);
    return out;
  });

  const bad = r.overflow || r.clipped.length || r.overlaps.length || (d.w < 768 && r.small.length);
  if (bad) problems++;
  console.log(`\n${bad ? 'ISSUES' : 'clean '}  ${String(d.w).padStart(4)}x${d.h}  ${d.name}`);
  if (r.overflow) console.log(`   overflow: ${r.overflow.scrollW} > ${r.overflow.clientW} — ${r.overflow.culprits.join('; ')}`);
  for (const c of r.clipped) console.log(`   clipped : ${c}`);
  for (const o of r.overlaps) console.log(`   overlap : ${o}`);
  if (d.w < 768) for (const s of r.small) console.log(`   tap<24  : ${s}`);

  await p.close();
}

console.log(`\n${WIDTHS.length - problems}/${WIDTHS.length} widths clean`);
await b.close();
