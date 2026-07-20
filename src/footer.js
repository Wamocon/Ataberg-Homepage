/**
 * Footer link tree.
 *
 * The live footer carries ~150 links — districts x property types across every
 * region they cover. It is not decoration: it is most of their internal linking
 * and local SEO. Dropping it to a copyright line, as the first cut of this
 * rebuild did, would measurably hurt them.
 *
 * Districts and regions are taken from the live footer. Turkish spellings are
 * normalised (the live site spells Demirtaş four ways); the slugs keep the
 * live URL forms so every link still resolves.
 */

const alanya = [
  ['Mahmutlar', 'mahmutlar'], ['Oba', 'oba'], ['Kestel', 'kestel'], ['Tosmur', 'tosmur'],
  ['Kargıcak', 'kargicak'], ['Demirtaş', 'demirtas'], ['Avsallar', 'avsallar'],
  ['Payallar', 'payallar'], ['Konaklı', 'konakli'], ['Cikcilli', 'cikcilli'],
  ['Alanya centre', 'center'], ['Cleopatra', 'cleopatra'], ['Gazipaşa', 'gazipasa'],
  ['Türkler', 'turkler'],
];

const antalya = [
  ['Konyaaltı', 'konyaalti'], ['Lara', 'lara'], ['Muratpaşa', 'muratpasa'],
  ['Kepez', 'kepez'], ['Altıntaş', 'altintas'], ['Döşemealtı', 'dosemealti'],
  ['Belek', 'belek'], ['Kemer', 'kemer'], ['Side', 'side'],
];

const mersin = [
  ['Tece', 'tece'], ['Erdemli', 'erdemli'], ['Mezitli', 'mezitli'], ['Yenişehir', 'yenisehir'],
  ['Ayaş', 'ayas'], ['Kargıpınarı', 'kargipinari'], ['Tömük', 'tomuk'], ['Arpaçbahşiş', 'arpacbahsis'],
  ['Çeşmeli', 'cesmeli'], ['Kızkalesi', 'kizkalesi'], ['Silifke', 'silifke'],
];

const cities = [
  ['Istanbul', 'istanbul'], ['Bodrum', 'bodrum'], ['Fethiye', 'fethiye'], ['İzmir', 'izmir'],
  ['Çeşme', 'cesme'], ['Yalova', 'yalova'], ['Trabzon', 'trabzon'], ['Bursa', 'bursa'],
  ['Northern Cyprus', 'cyprus'],
];

const types = [
  ['Apartments', 'apartments', 'f.apartments'], ['Villas and houses', 'villas', 'f.villas'], ['Penthouses', 'penthouses', 'f.penthouses'],
  ['Commercial', 'commercial', 'f.commercial'], ['Land', 'land', 'f.land'], ['Hotels', 'hotels', 'f.hotels'],
];

// Districts/cities carry no key (proper nouns, same in every language); types
// carry an i18n key so the mega-menu and footer translate with the page.
const linkify = (arr, pre) => arr.map(([label, slug, k]) => ({ label, k, href: `${pre}/${slug}` }));

/**
 * Price-band links. The live footer carries these against the apartments
 * catalogue (`/turkey/apartments/50000--80000` — note the double dash) and they
 * are some of the most valuable links in the tree: they match how people
 * actually search ("apartments in Alanya under 100,000").
 */
const bands = [
  [50000, 80000], [80000, 120000], [120000, 150000],
  [150000, 200000], [200000, 300000], [300000, 500000],
];
const priceLinks = bands.map(([a, b]) => ({
  label: `€${a.toLocaleString('en-GB')} to €${b.toLocaleString('en-GB')}`,
  href: `/turkey/apartments/${a}--${b}`,
}));

/**
 * Header "Properties" mega-menu. A concise, high-intent slice of the footer's
 * link tree — the districts and types a buyer actually browses by — grouped
 * into four columns with a translated heading each. Reused verbatim in the
 * mobile drawer. The live site buries all of this; surfacing it from the header
 * is the single biggest navigation win.
 */
export const MEGA = [
  { k: 'ftr.alanya', links: linkify(alanya.slice(0, 9), '/turkey/alanya') },
  {
    k: 'ftr.other',
    links: [
      { label: 'Antalya', href: '/turkey/antalya' },
      { label: 'Mersin', href: '/turkey/mersin' },
      ...linkify(cities.slice(0, 5), '/turkey'),
    ],
  },
  { k: 'ftr.byType', links: linkify(types, '/turkey') },
  {
    k: 'ftr.purpose',
    links: [
      { label: 'For citizenship', k: 'link.citizenship', href: '/turkish-citizenship' },
      { label: 'For a residence permit', k: 'link.residencePurpose', href: '/turkey/vid-na-jitelstvo' },
      { label: 'To let out', k: 'link.toLet', href: '/turkey/for-rent' },
      { label: 'Sea view', k: 'f.seaView', href: '/turkey/sea-view' },
      { label: 'Front line', k: 'link.frontLine', href: '/pervaya-l-n-ya' },
      { label: 'Resale', k: 'f.resale', href: '/turkey/alanya/vtorichka' },
    ],
  },
];

