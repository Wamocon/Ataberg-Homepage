import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';
import { LISTINGS, RATES, TABS } from './listings.js';
import { ARTICLE_TABS } from './footer.js';
import { cardHTML, articlesHTML, esc, setLang, t, quickRowHTML, moreHTML, footerHTML, megaHTML, drawerHTML } from './render.js';
import { makeT, LANGS, DEFAULT_LANG } from './i18n.js';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Assigned by the listing and article blocks below; called when the language
   changes, because anything rendered from data has to be repainted. */
let repaintTabs = () => {};
let repaintArticles = () => {};
let repaintSearch = () => {};
let showResults = () => {};      // assigned by the listings block; called from search
let inResultsMode = () => false; // true while search results replace the tabbed rail
let reshowResults = () => {};    // re-render the current results in the active language
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Number grouping follows the active language: tr 6.000 / €150.000, ru & pl
   6 000, en 6,000. Read from <html lang> so it tracks the language switch. */
const localeOf = () => LANGS.find((l) => l.code === document.documentElement.lang)?.locale || 'en-GB';

/* ───────────────────────── smooth scroll ─────────────────────────
   Lenis drives ScrollTrigger. Skipped entirely under reduced motion —
   hijacking scroll is exactly what that preference asks us not to do. */
let lenis = null;
// Lenis smooths WHEEL / trackpad scrolling — a desktop nicety. On touch devices
// its native momentum is already smooth, and Lenis's touch handling can trap a
// vertical swipe inside a nested horizontal carousel (the listings rail). So
// gate it to fine pointers; phones/tablets get pure native scroll. ScrollTrigger
// falls back to native scroll events when Lenis is absent.
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (!REDUCED && FINE_POINTER) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* One scroll entry point so the search jump respects Lenis instead of fighting
   its rAF loop with a native smooth scroll. Offsets for the fixed header. */
const scrollToEl = (sel) => {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ───────────────────────── header ───────────────────────── */
{
  const hdr = $('[data-hdr]');
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    onToggle: (s) => hdr.toggleAttribute('data-pinned', s.isActive),
  });
}

