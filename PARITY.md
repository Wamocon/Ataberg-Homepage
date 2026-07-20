# Content parity audit — original homepage vs. our rebuild

**Date:** 17 July 2026
**Method:** direct extraction from `raw/home.html` (the live page, 307,409 bytes, fetched 16 July 2026), compared against the built `dist/index.html`.
**Verdict:** **at parity on content, ahead on everything else.** The remaining gaps are listed and are deliberate.

The first version of this rebuild was built from an audit *summary* rather than a line-by-line diff, and shipped about a third of the page. This document is the diff, and the record of closing it.

---

## Headline numbers

| | Original | Rebuild (first cut) | Rebuild (now) |
|---|---|---|---|
| **Listing tabs** | 5 | 1 | **5** ✅ |
| **Unique listings** | **32** | 8 | **32** ✅ |
| **Listing photos harvested** | 154 | 154 (51 were 404 pages) | **154 verified** ✅ |
| **Footer links (unique)** | **202** | 2 | **149** ⚠️ |
| **Languages** | 3 (separate domains) | 1 | **3, in-page** ✅ |
| **Search fields** | ~10 + 40 amenities + infrastructure | 4 | **8 selects + 56 checkboxes** ✅ |
| **Major sections** | 11 | 6 | **11** ✅ |

### A correction to an earlier claim

An earlier version of this document claimed "Languages: 3 ✅" when the language
selector **only navigated to ataberkestate.com / .pl** — i.e. a link to someone
else's page, not a multilingual site. `<html lang="en">` was hardcoded and not a
single string was translated. That was an overclaim; it is now actually true:

- **~170 UI strings** across EN/RU/PL, including the full filter vocabulary
  (40 amenities, infrastructure, stage, seller, distance-to-sea).
- **Listing titles come from Ataberk's own RU/PL sites**, not machine
  translation — **32/32 in Russian, 24/32 in Polish**. The other 8 fall back to
  English because their Polish site genuinely does not carry those listings.
  An English title is honest; a machine-translated one would not be.
- **The assistant answers in the visitor's language**, including its
  below-the-floor refusal (which never reaches the model, so it is written in
  all three languages server-side).
- `<html lang>` updates, and the choice persists.
- Verified: **8 widths × 3 languages = 24 layouts, all clean.**

---

## Section-by-section

| # | Section | Original | Rebuild | Status |
|---|---|---|---|---|
| 1 | Header + logo | ✓ | ✓ | ✅ logo redrawn, palette consolidated to 4 tokens |
| 2 | Language selector EN/RU/PL | ✓ | ✓ | ✅ + **real hreflang**, which the live site lacks |
| 3 | Currency | EUR only | **8 currencies** | ✅ **exceeds** |
| 4 | Deep search / filter | ~10 fields, ~40 amenities, infrastructure, "More filters", "Reset filter" | 8 selects, 56 checkboxes, disclosure, reset | ✅ + **live match count** against the real 32 |
| 5 | "Look at map" | ✓ | ✓ link | ⚠️ links out; no embedded map |
| 6 | Favourites | ✓ | ✓ | ✅ persists in localStorage |
| 7 | Listing tabs × 5 | 40 slots / 32 unique | 40 slots / 32 unique | ✅ **exact**, membership preserved |
| 8 | "Why is it profitable…" (4) | ✓ | ✓ | ✅ English corrected |
| 9 | "Benefits of cooperation…" (6) | ✓ | ✓ | ✅ English corrected |
| 10 | "…most reliable currency deposit" prose | ✓ | ✓ | ✅ English corrected |
| 11 | Newsletter | ✓ | ✓ | ✅ validates; admits it is not wired |
| 12 | Reviews (2, one video) | ✓ | ✓ | ✅ incl. video link |
| 13 | Articles: News / Blog / Useful info | ✓ | ✓ | ✅ 3 tabs, 9 articles |
| 14 | Contact block | ✓ | ✓ | ✅ |
| 15 | Footer | 202 links | 149 links | ⚠️ see below |
| 16 | DMCA badge | ✓ | ✓ | ✅ |
| 17 | Database counter | "212342" | 30,000 | ⚠️ deliberate — see below |
| 18 | Grounded assistant | ✗ | ✓ | ✅ **new** |

