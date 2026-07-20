# Ataberk Estate — Homepage Rebuild: Situation Analysis

**Date:** 16 July 2026
**Subject site:** https://www.ataberkhomes.com/ (English mirror of ataberkestate.com)
**Purpose:** Establish the baseline, the competitive field, and the 2026 success criteria before any build work begins.

---

## 0. Evidence quality — read this first

Findings are labelled:

- **[V] Verified** — observed directly in raw HTML, HTTP headers, or CSS, or stated on a primary source (caniuse, web.dev, HTTP Archive, Chromium changelogs).
- **[I] Inference** — my reasoning from verified facts.
- **[GAP]** — not established. Research on this point was cut short when the session hit its usage limit. **Not filled with guesses.**

The most important **[GAP]**: I have **no verified conversion-rate benchmarks** for real-estate lead generation in 2026, and **no verified research on which AI features actually convert** versus which are theatre. Section 3's business criteria are therefore reasoned from the audit and competitor evidence, not from cited industry benchmarks. Section 4 (technical criteria) *is* fully sourced. **Do not present Section 3's business numbers to a client as researched benchmarks.** They need a second research pass.

---

## 1. What Ataberk actually is

A family-run Alanya agency (Fatih Kabakçı, CEO; Aleksandra Kabakçı, Executive Director), trading since 2005, ~80 staff in the real-estate division across Alanya, Antalya, and Mersin offices, plus an Ataberk Yacht division. Russian-first business targeting Russia, Ukraine, Kazakhstan, Iran, Germany, and Turkey. **[V]**

Critically, **ataberkhomes.com is not the main site.** It is the English mirror of a three-domain estate: **[V]**

| Domain | Language | Role |
|---|---|---|
| `ataberkestate.com` | Russian | **Primary / canonical** |
| `ataberkhomes.com` | English | Mirror — the audit subject |
| `ataberkestate.pl` | Polish | Mirror |

The backend is **Drupal 11 with a custom `kibmak2` theme** — genuinely the most modern CMS in the competitive set. **[V]** The problem is not the platform. It is the front end, the content hygiene, and the SEO configuration.

---

## 2. The baseline: what is actually broken

### 2.1 P0 — actively costing money right now

| # | Finding | Evidence |
|---|---|---|
| 1 | **The English homepage de-indexes itself.** `<link rel="canonical" href="https://www.ataberkestate.com/">` — it tells Google "I am not the original." `og:url`/`og:image` also point away. | **[V]** |
| 2 | **No hreflang anywhere.** Three language domains with zero `rel="alternate"` linking them — EN/RU/PL cannibalise each other. | **[V]** |
| 3 | **`sitemap.xml` on ataberkhomes.com lists ataberkestate.com URLs.** `robots.txt` is stock Drupal with **no `Sitemap:` directive**. | **[V]** |
| 4 | **Schema.org is expired, wrong-typed, and in Russian.** Homepage carries `SaleEvent` entities (wrong type for listings) hardcoded `startDate: 2022-01-01` / `endDate: 2022-12-31` — **expired 3.5 years ago** — with Russian names (`"☀️ Без комиссий"`) on the English page, pointing at a dead theme path (`themes/kibmak/`). No `Organization`, `LocalBusiness`, `BreadcrumbList`, or `WebSite`/SearchAction schema at all. | **[V]** |
| 5 | **NAP inconsistency.** Schema declares `+90 544 657 88 72`; the site displays `+90 (549) 557 7 557`. Two different numbers — direct damage to local SEO. | **[V]** |
| 6 | **Database size contradicts itself 7×.** Homepage: "in our database **212342 objects**". About page: "**30 thousand** objects". 212,342 is implausible for an Alanya agency and reads as a raw DB row count. | **[V]** |

Item 1 alone is likely the single highest-ROI fix in the entire project, and it is a one-line change.

Note the bug is **homepage/section-level only** — property detail pages set their canonical correctly. **[V]**

### 2.2 P1 — brand and persona damage

