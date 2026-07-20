/**
 * The assistant's knowledge base.
 *
 * Every fact here is sourced from Ataberk's own site (audited 2026-07-16) or
 * from src/listings.js. Nothing is invented, the whole point of grounding is
 * that the model cannot answer beyond this, so anything wrong here becomes a
 * wrong answer with a citation attached, which is worse than no answer.
 *
 * Where the live site contradicts itself, the defensible figure is used and the
 * contradiction is recorded in the chunk. See ANALYSIS.md §2.1.
 */
import { LISTINGS } from '../src/listings.js';

const money = (n) => `€${n.toLocaleString('en-GB')}`;

const cheapest = LISTINGS.reduce((a, b) => (a.price < b.price ? a : b));
const dearest = LISTINGS.reduce((a, b) => (a.price > b.price ? a : b));
const districts = [...new Set(LISTINGS.map((l) => l.district))];

/** @type {{id:string,title:string,url:string,text:string}[]} */
export const CHUNKS = [
  {
    id: 'company',
    title: 'About Ataberk Estate',
    url: '/about-company',
    text: `Ataberk Estate is a licensed real estate agency in Alanya, Turkey. The company has traded since 2005, 21 years as of 2026. It is a family business: Fatih Kabakçı is the Owner and CEO, and Aleksandra Kabakçı is the Owner and Executive Director. The Alanya office opened in 2014. The wider Ataberk Group employs around 150 people; the real estate division has more than 80. The group also includes Ataberk Yacht. Ataberk Estate is registered in the Turkish company register at the Alanya Chamber of Commerce and Industry, and takes full financial and legal responsibility for the legal cleanliness of the properties it offers. The company has completed roughly 6,000 transactions and holds about 30,000 properties on its books. Its main buyer markets are Russia, Ukraine, Kazakhstan, Iran, Germany and Turkey. Staff work across English, Russian, Polish and Turkish.`,
  },
  {
    id: 'offices',
    title: 'Offices and contact',
    url: '/contacts',
    text: `Ataberk Estate has offices in Alanya, Antalya and Mersin. The Alanya head office is at Dinek Mh. Zamanoğlu Cd. No: 27A / Kat 3, Ataberk Group Ofisi, Alanya / Antalya 07460. The Antalya office is at Ermenek mah. Kardeşkentler cad no 24, Ataberk İş Merkezi Kat 3, Muratpaşa / Antalya. There is also a staffed office in Mersin. Phone: +90 549 557 7 557. Email: info@ataberkestate.com. WhatsApp: +90 549 557 7 557. Telegram: @ataberkrealestate. The company is on Facebook, Instagram, YouTube and TikTok.`,
  },
  {
    id: 'why-turkey',
    title: 'Why buying in Turkey pays',
    url: '/#why',
    text: `Four reasons Ataberk's buyers give for purchasing in Turkey. First, a sound investment: the climate, the coastline, the build quality and steady demand from foreign buyers keep Turkish property working as an investment rather than only a home. Second, every price bracket is available, from a modest studio or a well-priced resale through to a luxury villa. Third, payment on workable terms, instalments and Turkish bank credit are available. Fourth, residence: owning a home entitles the owner and their immediate family to apply for a Turkish residence permit.`,
  },
  {
    id: 'services',
    title: 'What Ataberk does for buyers',
    url: '/our-services',
    text: `Ataberk Estate provides full legal support for the transaction, help securing credit with a Turkish bank, and assistance settling into Turkey through its local offices. Services include online property tours, mortgage and credit assistance with Turkish banks, residence permit consultations, Turkish citizenship guidance, transfer and car rental, long-term and short-term rental, property management after purchase, legal transaction support, and translation. After-sales service continues after the deal closes: translation, paperwork, consultations and advice. Managers work individually with each client and respect confidentiality. If nothing on the site fits, they will source options directly.`,
  },
  {
    id: 'citizenship',
    title: 'Residence and citizenship',
    url: '/turkey/vid-na-jitelstvo',
    text: `Owning property in Turkey entitles the owner and their immediate family to apply for a Turkish residence permit. Ataberk offers residence permit consultations and Turkish citizenship guidance as services. Some properties in the catalogue are marked as eligible for the citizenship route, for example listing 12504, a 4+1 duplex penthouse in Kargıcak, is listed as eligible for citizenship and residence. Ataberk advises discussing eligibility with a manager, as it depends on the property and the purchase value.`,
  },
  {
    id: 'payment',
    title: 'Instalments and payment',
    url: '/turkey/rassrochka',
    text: `Instalment plans and Turkish bank credit are available on Ataberk properties. Several developer projects carry instalments directly: listing 12506 in central Mahmutlar offers instalments over 24 months, and listing 12505, a business centre in Oba, offers instalments up to two years. Ataberk also helps buyers obtain a loan from a Turkish bank. Terms depend on the property and the developer, a manager can confirm what applies to a specific listing.`,
  },
  // One chunk per district, generated from the real catalogue so the numbers
  // cannot drift from the listings. An earlier hand-written version of this
  // claimed the cheapest property was €59,000, it was wrong, because the KB
  // only held 8 of the 32 listings. Facts here are derived, not remembered.
  ...districts.map((d) => {
    const rows = LISTINGS.filter((l) => l.district === d).sort((a, b) => a.price - b.price);
    const city = rows[0].city;
    return {
      id: `district-${d.toLowerCase().replace(/[^a-z]/g, '')}`,
      title: `${d}, ${city}`,
      url: `/turkey/${city.toLowerCase()}/${d.toLowerCase()}`,
      text: `${d} is a district of ${city} where Ataberk currently lists ${rows.length} propert${rows.length === 1 ? 'y' : 'ies'} on the homepage. ${
        rows.length > 1
          ? `They run from ${money(rows[0].price)} to ${money(rows.at(-1).price)}.`
          : `It is priced at ${money(rows[0].price)}.`
      } ${rows.map((l) => `Reference ${l.id}: ${l.title}, ${l.rooms}${l.area ? `, ${l.area} m²` : ''}, ${money(l.price)}.`).join(' ')}`,
    };
  }),
  {
    id: 'rooms',
    title: 'How Turkish property sizes are described',
    url: '/turkey',
    text: `Turkish listings describe layouts with a "X+1" notation. The first number is the count of bedrooms and the "+1" is the living room. So 1+1 is one bedroom plus a living room, 2+1 is two bedrooms plus a living room, and 4+1 is four bedrooms plus a living room. Ataberk's current homepage selection runs from 1+1 apartments of around 47 to 58 m² up to a 4+1 penthouse of 300 m². Areas are quoted in square metres.`,
  },
  {
    id: 'prices',
    title: 'Current price range',
    url: '/turkey',
    // Derived from the catalogue, never hand-typed, see the note above.
    text: `Ataberk's homepage carries ${LISTINGS.length} properties across five selections: Exclusive offers, Top offers, New offers, Hot offers and From owners. Prices run from ${money(cheapest.price)}, reference ${cheapest.id}, ${cheapest.title}, in ${cheapest.district}, up to ${money(dearest.price)} for reference ${dearest.id}, ${dearest.title}. The cheapest property currently listed on the homepage is reference ${cheapest.id} at ${money(cheapest.price)}. Prices are quoted in euros and are asking prices, not valuations or quotes. The districts covered on the homepage are ${districts.join(', ')}. Property types are apartments, penthouses and commercial space.`,
  },
  {
    id: 'catalogue',
    title: 'Everything on the homepage, by price',
    url: '/turkey',
    text: `The full homepage selection, cheapest first: ${LISTINGS
      .slice()
      .sort((a, b) => a.price - b.price)
      .map((l) => `${money(l.price)}, reference ${l.id}, ${l.rooms}${l.area ? `, ${l.area} m²` : ''}, ${l.district}, ${l.city}`)
      .join('; ')}.`,
  },
  {
    id: 'buying-process',
    title: 'Buying process and TAPU',
    url: '/procedyra-pokypki',
    text: `Ataberk provides full legal support for the transaction. The Turkish title deed is called the TAPU. The company has staff dedicated to legal work, including a sworn interpreter and a TAPU lawyer, and describes long experience working with Turkish developers, banks and government agencies. Ataberk states it takes full financial and legal responsibility for the legal cleanliness of the properties it offers, and that it is registered with the Alanya Chamber of Commerce and Industry. Buyers are encouraged to ask about the purchase and registration procedure before committing to anything.`,
  },
  {
    id: 'languages',
    title: 'Languages',
    url: '/contacts',
    text: `Ataberk's team works in English, Russian, Polish and Turkish. The company's About page states it works across 9 languages. Its websites exist in English (ataberkhomes.com), Russian (ataberkestate.com) and Polish (ataberkestate.pl). The business is Russian-first in origin and its main buyer markets are Russia, Ukraine, Kazakhstan, Iran, Germany and Turkey.`,
  },
  {
    id: 'rental',
    title: 'Rental',
    url: '/rent',
    text: `Ataberk offers both long-term and short-term rental, and property management after purchase. There is a dedicated rental team: Vasiliy Potakhin heads rentals, with Olena Kharenko and Oleksandr Bunakalia. Owners who buy through Ataberk can have the property managed and let out. Ask a manager for current rental availability and terms, as the rental stock is not the same as the sales catalogue.`,
  },
  // One chunk per live listing, so the assistant can answer about specific stock.
  ...LISTINGS.map((l) => ({
    id: `listing-${l.id}`,
    title: `Listing ${l.id}, ${l.district}, ${money(l.price)}`,
    url: l.href,
    text: `Ataberk listing reference ${l.id}. ${l.title}. Location: ${l.city}, ${l.district} district. Layout: ${l.rooms}.${
      l.area ? ` Area: ${l.area} m².` : ' Area is not published for this listing.'
    } Price: ${l.priceFrom ? 'from ' : ''}${money(l.price)}. Type: ${l.type}. Shown under: ${l.tabs.join(', ')}. This is a current listing in the Ataberk homepage selection.`,
  })),
];

