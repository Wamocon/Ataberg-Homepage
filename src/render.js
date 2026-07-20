/**
 * Markup templates shared by the build and the browser.
 *
 * These render at BUILD time into index.html (see vite.config.js) and are
 * reused at runtime only when the content actually changes — switching a tab.
 *
 * This split exists because injecting them from client JS cost 0.5088 CLS on a
 * throttled phone: the tabs, cards, articles and 76 footer links all landed
 * after first paint and shoved the page around. Rendering them into the HTML
 * fixes that, and has the side effect that the page's content works with no JS
 * at all.
 */
import { LISTINGS, TABS, RATES } from './listings.js';
import { FOOTER, FOOTER_COMBOS, MEGA, ARTICLES, ARTICLE_TABS } from './footer.js';
import * as F from './filters.js';
import { makeT, DEFAULT_LANG } from './i18n.js';
import LISTING_I18N from './listing-i18n.json';

/**
 * Current language. The build renders English; the client calls setLang() when
 * the visitor picks another. Kept module-level so every template can read it
 * without threading a parameter through eight call sites.
 */
let LANG = DEFAULT_LANG;
export let t = makeT(LANG);
export function setLang(lang) {
  LANG = lang;
  t = makeT(lang);
}
export const getLang = () => LANG;

/**
 * Listing titles in the visitor's language, taken from Ataberk's own RU/PL
 * sites. Falls back to our English rewrite when their pages do not carry that
 * listing — better an English title than a machine-translated guess.
 */
const titleOf = (l) => (LANG === 'en' ? l.title : LISTING_I18N[l.id]?.[LANG] || l.title);

export const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Server-side default: EUR. The client re-renders prices once it knows the
 *  visitor's stored preference. */
export const fmtEUR = (n) => `€${n.toLocaleString('en-GB')}`;

export function cardHTML(l, activeTab, isFav = false) {
  // The tag names the selection you are currently looking at, not the listing's
  // first membership — a listing can sit in several (8237 is in four), and
  // labelling a card "Exclusive" while browsing "From owners" reads as a bug.
  const tag = t(`tag.${activeTab}`);
  return `
    <article class="card" data-id="${l.id}">
      <a class="card__link" href="${l.href}">
        <div class="card__media">
          <picture>
            <source type="image/avif" srcset="/img/${l.img}.avif">
            <img src="/img/${l.img}.webp" alt="" width="640" height="427" loading="lazy" decoding="async">
          </picture>
          <span class="card__tag">${esc(tag)}</span>
        </div>
        <div class="card__body">
          <span class="card__loc">${esc(l.city)} · ${esc(l.district)}</span>
          <h3 class="card__ttl">${esc(titleOf(l))}</h3>
          <div class="card__meta">
            <span>${esc(l.rooms)}</span>
            ${l.area ? `<span>${l.area}&nbsp;m²</span>` : ''}
            <span class="card__ref">#${l.id}</span>
          </div>
          <span class="card__price" data-eur="${l.price}">${l.priceFrom ? t('card.from') : ''}${fmtEUR(l.price)}</span>
        </div>
      </a>
      <button class="card__fav${isFav ? ' is-on' : ''}" type="button" data-fav="${l.id}"
              aria-label="${esc(t('card.save'))} ${esc(titleOf(l))}" aria-pressed="${isFav}">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>
        </svg>
      </button>
    </article>`;
}

export const rowsFor = (key) => LISTINGS.filter((l) => l.tabs.includes(key));

export const railHTML = (key) => rowsFor(key).map((l) => cardHTML(l, key)).join('');

export const tabsHTML = (active = TABS[0].key) =>
  TABS.map((x) => {
    const on = x.key === active;
    return `<button class="tab${on ? ' is-on' : ''}" role="tab" type="button" data-tab="${x.key}"
      aria-selected="${on}" tabindex="${on ? 0 : -1}">${esc(t(`tab.${x.key}`))} <span class="tab__n">${rowsFor(x.key).length}</span></button>`;
  }).join('');

