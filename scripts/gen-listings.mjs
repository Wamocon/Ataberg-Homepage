/**
 * Generate src/listings.js from raw/original-listings.json.
 *
 * Titles are rewritten from the live site's machine-translated English. Meaning,
 * claims, prices, areas and layouts are untouched — only the English changes.
 * Where the live data contradicts itself, the contradiction is recorded here
 * rather than silently resolved.
 */
import { readFile, writeFile } from 'node:fs/promises';

const { tabs, listings } = JSON.parse(await readFile('raw/original-listings.json', 'utf8'));

/** id -> corrected English title. Verbatim originals are in the JSON. */
const TITLES = {
  12136: 'Studio in Mahmutlar — furnished, with mountain views, direct from the owner',
  10173: '1+1 apartment in Tece, Mersin — with two balconies',
  12497: '1+1 apartment in Demirtaş, Alanya — furnished, keenly priced',
  6068: '1+1 apartment in Mahmutlar, Alanya — a new comfort-class complex',
  11405: 'Bright 1+1 with new furniture and a pine-forest view — Avsallar, Alanya',
  12479: '1+1 apartment in Avsallar, Alanya — fully finished, modern complex',
  12480: '1+1 apartment in Payallar, Alanya — residence-permit eligible, furnished, sea view',
  12502: '1+1 apartment in Demirtaş, Alanya — newly furnished, priced to move',
  9411: '1+1 apartment in Mahmutlar from the owner — fully finished',
  // Live title is Russian on the English page. Translated, not copied.
  12082: 'Single-storey 4+1 apartment in central Gazipaşa — furnished, direct from the owner',
  12483: 'Studio in Avsallar, Alanya — from the owner, furnished, with sea views',
  5260: 'Apartments in Demirtaş, Alanya with instalments up to 2 years — a new residential complex',
  12472: '3+1 apartment in Mahmutlar, Barbarossa — separate kitchen, 150 m from the sea',
  6515: 'One-bedroom apartment in Mahmutlar, with instalments',
  11777: '2+1 apartment in a new Mahmutlar complex, Alanya — direct from the owner',
  12263: '1+1 apartment of 70 m² in Kestel — furnished, sea views, 300 m from the beach',
  8611: 'Apartments from the developer in a boutique complex in Demirtaş, Alanya',
  6012: 'Apartments from a developer with instalments up to 3 years — a hotel-style complex in Avsallar, Alanya',
  12506: 'Apartments direct from the developer with instalments over 24 months — a complex under construction in central Mahmutlar',
  8386: 'Turnkey one-bedroom apartment in Oba, Alanya',
  11766: 'New-build apartment in Altıntaş, Antalya — direct from the owner',
  // Live data disagrees with itself: the location field says Konyaaltı, the
  // title says Hurma. Hurma is a neighbourhood of Konyaaltı, so both are kept.
  12478: '1+1 apartment in Hurma, Konyaaltı, Antalya — from the owner, urgent sale, furnished',
  8237: 'Fully finished apartment from the owner in Mahmutlar — 600 m from the sea',
  9159: 'Premium residential complex under development in Mahmutlar, Alanya',
  12153: 'Turnkey office in central Alanya, Cleopatra Beach — 300 m from the sand',
  9303: '3+1 apartment from the owner in a new complex — Kargıcak, Alanya',
  12503: '2+1 apartment in Tosmur, Alanya — furnished, mountain and sea views',
  12505: 'Business centre in Oba, Alanya — commercial space from the developer with instalments up to 2 years',
  12500: '3+1 duplex penthouse in Oba, Alanya — stylish interior, residence-permit eligible, from the owner',
  12499: 'Apartments in central Mahmutlar, Alanya — 150 m from the sea',
  6634: 'Apartments with panoramic views from the developer in the historic heart of Alanya — residence-permit eligible',
  12504: '4+1 duplex penthouse in Kargıcak, Alanya — front line, eligible for citizenship and residence',
};

/**
 * District spellings, normalised. The live site spells Demirtaş four ways
 * (Dermirtash / Demirtas / Demirtash / Dermitas) and Tosmur two.
 */
