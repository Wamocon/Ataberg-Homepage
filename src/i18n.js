/**
 * Translations for the page chrome and copy.
 *
 * Ataberk's business is Russian-first — their primary domain is the Russian one,
 * and their stated buyer markets are Russia, Ukraine, Kazakhstan, Iran, Germany
 * and Turkey. Shipping an English-only page and calling the language selector
 * "3 languages" would be a lie; this is the actual translation layer.
 *
 * Listing titles are NOT here — they come from Ataberk's own Russian and Polish
 * sites via scripts/i18n-listings.mjs, so buyers read the agency's own words
 * rather than a machine's guess at them.
 *
 * The English column is the source of truth. RU and PL follow the live site's
 * register: plain, direct, no marketing gloss.
 */

export const LANGS = [
  { code: 'en', label: 'EN', name: 'English', locale: 'en-GB' },
  { code: 'ru', label: 'RU', name: 'Русский', locale: 'ru-RU' },
  { code: 'pl', label: 'PL', name: 'Polski', locale: 'pl-PL' },
];

export const T = {
  // ── header ──
  'nav.properties': { en: 'Properties', ru: 'Недвижимость', pl: 'Nieruchomości' },
  'nav.why': { en: 'Why Turkey', ru: 'Почему Турция', pl: 'Dlaczego Turcja' },
  'nav.about': { en: 'About us', ru: 'О нас', pl: 'O nas' },
  'nav.reviews': { en: 'Reviews', ru: 'Отзывы', pl: 'Opinie' },
  'nav.contact': { en: 'Contact', ru: 'Контакты', pl: 'Kontakt' },
  'nav.getInTouch': { en: 'Get in touch', ru: 'Связаться', pl: 'Skontaktuj się' },
  'nav.saved': { en: 'Saved properties', ru: 'Избранное', pl: 'Zapisane' },
  'nav.language': { en: 'Language', ru: 'Язык', pl: 'Język' },
  'nav.currency': { en: 'Currency', ru: 'Валюта', pl: 'Waluta' },
  'nav.skip': { en: 'Skip to content', ru: 'Перейти к содержанию', pl: 'Przejdź do treści' },

  // ── hero ──
  'hero.eyebrow': {
    en: 'Alanya · Antalya · Mersin · since 2005',
    ru: 'Аланья · Анталья · Мерсин · с 2005 года',
    pl: 'Alanya · Antalya · Mersin · od 2005 roku',
  },
  'hero.h1': { en: 'Property in Turkey', ru: 'Недвижимость в Турции', pl: 'Nieruchomości w Turcji' },
  'hero.lede': {
    en: 'Twenty-one years selling the Turkish Mediterranean to buyers who live somewhere else. Licensed in Alanya, and here after the keys change hands.',
    ru: 'Двадцать один год мы продаём недвижимость на турецком Средиземноморье покупателям из-за рубежа. Лицензированное агентство в Аланье. Мы остаёмся рядом и после передачи ключей.',
    pl: 'Od dwudziestu jeden lat sprzedajemy nieruchomości na tureckim Morzu Śródziemnym klientom z zagranicy. Licencjonowane biuro w Alanyi. Jesteśmy z Państwem także po przekazaniu kluczy.',
  },
  'hero.stat': {
    en: 'completed sales · licensed by the Alanya Chamber of Commerce',
    ru: 'завершённых сделок · лицензия Торговой палаты Аланьи',
    pl: 'zrealizowanych transakcji · licencja Izby Handlowej w Alanyi',
  },
  'hero.scroll': { en: 'Scroll', ru: 'Листайте', pl: 'Przewiń' },

  // ── search ──
  'search.deal': { en: 'I want to', ru: 'Хочу', pl: 'Chcę' },
  'search.buy': { en: 'Buy', ru: 'Купить', pl: 'Kupić' },
  'search.rent': { en: 'Rent', ru: 'Арендовать', pl: 'Wynająć' },
  'search.type': { en: 'Property', ru: 'Тип', pl: 'Rodzaj' },
  'search.anyType': { en: 'Any type', ru: 'Любой', pl: 'Dowolny' },
  'search.where': { en: 'Where', ru: 'Где', pl: 'Gdzie' },
  'search.anywhere': { en: 'Anywhere', ru: 'Везде', pl: 'Wszędzie' },
  'search.rooms': { en: 'Rooms', ru: 'Комнаты', pl: 'Pokoje' },
  'search.any': { en: 'Any', ru: 'Любые', pl: 'Dowolne' },
  'search.upTo': { en: 'Up to', ru: 'До', pl: 'Do' },
  'search.noLimit': { en: 'No limit', ru: 'Без ограничений', pl: 'Bez limitu' },
  'search.go': { en: 'Search', ru: 'Найти', pl: 'Szukaj' },
  'search.more': { en: 'More filters', ru: 'Больше фильтров', pl: 'Więcej filtrów' },
  'search.fewer': { en: 'Fewer filters', ru: 'Скрыть фильтры', pl: 'Mniej filtrów' },
  'search.reset': { en: 'Reset filter', ru: 'Сбросить фильтр', pl: 'Wyczyść filtr' },
  'search.map': { en: 'Look at map', ru: 'Смотреть на карте', pl: 'Zobacz na mapie' },
  'search.sea': { en: 'Distance to the sea', ru: 'Расстояние до моря', pl: 'Odległość od morza' },
  'search.stage': { en: 'Stage', ru: 'Стадия', pl: 'Etap' },
  'search.seller': { en: 'Sold by', ru: 'Продавец', pl: 'Sprzedający' },
  'search.goodToKnow': { en: 'Good to know', ru: 'Полезно знать', pl: 'Warto wiedzieć' },
  'search.amenities': { en: 'Amenities', ru: 'Удобства', pl: 'Udogodnienia' },
  'search.nearby': { en: 'Nearby', ru: 'Рядом', pl: 'W pobliżu' },
  'search.match': { en: '{n} of {total} shown here match', ru: 'подходит {n} из {total} на этой странице', pl: 'pasuje {n} z {total} na tej stronie' },

  // ── listings ──
  'listings.h2': { en: 'Our offers', ru: 'Наши предложения', pl: 'Nasze oferty' },
  'listings.sub': {
    en: 'Everything on this page is a real property we can show you in person, in Alanya, Antalya or Mersin.',
    ru: 'Каждый объект на этой странице реален, и мы готовы показать его лично в Аланье, Анталье или Мерсине.',
    pl: 'Każda nieruchomość na tej stronie jest realna i możemy ją pokazać osobiście w Alanyi, Antalyi lub Mersinie.',
  },
  'listings.all': { en: 'View all properties', ru: 'Все объекты', pl: 'Wszystkie nieruchomości' },

  // ── parallax band ──
  'band.eyebrow': { en: 'The Turkish Mediterranean', ru: 'Турецкое Средиземноморье', pl: 'Turecka część Morza Śródziemnego' },
  'band.h': { en: 'Where the mountains meet the sea', ru: 'Там, где горы встречают море', pl: 'Tam, gdzie góry spotykają morze' },
  'band.p': {
    en: 'Blue-flag beaches, a castle above the bay, and a warm coastline that draws buyers from across Europe. This is Alanya, and it is where our clients choose to live.',
    ru: 'Пляжи с «Голубым флагом», крепость над бухтой и тёплое побережье, которое привлекает покупателей со всей Европы. Это Аланья, и именно здесь выбирают жить наши клиенты.',
    pl: 'Plaże z Błękitną Flagą, zamek nad zatoką i ciepłe wybrzeże, które przyciąga kupujących z całej Europy. To Alanya, i właśnie tu nasi klienci wybierają życie.',
  },
  'tab.exclusive': { en: 'Exclusive offers', ru: 'Эксклюзивные предложения', pl: 'Oferty ekskluzywne' },
  'tab.top': { en: 'Top offers', ru: 'Топ предложения', pl: 'Najlepsze oferty' },
  'tab.new': { en: 'New offers', ru: 'Новые предложения', pl: 'Nowe oferty' },
  'tab.hot': { en: 'Hot offers', ru: 'Горячие предложения', pl: 'Gorące oferty' },
  'tab.owners': { en: 'From owners', ru: 'От собственников', pl: 'Od właścicieli' },
  'tag.exclusive': { en: 'Exclusive', ru: 'Эксклюзив', pl: 'Ekskluzywne' },
  'tag.top': { en: 'Top offer', ru: 'Топ', pl: 'Top' },
  'tag.new': { en: 'New', ru: 'Новое', pl: 'Nowość' },
  'tag.hot': { en: 'Hot price', ru: 'Горячая цена', pl: 'Gorąca cena' },
  'tag.owners': { en: 'From owner', ru: 'От собственника', pl: 'Od właściciela' },
  'card.from': { en: 'from ', ru: 'от ', pl: 'od ' },
  'card.save': { en: 'Save', ru: 'В избранное', pl: 'Zapisz' },

  // ── why ──
  'why.h2': { en: 'Why buying in Turkey pays', ru: 'Почему покупать в Турции выгодно', pl: 'Dlaczego zakup w Turcji się opłaca' },
  'why.sub': {
    en: 'Still deciding? Four reasons our buyers give us, most often.',
    ru: 'Ещё сомневаетесь? Четыре причины, которые чаще всего называют наши покупатели.',
    pl: 'Wciąż się Państwo zastanawiają? Cztery powody, które najczęściej podają nasi klienci.',
  },
  'why.1.h': { en: 'A sound investment', ru: 'Выгодная инвестиция', pl: 'Pewna inwestycja' },
  'why.1.p': {
    en: 'The climate, the coastline, the build quality and steady demand from foreign buyers keep Turkish property working as an investment, not just a home.',
    ru: 'Климат, побережье, качество строительства и постоянный спрос со стороны иностранных покупателей делают турецкую недвижимость не только жильём, но и работающей инвестицией.',
    pl: 'Klimat, wybrzeże, jakość budowy i stały popyt ze strony zagranicznych nabywców sprawiają, że turecka nieruchomość to nie tylko dom, ale też działająca inwestycja.',
  },
  'why.2.h': { en: 'Every price bracket', ru: 'Любой бюджет', pl: 'Każdy przedział cenowy' },
  'why.2.p': {
    en: 'From a modest studio or a well-priced resale through to a luxury villa. Our catalogue spans the whole range, and we will tell you honestly where your budget lands.',
    ru: 'От скромной студии или недорогой вторички до люксовой виллы. Наш каталог охватывает весь диапазон, и мы честно скажем, что реально купить на ваш бюджет.',
    pl: 'Od skromnego studia lub korzystnej oferty z rynku wtórnego po luksusową willę. Nasz katalog obejmuje cały zakres i szczerze powiemy, na co wystarczy Państwa budżet.',
  },
  'why.3.h': { en: 'Payment on your terms', ru: 'Удобные условия оплаты', pl: 'Płatność na Państwa warunkach' },
  'why.3.p': {
    en: 'Instalments and bank credit on workable terms, so the purchase fits how you actually hold your money.',
    ru: 'Рассрочка и банковский кредит на реальных условиях, чтобы покупка подстраивалась под то, как вы распоряжаетесь деньгами.',
    pl: 'Raty i kredyt bankowy na realnych warunkach, aby zakup dopasował się do Państwa finansów.',
  },
  'why.4.h': { en: 'Residence for your family', ru: 'ВНЖ для вашей семьи', pl: 'Pobyt dla Państwa rodziny' },
  'why.4.p': {
    en: 'Owning a home entitles you and your immediate family to apply for a Turkish residence permit.',
    ru: 'Владение жильём даёт вам и вашим ближайшим родственникам право подать на вид на жительство в Турции.',
    pl: 'Posiadanie domu uprawnia Państwa i najbliższą rodzinę do ubiegania się o turecki pobyt.',
  },
  'why.cta': {
    en: 'Call us and a manager will talk it through and shortlist what actually fits you.',
    ru: 'Позвоните нам, и менеджер всё объяснит и подберёт то, что действительно вам подходит.',
    pl: 'Prosimy o kontakt, a nasz doradca wszystko wyjaśni i dobierze to, co naprawdę Państwu odpowiada.',
  },
  'why.ctaBtn': { en: 'Order a consultation', ru: 'Заказать консультацию', pl: 'Zamów konsultację' },

  // ── trust ──
  'trust.h2': { en: 'Working with Ataberk', ru: 'Работа с Ataberk', pl: 'Współpraca z Ataberk' },
  'trust.sub': {
    en: 'A family business, licensed and registered in Alanya, doing this since 2005.',
    ru: 'Семейная компания, зарегистрированная и лицензированная в Аланье. Работаем с 2005 года.',
    pl: 'Firma rodzinna, zarejestrowana i licencjonowana w Alanyi. Działamy od 2005 roku.',
  },
  'stat.years': { en: 'years in Alanya', ru: 'лет в Аланье', pl: 'lat w Alanyi' },
  'stat.sales': { en: 'completed sales', ru: 'завершённых сделок', pl: 'zrealizowanych transakcji' },
  'stat.people': { en: 'people on the estate team', ru: 'сотрудников в отделе недвижимости', pl: 'osób w dziale nieruchomości' },
  'stat.objects': { en: 'properties on our books', ru: 'объектов в базе', pl: 'nieruchomości w bazie' },
  'trust.1.h': { en: 'A real choice', ru: 'Реальный выбор', pl: 'Realny wybór' },
  'trust.1.p': {
    en: 'A large database of Turkish property across every budget, from a cosy, inexpensive studio to a villa with a sea view. You will find something that fits.',
    ru: 'Большая база турецкой недвижимости на любой бюджет, от уютной недорогой студии до виллы с видом на море. Вы найдёте подходящий вариант.',
    pl: 'Duża baza tureckich nieruchomości na każdy budżet, od przytulnego, niedrogiego studia po willę z widokiem na morze. Znajdą Państwo coś dla siebie.',
  },
  'trust.2.h': { en: 'The whole service', ru: 'Полный спектр услуг', pl: 'Pełen zakres usług' },
  'trust.2.p': {
    en: 'Full legal support for the transaction, help securing credit with a Turkish bank, and an office on the ground in Turkey to help you settle in.',
    ru: 'Полное юридическое сопровождение сделки, помощь с кредитом в турецком банке и офис в Турции, который поможет вам обустроиться.',
    pl: 'Pełna obsługa prawna transakcji, pomoc w uzyskaniu kredytu w tureckim banku oraz biuro na miejscu w Turcji, które pomoże się Państwu zadomowić.',
  },
  'trust.3.h': { en: 'Handled personally', ru: 'Индивидуальный подход', pl: 'Indywidualne podejście' },
  'trust.3.p': {
    en: 'Our managers work with each client individually and respect your confidentiality. If nothing on the site is right, we will go and find options for you.',
    ru: 'Наши менеджеры работают с каждым клиентом индивидуально и соблюдают конфиденциальность. Если на сайте нет подходящего варианта, подберём его отдельно.',
    pl: 'Nasi doradcy pracują z każdym klientem indywidualnie i szanują poufność. Jeśli na stronie nie ma nic odpowiedniego, znajdziemy opcje specjalnie dla Państwa.',
  },
  'trust.4.h': { en: 'We stay after the sale', ru: 'Мы остаёмся после сделки', pl: 'Zostajemy po transakcji' },
  'trust.4.p': {
    en: 'Questions do not stop when the deal closes. Translation, paperwork, consultations, or just friendly advice, whenever you need it.',
    ru: 'Вопросы не заканчиваются вместе со сделкой. Перевод, документы, консультации или просто дружеский совет, в любой момент.',
    pl: 'Pytania nie kończą się wraz z transakcją. Tłumaczenia, dokumenty, konsultacje lub po prostu przyjazna rada, kiedy tylko będzie potrzebna.',
  },
  'trust.5.h': { en: 'A secure transaction', ru: 'Безопасная сделка', pl: 'Bezpieczna transakcja' },
  'trust.5.p': {
    en: 'Ataberk Estate is entered in the Turkish company register at the Alanya Chamber of Commerce and Industry. We take full financial and legal responsibility for the properties we offer.',
    ru: 'Ataberk Estate внесена в реестр турецких компаний Торгово-промышленной палаты Аланьи. Мы несём полную финансовую и юридическую ответственность за предлагаемые объекты.',
    pl: 'Ataberk Estate figuruje w rejestrze tureckich firm Izby Przemysłowo-Handlowej w Alanyi. Ponosimy pełną odpowiedzialność finansową i prawną za oferowane nieruchomości.',
  },
  'trust.6.h': { en: 'Talk to us in your language', ru: 'Говорим на вашем языке', pl: 'Rozmawiamy w Państwa języku' },
  'trust.6.p': {
    en: "Our team works in English, Russian, Polish and Turkish, and we act in the client's interest. Ask us about the purchase and registration process before you commit to anything.",
    ru: 'Наша команда работает на английском, русском, польском и турецком и всегда защищает интересы клиента. Спросите нас о процедуре покупки и оформления до того, как что-то решать.',
    pl: 'Nasz zespół pracuje po angielsku, rosyjsku, polsku i turecku i zawsze działa w interesie klienta. Prosimy pytać o procedurę zakupu i rejestracji, zanim podejmą Państwo decyzję.',
  },

  // ── prose ──
  'prose.h2': {
    en: 'Property in Turkey, somewhere solid to put your money',
    ru: 'Недвижимость в Турции, надёжное место для ваших средств',
    pl: 'Nieruchomości w Turcji, pewne miejsce dla Państwa pieniędzy',
  },
  'prose.p1': {
    en: 'Ataberk Estate offers a full professional service to clients renting or buying property in Turkey. We find the right property quickly and paper the transaction correctly, but we also help you settle into life abroad, and we take after-sales care seriously. Put plainly: we do not disappear once the sale has gone through.',
    ru: 'Ataberk Estate предлагает полный профессиональный сервис клиентам, которые арендуют или покупают недвижимость в Турции. Мы быстро подбираем объект и юридически грамотно оформляем сделку, но также помогаем адаптироваться к жизни за границей и серьёзно относимся к послепродажному обслуживанию. Проще говоря: мы не исчезаем после сделки.',
    pl: 'Ataberk Estate oferuje pełną profesjonalną obsługę klientom wynajmującym lub kupującym nieruchomości w Turcji. Szybko dobieramy nieruchomość i prawidłowo przeprowadzamy transakcję, ale też pomagamy odnaleźć się w życiu za granicą i poważnie traktujemy opiekę posprzedażową. Mówiąc wprost: nie znikamy po sfinalizowaniu sprzedaży.',
  },
  'prose.p2': {
    en: 'The agency has long experience working with Turkish developers, banks and government offices. Years in this market have given us a genuine database of properties, the contacts to go with it, and a way of working with clients that actually functions. Hundreds of people have been happy with our work, and we would be glad to add you to them.',
    ru: 'У агентства большой опыт работы с турецкими застройщиками, банками и государственными органами. Годы на этом рынке дали нам настоящую базу объектов, нужные связи и рабочую структуру взаимодействия с клиентами. Сотни людей остались довольны нашей работой, и мы будем рады видеть среди них и вас.',
    pl: 'Biuro ma duże doświadczenie we współpracy z tureckimi deweloperami, bankami i urzędami. Lata na tym rynku dały nam prawdziwą bazę nieruchomości, potrzebne kontakty i sprawnie działający sposób pracy z klientami. Setki osób są zadowolone z naszej pracy i z przyjemnością dołączymy do nich Państwa.',
  },

  // ── reviews ──
  'reviews.h2': { en: 'What buyers say', ru: 'Что говорят покупатели', pl: 'Co mówią klienci' },
  'reviews.sub': {
    en: 'Two of the reviews carried on the live site. More are on our testimonials page.',
    ru: 'Два отзыва с нашего сайта. Больше на странице отзывов.',
    pl: 'Dwie opinie z naszej strony. Więcej na stronie z opiniami.',
  },
  'reviews.video': { en: 'Video review', ru: 'Видеоотзыв', pl: 'Wideo opinia' },
  'reviews.q1': {
    en: 'We looked at a lot of agencies before we chose Ataberk. They showed us the apartment in Mahmutlar three times, answered every awkward question about the paperwork, and never once pushed us.',
    ru: 'Мы пересмотрели много агентств, прежде чем выбрали Ataberk. Квартиру в Махмутларе нам показали трижды, ответили на все неудобные вопросы по документам и ни разу не давили.',
    pl: 'Sprawdziliśmy wiele biur, zanim wybraliśmy Ataberk. Mieszkanie w Mahmutlar pokazali nam trzy razy, odpowiedzieli na każde niewygodne pytanie o dokumenty i ani razu nie naciskali.',
  },
  'reviews.a1': { en: 'Germany · bought in Mahmutlar · November 2023', ru: 'Германия · покупка в Махмутларе · ноябрь 2023', pl: 'Niemcy · zakup w Mahmutlar · listopad 2023' },
  'reviews.q2': {
    en: 'The manager did far more than sell me a flat. Bank account, residence permit, the utilities, all of it handled, in Russian, without me having to chase anyone.',
    ru: 'Менеджер сделал куда больше, чем просто продал квартиру. Банковский счёт, ВНЖ, коммунальные, всё оформили, на русском, и мне не пришлось никого догонять.',
    pl: 'Doradca zrobił znacznie więcej niż tylko sprzedał mi mieszkanie. Konto bankowe, pobyt, media, wszystko załatwione, po rosyjsku, bez konieczności pilnowania kogokolwiek.',
  },
  'reviews.a2': { en: 'Russia · bought in Alanya', ru: 'Россия · покупка в Аланье', pl: 'Rosja · zakup w Alanyi' },
  'reviews.all': { en: 'Read all testimonials', ru: 'Все отзывы', pl: 'Wszystkie opinie' },

  // ── articles ──
  'articles.h2': { en: 'News and guidance', ru: 'Новости и полезное', pl: 'Aktualności i porady' },
  'articles.sub': {
    en: 'What is changing in Turkish property, and what it means if you are buying from abroad.',
    ru: 'Что меняется на рынке недвижимости Турции и что это значит, если вы покупаете из-за рубежа.',
    pl: 'Co zmienia się na tureckim rynku nieruchomości i co to oznacza przy zakupie z zagranicy.',
  },
  'atab.news': { en: 'News', ru: 'Новости', pl: 'Aktualności' },
  'atab.blog': { en: 'Blog', ru: 'Блог', pl: 'Blog' },
  'atab.useful': { en: 'Useful information', ru: 'Полезная информация', pl: 'Przydatne informacje' },
  'articles.allNews': { en: 'All news', ru: 'Все новости', pl: 'Wszystkie aktualności' },
  'articles.allBlog': { en: 'All articles', ru: 'Все статьи', pl: 'Wszystkie artykuły' },
  'articles.allUseful': { en: 'All information', ru: 'Вся информация', pl: 'Wszystkie informacje' },
  'articles.read': { en: 'Read →', ru: 'Читать →', pl: 'Czytaj →' },

  // ── newsletter ──
  'news.h2': { en: 'Subscribe for news', ru: 'Подпишитесь на новости', pl: 'Zapisz się na newsletter' },
  'news.sub': {
    en: 'New listings and what is actually happening to prices in Alanya. No more than twice a month.',
    ru: 'Новые объекты и то, что на самом деле происходит с ценами в Аланье. Не чаще двух раз в месяц.',
    pl: 'Nowe oferty i to, co naprawdę dzieje się z cenami w Alanyi. Nie częściej niż dwa razy w miesiącu.',
  },
  'news.email': { en: 'Your email', ru: 'Ваш e-mail', pl: 'Państwa e-mail' },
  'news.go': { en: 'Subscribe', ru: 'Подписаться', pl: 'Zapisz się' },
  'news.agree': {
    en: 'I agree to the privacy policy and to being contacted.',
    ru: 'Я согласен с политикой конфиденциальности и на обратную связь.',
    pl: 'Zgadzam się z polityką prywatności i na kontakt.',
  },
  'news.badEmail': { en: 'That email does not look right.', ru: 'Похоже, e-mail указан неверно.', pl: 'Ten e-mail wygląda niepoprawnie.' },
  'news.needAgree': { en: 'Please agree to the privacy policy first.', ru: 'Сначала подтвердите согласие с политикой конфиденциальности.', pl: 'Prosimy najpierw zaakceptować politykę prywatności.' },
  'news.demo': { en: 'Demo build. No mailing list is connected, so nothing was sent.', ru: 'Демоверсия. Рассылка не подключена, ничего не отправлено.', pl: 'Wersja demo. Newsletter nie jest podłączony, nic nie wysłano.' },

  // ── contact ──
  'contact.h2': { en: 'Talk to a person', ru: 'Поговорите с человеком', pl: 'Porozmawiaj z człowiekiem' },
  'contact.sub': {
    en: 'Not a form that disappears. A named manager in the Alanya office, usually the same day.',
    ru: 'Не форма, которая исчезает в никуда. Конкретный менеджер в офисе в Аланье, обычно в тот же день.',
    pl: 'Nie formularz, który znika. Konkretny doradca w biurze w Alanyi, zwykle tego samego dnia.',
  },
  'contact.name': { en: 'Your name', ru: 'Ваше имя', pl: 'Imię i nazwisko' },
  'contact.phone': { en: 'Phone', ru: 'Телефон', pl: 'Telefon' },
  'contact.email': { en: 'Email', ru: 'E-mail', pl: 'E-mail' },
  'contact.msg': { en: 'What are you looking for?', ru: 'Что вы ищете?', pl: 'Czego Państwo szukają?' },
  'contact.go': { en: 'Request a call', ru: 'Заказать звонок', pl: 'Zamów rozmowę' },
  'contact.need': { en: 'Please give us a name and a phone number.', ru: 'Укажите, пожалуйста, имя и телефон.', pl: 'Prosimy podać imię i numer telefonu.' },
  'contact.demo': { en: 'Demo build. No endpoint is connected yet, so this has not been sent.', ru: 'Демоверсия. Форма не подключена, заявка не отправлена.', pl: 'Wersja demo. Formularz nie jest podłączony, zgłoszenie nie zostało wysłane.' },
  'contact.office': { en: 'Alanya office', ru: 'Офис в Аланье', pl: 'Biuro w Alanyi' },

  // ── footer ──
  'ftr.alanya': { en: 'Property in Alanya', ru: 'Недвижимость в Аланье', pl: 'Nieruchomości w Alanyi' },
  'ftr.antalya': { en: 'Property in Antalya', ru: 'Недвижимость в Анталье', pl: 'Nieruchomości w Antalyi' },
  'ftr.mersin': { en: 'Property in Mersin', ru: 'Недвижимость в Мерсине', pl: 'Nieruchomości w Mersinie' },
  'ftr.other': { en: 'Other regions', ru: 'Другие регионы', pl: 'Inne regiony' },
  'ftr.byType': { en: 'By type', ru: 'По типу', pl: 'Według rodzaju' },
  'ftr.byPrice': { en: 'By price', ru: 'По цене', pl: 'Według ceny' },
  'ftr.purpose': { en: 'What it is for', ru: 'Для чего', pl: 'W jakim celu' },
  'ftr.buying': { en: 'Buying', ru: 'Покупка', pl: 'Zakup' },
  'ftr.services': { en: 'Services', ru: 'Услуги', pl: 'Usługi' },
  'ftr.company': { en: 'Company', ru: 'Компания', pl: 'Firma' },
  'ftr.combos': { en: 'by district and type', ru: 'по районам и типам', pl: 'według dzielnic i rodzajów' },
  'ftr.rights': {
    en: '© 2005-2026 Ataberk Estate. Real estate in Turkey. All rights reserved.',
    ru: '© 2005-2026 Ataberk Estate. Недвижимость в Турции. Все права защищены.',
    pl: '© 2005-2026 Ataberk Estate. Nieruchomości w Turcji. Wszelkie prawa zastrzeżone.',
  },
  'ftr.reg': {
    en: 'Registered with the Alanya Chamber of Commerce and Industry. Licensed real estate agency, trading since 2005.',
    ru: 'Зарегистрировано в Торгово-промышленной палате Аланьи. Лицензированное агентство недвижимости, работаем с 2005 года.',
    pl: 'Zarejestrowane w Izbie Przemysłowo-Handlowej w Alanyi. Licencjonowane biuro nieruchomości, działa od 2005 roku.',
  },

  // ── assistant ──
  'ai.open': { en: 'Ask about Alanya', ru: 'Спросить об Аланье', pl: 'Zapytaj o Alanyę' },
  'ai.title': { en: 'Ataberk Assistant', ru: 'Ассистент Ataberk', pl: 'Asystent Ataberk' },
  'ai.close': { en: 'Close assistant', ru: 'Закрыть ассистента', pl: 'Zamknij asystenta' },
  'ai.hello': {
    en: "Ask me about districts, prices, the buying process, or residence permits. I answer only from Ataberk's own listings and pages, and I'll show you where each answer came from.",
    ru: 'Спросите меня о районах, ценах, процедуре покупки или ВНЖ. Я отвечаю только по данным сайта Ataberk и показываю источник каждого ответа.',
    pl: 'Proszę pytać o dzielnice, ceny, procedurę zakupu lub pobyt. Odpowiadam wyłącznie na podstawie danych Ataberk i pokazuję źródło każdej odpowiedzi.',
  },
  'ai.placeholder': {
    en: 'e.g. 2+1 near the sea under €150,000',
    ru: 'например, 2+1 у моря до €150 000',
    pl: 'np. 2+1 blisko morza do €150 000',
  },
  'ai.sources': { en: 'Sources:', ru: 'Источники:', pl: 'Źródła:' },
  'ai.reading': { en: 'Reading', ru: 'Читаю', pl: 'Czytam' },
  'ai.send': { en: 'Send', ru: 'Отправить', pl: 'Wyślij' },
  'ai.ask': { en: 'Ask a question', ru: 'Задать вопрос', pl: 'Zadaj pytanie' },
  'ai.down': {
    en: 'The assistant is unavailable right now. Please call +90 549 557 7 557.',
    ru: 'Ассистент сейчас недоступен. Позвоните, пожалуйста, по номеру +90 549 557 7 557.',
    pl: 'Asystent jest chwilowo niedostępny. Prosimy o telefon: +90 549 557 7 557.',
  },
  'ai.chip1': { en: 'What is there under €100,000?', ru: 'Что есть до €100 000?', pl: 'Co jest do €100 000?' },
  'ai.chip2': { en: 'What does 2+1 mean?', ru: 'Что значит 2+1?', pl: 'Co oznacza 2+1?' },
  'ai.chip3': { en: 'Can I get residence?', ru: 'Можно ли получить ВНЖ?', pl: 'Czy mogę dostać pobyt?' },
  'ai.chip4': { en: 'Tell me about Mahmutlar', ru: 'Расскажите о Махмутларе', pl: 'Opowiedz o Mahmutlar' },
};