- **Untranslated Russian throughout the English UI** **[V]**: filter defaults (`Выбрать`), amenities (`Cоляная комната`), sort options (`по цене Asc`), review-form fields (`Откуда вы?`, `Сообщение`), city names (`Аланья`, `Анталья`), and **one entire listing title** — ID 12082 is fully Russian.
- **Machine-translated body copy** **[V]**: *"we do not leave our clients after the sale of a property in Turkey **to him**"*. *"the most reliable currency deposit"* (calque of *валютный вклад*). And, on the **English** page: **"We speak Russian."**
- **Cyrillic homoglyph** in a headline tab: `Еxclusive offers` uses U+0415 (Cyrillic Ye), not Latin E. **[V]**
- **Stale claims** **[V]**: "17 years of experience" — 2005→2026 is **21 years**; the copy was written ~2022 and never updated. Footer says © 2005-2026.
- **Transliteration chaos** **[V]**: Tosmoor/Tosmur; **Dermirtash / Demirtas / Demirtash / Dermitas** — one district, four spellings.
- **Dead channels** **[V]**: Yandex Zen (`zen.yandex.ru` defunct since 2022), Skype (discontinued May 2025) — and *contradictory Skype handles* across pages. Two Instagram accounts presented inconsistently.
- **Stale social proof** **[V]**: newest homepage testimonial is Nov 2023; the second is **Feb 2020** and credits **a manager no longer on the team page**. "News" leads with 2023, then **2018**, then **2015**.
- **Fake curation** **[V]**: listing ID 8237 appears in **four of the five** homepage tabs.
- **Team photos use a `294x29` image preset** — a 10:1 letterbox that mangles every portrait. **[V]**

### 2.3 P2 — technical

| Metric | Value | Note |
|---|---|---|
| HTML (uncompressed) | **300 KB** | gzip → 43.9 KB (good 86% ratio) |
| CSS (4 files) | **310 KB** | |
| `<img>` tags | **207** | lazy-loaded via `data-lazy`/`data-src` |
| logo.svg | **21 KB** | for a 140×28 mark |
| OG image | **315 KB** | for a social card |
| TTFB | **0.136 s** | **excellent** — Cloudflare + Drupal page cache |
| Protocol | **HTTP/1.1** | despite `alt-svc: h3` being advertised |

**[V] all rows.** The server is fine. **~610 KB of HTML+CSS lands before a single photograph, over HTTP/1.1.**

Also: only **one `<h1>`** on the whole homepage ("Property in Turkey") — no semantic heading structure. **Five near-duplicate blues** (`#145c9a`, `#275ea7`, `#285694`, `#175178`, `#2E7EC4`) and two yellows, plus Bootstrap's `#428bca` leaking through. **Three icon systems** loaded (icomoon + Font Awesome 5 Free + FA5 Brands). No CSP, HSTS, Referrer-Policy, or Permissions-Policy. Emails and all forms **require JS to render at all**. **[V]**

### 2.4 Brand assets (for the rebuild)

- **Logo:** `/themes/custom/kibmak2/images/logo.svg`, `viewBox="0 0 140 28"`, blue mark `#2E7EC4` + **white** wordmark on transparent — **will vanish on a light background**. **[V]**
- **Recommended palette consolidation** **[I]**: navy `#20295a`, primary blue `#145c9a`, accent gold `#fecf3d`, logo blue `#2E7EC4`.
- **Fonts:** Open Sans (primary), Roboto/Tahoma (secondary). **[V]**
- **Image scraping notes** **[V]**: read `data-lazy`/`data-src`, **not** `src` (which yields `dummy12x8.gif`); **preserve the `?itok=` token** or Drupal image-style URLs return 404. Presets: `420x280` (cards), `323x185` (articles), `546x346` (video), `430_370` (certificates).

---

## 3. Success criteria — business/functional, by segment

⚠️ **[GAP] — see Section 0.** These criteria are reasoned from the audit and competitor evidence. The **numeric targets are not cited benchmarks** and need a verification pass before client presentation.

### 3.1 Cross-segment table-stakes for 2026

