/**
 * Pull the Russian and Polish listing titles from Ataberk's own sites.
 *
 * They already write every listing in all three languages — ataberkestate.com
 * (ru) and ataberkestate.pl (pl) are the same catalogue. Machine-translating our
 * English rewrite back into Russian would be a worse copy of something that
 * already exists in the agency's own voice, so we lift theirs.
 *
 * Their RU/PL homepages carry a slightly different selection (35 and 34 IDs vs
 * our 32), so anything missing is reported, never invented.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { LISTINGS } from '../src/listings.js';

const strip = (s) =>
  s.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"').replace(/&euro;/g, '€').replace(/&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, ' ').trim();

const field = (row, name) => {
  const i = row.indexOf(`views-field-${name}`);
  if (i === -1) return '';
  const rest = row.slice(i + `views-field-${name}`.length);
  const next = rest.search(/<div class="views-field/);
  return strip(next === -1 ? rest : rest.slice(0, next)).replace(/^["'>\s]+/, '').trim();
};

const out = {};
const report = {};

for (const lang of ['ru', 'pl']) {
  const h = await readFile(`raw/home-${lang}.html`, 'utf8');
  const rows = h.split('<div class="views-row">').slice(1);
  const byId = {};

  for (const row of rows) {
    const id = (row.match(/\/id(\d{3,6})/) || [])[1];
    if (!id || byId[id]) continue;
    const title = field(row, 'title');
    if (title) byId[id] = title;
  }

  const hit = LISTINGS.filter((l) => byId[l.id]);
  const miss = LISTINGS.filter((l) => !byId[l.id]);
  report[lang] = { hit: hit.length, miss: miss.map((l) => l.id) };

  for (const l of hit) {
    out[l.id] ??= {};
    out[l.id][lang] = byId[l.id];
  }
}

for (const [lang, r] of Object.entries(report)) {
  console.log(`${lang}: ${r.hit}/${LISTINGS.length} from the homepage`);
}

/**
 * Their RU and PL homepages carry a different selection, so ~13 listings are
 * missing. The same properties still exist as detail pages on those domains —
 * fetch the <h1>. Slower, but it means every card is the agency's own wording
 * in every language rather than a machine's guess.
 */
const HOST = { ru: 'https://www.ataberkestate.com', pl: 'https://www.ataberkestate.pl' };

for (const lang of ['ru', 'pl']) {
  const miss = LISTINGS.filter((l) => !out[l.id]?.[lang]);
  if (!miss.length) continue;
  process.stdout.write(`${lang}: fetching ${miss.length} detail pages`);
  let got = 0;
  for (const l of miss) {
    try {
      const r = await fetch(`${HOST[lang]}${l.href}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) { process.stdout.write('x'); continue; }
      const h = await r.text();
      const m = h.match(/<h1[^>]*>([\s\S]{0,300}?)<\/h1>/i);
      const title = m ? strip(m[1]) : '';
      if (title && title.length > 8) {
        out[l.id] ??= {};
        out[l.id][lang] = title;
        got++;
        process.stdout.write('.');
      } else process.stdout.write('?');
    } catch { process.stdout.write('!'); }
  }
  console.log(` -> +${got}`);
}

await writeFile('src/listing-i18n.json', JSON.stringify(out, null, 1));

for (const lang of ['ru', 'pl']) {
  const have = LISTINGS.filter((l) => out[l.id]?.[lang]);
  const miss = LISTINGS.filter((l) => !out[l.id]?.[lang]);
  console.log(`\n${lang}: ${have.length}/${LISTINGS.length} titles total`);
  if (miss.length) console.log(`   still English (their site has no ${lang} title): ${miss.map((l) => l.id).join(', ')}`);
}
console.log('\nwrote src/listing-i18n.json');
const sample = Object.entries(out).slice(0, 3);
for (const [id, v] of sample) {
  console.log(`\n  ${id}`);
  console.log(`    ru: ${(v.ru || '(none)').slice(0, 78)}`);
  console.log(`    pl: ${(v.pl || '(none)').slice(0, 78)}`);
}
