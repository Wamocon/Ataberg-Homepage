/**
 * Build ONE self-hosted Inter subset that covers every character the site can
 * display, so NO glyph ever falls through to the Arial metrics fallback.
 *
 * "Think differently": instead of stitching Google's latin / latin-ext /
 * cyrillic subsets together with unicode-range (where a boundary gap drops
 * Turkish ğ/ş/İ or Russian Cyrillic to Arial), we subset the full Inter variable
 * font down to the exact character set used across all four languages plus the
 * full alphabets (for future copy) and ship it as a single woff2 with no range.
 */
import subsetFont from 'subset-font';
import { readFileSync, writeFileSync } from 'node:fs';

const chars = new Set();
const add = (s) => { for (const ch of String(s)) chars.add(ch); }
const range = (a, b) => { for (let c = a; c <= b; c++) chars.add(String.fromCodePoint(c)); }

// 1) Every character that appears in the source files that hold shipped copy —
//    all language values are literal in these files, so reading them as raw text
//    captures every Turkish/Polish/Russian glyph actually used. (Over-inclusive
//    of ASCII code punctuation, which we ship anyway.)
for (const f of ['src/i18n.js', 'src/tr.json', 'src/listing-i18n.json', 'src/article-i18n.json', 'src/listings.js', 'src/footer.js', 'index.html', 'src/render.js']) {
  add(readFileSync(f, 'utf8'));
}

// 2) Full alphabets + digits + punctuation, so future copy is covered too.
range(0x20, 0x7e);   // ASCII
range(0xa0, 0xff);   // Latin-1 (ç ö ü ß £ ° · ...)
range(0x100, 0x17f); // Latin Extended-A (ğ Ğ ş Ş İ ı Ł ł Ą ą Ę ę Ć ć Ń ń Ś ś Ż ż Ź ź ...)
range(0x400, 0x45f); // Cyrillic (Russian)
add('ĞğİıŞşÇçÖöÜü');                 // Turkish, explicit
add('ĄąĆćĘꟳŁłŃńÓóŚśŹźŻż');            // Polish, explicit
add('ЁёҐґ№');                          // Cyrillic extras
add('·–—…“”‘’«»→←↑↓™€₺₽₴£$₣°²');       // punctuation / arrows / currency used in UI

const text = [...chars].join('');
const full = readFileSync('raw/InterVariable.woff2');
// Pin the weight axis to the 400-800 range the site actually uses (body 400 ..
// headings 800). Trimming the variable deltas outside that range roughly halves
// the file (114 KB -> ~64 KB) so it can be preloaded without hurting LCP.
const out = await subsetFont(full, text, { targetFormat: 'woff2', variationAxes: { wght: { min: 400, max: 800 } } });
writeFileSync('public/fonts/inter.woff2', out);
console.log(`subset ${chars.size} chars, wght 400-800 -> public/fonts/inter.woff2 (${(out.length / 1024).toFixed(0)} KB)`);