/* ───────────────────────── nav: mega-menu + drawer ─────────────────────────
   The Properties dropdown (desktop) and the full off-canvas menu (mobile, where
   the inline nav is hidden). Both are prerendered; a hidden attribute keeps them
   safe with no JS, and data-open drives the transition. */
{
  // A close animation needs the element to stay displayed through the fade, so
  // we drop the hidden attribute on open and restore it after the transition.
  const panel = (el, on, ms) => {
    if (on) { el.hidden = false; requestAnimationFrame(() => el.setAttribute('data-open', '')); }
    else { el.removeAttribute('data-open'); setTimeout(() => { if (!el.hasAttribute('data-open')) el.hidden = true; }, ms); }
  };

  const megaToggle = $('[data-mega-toggle]');
  const mega = $('[data-mega]');
  let megaOn = false;
  const setMega = (on) => { megaOn = on; megaToggle.setAttribute('aria-expanded', String(on)); panel(mega, on, 320); };
  megaToggle.addEventListener('click', (e) => { e.stopPropagation(); setMega(!megaOn); });
  mega.addEventListener('click', (e) => { if (e.target.closest('a')) setMega(false); else e.stopPropagation(); });
  document.addEventListener('click', () => { if (megaOn) setMega(false); });

  const burger = $('[data-burger]');
  const drawer = $('[data-drawer]');
  let drawerOn = false;
  const setDrawer = (on) => {
    drawerOn = on;
    burger.setAttribute('aria-expanded', String(on));
    document.body.classList.toggle('drawer-open', on);
    panel(drawer, on, 420);
  };
  burger.addEventListener('click', () => setDrawer(!drawerOn));
  drawer.addEventListener('click', (e) => {
    // overlay tap, a nav link, or a mega link all dismiss the drawer
    if (e.target === drawer || e.target.closest('[data-drawer-link], .drawer__mega a')) setDrawer(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (megaOn) setMega(false);
    if (drawerOn) setDrawer(false);
  });

  // Re-render both when the language changes (their headings are baked at render
  // time, not swapped via data-i18n).
  window.__renderNav = () => { mega.innerHTML = megaHTML(); $('.drawer__panel').innerHTML = drawerHTML(); };
}

/* ───────────────────────── split text ─────────────────────────
   Wrap each line in a masked block so it can rise into place. Done by
   measuring rendered line boxes, so it survives any wrap the browser picks. */
function splitLines(el) {
  const text = el.textContent.trim();
  const words = text.split(/\s+/);
  el.textContent = '';
  const probes = words.map((w) => {
    const s = document.createElement('span');
    s.textContent = w;
    s.style.display = 'inline-block';
    el.append(s, document.createTextNode(' '));
    return s;
  });

  // Group probes by their vertical offset — that's a line.
  const lines = [];
  let top = null;
  for (const p of probes) {
    const t = Math.round(p.offsetTop);
    if (t !== top) { lines.push([]); top = t; }
    lines.at(-1).push(p.textContent);
  }

  el.textContent = '';
  return lines.map((words, i) => {
    const line = document.createElement('span');
    line.className = 'line';
    const inner = document.createElement('span');
    inner.textContent = words.join(' ');
    line.append(inner);
    el.append(line);
    // A space between the line blocks. Without it the element's textContent
    // concatenates them — "Turcji się" + "opłaca" reads as "sięopłaca" to a
    // screen reader and to anyone copying the heading. The blocks make it
    // invisible visually, which is exactly why it survived unnoticed.
    if (i < lines.length - 1) el.append(document.createTextNode(' '));
    return inner;
  });
}

// The mask (.line { overflow: hidden }) exists only to hide each line while it
// rises. Once it has landed the clip must be released, or a tight heading
// line-height crops tall glyphs at rest: the breve on ğ, Polish accents, and
// descenders. Reveal on complete (and eagerly on the first line's rise, so the
// resting lines in a stagger are never left cropped).
const unclip = (inner) => { if (inner.parentElement) inner.parentElement.style.overflow = 'visible'; };

function animateSplit(el) {
  const inners = splitLines(el);
  gsap.from(inners, {
    yPercent: 115,
    duration: 1,
    ease: 'expo.out',
    stagger: 0.07,
    scrollTrigger: { trigger: el, start: 'top 88%' },
    // Release each line's clip as its own rise finishes.
    onComplete: () => inners.forEach(unclip),
  });
}

$$('[data-split]').forEach((el) => {
  if (REDUCED) return;
  animateSplit(el);
});

/* Scramble-decode: each letter flickers through random glyphs, then locks to its
   real value left to right, so the line "decodes" into place. Used once, on the
   cinematic band heading over the parallax. The text is read at trigger time so
   it decodes in whatever language is active. The chars pool includes Turkish
   letters so the flicker stays in-script. Inert under reduced motion (the plain
   text is already in the DOM). */
const SCRAMBLE_CHARS = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZabcçdefgğhıijklmnoöprsştuüvyz';
if (!REDUCED) {
  $$('[data-scramble]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: () => gsap.to(el, {
        duration: 1.5, ease: 'none',
        scrambleText: { text: el.textContent, chars: SCRAMBLE_CHARS, speed: 0.5, revealDelay: 0.25, tweenLength: false },
      }),
    });
  });
}

/* Hero copy intro — transform only, never opacity.
   The hero text is above the fold and drives LCP. A fade-from-transparent or a
   masked-line reveal hides it until animated, which pushed the lede's paint past
   2.5s on a throttled phone. A translateY-only rise paints every line on the
   first frame (just offset), so LCP stays fast while the entrance still reads. */
if (!REDUCED) {
  const heroCopy = $('[data-hero-copy]');
  if (heroCopy) {
    gsap.from([...heroCopy.children], {
      y: 22, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.05,
    });
  }
}

/**
 * Re-split a heading after its text changes.
 *
 * splitLines() destroys the element's text node and replaces it with masked
 * line wrappers — which means a language swap has nothing to write into, and
 * headings silently stayed English. Rebuild the rig, but land the lines in
 * place rather than replaying the entrance: the reader is already looking at
 * this heading, so animating it again would be a tic, not a delight.
 */
function resplit(el, text) {
  el.textContent = text;
  if (REDUCED) return;
  const inners = splitLines(el);
  gsap.set(inners, { yPercent: 0 });
  inners.forEach(unclip); // lands in place, so release the clip immediately
}

/* ───────────────────────── magnetic CTAs ─────────────────────────
   The one cursor toy worth having: primary buttons drift toward the pointer and
   spring back. quickTo reuses a single tween per axis, so it is cheap. Gated on
   a real pointer and reduced-motion; idempotent so it can re-bind after the
   search form (which carries a magnetic button) re-renders on a language change. */
const MAGNETIC = !REDUCED && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
function bindMagnetic() {
  if (!MAGNETIC) return;
  for (const btn of $$('[data-magnetic]')) {
    if (btn.dataset.magBound) continue;
    btn.dataset.magBound = '1';
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.35);
      yTo((e.clientY - r.top - r.height / 2) * 0.35);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  }
}
bindMagnetic();