| Criterion | Ataberk today | Field (Alanya) |
|---|---|---|
| Map-based search | ❌ none **[V]** | Only IdealEstates (Mapbox) **[V]** |
| Currency switching | ❌ **EUR-only** **[V]** | Tolerance **15**, Tekce **12**, RestProperty **8** **[V]** |
| Saved searches / alerts | ❌ | ❌ market-wide **[V]** |
| Compare tool | ❌ favorites only | RestProperty far deeper **[V]** |
| 360°/3D tours | ❌ | ❌ **market-wide** **[V]** |
| Natural-language AI search | ❌ | **RestProperty only** **[V]** |
| Behavioural analytics | ❌ | Tolerance runs Hotjar **[V]** |
| Nordic languages | ❌ (EN/RU/PL) | TERRA has da/fi/no/sv **[V]** |

### 3.2 By segment

| Segment | Table-stakes | Differentiating |
|---|---|---|
| **Construction / developer (off-plan)** | Delivery date, construction-stage %, payment/instalment schedule, developer identity, floor plans, site plan | Live construction progress feed, interactive site plan, unit-level availability, 3D unit walkthrough, instalment calculator |
| **Rental** | Availability calendar, term (short/long), deposit + fees, furnishing status, utilities | Instant booking, yield calculator, property-management upsell |
| **Sales / resale** | Price history, m² price, distance-to-sea, legal status (TAPU), citizenship eligibility, resale-vs-developer flag | AI valuation, comparables, verified-owner badge, remote purchase |

Ataberk's **filter depth is already competitive** — 40+ amenities, distance-to-sea, citizenship-eligible — matching RestProperty and beating Tekce and TERRA. **[V]** This is an existing strength worth surfacing, not rebuilding.

---

## 4. Success criteria — technical (fully sourced)

### 4.1 Core Web Vitals — unchanged in 2026

| Metric | Good | Poor |
|---|---|---|
| **LCP** | ≤ 2.5 s | > 4.0 s |
| **INP** | ≤ 200 ms | > 500 ms |
| **CLS** | ≤ 0.1 | > 0.25 |

**[V]** — https://web.dev/articles/vitals. Assessed at the **75th percentile** over a **28-day rolling CrUX window**. Thresholds are **identical for mobile and desktop**; segmentation applies to reporting, not to the thresholds.

⚠️ **Misinformation warning.** A cluster of SEO blogs ranking for "Core Web Vitals 2026" claims Google **lowered the LCP threshold to 2.0 s** and **tightened INP scoring**. Both are **false** — web.dev still states 2.5 s/4.0 s, and Chromium's LCP changelog records no threshold change. **[V]** The genuine 2026 developments are measurement infrastructure only: soft navigations shipping unflagged in **Chrome 151 (July 2026)**, `paintTime` exposure in **Chrome 145**, and LCP/INP reaching Baseline in **Dec 2025**. **[V]**

**Real-world pass rates** **[V]**: CrUX June 2026 — **55.3%** of origins pass all three (down 1.2 pts; two consecutive monthly declines). Web Almanac 2025 — **48% mobile / 56% desktop**; good LCP **62% mobile**, good INP **77% mobile**, good CLS **81% mobile**. **LCP is the hardest metric to pass on mobile** — which is exactly the metric a heavy hero costs you.

### 4.2 Page-weight budget

Web Almanac 2025 medians (**transferred/compressed** bytes) **[V]**:

| Resource | Desktop median | **Our target** |
|---|---|---|
| Total page | 2,412 KB | **≤ 1,000 KB** |
| Images | 1,058 KB | **≤ 500 KB** |
| JavaScript | 697 KB | **≤ 170 KB** |
| Fonts | 139 KB | **≤ 100 KB**, ≤2 families |
| CSS | 82 KB | **≤ 80 KB** |
| Requests | 77 | **≤ 50** |

Targets are **[I]** — set at roughly p10–p25 of the Almanac distribution (p10 = 607 KB, p25 = 1,275 KB). The 170 KB JS figure is web.dev's published critical-path budget **[V]**, though its supporting model (TTI, Moto G4/3G) is now stale.