---

## The 32 listings — all present

Tab membership is reproduced exactly as published:

| Tab | IDs |
|---|---|
| Exclusive offers | 12506 · 8237 · 9159 · 12505 · 12504 · 12503 · 12502 · 8611 |
| Top offers | 8237 · 6515 · 12153 · 11777 · 6068 · 9411 · 5260 · 9303 |
| New offers | 12136 · 8386 · 12082 · 6012 · 11766 · 10173 · 6634 · 11405 |
| Hot offers | 8237 · 12502 · 12497 · 12483 · 12480 · 12479 · 12478 · 12472 |
| From owners | 8237 · 12504 · 12503 · 12502 · 12500 · 12499 · 12497 · 12263 |

`8237` sits in **four of five** tabs on the live site — 40 slots, 32 unique properties. Reproduced, not "corrected".

Price range **€50,500 – €467,500**. Districts: Mahmutlar, Demirtaş, Avsallar, Oba, Kestel, Kargıcak, Tosmur, Payallar, Gazipaşa, Alanya centre, plus Tece (Mersin) and Altıntaş / Konyaaltı (Antalya).

---

## Deliberate departures (choices, not gaps)

1. **"212,342 objects" → 30,000.** The live homepage says 212,342; their own About page says 30,000 — a **7× self-contradiction**. 212,342 is implausible for an Alanya agency and reads as a raw database row count.
2. **"17 years of experience" → 21 years.** 2005→2026 is 21. Their copy was written ~2022 and never updated.
3. **Machine-translated copy rewritten.** e.g. *"we do not leave our clients after the sale of a property in Turkey **to him**"*. Meaning and claims preserved, English corrected.
4. **District spellings normalised.** The live site spells Demirtaş four ways (Dermirtash / Demirtas / Demirtash / Dermitas), Tosmur two, and renders Tece as "Teje".
5. **Listing 12082's Russian title translated.** It is Russian on the live *English* page.
6. **`Еxclusive offers` → `Exclusive offers`.** The original's first letter is a **Cyrillic Ye (U+0415)**.
7. **Skype and Yandex Zen dropped.** Skype was discontinued May 2025; `zen.yandex.ru` has been dead since 2022. Keeping dead channels is not parity, it is decay.
8. **Self-referencing canonical + real hreflang.** Verified in the source: the live page carries `rel="canonical" → ataberkestate.com` and has **no `rel="alternate"` hreflang at all** (its `hreflang=` hits are attributes on `<a>` tags, which have no SEO effect).
9. **Listing 12478's location kept as published.** Its location field says Konyaaltı, its title says Hurma. Hurma is a neighbourhood of Konyaaltı, so both are kept rather than silently picking one.

---

## Remaining gaps, honestly

1. **Footer: 149 of 202 unique links.** The 53 short are mostly duplicate paths and dead ends in the live tree — including `/furniture-,` (malformed) and a second "Sell your property" pointing at `/furniture-`. We ship every district, type, price band, intent link and district×type combination. It is not literally 202, and I am not going to pad it with broken links to claim a number.
2. **Map is a link, not an embedded map.** No competitor in Alanya has real map search except IdealEstates (Mapbox). This is the biggest remaining product opportunity — see ANALYSIS.md §6.
3. **10 of 32 covers are 420px.** Their Drupal originals 404 on their own server, so we fall back to the site's own derivative. Slightly soft on retina; the source material is simply gone.
4. **Listing 11777 has no area.** Not published on the live site either.
5. **Team, certificates and vacancies are footer links, not homepage sections.** They are not on the live homepage either.

---

## Bugs this exercise caught

Recorded because they were all real, and all found by measuring rather than assuming:

