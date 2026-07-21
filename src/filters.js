/**
 * Search filter model.
 *
 * Ataberk's filter depth genuinely beats Tekce's and TERRA's — ~40 amenities,
 * infrastructure, distance-to-sea, resale-vs-developer. The first cut of this
 * rebuild reduced it to four selects, which hid an existing competitive
 * strength. This restores the depth behind a "More filters" disclosure so the
 * default view stays calm.
 *
 * Every label is an i18n key (`k`), not literal text — the first version hard-
 * coded English here, so the form stayed English while the rest of the page
 * translated. District and city names carry `label` instead: they are proper
 * nouns and read the same in every language.
 */

export const DEALS = [
  { v: 'buy', k: 'search.buy' },
  { v: 'rent', k: 'search.rent' },
];

export const TYPES = [
  { v: '', k: 'search.anyType' },
  { v: 'apartments', k: 'f.apartments' },
  { v: 'villas', k: 'f.villas' },
  { v: 'penthouses', k: 'f.penthouses' },
  { v: 'commercial', k: 'f.commercial' },
  { v: 'land', k: 'f.land' },
  { v: 'hotels', k: 'f.hotels' },
];

export const LOCATIONS = [
  { group: 'Alanya', items: ['All of Alanya', 'Mahmutlar', 'Oba', 'Kestel', 'Tosmur', 'Kargıcak', 'Demirtaş', 'Avsallar', 'Payallar', 'Konaklı', 'Cikcilli', 'Alanya centre', 'Cleopatra', 'Gazipaşa', 'Türkler'] },
  { group: 'Antalya', items: ['All of Antalya', 'Konyaaltı', 'Lara', 'Muratpaşa', 'Kepez', 'Altıntaş', 'Belek', 'Kemer', 'Side'] },
  { group: 'Mersin', items: ['All of Mersin', 'Tece', 'Erdemli', 'Mezitli', 'Yenişehir', 'Kızkalesi', 'Silifke'] },
  { group: 'Other', items: ['İstanbul', 'Bodrum', 'Fethiye', 'İzmir', 'Northern Cyprus'] },
];

/** Turkish layout notation — "2+1" is 2 bedrooms plus a living room. Universal. */
export const ROOMS = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+1 and larger'];

export const SEA = [
  { v: '', k: 'f.anyDistance' },
  { v: '100', k: 'f.frontLine' },
  { v: '300', k: 'f.to300' },
  { v: '500', k: 'f.to500' },
  { v: '1000', k: 'f.to1000' },
  { v: '2000', k: 'f.to2000' },
];

export const STAGE = [
  { v: '', k: 'search.any' },
  { v: 'ready', k: 'f.ready' },
  { v: 'construction', k: 'f.construction' },
  { v: 'resale', k: 'f.resale' },
];

export const SELLER = [
  { v: '', k: 'f.anyone' },
  { v: 'developer', k: 'f.developer' },
  { v: 'owner', k: 'f.owner' },
];

/** ~40 amenities, as on the live site. Their `Cоляная комната` is "Salt room". */
export const AMENITIES = [
  { v: 'furnished', k: 'f.furnished' }, { v: 'sea-view', k: 'f.seaView' },
  { v: 'mountain-view', k: 'f.mountainView' }, { v: 'pool', k: 'f.pool' },
  { v: 'indoor-pool', k: 'f.indoorPool' }, { v: 'heated-pool', k: 'f.heatedPool' },
  { v: 'sauna', k: 'f.sauna' }, { v: 'hamam', k: 'f.hamam' },
  { v: 'salt-room', k: 'f.saltRoom' }, { v: 'gym', k: 'f.gym' },
  { v: 'tennis', k: 'f.tennis' }, { v: 'basketball', k: 'f.basketball' },
  { v: 'kids-pool', k: 'f.kidsPool' }, { v: 'playground', k: 'f.playground' },
  { v: 'games', k: 'f.games' }, { v: 'cinema', k: 'f.cinema' },
  { v: 'generator', k: 'f.generator' }, { v: 'lift', k: 'f.lift' },
  { v: 'security', k: 'f.security' }, { v: 'cctv', k: 'f.cctv' },
  { v: 'concierge', k: 'f.concierge' }, { v: 'parking', k: 'f.parking' },
  { v: 'underground', k: 'f.underground' }, { v: 'garden', k: 'f.garden' },
  { v: 'bbq', k: 'f.bbq' }, { v: 'terrace', k: 'f.terrace' },
  { v: 'balcony', k: 'f.balcony' }, { v: 'ac', k: 'f.ac' },
  { v: 'underfloor', k: 'f.underfloor' }, { v: 'central', k: 'f.central' },
  { v: 'fireplace', k: 'f.fireplace' }, { v: 'kitchen', k: 'f.kitchen' },
  { v: 'white-goods', k: 'f.whiteGoods' }, { v: 'satellite', k: 'f.satellite' },
  { v: 'internet', k: 'f.internet' }, { v: 'water-tank', k: 'f.waterTank' },
  { v: 'solar', k: 'f.solar' }, { v: 'accessible', k: 'f.accessible' },
  { v: 'pets', k: 'f.pets' }, { v: 'letting', k: 'f.letting' },
];

export const INFRASTRUCTURE = [
  { v: 'beach', k: 'f.beach' }, { v: 'shops', k: 'f.shops' },
  { v: 'supermarket', k: 'f.supermarket' }, { v: 'pharmacy', k: 'f.pharmacy' },
  { v: 'school', k: 'f.school' }, { v: 'kindergarten', k: 'f.kindergarten' },
  { v: 'hospital', k: 'f.hospital' }, { v: 'bus', k: 'f.bus' },
  { v: 'restaurants', k: 'f.restaurants' }, { v: 'bazaar', k: 'f.bazaar' },
  { v: 'bank', k: 'f.bank' }, { v: 'park', k: 'f.park' },
];

export const EXTRAS = [
  { v: 'installments', k: 'f.installments' },
  { v: 'citizenship', k: 'f.citizenship' },
  { v: 'residence', k: 'f.residence' },
  { v: 'credit', k: 'f.credit' },
];

export const PRICE_STEPS = [50000, 80000, 100000, 120000, 150000, 200000, 300000, 400000, 500000];