/* ───────────────────────── reveals ─────────────────────────
   Elements marked data-fade rise and fade in. Siblings sharing a parent (a card
   grid, a stat row) stagger off the first one entering, so a section resolves as
   a wave rather than everything popping at once. once:true, so it never re-plays. */
if (!REDUCED) {
  const groups = new Map();
  for (const el of $$('[data-fade]')) {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  }
  for (const els of groups.values()) {
    els.forEach((el, i) => {
      gsap.from(el, {
        y: 34,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        delay: Math.min(i, 6) * 0.08,
        scrollTrigger: { trigger: els[0], start: 'top 86%', once: true },
      });
    });
  }

  // Parallax band: the oversized photo drifts against the scroll for depth.
  const bandMedia = $('[data-band-media]');
  if (bandMedia) {
    gsap.fromTo(bandMedia, { yPercent: -9 }, {
      yPercent: 9,
      ease: 'none',
      scrollTrigger: { trigger: '[data-band]', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  // Ambient aurora on the flat dark fields. The CSS animation is compositor-only
  // (transform/opacity), but CSS animations keep ticking when scrolled off, so
  // an observer runs it only while the section is near the viewport.
  const ambientIO = new IntersectionObserver(
    (es) => es.forEach((e) => e.target.classList.toggle('ambient-run', e.isIntersecting)),
    { rootMargin: '10% 0px' }
  );
  for (const el of $$('.sec--dark, .sec--news, .ftr')) ambientIO.observe(el);
}

/* ───────────────────────── the descent ─────────────────────────
   Sky over the Mediterranean → down into Alanya → into a complex → the water.
   Each stage is a photograph scaled and cross-faded on a scrubbed timeline,
   so it reads as one continuous camera push rather than three slides.

   Stage 1 gains real depth from a WebGL depth-parallax pass (hero3d.js): the
   aerial parallaxes under the pointer and pushes into the frame as you scroll,
   so the descent literally dives into the city. That layer is lazy, gated, and
   optional — under reduced motion or on a phone it never loads and the flat
   photo carries the whole thing (ANALYSIS.md §7). */
if (!REDUCED) {
  const vp = $('[data-descent-vp]');
  const s1 = $('[data-stage="1"]');
  const s2 = $('[data-stage="2"]');
  const s3 = $('[data-stage="3"]');
  const copy = $('.descent__copy');
  const hint = $('[data-hint]');
  const scrim = $('.descent__scrim');
  const gl = $('[data-gl]');

  gsap.set([s2, s3], { scale: 1.35, autoAlpha: 0 });
  gsap.set(s1, { scale: 1 });

  // The 3D layer, once loaded, is driven by the same scroll progress as the
  // timeline below. Held in a ref so the ScrollTrigger onUpdate can reach it
  // even though it resolves asynchronously.
  let hero3d = null;

  // The first leg of the descent — the stretch where the 3D parallax is live.
  // Shared between the timeline and the parallax ramp so retiming the descent
  // can't silently desync them.
  const LEG1 = 0.32;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '[data-descent]',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => hero3d?.setScroll(self.progress / LEG1),
    },
  });

  // Leg 1 — push through the aerial. Copy lifts away as we drop.
  // The scrim exists to hold contrast under the headline; once the copy is
  // gone it is just mud on the photography, so it lifts with the text.
  tl.to(s1, { scale: 1.55, ease: 'none' }, 0)
    .to(gl, { autoAlpha: 0, ease: 'none' }, LEG1 - 0.04) // fade the 3D out with stage 1
    .to(copy, { y: -70, autoAlpha: 0, ease: 'power1.in' }, 0)
    .to(scrim, { opacity: 0.3, ease: 'none' }, 0)
    .to(hint, { autoAlpha: 0, duration: 0.15 }, 0)

    // Leg 2 — the towers resolve out of the city below.
    .to(s1, { autoAlpha: 0, ease: 'none' }, LEG1)
    .to(s2, { autoAlpha: 1, scale: 1.08, ease: 'none' }, 0.3)

    // Leg 3 — arrive at the water.
    .to(s2, { autoAlpha: 0, scale: 1, ease: 'none' }, 0.66)
    .to(s3, { autoAlpha: 1, scale: 1, ease: 'none' }, 0.64);

  // Depth-parallax hero. Dynamically imported so three.js is its own chunk and
  // never blocks first paint; a failure here must never break the page.
  import('./hero3d.js')
    .then((m) => { hero3d = m.initHero3d(gl, vp, s1.querySelector('img')); })
    .catch(() => { /* the flat photo is a complete hero on its own */ });
}

/* ───────────────────────── currency ─────────────────────────
   Ataberk is EUR-only today. Tolerance ships 15 currencies, Tekce 12 —
   this is the cheapest competitive gap on the board (ANALYSIS.md §6). */
const money = (() => {
  let cur = localStorage.getItem('ab-cur') || 'EUR';
  const fmt = (eur, c = cur) => {
    const v = eur * RATES.rate[c];
    const n = new Intl.NumberFormat(localeOf(), {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(v / (v > 100000 ? 500 : 100)) * (v > 100000 ? 500 : 100));
    return `${RATES.symbol[c]}${n}`;
  };
  return {
    get cur() { return cur; },
    set(c) { cur = c; localStorage.setItem('ab-cur', c); render(); },
    fmt,
  };
})();

/* ───────────────────────── favourites ─────────────────────────
   The live site has a favourites feature; the first cut of this rebuild
   dropped it. Local-only — there is no account system to sync to. */
const favs = {
  set: new Set(JSON.parse(localStorage.getItem('ab-favs') || '[]')),
  has(id) { return this.set.has(id); },
  toggle(id) {
    this.set.has(id) ? this.set.delete(id) : this.set.add(id);
    localStorage.setItem('ab-favs', JSON.stringify([...this.set]));
    $('[data-fav-n]').textContent = String(this.set.size);
    $('[data-fav-count]').classList.toggle('is-on', this.set.size > 0);
  },
};

/* ───────────────────────── listings ───────────────────────── */

function render() {
  $$('[data-eur]').forEach((el) => {
    // data-from is language-agnostic; the old startsWith('from ') check dropped
    // the localized prefix (tr "başlangıç fiyatı") on a currency change.
    const from = el.hasAttribute('data-from');
    el.textContent = (from ? t('card.from') : '') + money.fmt(Number(el.dataset.eur));
  });
}

{
  const track = $('[data-rail-track]');
  const tabsEl = $('[data-tabs]');
  const banner = $('[data-results]');
  const bannerTxt = $('[data-results-txt]');
  let active = TABS[0].key;
  let pin = null;
  // Results-mode state, so a language change (or any repaint) can restore the
  // exact search results in the new language instead of dropping them.
  let inResults = false, lastMatches = [], lastEmpty = false;

  function hydrateFavs() {
    for (const b of $$('[data-fav]')) {
      const on = favs.has(Number(b.dataset.fav));
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    }
  }

  // Tabs and the first rail are prerendered into index.html — see render.js.

  // The horizontal rail is pinned and scrubbed. Switching tabs changes the
  // track width, so the pin has to be rebuilt or the end point goes stale.
  function buildRail() {
    pin?.kill();
    pin = null;
    gsap.set(track, { x: 0 });
    if (REDUCED || !window.matchMedia('(min-width: 861px)').matches) return;

    const overflow = () => track.scrollWidth - track.parentElement.clientWidth;
    if (overflow() <= 0) return;

    pin = gsap.to(track, {
      x: () => -overflow(),
      ease: 'none',
      scrollTrigger: {
        trigger: '#listings',
        start: 'top top',
        end: () => `+=${overflow()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    }).scrollTrigger;
  }

  function paint(key, initial = false, force = false) {
    active = key;
    inResults = false;
    if (banner) banner.hidden = true;   // leaving results mode for a real tab
    // The default tab's cards are already in the HTML; re-rendering them on
    // boot would throw away markup the browser has already painted. A language
    // change forces a repaint because the text itself has to change.
    if (!initial || force) {
      track.innerHTML = LISTINGS.filter((l) => l.tabs.includes(key))
        .map((l) => cardHTML(l, key, favs.has(l.id))).join('');
    }
    render();
    $$('[data-tab]').forEach((b) => {
      const on = b.dataset.tab === key;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      const n = b.querySelector('.tab__n');
      b.firstChild.textContent = t(`tab.${b.dataset.tab}`) + ' ';
      if (n) b.append(n);
    });
    buildRail();
    ScrollTrigger.refresh();
  }

  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b && b.dataset.tab !== active) paint(b.dataset.tab);
  });

  // Roving tabindex — arrow keys move between tabs, per WAI-ARIA.
  tabsEl.addEventListener('keydown', (e) => {
    const i = TABS.findIndex((t) => t.key === active);
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = TABS.length - 1;
    if (n === null) return;
    e.preventDefault();
    paint(TABS[n].key);
    $(`[data-tab="${TABS[n].key}"]`).focus();
  });

  track.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    e.preventDefault();
    const id = Number(b.dataset.fav);
    favs.toggle(id);
    b.classList.toggle('is-on', favs.has(id));
    b.setAttribute('aria-pressed', String(favs.has(id)));
  });

  repaintTabs = () => paint(active, false, true);

  // Rebuild the rail when the viewport crosses the 861px pin boundary (rotate,
  // window drag). buildRail's guard otherwise only runs on a tab paint, so a
  // desktop scrub-pin would persist and hold #listings fixed on the mobile
  // layout — or a phone would miss the pin after growing to desktop width.
  let wideRail = window.matchMedia('(min-width: 861px)').matches;
  addEventListener('resize', () => {
    const now = window.matchMedia('(min-width: 861px)').matches;
    if (now !== wideRail) { wideRail = now; buildRail(); ScrollTrigger.refresh(); }
  }, { passive: true });

  // Search results: replace the rail with the matching listings, drop the tab
  // highlight, and reveal a dismissible banner. Each card keeps its OWN primary
  // tag (l.tabs[0]) rather than borrowing the last active tab's, so a card never
  // mislabels itself. Clearing (or picking any tab) returns to the tabbed view.
  showResults = (matches, label, empty) => {
    inResults = true; lastMatches = matches; lastEmpty = empty;
    $$('[data-tab]').forEach((b) => {
      b.classList.remove('is-on'); b.setAttribute('aria-selected', 'false'); b.tabIndex = -1;
    });
    track.innerHTML = matches.map((l) => cardHTML(l, l.tabs[0], favs.has(l.id))).join('');
    render();
    hydrateFavs();
    banner.hidden = false;
    banner.classList.toggle('results--empty', empty);
    // Write the count AFTER the live region is on-screen (next frame), so a
    // screen reader observes the region empty first and then announces the count
    // — announcing region+text in the same frame is usually silent.
    requestAnimationFrame(() => { bannerTxt.textContent = label; });
    buildRail();
    ScrollTrigger.refresh();
  };
  banner?.querySelector('[data-results-clear]')?.addEventListener('click', () => paint(active, false, true));

  inResultsMode = () => inResults;
  reshowResults = () => showResults(lastMatches, lastEmpty ? t('search.none') : t('search.results', { n: lastMatches.length }), lastEmpty);

  paint(active, true);
  hydrateFavs();   // prerendered cards ship with is-on absent; hydrate from localStorage
  $('[data-fav-n]').textContent = String(favs.set.size);
  $('[data-fav-count]').classList.toggle('is-on', favs.set.size > 0);
}

{
  const sel = $('[data-cur]');
  sel.value = money.cur;
  sel.addEventListener('change', () => money.set(sel.value));
  render();
}

/* ───────────────────────── counters ─────────────────────────
   Note the numbers: 6,000 sales / 30,000 properties come from the About page.
   The live homepage claims "212342 objects" — a 7x contradiction with their
   own About page, and implausible for an Alanya agency. We use the
   defensible figure. See ANALYSIS.md §2.1. */
$$('[data-count]').forEach((el) => {
  const to = Number(el.dataset.count);
  // Read the locale each frame so the roll-up settles in the ACTIVE language even
  // if it was queued at boot in another (tr 6.000 vs ru/pl 6 000 vs en 6,000).
  const nfmt = (n) => new Intl.NumberFormat(localeOf()).format(n);
  if (REDUCED) { el.textContent = nfmt(to); return; }
  const o = { v: 0 };
  gsap.to(o, {
    v: to,
    duration: 1.9,
    ease: 'expo.out',
    // once: the count rolls up when it first scrolls in and stays put —
    // re-rolling every time it re-enters the viewport reads as a glitch.
    scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    onUpdate: () => { el.textContent = nfmt(Math.round(o.v)); },
  });
});

/* ───────────────────────── search ─────────────────────────
   Restores the live site's filter depth (~40 amenities, infrastructure,
   distance-to-sea, developer-vs-owner) behind a "More filters" disclosure.
   The live match count is computed against the 32 real listings, so the form
   cannot promise results that do not exist. */
{
  const row = $('[data-quick-row]');
  const more = $('[data-more]');
  const form = $('[data-search]');

  // Re-queried, never captured: a language change replaces the form's innerHTML,
  // so a held reference would point at a detached node and silently do nothing.
  const priceSel = () => $('[data-price-sel]');
  const syncPrices = () => {
    const sel = priceSel();
    if (!sel) return;
    [...sel.options].forEach((o) => {
      if (o.value) o.textContent = money.fmt(Number(o.value));
    });
  };

  const locMatch = (l, loc) => {
    if (!loc) return true;
    if (loc.startsWith('All of ')) return l.city === loc.slice(7);
    return l.district === loc || l.city === loc;
  };

  // The real predicate, shared by the live count and the submit. All 32 homes
  // on this page are for sale, so a "rent" request honestly returns nothing and
  // the submit shows the empty state rather than pretending otherwise.
  const matching = () => {
    if (($('#q-deal')?.value ?? 'buy') === 'rent') return [];
    const max = Number(priceSel()?.value) || Infinity;
    const type = $('#q-type')?.value ?? '';
    const loc = $('#q-loc')?.value ?? '';
    const rooms = $('#q-rooms')?.value ?? '';
    return LISTINGS.filter((l) =>
      l.price <= max &&
      (!type || l.type === type) &&
      locMatch(l, loc) &&
      (!rooms || l.rooms.includes(rooms))
    );
  };

  // Honest match count: computed against the real 32, not invented.
  const count = () => {
    $('[data-match]').textContent = t('search.match', { n: matching().length, total: LISTINGS.length });
  };

  form.addEventListener('change', count);

  // "Search" was a no-op submit that reloaded the page. Now it filters the real
  // listings into a results view and scrolls there — genuinely functional.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const matches = matching();
    if (matches.length) showResults(matches, t('search.results', { n: matches.length }), false);
    else showResults([], t('search.none'), true);
    scrollToEl('#listings');
  });
  $('[data-cur]').addEventListener('change', () => { syncPrices(); });

  $('[data-more-toggle]').addEventListener('click', (e) => {
    const on = more.hidden;
    more.hidden = !on;
    e.currentTarget.setAttribute('aria-expanded', String(on));
    e.currentTarget.querySelector('span').textContent = t(on ? 'search.fewer' : 'search.more');
    ScrollTrigger.refresh();
  });

  $('[data-reset]').addEventListener('click', () => {
    form.reset();
    syncPrices();
    count();
  });

  // The <form>, toggle and reset survive a repaint (only the form's innerHTML is
  // replaced), and their listeners are bound to those survivors — so a repaint
  // only has to refresh the derived text.
  repaintSearch = () => {
    syncPrices();
    count();
    const tog = $('[data-more-toggle]');
    tog.querySelector('span').textContent = t(more.hidden ? 'search.more' : 'search.fewer');
    $('[data-reset]').textContent = t('search.reset');
    $('[data-map]')?.replaceChildren(t('search.map'));
    bindMagnetic(); // the freshly-rendered Search button carries data-magnetic
  };

  syncPrices();
  count();
}

/* ───────────────────────── articles ───────────────────────── */
{
  const tabsEl = $('[data-atabs]');
  const grid = $('[data-articles]');
  const all = $('[data-articles-all]');
  let active = ARTICLE_TABS[0].key;

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(localeOf(), { day: 'numeric', month: 'long', year: 'numeric' });

  // Article tabs and the first panel are prerendered — see render.js.
  function paint(key, initial = false) {
    active = key;
    if (!initial) grid.innerHTML = articlesHTML(key);
    const tab = ARTICLE_TABS.find((x) => x.key === key);
    const labelKey = { news: 'articles.allNews', blog: 'articles.allBlog', useful: 'articles.allUseful' }[key];
    all.firstChild.textContent = t(labelKey);
    all.href = tab.all.href;
    $$('[data-atab]').forEach((b) => {
      const on = b.dataset.atab === key;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }

  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-atab]');
    if (b) paint(b.dataset.atab);
  });
  tabsEl.addEventListener('keydown', (e) => {
    const i = ARTICLE_TABS.findIndex((t) => t.key === active);
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % ARTICLE_TABS.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + ARTICLE_TABS.length) % ARTICLE_TABS.length;
    if (n === null) return;
    e.preventDefault();
    paint(ARTICLE_TABS[n].key);
    $(`[data-atab="${ARTICLE_TABS[n].key}"]`).focus();
  });

  repaintArticles = () => {
    paint(active, false);
    $$('[data-atab]').forEach((b) => { b.textContent = t(`atab.${b.dataset.atab}`); });
  };

  paint(active, true);
}

/* ───────────────────────── newsletter ───────────────────────── */
{
  const form = $('[data-news]');
  const note = $('[data-news-note]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#n-email');
    const agree = form.querySelector('[name="agree"]');
    note.removeAttribute('data-ok');
    note.removeAttribute('data-err');
    if (!email.checkValidity()) {
      note.setAttribute('data-err', '');
      note.textContent = t('news.badEmail');
      return;
    }
    if (!agree.checked) {
      note.setAttribute('data-err', '');
      note.textContent = t('news.needAgree');
      return;
    }
    note.setAttribute('data-ok', '');
    note.textContent = t('news.demo');
  });
}

/* ───────────────────────── language ─────────────────────────
   Real translation, not a redirect. The first cut of this shipped a selector
   that just navigated to ataberkestate.com — which is a link to someone else's
   page, not a multilingual site.

   English is prerendered into the HTML (so it survives with no JS and needs no
   swap on first paint); RU and PL swap in on demand. Listing titles come from
   Ataberk's own RU/PL sites, so buyers read the agency's words. */
{
  const sel = $('[data-lang]');
  const saved = localStorage.getItem('ab-lang');

  function applyLang(lang) {
    const t = makeT(lang);
    document.documentElement.lang = lang;
    localStorage.setItem('ab-lang', lang);

    for (const el of $$('[data-i18n]')) {
      const s = t(el.dataset.i18n);
      // Split headings have no text node left to write into — rebuild the rig.
      if (el.hasAttribute('data-split')) { resplit(el, s); continue; }
      // A scramble heading mid-decode would otherwise lock to the OLD language;
      // kill the tween and set the new text (a no-op kill if none is running).
      if (el.hasAttribute('data-scramble')) { gsap.killTweensOf(el); el.textContent = s; continue; }
      // Keep any element children (the counter <strong>, link arrows) intact —
      // only the element's own text nodes are translated.
      if (el.children.length === 0) { el.textContent = s; continue; }
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim()) { n.textContent = s; break; }
      }
    }
    for (const el of $$('[data-i18n-attr]')) {
      const [attr, key] = el.dataset.i18nAttr.split(':');
      el.setAttribute(attr, t(key));
    }

    // Anything rendered from data has to be repainted in the new language.
    setLang(lang);
    // Anything rendered from data has to be repainted in the new language.
    // The search form is prerendered markup, so it needs rebuilding too — the
    // first cut of this left it stubbornly English while the page changed.
    const wasResults = inResultsMode();  // capture before repaintTabs clears it
    const more = $('[data-more]');
    const wasOpen = !more.hidden;
    // Snapshot the visitor's search selections; rebuilding the form innerHTML for
    // the new language would otherwise wipe every choice and the match count.
    const sf = $('[data-search]');
    const selVals = {}; $$('select', sf).forEach((s) => { selVals[s.id] = s.value; });
    const checkedVals = new Set($$('input[type=checkbox]:checked', sf).map((c) => c.value));
    $('[data-quick-row]').innerHTML = quickRowHTML();
    more.innerHTML = moreHTML();
    more.hidden = !wasOpen;
    // Restore the selections onto the freshly-rendered controls.
    $$('select', sf).forEach((s) => { if (selVals[s.id] != null && selVals[s.id] !== '') s.value = selVals[s.id]; });
    $$('input[type=checkbox]', sf).forEach((c) => { if (checkedVals.has(c.value)) c.checked = true; });
    $('[data-ftr]').innerHTML = footerHTML();
    window.__renderNav?.();
    repaintSearch();
    repaintTabs();
    repaintArticles();
    render();
    // Re-group the already-rolled counters in the new locale (6,000 -> 6.000).
    $$('[data-count]').forEach((el) => { el.textContent = new Intl.NumberFormat(localeOf()).format(Number(el.dataset.count)); });
    // If the visitor was viewing search results, re-render them in the new
    // language instead of silently dropping them back to the default tab.
    if (wasResults) reshowResults();
    ScrollTrigger.refresh();
  }

  sel.addEventListener('change', (e) => applyLang(e.target.value));

  // The page ships prerendered in DEFAULT_LANG (Turkish). If the visitor has a
  // saved preference for a different language, swap to it; otherwise the static
  // Turkish paint stands with no work.
  const initial = saved && LANGS.some((l) => l.code === saved) ? saved : DEFAULT_LANG;
  sel.value = initial;
  if (initial !== DEFAULT_LANG) applyLang(initial);
}

/* ───────────────────────── contact form ─────────────────────────
   Client-side only. There is no endpoint wired — say so rather than
   fake a success state the user would trust. */
{
  const form = $('[data-form]');
  const note = $('[data-form-note]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#f-name');
    const phone = $('#f-phone');
    let bad = false;
    for (const f of [name, phone]) {
      const empty = !f.value.trim();
      f.setAttribute('aria-invalid', String(empty));
      if (empty) bad = true;
    }
    note.removeAttribute('data-ok');
    note.removeAttribute('data-err');
    if (bad) {
      note.setAttribute('data-err', '');
      note.textContent = t('contact.need');
      return;
    }
    note.setAttribute('data-ok', '');
    note.textContent = t('contact.demo');
  });
}

/* ───────────────────────── assistant ─────────────────────────
   Streams from /api/ask, which retrieves from Ataberk's own content and
   answers only from it. The API key lives on the server and never reaches
   this file — see server/ai.js. */
{
  const fab = $('[data-ai-open]');
  const panel = $('[data-ai]');
  const log = $('[data-ai-log]');
  const form = $('[data-ai-form]');
  const input = $('[data-ai-input]');
  const history = [];
  let busy = false;

  const bubble = (kind, text = '') => {
    const d = document.createElement('div');
    d.className = `msg msg--${kind}`;
    d.textContent = text;
    log.append(d);
    log.scrollTop = log.scrollHeight;
    return d;
  };

  // Sources are rendered as links to the page the claim came from, so a
  // person can check the assistant rather than take its word.
  const cite = (sources) => {
    if (!sources?.length) return;
    const d = document.createElement('div');
    d.className = 'cites';
    d.append(Object.assign(document.createElement('span'), { textContent: t('ai.sources') }));
    for (const s of sources) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.title;
      a.title = `relevance ${s.score}`;
      d.append(a);
    }
    log.append(d);
    log.scrollTop = log.scrollHeight;
  };

  async function ask(q) {
    const out = bubble('bot');
    out.classList.add('msg--typing');
    let text = '';
    let sources = [];

    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history, lang: document.documentElement.lang }),
      });

      if (!r.ok || !r.body) {
        const e = await r.json().catch(() => ({}));
        out.classList.remove('msg--typing');
        out.textContent = e.error || t('ai.down');
        return;
      }

      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const p = line.slice(5).trim();
          if (!p || p === '[DONE]') continue;
          let m;
          try { m = JSON.parse(p); } catch { continue; }
          if (m.sources) {
            sources = m.sources;
            // Sources land seconds before the first token. Saying what we are
            // reading beats three dots — it is the honest answer to "is this
            // thing working?" and it is free.
            if (sources.length) out.dataset.reading = sources[0].title;
            continue;
          }
          if (m.delta) {
            out.classList.remove('msg--typing');
            delete out.dataset.reading;
            text += m.delta;
            // Strip the [id] citation markers — they are the model's proof of
            // grounding, but the links below say it better than raw ids do.
            out.textContent = text.replace(/\s*\[[a-z0-9-]+\]/gi, '');
            log.scrollTop = log.scrollHeight;
          }
        }
      }

      if (!text) {
        out.textContent = t('ai.noAnswer');
        return;
      }
      history.push({ role: 'user', content: q }, { role: 'assistant', content: text });
      cite(sources);
    } catch {
      out.classList.remove('msg--typing');
      out.textContent = t('ai.unreachable');
    }
  }

  const open = (on) => {
    panel.hidden = !on;
    fab.hidden = on;
    fab.setAttribute('aria-expanded', String(on));
    if (on && !log.childElementCount) {
      bubble('bot', t('ai.hello'));
      const chips = document.createElement('div');
      chips.className = 'ai__chips';
      for (const q of [t('ai.chip1'), t('ai.chip2'), t('ai.chip3'), t('ai.chip4')]) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = q;
        b.addEventListener('click', () => { input.value = q; form.requestSubmit(); });
        chips.append(b);
      }
      log.append(chips);
    }
    if (on) input.focus();
  };

  fab.addEventListener('click', () => open(true));
  $('[data-ai-close]').addEventListener('click', () => open(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) open(false);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q || busy) return;
    busy = true;
    input.value = '';
    $('.ai__chips')?.remove();
    bubble('me', q);
    await ask(q);
    busy = false;
    input.focus();
  });
}

/* ───────────────────────── deferred stage art ─────────────────────────
   Hydrate the descent's later stages once the page has loaded and the main
   thread is idle. They are absolutely positioned inside the viewport, so the
   browser would otherwise fetch them eagerly (loading="lazy" does not apply to
   in-viewport elements) — 395 KB of art for frames nobody has reached yet. */
function hydrateStages() {
  for (const el of $$('[data-srcset]')) {
    el.srcset = el.dataset.srcset;
    delete el.dataset.srcset;
  }
  for (const el of $$('img[data-src]')) {
    el.src = el.dataset.src;
    delete el.dataset.src;
  }
  ScrollTrigger.refresh();
}

/* Rail and pin geometry depend on fonts and images being settled. */
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  idle(hydrateStages, { timeout: 2000 });
});

/* If someone scrolls before idle fires, we need the art now, not later. */
addEventListener('scroll', function once() {
  removeEventListener('scroll', once);
  hydrateStages();
}, { passive: true, once: true });