/**
 * Footer link tree — deliberately trimmed to four curated columns. The earlier
 * footer carried ~150 links across ten columns plus a district x type band; it
 * read as a link farm. This keeps the highest-intent links a buyer actually
 * uses and lets the rest live on the /turkey catalogue and the mega-menu.
 */
export const FOOTER = [
  {
    k: 'ftr.popular',
    links: [
      ...linkify(alanya.slice(0, 6), '/turkey/alanya'),
      { label: 'Antalya', href: '/turkey/antalya' },
      { label: 'Mersin', href: '/turkey/mersin' },
    ],
  },
  {
    k: 'ftr.byType',
    links: [
      ...linkify(types.slice(0, 4), '/turkey'),
      { label: 'Under construction', k: 'f.construction', href: '/turkey/our-projects' },
      { label: 'Resale', k: 'f.resale', href: '/turkey/alanya/vtorichka' },
    ],
  },
  {
    k: 'ftr.buying',
    links: [
      { label: 'How the purchase works', k: 'link.howBuy', href: '/procedyra-pokypki' },
      { label: 'Instalments', k: 'link.instalments', href: '/turkey/rassrochka' },
      { label: 'Residence permit', k: 'link.residencePermit', href: '/turkey/vid-na-jitelstvo' },
      { label: 'Turkish citizenship', k: 'link.turkishCitizenship', href: '/turkish-citizenship' },
      { label: 'Title deed (TAPU)', k: 'link.tapu', href: '/articles/tapu' },
    ],
  },
  {
    k: 'ftr.company',
    links: [
      { label: 'About us', k: 'nav.about', href: '/about-company' },
      { label: 'Our team', k: 'link.team', href: '/our-team' },
      { label: 'Testimonials', k: 'link.testimonials', href: '/testimonials' },
      { label: 'Articles', k: 'link.articles', href: '/articles' },
      { label: 'Contacts', k: 'link.contacts', href: '/contacts' },
    ],
  },
];

/**
 * Homepage articles — News / Blog / Useful information, exactly as tabbed on
 * the live site. Dates and slugs are the live ones. Several are years old; that
 * staleness is Ataberk's to fix with content, not ours to hide.
 */
export const ARTICLES = {
  news: [
    { title: 'Gold and silver visas in Turkey', date: '2023-07-31', href: '/articles/zakony', img: 'art-1' },
    { title: 'Kat Karşılığı: how does shared construction work in Turkey?', date: '2025-05-29', href: '/articles/kat-karsiligi-how-does-shared-construction-work-turkey', img: 'art-2' },
    { title: 'Real estate in Turkey 2025: trends, prices, advice', date: '2025-04-18', href: '/articles/real-estate-turkey-', img: 'art-3' },
  ],
  blog: [
    { title: 'What counts as overstaying in Turkey, how to calculate it, and how to avoid fines and deportation', date: '2024-09-01', href: '/articles/what-overtime-turkey-how-calculate-it-and-avoid-fines-and-deportations', img: 'art-4' },
    { title: 'Long and short-term rentals in Turkey: earning rental income', date: '2024-07-01', href: '/articles/long-term-and-short-term-real-estate-rentals-turkey-rental-income', img: 'art-5' },
    { title: 'The benefits of owning Turkish property', date: '2024-04-01', href: '/articles/benefits-owning-turkish-property', img: 'art-6' },
  ],
  useful: [
    { title: 'The title deed (TAPU), explained', date: '2023-01-01', href: '/articles/tapu', img: 'art-7' },
    { title: 'Running costs and upkeep of a Turkish home', date: '2022-01-01', href: '/articles/rashodi-i-soderjanie', img: 'art-8' },
    { title: 'How to earn an income from real estate in Turkey', date: '2022-01-01', href: '/articles/earn-income-real-estate-turkey', img: 'art-9' },
  ],
};

/**
 * District x type deep links — the bulk of the live footer's 202 unique links,
 * and the part that does the real local-SEO work ("penthouses in Kargıcak").
 * Generated rather than hand-listed so the tree cannot drift from the district
 * lists above.
 *
 * Rendered in a separate, denser band below the main columns so the footer stays
 * readable: eight columns of prose links plus ~90 combination links in one grid
 * would be a wall.
 */
const COMBO_TYPES = [
  ['Apartments', 'apartments'],
  ['Villas', 'villas'],
  ['Penthouses', 'penthouses'],
];

const comboFor = (region, slug, districts) => ({
  title: region,
  links: districts.flatMap(([label, d]) =>
    COMBO_TYPES.map(([t, ts]) => ({
      label: `${t} in ${label}`,
      href: `/turkey/${slug}/${d}/${ts}`,
    }))
  ),
});

export const FOOTER_COMBOS = [
  comboFor('Alanya', 'alanya', alanya.slice(0, 9)),
  comboFor('Antalya', 'antalya', antalya.slice(0, 6)),
  comboFor('Mersin', 'mersin', mersin.slice(0, 5)),
];

export const ARTICLE_TABS = [
  { key: 'news', label: 'News', all: { label: 'All news', href: '/articles' } },
  { key: 'blog', label: 'Blog', all: { label: 'All articles', href: '/articles/nedvizhimost' } },
  { key: 'useful', label: 'Useful information', all: { label: 'All information', href: '/articles/lichnyy-opyt' } },
];