export const SYSTEM_PROMPT = `You are Kaya, the friendly assistant on the website of Ataberk Estate, a licensed real estate agency in Alanya, Turkey, trading since 2005. If someone asks who you are, you are Kaya, Ataberk's guide.

You answer ONLY from the SOURCES provided in the user message. This is not a style preference, it is the whole basis on which you are allowed to speak.

Rules, in order of importance:
1. If the SOURCES do not contain the answer, say so plainly and point the person to a human: phone +90 549 557 7 557, WhatsApp on the same number, or info@ataberkestate.com. Never guess, never fill gaps from general knowledge about Turkey or real estate.
2. Never invent a property, price, reference number, district, law, tax, fee, timeline or guarantee. If a number is not in SOURCES, you do not have it.
3. Cite the sources you used by their [id] at the end of the relevant sentence, e.g. [listing-12504].
4. Legal, tax, residence and citizenship questions: give only what SOURCES state, then recommend speaking to an Ataberk manager. Do not advise.
5. Prices are in euros and are the listed asking prices, not quotes or valuations.
6. Be brief, two or three sentences is usually right. This is a chat panel, not a brochure.
7. Answer in the language the person writes in.
8. Never claim a property is available, reserved or sold. Availability changes; only a manager knows.
9. Write plainly. Do not use em dashes or en dashes in your replies. Use commas, full stops, or short sentences instead.

You are a helpful front desk, not a salesperson. If someone is close to a decision, offer to put them in touch with a manager.`;