const fmtDate = (d) =>
  new Date(d).toLocaleDateString(LANG === 'ru' ? 'ru-RU' : LANG === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export const articlesHTML = (key) =>
  ARTICLES[key].map((a) => `
    <a class="art" href="${a.href}">
      <time datetime="${a.date}">${fmtDate(a.date)}</time>
      <h3>${esc(a.title)}</h3>
      <span class="art__go" aria-hidden="true">${esc(t('articles.read'))}</span>
    </a>`).join('');

export const articleTabsHTML = (active = ARTICLE_TABS[0].key) =>
  ARTICLE_TABS.map((x) => {
    const on = x.key === active;
    return `<button class="tab${on ? ' is-on' : ''}" role="tab" type="button" data-atab="${x.key}"
      aria-selected="${on}" tabindex="${on ? 0 : -1}">${esc(t(`atab.${x.key}`))}</button>`;
  }).join('');

export const footerHTML = () =>
  FOOTER.map((col) => `
    <details class="ftr__col" open>
      <summary><h2>${esc(t(col.k))}</h2></summary>
      <ul>${col.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>
    </details>`).join('');

/** The district x type band — closed by default; it is a link farm for crawlers
 *  and the occasional deep-diver, not something to make a reader scroll past. */
export const footerCombosHTML = () =>
  FOOTER_COMBOS.map((col) => `
    <details class="ftr__combo">
      <summary>${esc(col.title)} ${esc(t('ftr.combos'))} <span class="ftr__n">${col.links.length}</span></summary>
      <ul>${col.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>
    </details>`).join('');

/* ── search ─────────────────────────────────────────────── */
/** An option may carry `k` (an i18n key) or `label` (already-final text such as
 *  a district name, which is a proper noun and not translated). */
const opts = (arr, sel) =>
  arr.map((o) => {
    const v = typeof o === 'string' ? o : o.v;
    const label = typeof o === 'string' ? o : o.k ? t(o.k) : o.label;
    return `<option value="${esc(v)}"${v === sel ? ' selected' : ''}>${esc(label)}</option>`;
  }).join('');

const fieldSel = (id, label, inner) => `
  <div class="quick__f">
    <label for="${id}">${esc(label)}</label>
    <select id="${id}" name="${id.replace('q-', '')}">${inner}</select>
  </div>`;

export const quickRowHTML = () => [
  fieldSel('q-deal', t('search.deal'), opts(F.DEALS)),
  fieldSel('q-type', t('search.type'), opts(F.TYPES)),
  fieldSel('q-loc', t('search.where'),
    `<option value="">${esc(t('search.anywhere'))}</option>` +
    F.LOCATIONS.map((g) => `<optgroup label="${esc(g.group)}">${g.items.map((i) => `<option>${esc(i)}</option>`).join('')}</optgroup>`).join('')),
  fieldSel('q-rooms', t('search.rooms'), `<option value="">${esc(t('search.any'))}</option>${opts(F.ROOMS)}`),
  `<div class="quick__f">
     <label for="q-max">${esc(t('search.upTo'))}</label>
     <select id="q-max" name="max" data-price-sel>
       ${F.PRICE_STEPS.map((p) => `<option value="${p}"${p === 150000 ? ' selected' : ''}>${fmtEUR(p)}</option>`).join('')}
       <option value="">${esc(t('search.noLimit'))}</option>
     </select>
   </div>`,
  `<button class="btn btn--gold" type="submit" data-magnetic>${esc(t('search.go'))}</button>`,
].join('');

const checks = (name, arr) => `
  <fieldset class="quick__set">
    <legend>${esc(name)}</legend>
    <div class="quick__checks">
      ${arr.map((a) => {
        const v = typeof a === 'string' ? a : a.v;
        const label = typeof a === 'string' ? a : a.k ? t(a.k) : a.label;
        return `<label class="chk"><input type="checkbox" name="f" value="${esc(v)}"><span>${esc(label)}</span></label>`;
      }).join('')}
    </div>
  </fieldset>`;

export const moreHTML = () => [
  `<div class="quick__row">
    ${fieldSel('q-sea', t('search.sea'), opts(F.SEA))}
    ${fieldSel('q-stage', t('search.stage'), opts(F.STAGE))}
    ${fieldSel('q-seller', t('search.seller'), opts(F.SELLER))}
  </div>`,
  checks(t('search.goodToKnow'), F.EXTRAS),
  checks(t('search.amenities'), F.AMENITIES),
  checks(t('search.nearby'), F.INFRASTRUCTURE),
].join('');

/** Everything the build injects, keyed by the placeholder it replaces. */
/* ── header mega-menu + mobile drawer ─────────────────────
   The Properties dropdown (desktop) and the full mobile menu, both built from
   the MEGA columns so they never drift apart. */
const megaColsHTML = () =>
  MEGA.map((col) => `
    <div class="mega__col">
      <h3>${esc(t(col.k))}</h3>
      <ul>${col.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>
    </div>`).join('');

export const megaHTML = () => `
  <div class="mega__grid">${megaColsHTML()}</div>
  <a class="mega__all" href="/turkey">${esc(t('listings.all'))} <span aria-hidden="true">&rarr;</span></a>`;

// Mobile drawer: the primary nav, then the same Properties columns, then the
// language and currency controls, so a phone finally has a full menu.
export const drawerHTML = () => {
  const nav = [
    ['#listings', 'nav.properties'], ['#why', 'nav.why'], ['#trust', 'nav.about'],
    ['#reviews', 'nav.reviews'], ['#contact', 'nav.contact'],
  ];
  return `
    <nav class="drawer__nav" aria-label="Primary">
      ${nav.map(([href, k]) => `<a href="${href}" data-drawer-link data-i18n="${k}">${esc(t(k))}</a>`).join('')}
    </nav>
    <div class="drawer__mega">${megaColsHTML()}</div>
    <a class="btn btn--gold btn--full" href="#contact" data-drawer-link data-i18n="nav.getInTouch">${esc(t('nav.getInTouch'))}</a>`;
};

export const SLOTS = () => ({
  '<!--@mega-->': megaHTML(),
  '<!--@drawer-->': drawerHTML(),
  '<!--@tabs-->': tabsHTML(),
  '<!--@rail-->': railHTML(TABS[0].key),
  '<!--@atabs-->': articleTabsHTML(),
  '<!--@articles-->': articlesHTML(ARTICLE_TABS[0].key),
  '<!--@footer-->': footerHTML(),
  '<!--@combos-->': footerCombosHTML(),
  '<!--@quickrow-->': quickRowHTML(),
  '<!--@more-->': moreHTML(),
});