const DISTRICT = {
  Mahmutlar: 'Mahmutlar', Dermirtash: 'Demirtaş', Demirtash: 'Demirtaş', Demirtas: 'Demirtaş',
  Tosmoor: 'Tosmur', Tosmur: 'Tosmur', Kargicak: 'Kargıcak', Oba: 'Oba', Avsallar: 'Avsallar',
  Payallar: 'Payallar', Kestel: 'Kestel', Gazipasha: 'Gazipaşa', Center: 'Alanya centre',
  Tece: 'Tece', Teje: 'Tece', Altintas: 'Altıntaş', Altintash: 'Altıntaş', Konyaalti: 'Konyaaltı',
};

const TAG = {
  exclusive: 'Exclusive', top: 'Top offer', new: 'New', hot: 'Hot price', owners: 'From owner',
};

const slug = (id) => `p${id}`;

const rows = listings.map((l) => {
  // "District: Alanya Mahmutlar Apartments" -> city, district, type
  const m = l.location.replace(/^District:\s*/, '').trim();
  const parts = m.split(/\s+/);
  const type = parts.pop();
  const city = parts.shift();
  const district = DISTRICT[parts.join(' ')] || parts.join(' ');

  return {
    id: l.id,
    title: TITLES[l.id] || l.title,
    rooms: (l.rooms.match(/Rooms:\s*(.+)$/) || [])[1]?.trim() || '',
    area: l.area || null,
    city,
    district,
    type: type.toLowerCase(),
    price: l.price,
    priceFrom: l.priceFrom,
    href: l.href,
    img: slug(l.id),
    photos: l.photos.length,
    tabs: Object.entries(tabs).filter(([, ids]) => ids.includes(String(l.id))).map(([k]) => k),
  };
});

const missing = rows.filter((r) => !TITLES[r.id]);
if (missing.length) console.warn('! no corrected title for:', missing.map((r) => r.id).join(', '));

const out = `/**
 * Every listing carried on the live Ataberk homepage — all ${rows.length} of them,
 * across all five tabs. GENERATED by scripts/gen-listings.mjs from
 * raw/original-listings.json (extracted from the live page, 16 July 2026).
 * Do not hand-edit: change the title map in the generator instead.
 *
 * IDs, prices, areas, layouts and tab membership are exactly as published.
 * Titles are rewritten from the site's machine-translated English — meaning and
 * claims unchanged. District spellings are normalised (the live site spells
 * Demirtaş four ways). Listing 12082's title is Russian on the live English
 * page and is translated here.
 *
 * Note 8237 appears in four of the five tabs on the live site, so 40 slots
 * resolve to ${rows.length} unique properties.
 */
export const TABS = ${JSON.stringify(
  [
    { key: 'exclusive', label: 'Exclusive offers' },
    { key: 'top', label: 'Top offers' },
    { key: 'new', label: 'New offers' },
    { key: 'hot', label: 'Hot offers' },
    { key: 'owners', label: 'From owners' },
  ],
  null,
  2
)};

export const TAG = ${JSON.stringify(TAG, null, 2)};

export const LISTINGS = ${JSON.stringify(rows, null, 1)};

/**
 * Indicative rates only — a real build reads these from a daily feed. Stamped
 * so the UI can admit how old they are rather than implying a live quote.
 */
export const RATES = {
  asOf: '2026-07-16',
  base: 'EUR',
  rate: { EUR: 1, USD: 1.09, GBP: 0.85, TRY: 44.1, RUB: 95.4, SEK: 11.3, NOK: 11.7, PLN: 4.26 },
  symbol: { EUR: '€', USD: '$', GBP: '£', TRY: '₺', RUB: '₽', SEK: 'kr', NOK: 'kr', PLN: 'zł' },
};
`;

await writeFile('src/listings.js', out);
console.log(`wrote src/listings.js — ${rows.length} listings`);
console.log(`  districts: ${[...new Set(rows.map((r) => r.district))].join(', ')}`);
console.log(`  types    : ${[...new Set(rows.map((r) => r.type))].join(', ')}`);
console.log(`  price    : €${Math.min(...rows.map((r) => r.price)).toLocaleString('en-GB')} – €${Math.max(...rows.map((r) => r.price)).toLocaleString('en-GB')}`);
console.log(`  cheapest : ${rows.reduce((a, b) => (a.price < b.price ? a : b)).id}`);