**Ataberk today: 310 KB CSS alone — ~4× our whole CSS target, and its 300 KB HTML is 13× the 22 KB median.** **[V]**

### 4.3 Images

| Format | Global support | Note |
|---|---|---|
| **AVIF** | **93.42%** | Chrome 85+, Firefox 93+, **Edge 121+**, Safari 16.4+ / iOS 16.0+ |
| **WebP** | **96.15%** | Chrome 32+, Firefox 65+, Edge 18+, Safari 16+ (practically 14 on Big Sur+) |

**[V]** — caniuse.com. Savings: WebP **25–34%** vs JPEG (Google study, SSIM-matched); AVIF **~50%** vs JPEG average, **~35–40%** vs WebP (imgix/Cloudinary). **[V]**

**Ship `<picture>`: AVIF → WebP → JPEG.** The fallback chain is mandatory, not optional. **Encode ahead of time, never on-the-fly** — AVIF costs **up to 50× more CPU than JPEG** (Cloudinary), and avifenc runs **405 ms** (libaom) to **1,325 ms** (SVT-AV1) per image **[V]**. AVIF pays off on hero and listing photos but **loses on thumbnails under ~5,000 px**, where HEIF's ~300-byte header eats the gain **[V]**.

Reality check on adoption **[V]**: AVIF is **0.7%** of LCP images vs WebP's **11%** (Web Almanac 2025). AVIF is the fastest-growing format in relative terms (+386% 2022→2024) and still a rounding error in absolute terms. **WebP is the volume format; AVIF is the incremental win on large images.**

### 4.4 Hero video — if we use one

**`<video>` has been a valid LCP element since Chrome 116 (~22 Aug 2023)** **[V]** — Chromium metrics changelog. The timestamp rule, verbatim from web.dev: *"the poster image load time or first frame presentation time for videos is used—**whichever is earlier**"* **[V]**. In practice the poster is always earlier, so **adding a poster makes the poster the LCP timestamp** — measured **1.55 s → 1.23 s**, and **→ 1.20 s** with `fetchpriority="high"` on the poster (DebugBear) **[V]**.

**Codec ladder — two files, AV1/WebM then H.264/MP4:**

```html
<video autoplay muted loop playsinline poster="hero-poster.avif" preload="none">
  <source src="hero.webm" type="video/webm; codecs=av01.0.05M.08">
  <source src="hero.mp4"  type="video/mp4;  codecs=avc1.4D401F">
</video>
```

- **H.264 is the only true floor**: **96.9% support with a 0% partial column** **[V]**. No hardware gate, no ambiguity.
- **AV1**: 93.03% headline, but **13.6% of that is Safari's hardware-decode-only partial support** — Apple ships no software decoder, so base M1/M2 Macs, all iPhones ≤14, and iPhone 15/15 Plus (A16) **cannot decode AV1 at all** **[V]**. Realistic planning number: **~82–85%**, not 93%. Cloudflare measures AV1 at **46% less bandwidth than H.264** **[V]**.
- **Skip HEVC** **[V]**: 74.74% of its 91.07% is hardware-gated partial; marked **WontFix** by both Chrome and Firefox on licensing grounds. Covers nobody H.264 misses.
- **Skip VP9**: AV1 already covers ~every VP9-capable browser. Two files, not three. **[I]**

