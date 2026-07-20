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
  ['Apartments', 'apartments'], ['Villas and houses', 'villas'], ['Penthouses', 'penthouses'],
  ['Commercial', 'commercial'], ['Land', 'land'], ['Hotels', 'hotels'],
];

const linkify = (arr, pre) => arr.map(([label, slug]) => ({ label, href: `${pre}/${slug}` }));

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
  label: `€${a.toLocaleString('en-GB')} – €${b.toLocaleString('en-GB')}`,
  href: `/turkey/apartments/${a}--${b}`,
}));

export const FOOTER = [
  {
    k: 'ftr.alanya',
    links: linkify(alanya, '/turkey/alanya'),
  },
  {
    k: 'ftr.antalya',
    links: linkify(antalya, '/turkey/antalya'),
  },
  {
    k: 'ftr.mersin',
    links: linkify(mersin, '/turkey/mersin'),
  },
  {
    k: 'ftr.other',
    links: linkify(cities, '/turkey'),
  },
  {
    k: 'ftr.byType',
    links: [
      ...linkify(types, '/turkey'),
      { label: 'Under construction', href: '/stroitelstvo/tyrciya' },
      { label: 'Our projects', href: '/turkey/our-projects' },
      { label: 'Offers from developers', href: '/turkey/builder' },
    ],
  },
  {
    k: 'ftr.byPrice',
    links: priceLinks,
  },
  {
    k: 'ftr.purpose',
    links: [
      { label: 'For citizenship', href: '/turkish-citizenship' },
      { label: 'For a residence permit', href: '/turkey/vid-na-jitelstvo' },
      { label: 'To let out', href: '/turkey/for-rent' },
      { label: 'Sea view', href: '/turkey/sea-view' },
      { label: 'Front line', href: '/pervaya-l-n-ya' },
      { label: 'Resale in Alanya', href: '/turkey/alanya/vtorichka' },
      { label: 'Resale in Antalya', href: '/turkey/antalya/vtorichka' },
    ],
  },
  {
    k: 'ftr.buying',
    links: [
      { label: 'How the purchase works', href: '/procedyra-pokypki' },
      { label: 'Instalments', href: '/turkey/rassrochka' },
      { label: 'Credit in Turkey', href: '/kredit' },
      { label: 'What is a TAPU?', href: '/articles/tapu' },
      { label: 'The resident card', href: '/articles/vid-na-jitelstvo' },
      { label: 'Costs and upkeep', href: '/articles/rashodi-i-soderjanie' },
      // The live footer links "Sell your property" twice: once here and once,
      // malformed, to `/furniture-,`. We keep only the working one.
      { label: 'Sell your property', href: '/prodat-vashy-nedvizhimost' },
      { label: 'Catalogue', href: '/turkey' },
    ],
  },
  {
    k: 'ftr.services',
    links: [
      { label: 'All services', href: '/our-services' },
      { label: 'Online tour', href: '/Online-tour' },
      { label: 'Rent', href: '/rent' },
      { label: 'Property management', href: '/our-services' },
      { label: 'Transfer and car rental', href: '/our-services' },
      { label: 'Furniture', href: '/furniture' },
      { label: 'Legal support', href: '/our-services' },
      { label: 'Translation', href: '/our-services' },
    ],
  },
  {
    k: 'ftr.company',
    links: [
      { label: 'About us', href: '/about-company' },
      { label: 'Our team', href: '/our-team' },
      { label: 'Certificates', href: '/certificates' },
      { label: 'Vacancies', href: '/vacancy' },
      { label: 'Testimonials', href: '/testimonials' },
      { label: 'Articles', href: '/articles' },
      { label: 'Contacts', href: '/contacts' },
      { label: 'Site map', href: '/sitemap' },
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
    { title: 'Real estate in Turkey 2025 — trends, prices, advice', date: '2025-04-18', href: '/articles/real-estate-turkey-', img: 'art-3' },
  ],
  blog: [
    { title: 'What counts as overstaying in Turkey, how to calculate it, and how to avoid fines and deportation', date: '2024-09-01', href: '/articles/what-overtime-turkey-how-calculate-it-and-avoid-fines-and-deportations', img: 'art-4' },
    { title: 'Long- and short-term rentals in Turkey — rental income', date: '2024-07-01', href: '/articles/long-term-and-short-term-real-estate-rentals-turkey-rental-income', img: 'art-5' },
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
