/**
 * Annotate index.html with data-i18n keys.
 *
 * The page is hand-written HTML with real prose in it, so rather than move every
 * sentence into a JS template, we tag each translatable node with the key that
 * owns it. English stays in the markup as the source of truth (and as the no-JS
 * fallback); the client swaps textContent on language change.
 *
 * Run once. It is idempotent: strings already carrying data-i18n are skipped.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { T } from '../src/i18n.js';

let html = await readFile('index.html', 'utf8');

/** [key, the exact English text in index.html] */
const MAP = [
  ['nav.skip', 'Skip to content'],
  ['nav.properties', 'Properties'],
  ['nav.why', 'Why Turkey'],
  ['nav.about', 'About us'],
  ['nav.reviews', 'Reviews'],
  ['nav.contact', 'Contact'],
  ['nav.getInTouch', 'Get in touch'],
  ['hero.h1', 'Property in Turkey'],
  ['listings.h2', 'Our offers'],
  ['listings.all', 'View all properties'],
  ['why.h2', 'Why buying in Turkey pays'],
  ['why.1.h', 'A sound investment'],
  ['why.2.h', 'Every price bracket'],
  ['why.3.h', 'Payment on your terms'],
  ['why.4.h', 'Residence for your family'],
  ['why.ctaBtn', 'Order a consultation'],
  ['trust.h2', 'Working with Ataberk'],
  ['trust.1.h', 'A real choice'],
  ['trust.2.h', 'The whole service'],
  ['trust.3.h', 'Handled personally'],
  ['trust.4.h', 'We stay after the sale'],
  ['trust.5.h', 'A secure transaction'],
  ['trust.6.h', 'Talk to us in your language'],
  ['stat.years', 'years in Alanya'],
  ['stat.sales', 'completed sales'],
  ['stat.people', 'people on the estate team'],
  ['stat.objects', 'properties on our books'],
  ['prose.h2', 'Property in Turkey — somewhere solid to put your money'],
  ['reviews.h2', 'What buyers say'],
  ['reviews.video', 'Video review'],
  ['reviews.all', 'Read all testimonials'],
  ['articles.h2', 'News and guidance'],
  ['news.h2', 'Subscribe for news'],
  ['news.go', 'Subscribe'],
  ['contact.h2', 'Talk to a person'],
  ['contact.name', 'Your name'],
  ['contact.phone', 'Phone'],
  ['contact.email', 'Email'],
  ['contact.msg', 'What are you looking for?'],
  ['contact.go', 'Request a call'],
  ['contact.office', 'Alanya office'],
  ['ai.open', 'Ask about Alanya'],
  ['ai.title', 'Ataberk Assistant'],
];

let done = 0;
const missed = [];

for (const [key, text] of MAP) {
  if (!T[key]) { missed.push(`${key} (no translation row)`); continue; }
  // Match a tag whose entire text content is `text`, and that isn't tagged yet.
  const re = new RegExp(`(<([a-z0-9]+)(?![^>]*data-i18n)([^>]*)>)(\\s*)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*)(</\\2>)`, 'i');
  if (!re.test(html)) { missed.push(`${key} — "${text.slice(0, 40)}" not found`); continue; }
  html = html.replace(re, (_m, open, tag, attrs, s1, s2, close) =>
    `<${tag}${attrs} data-i18n="${key}">${s1}${text}${s2}${close}`);
  done++;
}

// Longer prose blocks sit inside <p data-fade> — tag by their opening words.
const PROSE = [
  ['hero.eyebrow', 'Alanya · Antalya · Mersin — since 2005'],
  ['hero.lede', 'Twenty-one years selling the Turkish Mediterranean'],
  ['listings.sub', 'Everything on this page is a real property'],
  ['why.sub', 'Still deciding? Four reasons'],
  ['why.1.p', 'The climate, the coastline, the build quality'],
  ['why.2.p', 'From a modest studio or a well-priced resale'],
  ['why.3.p', 'Instalments and bank credit on workable terms'],
  ['why.4.p', 'Owning a home entitles you and your immediate family'],
  ['trust.sub', 'A family business, licensed and registered'],
  ['trust.1.p', 'A large database of Turkish property'],
  ['trust.2.p', 'Full legal support for the transaction'],
  ['trust.3.p', 'Our managers work with each client individually'],
  ['trust.4.p', 'Questions do not stop when the deal closes'],
  ['trust.5.p', 'Ataberk Estate is entered in the Turkish company register'],
  ['trust.6.p', 'Our team works in English, Russian, Polish and Turkish'],
  ['prose.p1', 'Ataberk Estate offers a full professional service'],
  ['prose.p2', 'The agency has long experience working with Turkish developers'],
  ['reviews.sub', 'Two of the reviews carried on the live site'],
  ['reviews.q1', 'We looked at a lot of agencies'],
  ['reviews.a1', 'Germany · bought in Mahmutlar'],
  ['reviews.q2', 'The manager did far more than sell me a flat'],
  ['reviews.a2', 'Russia · bought in Alanya'],
  ['articles.sub', 'What is changing in Turkish property'],
  ['news.sub', 'New listings and what is actually happening'],
  ['contact.sub', 'Not a form that disappears'],
];

for (const [key, starts] of PROSE) {
  if (!T[key]) { missed.push(`${key} (no translation row)`); continue; }
  const i = html.indexOf(starts);
  if (i === -1) { missed.push(`${key} — prose "${starts.slice(0, 34)}" not found`); continue; }
  // walk back to the opening tag of the node holding this text
  const open = html.lastIndexOf('<', i);
  const tagEnd = html.indexOf('>', open);
  if (open === -1 || tagEnd === -1 || html.slice(open, tagEnd).includes('data-i18n')) continue;
  html = html.slice(0, tagEnd) + ` data-i18n="${key}"` + html.slice(tagEnd);
  done++;
}

await writeFile('index.html', html);
console.log(`tagged ${done} nodes`);
if (missed.length) {
  console.log(`\nnot tagged (${missed.length}):`);
  for (const m of missed) console.log('  ' + m);
}