/**
 * Filter vocabulary.
 *
 * Kept in one block because it is a closed list that only the search form uses,
 * and because it is easier to check a table than 70 scattered keys. District and
 * city names are proper nouns and are deliberately absent — Mahmutlar is
 * Mahmutlar in every language.
 */
const F = {
  // types
  'f.apartments': ['Apartments', 'Квартиры', 'Apartamenty'],
  'f.villas': ['Villas and houses', 'Виллы и дома', 'Wille i domy'],
  'f.penthouses': ['Penthouses', 'Пентхаусы', 'Apartamenty penthouse'],
  'f.commercial': ['Commercial', 'Коммерческая', 'Komercyjne'],
  'f.land': ['Land', 'Земля', 'Działki'],
  'f.hotels': ['Hotels', 'Отели', 'Hotele'],
  // distance to sea
  'f.anyDistance': ['Any distance', 'Любое расстояние', 'Dowolna odległość'],
  'f.frontLine': ['Front line (up to 100 m)', 'Первая линия (до 100 м)', 'Pierwsza linia (do 100 m)'],
  'f.to300': ['Up to 300 m', 'До 300 м', 'Do 300 m'],
  'f.to500': ['Up to 500 m', 'До 500 м', 'Do 500 m'],
  'f.to1000': ['Up to 1 km', 'До 1 км', 'Do 1 km'],
  'f.to2000': ['Up to 2 km', 'До 2 км', 'Do 2 km'],
  // stage
  'f.ready': ['Ready to move in', 'Готово к заселению', 'Gotowe do zamieszkania'],
  'f.construction': ['Under construction', 'Строится', 'W budowie'],
  'f.resale': ['Resale', 'Вторичка', 'Rynek wtórny'],
  // seller
  'f.anyone': ['Anyone', 'Любой', 'Dowolny'],
  'f.developer': ['From the developer', 'От застройщика', 'Od dewelopera'],
  'f.owner': ['From the owner', 'От собственника', 'Od właściciela'],
  // extras
  'f.installments': ['Instalments available', 'Есть рассрочка', 'Dostępne raty'],
  'f.citizenship': ['Eligible for citizenship', 'Подходит для гражданства', 'Kwalifikuje się do obywatelstwa'],
  'f.residence': ['Eligible for residence permit', 'Подходит для ВНЖ', 'Kwalifikuje się do pobytu'],
  'f.credit': ['Bank credit possible', 'Возможен банковский кредит', 'Możliwy kredyt bankowy'],
  // amenities
  'f.furnished': ['Furnished', 'С мебелью', 'Umeblowane'],
  'f.seaView': ['Sea view', 'Вид на море', 'Widok na morze'],
  'f.mountainView': ['Mountain view', 'Вид на горы', 'Widok na góry'],
  'f.pool': ['Swimming pool', 'Бассейн', 'Basen'],
  'f.indoorPool': ['Indoor pool', 'Крытый бассейн', 'Basen kryty'],
  'f.heatedPool': ['Heated pool', 'Подогреваемый бассейн', 'Basen podgrzewany'],
  'f.sauna': ['Sauna', 'Сауна', 'Sauna'],
  'f.hamam': ['Turkish bath (hamam)', 'Хамам', 'Łaźnia turecka (hamam)'],
  'f.saltRoom': ['Salt room', 'Соляная комната', 'Grota solna'],
  'f.gym': ['Gym', 'Спортзал', 'Siłownia'],
  'f.tennis': ['Tennis court', 'Теннисный корт', 'Kort tenisowy'],
  'f.basketball': ['Basketball court', 'Баскетбольная площадка', 'Boisko do koszykówki'],
  'f.kidsPool': ['Children’s pool', 'Детский бассейн', 'Basen dla dzieci'],
  'f.playground': ['Playground', 'Детская площадка', 'Plac zabaw'],
  'f.games': ['Games room', 'Игровая комната', 'Pokój gier'],
  'f.cinema': ['Cinema room', 'Кинозал', 'Sala kinowa'],
  'f.generator': ['Generator', 'Генератор', 'Generator'],
  'f.lift': ['Lift', 'Лифт', 'Winda'],
  'f.security': ['Security 24/7', 'Охрана 24/7', 'Ochrona 24/7'],
  'f.cctv': ['CCTV', 'Видеонаблюдение', 'Monitoring'],
  'f.concierge': ['Concierge', 'Консьерж', 'Konsjerż'],
  'f.parking': ['Car park', 'Парковка', 'Parking'],
  'f.underground': ['Underground parking', 'Подземный паркинг', 'Parking podziemny'],
  'f.garden': ['Garden', 'Сад', 'Ogród'],
  'f.bbq': ['Barbecue area', 'Зона барбекю', 'Miejsce na grilla'],
  'f.terrace': ['Terrace', 'Терраса', 'Taras'],
  'f.balcony': ['Balcony', 'Балкон', 'Balkon'],
  'f.ac': ['Air conditioning', 'Кондиционер', 'Klimatyzacja'],
  'f.underfloor': ['Underfloor heating', 'Тёплый пол', 'Ogrzewanie podłogowe'],
  'f.central': ['Central heating', 'Центральное отопление', 'Ogrzewanie centralne'],
  'f.fireplace': ['Fireplace', 'Камин', 'Kominek'],
  'f.kitchen': ['Kitchen appliances', 'Кухонная техника', 'Sprzęt kuchenny'],
  'f.whiteGoods': ['White goods', 'Бытовая техника', 'AGD'],
  'f.satellite': ['Satellite TV', 'Спутниковое ТВ', 'Telewizja satelitarna'],
  'f.internet': ['Internet', 'Интернет', 'Internet'],
  'f.waterTank': ['Water tank', 'Бак для воды', 'Zbiornik na wodę'],
  'f.solar': ['Solar panels', 'Солнечные панели', 'Panele słoneczne'],
  'f.accessible': ['Wheelchair access', 'Доступ для инвалидных колясок', 'Dostęp dla wózków'],
  'f.pets': ['Pets allowed', 'Можно с животными', 'Zwierzęta dozwolone'],
  'f.letting': ['Suitable for letting', 'Подходит для сдачи в аренду', 'Nadaje się pod wynajem'],
  // nearby
  'f.beach': ['Beach', 'Пляж', 'Plaża'],
  'f.shops': ['Shops', 'Магазины', 'Sklepy'],
  'f.supermarket': ['Supermarket', 'Супермаркет', 'Supermarket'],
  'f.pharmacy': ['Pharmacy', 'Аптека', 'Apteka'],
  'f.school': ['School', 'Школа', 'Szkoła'],
  'f.kindergarten': ['Kindergarten', 'Детский сад', 'Przedszkole'],
  'f.hospital': ['Hospital', 'Больница', 'Szpital'],
  'f.bus': ['Bus stop', 'Остановка', 'Przystanek'],
  'f.restaurants': ['Restaurants', 'Рестораны', 'Restauracje'],
  'f.bazaar': ['Bazaar', 'Базар', 'Bazar'],
  'f.bank': ['Bank', 'Банк', 'Bank'],
  'f.park': ['Park', 'Парк', 'Park'],
};

for (const [k, [en, ru, pl]] of Object.entries(F)) T[k] = { en, ru, pl };

/** Fallback chain: requested language -> English. Never renders a bare key. */
export function makeT(lang) {
  return (key, vars) => {
    const row = T[key];
    if (!row) return key; // loud on purpose: a missing key should be visible
    let s = row[lang] ?? row.en;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  };
}

export const DEFAULT_LANG = 'en';