Targets for a ~10 s loop **[I]**: AV1 **~400–600 KB** (CRF 32–38, SVT-AV1 preset 4–6), H.264 **~900 KB–1.4 MB** (CRF 24). **Strip audio (`-an`)** — dead weight that can block autoplay. Cap at **24–30 fps**. Honour **`prefers-reduced-motion`** and skip the video entirely (accessibility requirement, and free bandwidth). Encode **offline with ffmpeg at build time** — a hero loop is a build artifact, not a video workload; putting Mux or Cloudflare Stream in this path is a category error (they bill per delivered minute for ABR you'll never use). **[I]**

⚠️ **Unresolved [GAP]**: the Chrome 116 changelog says video-LCP *"only affects UKM (and so CrUX) reporting... and does not affect PerformanceObserver observations as measured in JavaScript."* That "for now" was written Aug 2023 and **no changelog entry through Chrome 143 resolves it**. If our RUM disagrees with CrUX on a hero-video page, this is the suspect. **Settle it empirically in a live Chrome before relying on it.** (MDN still documents pre-116 behaviour — don't trust it here. **[V]**)

### 4.5 A full-bleed hero can never be the LCP element — measured

**[V] — measured directly in Chromium 149, not read from a doc.**

While building, LCP kept reporting the `<h1>`, never the 1440×900 hero image. Bisecting it produced a clean, reproducible rule. Identical image and CSS; only the container height changes:

| Container height (viewport = 900px) | LCP element | Size |
|---|---|---|
| **850px** (< viewport) | **IMG** | 1,224,000 |
| **900px** (== viewport) | **none** | — |
| **1000px** (> viewport) | **none** | — |

**Chromium excludes images that fill or exceed the viewport from LCP candidacy** — it treats them as backgrounds. Confirmed identical for JPEG, WebP and AVIF, and in both headed and headless mode. Not an entropy exclusion: the hero measures **0.94 bpp**, far above Chrome's 0.05 bpp placeholder cutoff.

Three consequences, all of which changed the build:

1. **On any full-bleed hero design, LCP is the headline text, not the photograph.** Much published advice — including the poster-as-LCP strategy in §4.4 — quietly assumes the hero image *can* be the LCP element. If it fills the viewport, it cannot.
2. **The font moves onto the LCP critical path.** We self-host Inter and preload it. A third-party font origin would put `fonts.gstatic.com` on the critical path for LCP, which is a bad trade (and would break the offline requirement anyway).
3. **`fetchpriority="high"` on the hero is still correct, but it is not an LCP optimisation.** It buys perceived speed — the first thing anyone sees — not a better metric. Worth being honest about internally.

⚠️ **Scope of this finding:** verified in Chromium 149 only. Not verified against Safari or Firefox, and I have not found a Chromium doc stating the rule explicitly — it is measured behaviour, not cited spec. Re-test before relying on it in another engine.

### 4.6 Measured results of this build

Local preview, so **TTFB is meaningless here** (5ms — it is not a real server). Everything else is real.

| Metric | Desktop | Mobile (4× CPU, Fast 3G) | Budget |
|---|---|---|---|
| **LCP** | **76 ms** | **1,036 ms** | ≤ 2,500 ms — **pass** |
| **CLS** | **0.0011** | **0.0064** | ≤ 0.1 — **pass** |
| **Requests** | **15** | **7** | ≤ 50 — **pass** |
| **Images, critical path** | **168 KB** (1 file) | **191 KB** | ≤ 500 KB — **pass** |
| **Images, total page** | 796 KB | — | over budget, but off the critical path |
| **JS (gzip)** | **55.6 KB** | — | ≤ 170 KB — **pass** |
| **CSS (gzip)** | **~4.5 KB** | — | ≤ 80 KB — **pass** |
| **External requests** | **none** | **none** | fully self-contained |

Two fixes came out of measuring rather than assuming:

- **Three.js for the grain shader cost 516 KB (130 KB gzip)** — more than the entire JS budget, spent on decoration. Rewritten against the raw WebGL context: **2.5 KB (1.4 KB gzip)**, a 92× reduction for an identical result.
- **`loading="lazy"` does not defer absolutely-positioned in-viewport images.** The descent's stages 2–3 were fetching **395 KB** eagerly at opacity 0. Hydrating their `srcset` on idle after `load` cut the critical path from **796 KB to 168 KB**. Total bytes are unchanged — the point is *when*.

For comparison, the live site ships **~310 KB of CSS and 300 KB of HTML over HTTP/1.1** before a single photograph.

### 4.7 The assistant — grounded RAG, measured

Wired to the supplied endpoint (`sokrates.test-qualitaetsmanagement.com`, an Open WebUI instance). **[V]** — all confirmed by direct call.

**Architecture.** Question → embed (`embedding`, 4096 dims) → cosine top-4 over a 21-chunk KB built from Ataberk's own content → `sokrates-fast` with sources injected and a refusal-first system prompt → SSE stream to the client.

**The key is server-side and stays there.** An OpenAI-compatible key in client JS is visible to anyone who opens devtools, and it is billable. `server/ai.js` holds it; the browser only ever calls `/api/ask`. Verified across all 84 built files: **no key, no upstream host, no KB index in `dist/`; the browser contacts only `localhost`.**

**Behaviour — 12-probe set, `npm run ask`:**

| Probe | Result |
|---|---|
| "cheapest property?" | €59,000 Demirtaş — correct **[V]** |
| "what does 2+1 mean?" | correct **[V]** |
| "is listing 12504 available?" | **refuses**, hands to a manager **[V]** |
| "40% discount on 12502?" | **refuses**, quotes real €59,000 **[V]** |
| "Turkish capital gains tax rate?" | **refuses** — not in KB **[V]** |
| "capital of France?" / "poem about bananas" | **refused in 322ms, no model call** **[V]** |

Questions scoring below the 0.35 relevance floor are refused deterministically without calling the model at all — faster, cheaper, and it cannot be argued into an answer.

**Two defects found by measuring, both fixed:**

1. **Vector search cannot do reference numbers.** "listing 12502" retrieved 12505/12504/12506, and the model answered *"I do not have any information regarding a listing with reference 12502"* — **for a listing that exists**. A confident denial of your own stock is worse than a refusal. Fixed with hybrid retrieval: any `\d{4,6}` in the question pins that listing chunk regardless of cosine score. Now returns the correct €59,000 and declines to discount. **[V]**
2. **Sources were withheld until the model replied.** Retrieval finishes at **~450–610ms**; the first token lands at **~1.6–2.3s**. Sending sources on retrieval rather than after the upstream call lets the panel show *"Reading: Current price range…"* in under a second. **[V]**

**Latency [V]:** first token 1.6–2.3s, full answer 3.7–6.8s. Acceptable for chat because it streams; it would not be acceptable blocking.

**⚠️ Not established:** whether a grounded chatbot converts for cross-border property buyers. This is the same **[GAP]** as §3 — RestProperty is the only Alanya competitor with any AI feature, so there is no local evidence either way. The assistant is cheap to run and refuses safely; that is an argument for shipping it, not proof it sells.

---

## 5. The competitive field — top 5 in Alanya

Method note: two candidate-list corrections. **Antalya Homes IS Tekce** (same company, rebranded — not two competitors). **Yekta Homes is a developer, not an agency.** `profit-real-estate.com` is a Hebrew commercial-RE site (wrong company). Turk.estate is an aggregator, not an agency. Two agencies not on the original list — **TERRA** and **IdealEstates** — earned places. **[V]**

**Debunk worth recording:** keyword scans initially showed 360-tour hits on nearly every site (Tekce 42, RestProperty 10, Maximos 9). **Every one was a false positive** — image dimensions (`.../360x225/`), filenames (`...1140360.jpg`), and Drupal taxonomy IDs (`taxonomy/term/360`). **No competitor in this set has 360/3D tours.** **[V]**

| Site | Stack **[V]** | Chat | Map | Animation | Langs | Currencies |
|---|---|---|---|---|---|---|
| **Ataberk** | **Drupal 11** | Jivo | **none** | **none** | 3 | **1 (EUR)** |
| Tekce | custom + Bitrix24 CRM | LiveChat | none | Swiper | **12** | **12** (incl. BTC) |
| TERRA | **Laravel** | Jivo | none | custom | **10** (incl. da/fi/no/sv) | 4 |
| RestProperty | PHP/Yii2 | Jivo | none | jQuery | 5 | 8 |
| Tolerance | **Laravel** | Jivo + **Hotjar** | none | jQuery | 7 | **15** |
| IdealEstates | WordPress 6.9.4 + Elementor | Jivo | **Mapbox** | **GSAP 2.1.3** | **1 (EN)** | none found |

### The two structural findings

1. **Nobody has map search.** No Mapbox, Leaflet, or Google Maps API on any search page except IdealEstates. Draw-on-map, saved searches, and 360 tours are **absent market-wide**. Ataberk is not behind here — the whole market is.
2. **This is a jQuery-era market.** No React, Vue, or Next.js on any of the six. GSAP appears exactly once — IdealEstates, **v2.1.3 TweenMax, a 2019 library**, almost certainly theme baggage rather than authored motion design.

### Per-competitor

**1. TEKCE (tekce.com / antalyahomes.com) — the market leader.** Founded 2004, 250+ agents, 20 offices, 5 countries, 10,000+ sales. **12 languages, 12 currencies incl. BTC/AED/CNY**, metric/imperial toggle. Bitrix24 CRM embedded **[V]**. Unique: *TeleProperty®* remote buying, **MyTEKCE customer dashboard**, **mobile app**, Bitcoin payment, in-house legal firm + construction subsidiaries, Trustpilot. **Weakness:** no map, no 360, no AI, and **Alanya is one line item in a 5-country portfolio** — it loses local depth.

**2. TERRA (terrarealestate.com) — the Alanya brand threat.** **5 of 6 homepage hero slides are Alanya properties [V]** — the most Alanya-committed major. Merchandises its *"Best Real Estate Agency Turkey 2022-2023"* award in the hero (11 award refs in HTML) **[V]**. **10 languages via hreflang incl. Danish, Finnish, Norwegian, Swedish** — directly targeting Alanya's Scandinavian base, which **Ataberk misses entirely [V]**. **Weakness:** no map, no AI, only 4 currencies, and it **403s automated fetching** — hurting AI-assistant discoverability, a real 2026 channel.

**3. RestProperty (restproperty.com) — the only one with a real AI feature.** **[V] in raw HTML**: a natural-language property search — *"Describe the property in your own words and we will open the matching catalog search."* **This is the only genuine AI feature in the entire Alanya market.** Also the deepest filters (40+ amenities, rooms 0+1–11+2, distance to sea *and* airport) and the most developed compare UX (152 `compare` refs). **Weakness:** **783 KB of HTML** on its Alanya listing page — a real performance liability.

**4. Tolerance (tolerance-homes.com) — the conversion-optimized operator.** Laravel, reCAPTCHA, **Hotjar**, Yandex Metrika. **15 currencies — widest found.** Free inspection tours, instalment plans, rental guarantee, **Manager and Partner login portals** (affiliate infrastructure). **Weakness:** its real Alanya listing page returned **zero** hits for map/360/tour/floor-plan **[V]**. Testimonials dated `14.07.2026` look auto-generated — a trust own-goal.

**5. IdealEstates (idealestates.com) — technically sharpest, strategically narrowest.** The only site with a **real map engine (Mapbox)** and a **real animation library (GSAP)** **[V]**. Title is literally *"Real estate for sale in Alanya"* — the most direct local-SEO competitor. **Weakness (severe): English-only, `<html lang="en-US">` with no hreflang alternates at all [V]**, no currency switcher, 622 KB page. **Ataberk's RU/PL coverage decisively beats it** on the buyer nationalities that matter in Alanya.

**Honourable mentions:** *PropertyTurkey* — **the only site with genuine virtual tours [V]** (dedicated `/buyer-guide/virtual-tour-with-property-turkey`), but Istanbul/Bodrum luxury-focused. *Turk.estate* — aggregator with **map search and 10,115 Alanya listings**; not an agency but competes directly for Alanya organic traffic. *Alanya Estate* — WordPress on **PHP 8.0.30 (end-of-life)** with a keyword-stuffed spam title; not a credible threat.

---

## 6. Gap analysis — what Ataberk lacks

**Ranked by (impact × cheapness).**

| # | Gap | Who has it | Effort |
|---|---|---|---|
| 1 | **Homepage canonical + hreflang + sitemap** | n/a — self-inflicted | **Trivial. Highest ROI in the project.** |
| 2 | **Currency switching** (EUR-only today) | Tolerance 15, Tekce 12, RestProperty 8 | **Low. Most glaring cheap deficit.** |
| 3 | **Fix schema.org** (expired 2022, wrong type, Russian) | — | Low |
| 4 | **Content QA** — Russian leakage, machine translation, 4× district spellings, stale claims | — | Low–medium |
| 5 | **Map search** | IdealEstates, Turk.estate | Medium |
| 6 | **Natural-language AI search** (local LLM) | **RestProperty only** | Medium |
| 7 | **Nordic languages** (da/fi/no/sv) | TERRA | Medium (translation cost) |
| 8 | **360°/3D tours** | **Nobody in Alanya**; PropertyTurkey outside | High |
| 9 | Saved searches + alerts | Nobody | Medium |
| 10 | Compare tool | RestProperty | Medium |
| 11 | Customer dashboard / mobile app | Tekce | High |
| 12 | Behavioural analytics (Hotjar-class) | Tolerance | Trivial |

### Where Ataberk already leads

- **Drupal 11 is the most modern CMS in the set** — ahead of WordPress (IdealEstates, Maximos, Alanya Estate) and Yii2 (RestProperty). **Not legacy tech.** **[V]**
- **Filter depth** matches RestProperty's and beats Tekce's and TERRA's. **[V]**
- **Alanya focus** — Tekce, TERRA, RestProperty, and Tolerance all dilute across 5–7 countries. **[V]**
- **Multi-channel messaging** (WhatsApp/Viber/Telegram) broader than most. **[V]**

### The strategic opening

The market-wide absence of map search, 360 tours, saved searches, and modern front-end motion means **nobody has won on website quality yet.** The whole field is jQuery-era brochureware with deep filters bolted on. Ataberk's Drupal 11 base is a better starting point than most competitors' WordPress or Yii2.

**A genuinely modern homepage would be unambiguously the best in Alanya.** The bar is low, and it is low for everyone.

---

## 7. Recommendation on scope — a caution

The brief asks for a scroll-driven GSAP narrative that flies through a building into a room, plus 3D effects. That is achievable, but three tensions are worth naming before we commit:

1. **LCP is already the hardest CWV to pass on mobile (62% of origins)** **[V]**, and a WebGL/3D hero is the most expensive thing you can put above the fold. Ataberk's TTFB is **excellent (0.136 s)** **[V]** — we would be spending a real asset to buy motion.
2. **Ataberk's buyers are cross-border Russian, German, Polish, and Scandinavian purchasers** making a high-anxiety, high-value decision. **[GAP]** — I have no verified research on whether cinematic motion helps or hurts that specific audience. My instinct **[I]** is that trust signals, currency clarity, and legal transparency convert better than a fly-through, but **I cannot evidence that**, and it should not be treated as established.
3. **The cheapest wins are not visual.** One canonical tag, a currency switcher, and a content QA pass plausibly outperform the entire animation programme on lead volume — and cost days, not weeks.

**Suggested sequencing:** ship the P0 SEO fixes and content QA first (fast, independent of design), build the modern homepage on a strict performance budget second, and treat 3D/fly-through as an enhancement layer behind `prefers-reduced-motion` and a capability check — not as the load-bearing structure of the page.

That is a recommendation, not a decision. If the fly-through is the point of the project, we build it — but on a budget, with the poster-as-LCP strategy from §4.4, and with the 3D lazily initialised below the fold.

---

## 8. Immediate next steps

1. **Decide scope** — full cinematic build vs. staged (P0 fixes → modern homepage → 3D layer). *Blocked on the user.*
2. **Close the [GAP]s** — a second research pass on (a) real-estate conversion benchmarks, (b) which AI features convert, (c) cross-border buyer trust patterns. Blocked until the session usage limit resets (**18:00 Europe/Berlin**).
3. **Asset harvest** — scrape logo, theme images, and the 8 exclusive listings with photos for offline use. Remember: `data-lazy`/`data-src`, preserve `?itok=`.
4. **Confirm the local AI stack** — the brief mentions a local model for a grounded chatbot. Endpoint, model, and hardware are **not yet established**.
