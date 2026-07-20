/**
 * Turkish spell-check verification.
 *
 * Runs every shipped Turkish string through the Hunspell tr_TR dictionary
 * (via nspell) and flags: (1) any non-Latin character leaking into Turkish
 * text (Cyrillic/Greek — i.e. mojibake or a mixed-script typo), and (2) words
 * the dictionary does not recognise. Turkish is agglutinative and Hunspell's
 * coverage of inflected forms is imperfect, so (2) is a REVIEW list, not a
 * verdict — but it reliably surfaces real misspellings and wrong-letter errors.
 */
import nspell from 'nspell';
import trDict from 'dictionary-tr';
import { readFileSync } from 'node:fs';

const spell = nspell(trDict.aff ? trDict : { aff: trDict[0], dic: trDict[1] });

// Proper nouns, brands, tech terms, and the reviewer first-names — not words.
const ALLOW = new Set([
  'ataberk', 'alanya', 'antalya', 'mersin', 'mahmutlar', 'oba', 'kestel', 'tosmur',
  'kargıcak', 'demirtaş', 'avsallar', 'payallar', 'konaklı', 'cikcilli', 'kleopatra',
  'istanbul', 'i̇stanbul', 'bodrum', 'fethiye', 'izmir', 'i̇zmir', 'çeşme', 'kıbrıs',
  'whatsapp', 'telegram', 'instagram', 'yandex', 'maps', 'tapu', 'kaya', 'viber', 'skype',
  'facebook', 'youtube', 'tiktok', 'eur', 'usd', 'gbp', 'try', 'rub', 'pln', 'sek', 'nok',
  'natalya', 'natalia', 'ramil', 'svetlana', 'yana', 'irina', 'marco', 'anna', 'aleksandr',
  'olga', 'timur', 'vitaliy', 'ekaterina', 'lily', 'olya',
  // Proper nouns / brand / loanwords the Hunspell base dic lacks.
  'akdeniz', 'akdenizi', 'estate', 'konyaaltı', 'barbarossa', 'tece', 'muratpaşa', 'ermenek',
  'kardeşkentler', 'zamanoğlu', 'dinek', 'blog', 'demo', 'premium', 'full', 'örn', 'konsiyerj',
  // Valid Turkish words/inflections missing from the base dic (verified by hand).
  'içeriğe', 'ikinci', 'iletişim', 'ilk', 'inşaat', 'istiyorum', 'işlem', 'işte', 'e-posta',
  'lisanslıyız', 'belgelendiririz', 'imkânı', 'imkânlı', 'isıtmalı', 'dükkân', 'dükkânlar',
]);

const tr = JSON.parse(readFileSync('src/tr.json', 'utf8'));
const li = JSON.parse(readFileSync('src/listing-i18n.json', 'utf8'));
const strings = { ...tr };
for (const [id, v] of Object.entries(li)) if (v.tr) strings[`listing.${id}`] = v.tr;

const NONLATIN = /[Ѐ-ӿͰ-Ͽ]/;      // Cyrillic / Greek
const strip = (w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

const badChars = [];
const unknown = new Map();

for (const [key, s] of Object.entries(strings)) {
  if (NONLATIN.test(s)) badChars.push([key, s]);
  for (let tok of s.split(/[\s,.;:!?()"“”«»/[\]…·–—]+/)) {
    tok = strip(tok);
    if (!tok || /[\d{}€₺£$₽]/.test(tok)) continue;      // skip numbers / placeholders / currency
    let root = tok;
    if (tok.includes("'")) root = tok.slice(0, tok.indexOf("'"));
    const low = tok.toLowerCase(), rootLow = root.toLowerCase();
    if (ALLOW.has(low) || ALLOW.has(rootLow)) continue;
    if (spell.correct(tok) || spell.correct(root)) continue;
    if (!unknown.has(tok)) unknown.set(tok, new Set());
    unknown.get(tok).add(key);
  }
}

console.log('=== NON-LATIN characters in Turkish (real errors) ===');
console.log(badChars.length ? badChars.map(([k, s]) => `  ${k}: ${s}`).join('\n') : '  (none)');

console.log('\n=== words tr_TR Hunspell does not recognise (review) ===');
const sorted = [...unknown.entries()].sort((a, b) => a[0].localeCompare(b[0], 'tr'));
for (const [w, keys] of sorted) console.log(`  ${w}  [${[...keys].slice(0, 2).join(', ')}]`);
console.log(`\ntotal: ${sorted.length} distinct unknown tokens, ${badChars.length} non-Latin strings`);
