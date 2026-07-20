/**
 * Extract every listing from the saved live homepage.
 *
 * The live page is Drupal Quicktabs: five panes (quicktabs-tabpage-tabs_realty-0..4)
 * each holding eight `views-row` cards. 40 slots resolve to 32 unique properties
 * because 8237 appears in four of the five tabs.
 *
 * Writes raw/original-listings.json — the ground truth we build the rails from.
 */
import { readFile, writeFile } from 'node:fs/promises';

const h = await readFile('raw/home.html', 'utf8');

const TABS = [
  { n: 0, key: 'exclusive', label: 'Exclusive offers' }, // live label starts with Cyrillic Ye (U+0415)
  { n: 1, key: 'top', label: 'Top offers' },
  { n: 2, key: 'new', label: 'New offers' },
  { n: 3, key: 'hot', label: 'Hot offers' },
  { n: 4, key: 'owners', label: 'From owners' },
];

const strip = (s) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&euro;/g, '€')
    .replace(/&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pull one views-field block by its class suffix, bounded at the next
 * views-field so it cannot bleed into its neighbour. Drupal's markup nests
 * inconsistently here, so "up to the next field" is more reliable than trying
 * to balance the divs.
 */
const field = (row, name) => {
  const i = row.indexOf(`views-field-${name}`);
  if (i === -1) return '';
  const from = i + `views-field-${name}`.length;
  // Bound at the next views-field of any kind (field-content is a child
  // wrapper, not a sibling, so it must not terminate us). The trailing
  // fragment is an unclosed tag, which strip() cannot see — hence the cut.
  const rest = row.slice(from);
  const next = rest.search(/<div class="views-field/);
  const raw = next === -1 ? rest : rest.slice(0, next);
  return strip(raw).replace(/^["'>\s]+/, '').trim();
};

const paneOf = (n) => {
  const start = h.indexOf(`id="quicktabs-tabpage-tabs_realty-${n}"`);
  if (start === -1) throw new Error(`pane ${n} not found`);
  const next = h.indexOf(`id="quicktabs-tabpage-tabs_realty-${n + 1}"`, start);
  return h.slice(start, next === -1 ? start + 26000 : next);
};

const byId = new Map();
const tabs = {};

for (const t of TABS) {
  const rows = paneOf(t.n).split('<div class="views-row">').slice(1);
  tabs[t.key] = [];

  for (const row of rows) {
    const id = (row.match(/\/id(\d{3,6})/) || [])[1];
    if (!id) continue;
    tabs[t.key].push(id);
    if (byId.has(id)) continue;

    // Every photo in the card's slider, original resolution (strip the style
    // preset and the .webp wrapper; keep order — the first is the cover).
    const photos = [...row.matchAll(/data-lazy="([^"]*420x280[^"]*)"/g)]
      .map((m) => m[1].replace(/\/styles\/[^/]+\/public\//, '/').replace(/\.webp\?itok=.*$/, ''))
      .filter((v, i, a) => a.indexOf(v) === i);

    const href = (row.match(/href="https:\/\/www\.ataberkestate\.com(\/turkey\/[^"]*?\/id\d+)"/) || [])[1] || '';
    const priceRaw = field(row, 'field-price');
    const price = Number((priceRaw.match(/([\d\s ]{4,12})\s*€/) || [])[1]?.replace(/[\s ]/g, '') || 0);

    byId.set(id, {
      id: Number(id),
      href,
      title: strip(field(row, 'title')).replace(/^\s*/, ''),
      rooms: field(row, 'field-rooms-text'),
      area: Number((field(row, 'field-size-from').match(/(\d{2,4})/) || [])[1] || 0),
      location: field(row, 'field-location'),
      price,
      priceFrom: /price from/i.test(priceRaw),
      photos,
    });
  }
}

const listings = [...byId.values()].sort((a, b) => a.price - b.price);
await writeFile('raw/original-listings.json', JSON.stringify({ tabs, listings }, null, 1));

console.log(`panes: ${TABS.length}`);
for (const t of TABS) console.log(`  ${t.label.padEnd(18)} ${tabs[t.key].length} slots`);
console.log(`\nunique listings: ${listings.length}`);
console.log(`  with title : ${listings.filter((l) => l.title).length}`);
console.log(`  with price : ${listings.filter((l) => l.price).length}`);
console.log(`  with area  : ${listings.filter((l) => l.area).length}`);
console.log(`  with href  : ${listings.filter((l) => l.href).length}`);
console.log(`  with photos: ${listings.filter((l) => l.photos.length).length}  (total ${listings.reduce((s, l) => s + l.photos.length, 0)} photos)`);
console.log('\nsample:');
for (const l of listings.slice(0, 5)) {
  console.log(`  ${String(l.id).padEnd(6)} €${String(l.price).padStart(7)} ${String(l.area).padStart(4)}m² ${l.rooms.padEnd(22)} ${l.photos.length}p  ${l.title.slice(0, 46)}`);
}