1. **The assistant gave a wrong price.** It said the cheapest property was €59,000. The real answer is **€50,500** (ref 12136). Cause: the knowledge base held 8 of 32 listings, so it answered confidently and cited a source. Fixed by generating the KB from the full catalogue — facts are now derived, never hand-typed.
2. **51 of 154 "harvested" photos were 404 HTML pages** wearing a `.jpg` extension, plus 5 HEIC files. Cause: the harvester checked HTTP status codes and kept the body regardless. Fixed by validating the bytes with `sharp`.
3. **The scroll hint swallowed clicks.** A full-width strip over the hero with no `pointer-events: none` — it would have blocked real users from using the search form. Caught by Playwright.
4. **Client-injected markup cost 0.5088 CLS on mobile.** Tabs, cards, articles and the footer landed after first paint. Fixed by prerendering at build time — which also means **the page now works with JavaScript disabled**.
5. **Cards showed the wrong tag.** "From owners" cards were labelled "Exclusive" because the tag used the listing's first tab membership rather than the active tab.
6. **51 covers encoded to zero files.** The encoder skipped any width above the source, and those sources are 420px. The "encoded 32/32" counter was measuring the wrong thing.
7. **`[hidden]` did nothing.** `.quick__more { display: flex }` outranks the UA's `[hidden] { display: none }` — class beats attribute — so the 56-checkbox filter panel shipped **permanently open**. Nobody would have called it a CSS specificity bug; it just looked like a design decision.
8. **The mobile layout was losing to the desktop one.** The `@media (max-width: 560px)` block sat *earlier* in the stylesheet than the `.ai-fab` rules it was meant to override. Equal specificity, later rule wins — so the assistant button kept its full label on a phone and covered the match count. Cascade *order*, not specificity.
9. **The header overlapped the hero copy in Russian.** The hero centred its copy in 100svh with no allowance for the fixed header. Fine in English; in Russian the eyebrow wraps to two lines and rides up into the logo. **My layout audit did not catch this** — it exempted `.hdr` as "deliberately layered" and its leaf scan ignored `<select>` and `<svg>`. A screenshot caught it. The audit now includes all three.
10. **Headings did not translate.** `splitLines()` replaces a heading's text node with masked line wrappers, so the language swap had nothing to write into and headings silently stayed English.
11. **Split headings mangled their own text.** Each line became a block span with no separator, so `textContent` read *"Turcji się"* + *"opłaca"* as **"sięopłaca"**. Invisible on screen — the lines are stacked — but that is what a screen reader announces and what a copy-paste produces. Present in English too, at any width where a heading wraps.

---

## Final measurements

Measured on the built site, after all three languages and the layout fixes.

| Metric | Desktop | Mobile (4× CPU, Fast 3G) | Budget |
|---|---|---|---|
| **LCP** | **104 ms** | **1,216 ms** | ≤ 2,500 — pass |
| **CLS** | **0.0054** | **0.0107** | ≤ 0.1 — pass |
| **Requests** | 15 | 7 | ≤ 50 — pass |
| **JS (gzip)** | **75.6 KB** | — | ≤ 170 — pass |
| **CSS (gzip)** | **6.2 KB** | — | ≤ 80 — pass |
| **HTML (gzip)** | **13.4 KB** | — | vs live site's 43.9 KB |
| **Layout** | **8 widths × 3 languages = 24/24 clean** | | no overflow, clipping, overlap, or sub-24px tap targets |
| **Works without JS** | ✅ 8 cards, 5 tabs, 3 articles, 153 links, 56 filters | | |
| **External requests** | **none** | **none** | offline (assistant excepted) |

JS grew from 58 KB to 75.6 KB gzip when the three-language table landed — a fair
price for ~170 translated strings plus the filter vocabulary, and still less than
half the budget. For comparison, the live site ships **~310 KB of CSS and 300 KB
of HTML over HTTP/1.1** before a single photograph.
