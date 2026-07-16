import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const outDir = path.resolve("categorizer");
fs.mkdirSync(outDir, { recursive: true });

const categories = {
  salary: { label_uk: "Доходи", label_en: "Salary", group: "income" },
  transfer: { label_uk: "Перекази", label_en: "Transfers", group: "transfer" },
  cash: { label_uk: "Готівка", label_en: "Cash", group: "finance" },
  investment: { label_uk: "Інвестиції", label_en: "Investments", group: "finance" },
  crypto: { label_uk: "Криптовалюта", label_en: "Crypto", group: "finance" },
  finance: { label_uk: "Фінанси", label_en: "Finance", group: "finance" },
  bank_fee: { label_uk: "Комісії банку", label_en: "Bank fees", group: "finance" },
  insurance: { label_uk: "Страхування", label_en: "Insurance", group: "finance" },
  taxes: { label_uk: "Податки", label_en: "Taxes", group: "government" },
  government: { label_uk: "Держпослуги", label_en: "Government", group: "government" },
  charity: { label_uk: "Благодійність", label_en: "Charity", group: "lifestyle" },
  supermarket: { label_uk: "Продукти", label_en: "Supermarket", group: "food" },
  groceries: { label_uk: "Бакалія", label_en: "Groceries", group: "food" },
  food: { label_uk: "Їжа", label_en: "Food", group: "food" },
  restaurant: { label_uk: "Ресторани", label_en: "Restaurants", group: "food" },
  fast_food: { label_uk: "Фастфуд", label_en: "Fast food", group: "food" },
  coffee: { label_uk: "Кава", label_en: "Coffee", group: "food" },
  bar: { label_uk: "Бари", label_en: "Bars", group: "food" },
  delivery: { label_uk: "Доставка", label_en: "Delivery", group: "services" },
  transport: { label_uk: "Транспорт", label_en: "Transport", group: "mobility" },
  taxi: { label_uk: "Таксі", label_en: "Taxi", group: "mobility" },
  fuel: { label_uk: "Пальне", label_en: "Fuel", group: "mobility" },
  parking: { label_uk: "Паркування", label_en: "Parking", group: "mobility" },
  auto: { label_uk: "Авто", label_en: "Auto", group: "mobility" },
  repair: { label_uk: "Ремонт", label_en: "Repair", group: "services" },
  clothing: { label_uk: "Одяг", label_en: "Clothing", group: "shopping" },
  shoes: { label_uk: "Взуття", label_en: "Shoes", group: "shopping" },
  jewelry: { label_uk: "Прикраси", label_en: "Jewelry", group: "shopping" },
  shopping: { label_uk: "Покупки", label_en: "Shopping", group: "shopping" },
  retail: { label_uk: "Товари", label_en: "Retail", group: "shopping" },
  electronics: { label_uk: "Електроніка", label_en: "Electronics", group: "shopping" },
  marketplaces: { label_uk: "Маркетплейси", label_en: "Marketplaces", group: "shopping" },
  home: { label_uk: "Дім", label_en: "Home", group: "home" },
  housing: { label_uk: "Житло", label_en: "Housing", group: "home" },
  utilities: { label_uk: "Комунальні", label_en: "Utilities", group: "home" },
  utility: { label_uk: "Комунальні", label_en: "Utilities", group: "home" },
  telecom: { label_uk: "Зв'язок", label_en: "Telecom", group: "home" },
  beauty: { label_uk: "Краса", label_en: "Beauty", group: "health" },
  health: { label_uk: "Здоров'я", label_en: "Health", group: "health" },
  pharmacy: { label_uk: "Аптека", label_en: "Pharmacy", group: "health" },
  pets: { label_uk: "Тварини", label_en: "Pets", group: "lifestyle" },
  kids: { label_uk: "Діти", label_en: "Kids", group: "family" },
  education: { label_uk: "Освіта", label_en: "Education", group: "learning" },
  books: { label_uk: "Книги", label_en: "Books", group: "learning" },
  music: { label_uk: "Музика", label_en: "Music", group: "entertainment" },
  gaming: { label_uk: "Ігри", label_en: "Gaming", group: "entertainment" },
  streaming: { label_uk: "Стримінг", label_en: "Streaming", group: "entertainment" },
  subscription: { label_uk: "Підписки", label_en: "Subscriptions", group: "entertainment" },
  digital: { label_uk: "Цифрові сервіси", label_en: "Digital services", group: "digital" },
  cloud: { label_uk: "Хмарні сервіси", label_en: "Cloud", group: "digital" },
  entertainment: { label_uk: "Розваги", label_en: "Entertainment", group: "entertainment" },
  sport: { label_uk: "Спорт", label_en: "Sport", group: "lifestyle" },
  travel: { label_uk: "Подорожі", label_en: "Travel", group: "travel" },
  hotel: { label_uk: "Готелі", label_en: "Hotels", group: "travel" },
  flight: { label_uk: "Авіаквитки", label_en: "Flights", group: "travel" },
  other: { label_uk: "Інше", label_en: "Other", group: "unknown" },
  unknown: { label_uk: "Невідомо", label_en: "Unknown", group: "unknown" },
};

const merchantGroupsUa = [
  ["supermarket", "groceries", ["ATB", "АТБ", "Silpo", "Сільпо", "Fora", "Фора", "NOVUS", "VARUS", "Metro Cash & Carry", "Auchan", "Ашан", "Eco Market", "Еко Маркет", "Velmart", "Велмарт", "Tavria V", "Таврія В", "Thrash", "Trash!", "МегаМаркет", "Велика Кишеня", "Близенько", "Рукавичка", "Наш Край", "Коло", "SPAR Ukraine", "Фуршет", "Winetime", "GoodWine", "М'ясомаркет", "Молоко від фермера", "Делікатес маркет", "Le Silpo"]],
  ["electronics", "electronics", ["Rozetka", "Розетка", "Comfy", "Foxtrot", "Фокстрот", "Allo", "Алло", "MOYO", "Citrus", "Цитрус", "Brain", "Eldorado", "Ельдорадо", "iStore", "Ябко", "Stylus", "Telemart", "Touch", "KTC", "Ringoo", "Vodafone Store", "Kyivstar Store", "Lifecell Store", "Portativ", "MTA", "EStore", "ЖЖУК", "Tехно Їжак"]],
  ["fuel", "fuel", ["OKKO", "WOG", "SOCAR", "Shell", "KLO", "Ukrnafta", "Укрнафта", "BRSM", "БРСМ", "Motto", "UPG", "AMIC", "Avantage 7", "Glusco", "BVS", "Marshal", "ANP", "Авіас", "Олас", "Chipo", "Luxwen", "Parallel"]],
  ["restaurant", "restaurant", ["Puzata Hata", "Пузата Хата", "Mafia", "Celentano", "Salateira", "Casta", "Eurasia", "This is Pivbar", "Чорноморка", "Mister Cat", "Sushi Master", "Sushi Icons", "ЯпонаХата", "Євразія", "il Molino", "Milk Bar", "BAO", "Good Girl", "Honey", "Nam", "Musafir", "Ramen vs Marketing", "Veterano Pizza", "Tarantino Family", "First Line Group"]],
  ["fast_food", "fast_food", ["McDonald's", "McDonalds", "KFC", "Burger King", "Lviv Croissants", "Львівські Круасани", "Pizza Day", "Domino's Pizza", "Doner Market", "Menya Musashi", "Kebab Chef", "Shaurma", "FreshLine", "Aroma Kava Food"]],
  ["coffee", "coffee", ["Aroma Kava", "Арома Кава", "Lviv Coffee Manufacture", "Львівська майстерня шоколаду", "Idealist Coffee", "One Love Coffee", "Foundation Coffee", "Black Honey", "Blur Coffee", "Takava", "CoffeeDoor", "Gemini Espresso", "Svit Kavy"]],
  ["delivery", "postal", ["Nova Poshta", "Нова Пошта", "NovaPay", "Ukrposhta", "Укрпошта", "Meest", "Justin", "Delivery Auto", "SAT", "Нічний Експрес", "Intime", "DHL Ukraine", "FedEx Ukraine", "UPS Ukraine", "Rozetka Delivery"]],
  ["delivery", "food_delivery", ["Glovo", "Bolt Food", "Raketa", "Liki24", "Zakaz.ua", "MAUDAU", "Cooker", "Mister.Am", "Eda.ua"]],
  ["taxi", "taxi", ["Uklon", "Uber", "Bolt", "BlaBlaCar", "OnTaxi", "Shark Taxi", "838 Taxi", "Opti Taxi", "Taxi 309", "Bond Taxi"]],
  ["transport", "public_transport", ["Kyiv Digital", "Київ Цифровий", "EasyWay", "Eway", "Укрзалізниця", "UZ Gov", "УЗ", "Tickets.ua", "Busfor", "Infobus", "Ecolines", "FlixBus", "Leo Express", "SkyUp Bus", "Автостанція Київ"]],
  ["finance", "banking", ["Monobank", "Mono", "Universal Bank", "PrivatBank", "ПриватБанк", "Sense Bank", "Raiffeisen Bank", "OTP Bank", "PUMB", "ПУМБ", "A-Bank", "А-Банк", "Oschadbank", "Ощадбанк", "Ukrgasbank", "Укргазбанк", "Ukrsibbank", "Кредобанк", "ТАСкомбанк", "Sportbank", "izibank", "Neobank", "Concord Bank", "Idea Bank", "Credit Agricole", "Alfa Bank", "Райфайзен"]],
  ["home", "home_improvement", ["Epicentr", "Епіцентр", "Nova Linia", "Нова Лінія", "Jysk", "IKEA", "Leroy Merlin", "Oldi", "Agromat", "KeramaExpert", "Deco", "MebelOk", "MebelMarket", "Taburetka", "BRW", "Blest", "Мир Меблів", "Епіцентр К"]],
  ["beauty", "beauty", ["EVA", "Watsons", "Brocard", "Prostor", "Makeup", "Notino", "Bomond", "Лінія Краси", "Kiko Milano", "Sisters Aroma", "G.Bar", "Lazerhall", "Лазерхауз", "Barbershop Frisor", "Backstage", "Aldo Coppola"]],
  ["pharmacy", "pharmacy", ["ANC", "АНЦ", "Аптека 911", "Apteka 911", "Подорожник", "Podorozhnyk", "Бажаємо здоров'я", "Dobroho Dnia", "Аптека Доброго Дня", "Аптека Низьких Цін", "Аптека Копійка", "Аптека 3і", "Tabletki.ua", "Liki24", "Мед-Сервіс", "DS", "Аптека Шара", "Аптека оптових цін"]],
  ["pets", "pet_store", ["MasterZoo", "ZooBonus", "Зоолюкс", "Zootovary", "Pethouse", "Petslike", "Lapki", "E-Zoo", "Зооаптека", "ZooComplex"]],
  ["streaming", "video_streaming", ["Megogo", "SweetTV", "Київстар ТБ", "Volia TV", "Divan TV", "Takflix", "oll.tv"]],
  ["telecom", "mobile", ["Kyivstar", "Київстар", "Vodafone Ukraine", "Vodafone", "Lifecell", "Triolan", "Volia", "Воля", "Lanet", "Datagroup", "Укртелеком", "Tenet", "Fregat", "IPnet", "LocalNet", "Omega Telecom"]],
  ["utilities", "utilities", ["Yasno", "DTEK", "ДТЕК", "Naftogaz", "Нафтогаз", "Київводоканал", "Львівводоканал", "Харківводоканал", "Київтеплоенерго", "ЦКС Київ", "104.ua", "Gasolina Online", "ОСББ", "ЖЕК", "Комунальний сервіс"]],
  ["clothing", "clothing", ["ZARA", "Bershka", "Pull&Bear", "Stradivarius", "Massimo Dutti", "Oysho", "Reserved", "Sinsay", "Cropp", "House", "Intertop", "Answear", "MD Fashion", "LC Waikiki", "Colin's", "Vovk", "MustHave", "Goldi", "Arber", "Helen Marlen", "Symbol", "Walker", "Miraton", "Kachorovska", "Konfiskat", "Defacto", "New Yorker", "H&M", "Nike", "Adidas", "Puma", "Under Armour"]],
  ["marketplaces", "marketplaces", ["Prom.ua", "OLX", "Kasta", "Bigl.ua", "Shafa", "Crafta", "Zakupka", "Hotline", "Price.ua", "Epicentr Marketplace", "Rozetka Marketplace", "Allbiz", "Kabanchik"]],
  ["sport", "sport", ["Sportmaster", "Intersport", "Megasport", "Gorgany", "Extrem Style", "Decathlon Ukraine", "Veliki.ua", "Drive Sport", "Athletics", "4F Ukraine", "Arena Store"]],
  ["books", "books", ["Yakaboo", "Книгарня Є", "Book24", "Наш Формат", "Видавництво Старого Лева", "А-БА-БА-ГА-ЛА-МА-ГА", "Буква", "Лабораторія", "Readeat"]],
  ["health", "medical", ["Добробут", "Oxford Medical", "Медиком", "Into-Sana", "Сінево", "Synevo", "Діла", "Dila", "Ескулаб", "Ніколаб", "Adonis", "MedLife", "Ісіда", "ЛюміДент", "Astra Dent", "Оберіг"]],
  ["government", "government", ["Дія", "Diia", "ЦНАП", "ДП Документ", "МВС", "Мін'юст", "Судовий збір", "Штраф ПДР", "Електронний суд"]],
  ["charity", "charity", ["United24", "Повернись живим", "Come Back Alive", "Serhiy Prytula Foundation", "Фонд Притули", "Tabletochki", "UAnimals", "Razom for Ukraine", "Save Ukraine", "Hospitallers", "Карітас", "Червоний Хрест"]],
];

const merchantGroupsGlobal = [
  ["marketplaces", "marketplaces", ["Amazon", "Amazon Marketplace", "eBay", "AliExpress", "Alibaba", "Temu", "SHEIN", "Etsy", "Walmart", "Target", "Costco", "Sam's Club", "Best Buy", "Newegg", "Rakuten", "Mercado Libre", "Shopee", "Lazada", "Flipkart", "Tokopedia", "Jumia", "Wildberries", "Ozon"]],
  ["electronics", "technology", ["Apple", "Apple Store", "Google Store", "Samsung", "Sony", "Microsoft Store", "Dell", "HP", "Lenovo", "ASUS", "Acer", "Nintendo", "DJI", "Bose", "Sonos", "Logitech", "Garmin", "GoPro", "Canon", "Nikon", "B&H Photo", "Adorama"]],
  ["digital", "software", ["Apple.com/bill", "App Store", "Google", "OpenAI", "ChatGPT", "Anthropic", "Claude", "Microsoft", "Adobe", "Canva", "Figma", "Notion", "Evernote", "Dropbox", "Box", "Slack", "Zoom", "Atlassian", "Jira", "GitHub", "GitLab", "Bitbucket", "JetBrains", "1Password", "NordVPN", "Surfshark", "ExpressVPN", "Grammarly", "Miro", "Airtable", "Linear", "Asana", "Monday.com", "ClickUp", "Calendly", "Typeform", "Zapier", "Make", "n8n", "Replit", "Vercel", "Netlify"]],
  ["cloud", "cloud", ["AWS", "Amazon Web Services", "Google Cloud", "GCP", "Microsoft Azure", "DigitalOcean", "Hetzner", "Contabo", "OVHcloud", "Linode", "Akamai", "Cloudflare", "Heroku", "Render", "Supabase", "Firebase", "MongoDB Atlas", "PlanetScale", "Railway", "Namecheap", "GoDaddy", "Cloudways"]],
  ["streaming", "streaming", ["Netflix", "Spotify", "YouTube Premium", "YouTube", "Disney+", "Hulu", "HBO Max", "Max", "Apple TV", "Amazon Prime Video", "Prime Video", "Paramount+", "Peacock", "Twitch", "Deezer", "Tidal", "SoundCloud", "Audible", "Scribd", "Storytel", "Crunchyroll", "Mubi", "DAZN"]],
  ["gaming", "gaming", ["Steam", "Epic Games", "PlayStation Network", "Xbox", "Nintendo eShop", "GOG", "Battle.net", "Blizzard", "Riot Games", "EA", "Electronic Arts", "Ubisoft", "Roblox", "Minecraft", "Fortnite", "Wargaming", "World of Tanks", "Game Pass", "Nvidia GeForce Now"]],
  ["fast_food", "fast_food", ["McDonald's", "KFC", "Burger King", "Subway", "Taco Bell", "Wendy's", "Pizza Hut", "Domino's", "Papa Johns", "Chipotle", "Five Guys", "Popeyes", "Dunkin", "Krispy Kreme", "Jollibee", "Shake Shack", "In-N-Out Burger"]],
  ["coffee", "coffee", ["Starbucks", "Costa Coffee", "Caffe Nero", "Tim Hortons", "Peet's Coffee", "Pret A Manger", "Blue Bottle Coffee", "Dunkin Coffee", "Lavazza", "Illy"]],
  ["restaurant", "restaurant", ["Uber Eats", "DoorDash", "Deliveroo", "Just Eat", "Grubhub", "Wolt", "Foodpanda", "Zomato", "TheFork", "OpenTable", "Nando's", "TGI Fridays", "Hard Rock Cafe", "Olive Garden", "Cheesecake Factory"]],
  ["taxi", "taxi", ["Uber", "Bolt", "Lyft", "Free Now", "Cabify", "Grab", "Careem", "Yango", "DiDi", "Ola", "Gett"]],
  ["travel", "travel", ["Booking.com", "Airbnb", "Expedia", "Trip.com", "Tripadvisor", "GetYourGuide", "Klook", "Viator", "Omio", "Rome2Rio", "Rentalcars.com", "Hertz", "Avis", "Budget", "Sixt", "Enterprise", "Europcar"]],
  ["flight", "airlines", ["Ryanair", "Wizz Air", "LOT Polish Airlines", "Lufthansa", "Turkish Airlines", "Emirates", "Qatar Airways", "KLM", "Air France", "British Airways", "United Airlines", "Delta Air Lines", "American Airlines", "Air Canada", "Swiss", "Austrian Airlines", "Etihad", "Finnair", "Norwegian", "EasyJet", "Vueling", "Iberia", "SAS", "Aegean Airlines", "Pegasus Airlines"]],
  ["hotel", "hotels", ["Hilton", "Marriott", "Hyatt", "Accor", "Ibis", "Novotel", "Mercure", "Radisson", "Sheraton", "Ritz-Carlton", "Four Seasons", "Holiday Inn", "InterContinental", "Wyndham", "Best Western", "Motel One", "Premier Inn", "Scandic"]],
  ["finance", "payments", ["PayPal", "Wise", "Revolut", "Stripe", "Square", "Adyen", "Payoneer", "Skrill", "Neteller", "Western Union", "MoneyGram", "Remitly", "WorldRemit", "Paysend", "Klarna", "Afterpay", "Affirm", "Venmo", "Cash App", "Zelle", "N26", "Monzo", "Starling Bank", "Chime", "Robinhood", "Interactive Brokers", "Trading 212", "eToro", "Coinbase", "Binance", "Kraken", "Bybit", "OKX"]],
  ["clothing", "fashion", ["Zara", "H&M", "Uniqlo", "Mango", "Bershka", "Pull&Bear", "Stradivarius", "Massimo Dutti", "Nike", "Adidas", "Puma", "Reebok", "New Balance", "Under Armour", "ASOS", "Farfetch", "Net-a-Porter", "Mytheresa", "Nordstrom", "Macy's", "Primark", "Next", "Marks & Spencer", "Levi's", "Gap", "Old Navy", "Victoria's Secret", "Calvin Klein", "Tommy Hilfiger", "Ralph Lauren", "Patagonia", "The North Face", "Columbia", "Decathlon", "Lululemon", "Gymshark"]],
  ["beauty", "beauty", ["Sephora", "Ulta Beauty", "Douglas", "Notino", "Lookfantastic", "Cult Beauty", "Kiehl's", "MAC Cosmetics", "Lush", "The Body Shop", "Yves Rocher", "Bath & Body Works", "Glossier", "Charlotte Tilbury", "Dior Beauty", "Chanel Beauty"]],
  ["pharmacy", "pharmacy", ["CVS Pharmacy", "Walgreens", "Boots", "Rite Aid", "dm-drogerie markt", "Rossmann", "Superdrug", "Watsons", "Guardian Pharmacy", "Apotek Hjartat", "Apotheke", "DocMorris"]],
  ["health", "healthcare", ["Doctor On Demand", "Teladoc", "Zocdoc", "BetterHelp", "Headspace Health", "Calm", "Quest Diagnostics", "Labcorp", "Mayo Clinic", "Cleveland Clinic"]],
  ["home", "home", ["IKEA", "Leroy Merlin", "Home Depot", "Lowe's", "Wayfair", "JYSK", "OBI", "Bauhaus", "Castorama", "Kingfisher", "HomeGoods", "Bed Bath & Beyond", "West Elm", "Crate & Barrel", "Pottery Barn", "Zara Home", "H&M Home"]],
  ["sport", "sport", ["Decathlon", "Intersport", "Foot Locker", "JD Sports", "Sports Direct", "Dick's Sporting Goods", "REI", "Fanatics", "Strava", "Nike Run Club", "ClassPass", "Peloton", "MyFitnessPal"]],
  ["education", "education", ["Coursera", "Udemy", "edX", "Skillshare", "MasterClass", "Duolingo", "Babbel", "Busuu", "Lingoda", "Preply", "Italki", "Brilliant", "Khan Academy", "DataCamp", "Codecademy", "Pluralsight", "LinkedIn Learning", "Domestika"]],
  ["books", "books", ["Kindle", "Audible", "Book Depository", "Waterstones", "Barnes & Noble", "ThriftBooks", "Kobo", "Goodreads", "Storytel"]],
  ["pets", "pets", ["Petco", "PetSmart", "Chewy", "Zooplus", "Fressnapf", "Pets at Home", "Purina", "Royal Canin"]],
  ["utilities", "utilities", ["Vodafone", "Orange", "T-Mobile", "Verizon", "AT&T", "O2", "Three", "EE", "Deutsche Telekom", "Comcast", "Xfinity", "Spectrum", "BT", "Sky", "E.ON", "EDF", "Enel", "Iberdrola"]],
  ["charity", "charity", ["UNICEF", "Red Cross", "Doctors Without Borders", "MSF", "Save the Children", "WWF", "Greenpeace", "Amnesty International", "Wikipedia Donation", "GoFundMe", "Patreon", "Ko-fi", "Buy Me a Coffee"]],
];

function normalizeAlias(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’`]/g, "")
    .replace(/[^a-zа-яіїєґё0-9]+/giu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function aliasVariants(name) {
  const normalized = normalizeAlias(name);
  const compact = normalized.replace(/\s+/g, "");
  const variants = new Set([name, normalized, compact]);

  variants.add(normalized.replace(/\band\b/g, "&"));
  variants.add(normalized.replace(/\s+/g, "-"));
  variants.add(normalized.replace(/\s+/g, "."));
  variants.add(`${normalized} online`);
  variants.add(`${normalized} store`);
  variants.add(`${normalized} shop`);
  variants.add(`${normalized} app`);
  variants.add(`www ${normalized}`);
  variants.add(`www.${compact}`);
  variants.add(`${compact}.com`);
  variants.add(`${compact}.ua`);

  if (normalized.includes("mc donald")) variants.add("mcdonalds");
  if (normalized.includes("nova poshta")) variants.add("novaposhta");
  if (normalized.includes("apple com bill")) variants.add("apple.com/bill");
  if (normalized.includes("youtube premium")) variants.add("google youtube premium");
  if (normalized.includes("openai")) variants.add("chatgpt");

  return [...variants].filter(Boolean);
}

function buildMerchants(groups, locale) {
  const entries = [];
  const seen = new Set();

  for (const [category, subcategory, names] of groups) {
    for (const name of names) {
      const key = normalizeAlias(name);
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        name,
        category,
        subcategory,
        country: locale === "ua" ? "UA" : "GLOBAL",
        aliases: aliasVariants(name),
      });
    }
  }

  return {
    version: 1,
    locale,
    generated_from: "Curated real-world merchant list with generated spelling aliases.",
    merchants: entries,
  };
}

const categoryByMccRules = [
  [/Airlines|Air Carrier|Airways|Air Transportation/i, ["flight", "airlines"]],
  [/Hotel|Motel|Resort|Lodging/i, ["hotel", "lodging"]],
  [/Travel|Tourist|Cruise|Car Rental|Trailer Parks|Camp/i, ["travel", "travel"]],
  [/Taxi|Limousine|Bus|Rail|Transportation|Tolls|Parking/i, ["transport", "mobility"]],
  [/Service Stations|Fuel|Gasoline|Automated Fuel/i, ["fuel", "fuel"]],
  [/Restaurant|Eating Places|Fast Food|Caterers/i, ["restaurant", "dining"]],
  [/Bars|Taverns|Nightclubs|Drinking/i, ["bar", "bars"]],
  [/Grocery|Supermarket|Meat|Candy|Dairy|Bakeries|Food Stores/i, ["supermarket", "groceries"]],
  [/Drug Stores|Pharmac|Medical|Dental|Hospital|Health|Physicians|Optical|Nursing/i, ["pharmacy", "health"]],
  [/Clothing|Shoe|Apparel|Tailors|Furriers|Wig|Uniform|Men.s|Women.s|Family Clothing/i, ["clothing", "clothing"]],
  [/Jewelry|Watch|Clock|Silverware/i, ["jewelry", "jewelry"]],
  [/Computer|Software|Electronics|Telecommunication|Digital|Record Shops|Video Game|Music Stores/i, ["electronics", "electronics"]],
  [/Utilities|Electric|Gas|Water|Sanitary|Cable|Telegraph|Telephone/i, ["utilities", "utilities"]],
  [/Financial|Money|Security Brokers|Wire Transfer|ATM|Cash|Loan|Quasi Cash|Cryptocurrency/i, ["finance", "financial_services"]],
  [/Insurance/i, ["insurance", "insurance"]],
  [/Schools|Colleges|Education|Book Stores|Stationery/i, ["education", "education"]],
  [/Charitable|Religious|Political Organizations/i, ["charity", "charity"]],
  [/Government|Court|Fines|Tax|Postal Services/i, ["government", "government"]],
  [/Furniture|Home|Hardware|Garden|Glass|Paint|Wallpaper|Drapery|Household Appliance|Antique/i, ["home", "home"]],
  [/Beauty|Barber|Cosmetic|Massage|Spa/i, ["beauty", "beauty"]],
  [/Pet|Veterinary/i, ["pets", "pets"]],
  [/Sports|Sporting Goods|Athletic|Fitness|Golf|Country Clubs|Sport Clubs|Sport Promoters/i, ["sport", "sport"]],
  [/Amusement|Recreation|Theatrical|Motion Picture|Cinema|Bowling|Betting|Lottery|Aquarium|Zoo/i, ["entertainment", "entertainment"]],
  [/Automotive|Auto|Motorcycle|Tire|Repair|Car Wash/i, ["auto", "auto"]],
  [/Laundry|Cleaning|Repair|Maintenance/i, ["repair", "services"]],
  [/Department Stores|Discount Stores|Variety Stores|Duty Free|Direct Marketing|Catalog|Retail/i, ["retail", "retail"]],
];

function categorizeMcc(description) {
  for (const [regex, value] of categoryByMccRules) {
    if (regex.test(description)) return value;
  }
  return ["retail", "retail"];
}

function buildMcc() {
  const sourcePath = path.join(process.env.TEMP || process.env.TMPDIR || "", "mcc-pack", "package", "src", "merchant-codes.js");
  let source;

  try {
    source = require(sourcePath);
  } catch {
    source = [];
  }

  const result = {};
  for (const item of source) {
    const code = String(item.mcc).padStart(4, "0");
    const name = item.edited_description || item.combined_description || item.irs_description || "Merchant category";
    const [category, subcategory] = categorizeMcc(name);
    result[code] = { name, category, subcategory };
  }

  const required = {
    "5411": ["Grocery Stores, Supermarkets", "supermarket", "groceries"],
    "5651": ["Family Clothing Stores", "clothing", "clothing"],
    "5732": ["Electronics Stores", "electronics", "electronics"],
    "5814": ["Fast Food Restaurants", "fast_food", "fast_food"],
    "5912": ["Drug Stores and Pharmacies", "pharmacy", "pharmacy"],
    "6012": ["Financial Institutions - Merchandise and Services", "finance", "banking"],
    "6538": ["MoneySend Funding", "transfer", "card_transfer"],
  };

  for (const [code, [name, category, subcategory]] of Object.entries(required)) {
    result[code] = { name, category, subcategory };
  }

  return result;
}

const keywordGroups = {
  salary: ["salary", "payroll", "wage", "bonus", "зарплата", "аванс", "премія", "заробітна плата", "заработная плата", "оклад"],
  transfer: ["transfer", "p2p", "card to card", "переказ", "перевод", "поповнення", "зарахування", "send money"],
  cash: ["atm", "cash withdrawal", "cash deposit", "банкомат", "готівка", "наличные", "снятие наличных"],
  finance: ["fee", "commission", "bank", "interest", "finance", "swift", "iban", "еквайринг", "комісія", "банк", "кредит"],
  crypto: ["crypto", "bitcoin", "ethereum", "usdt", "binance", "coinbase", "kraken", "крипта", "криптовалюта"],
  supermarket: ["grocery", "groceries", "supermarket", "market", "food store", "продукти", "супермаркет", "гастроном", "бакалія", "магазин продуктов", "овочі", "фрукти"],
  restaurant: ["restaurant", "cafe", "dining", "bistro", "pizza", "sushi", "ресторан", "кафе", "піца", "суші", "їдальня", "столова"],
  fast_food: ["fast food", "burger", "kebab", "shawarma", "doner", "фастфуд", "бургер", "шаурма", "донер"],
  coffee: ["coffee", "espresso", "latte", "cappuccino", "кава", "кав'ярня", "кофе", "кофейня"],
  bar: ["bar", "pub", "beer", "wine", "бар", "паб", "пиво", "вино"],
  delivery: ["delivery", "post", "postal", "courier", "shipping", "доставка", "пошта", "кур'єр", "посилка", "почта"],
  taxi: ["taxi", "ride", "таксі", "такси"],
  transport: ["metro", "bus", "train", "rail", "ticket", "transport", "метро", "автобус", "поїзд", "квиток", "транспорт"],
  fuel: ["fuel", "gas station", "petrol", "diesel", "пальне", "бензин", "дизель", "азс", "заправка"],
  parking: ["parking", "parkovka", "паркінг", "парковка", "стоянка"],
  auto: ["auto", "car", "tire", "wash", "авто", "шини", "мийка", "сто", "автомобіль"],
  clothing: ["clothing", "fashion", "apparel", "dress", "shirt", "одяг", "плаття", "сорочка", "одежда"],
  shoes: ["shoes", "sneakers", "boots", "взуття", "кросівки", "ботинки", "обувь"],
  jewelry: ["jewelry", "watch", "gold", "silver", "ювелір", "годинник", "золото", "серебро"],
  electronics: ["electronics", "computer", "phone", "laptop", "gadget", "електроніка", "ноутбук", "телефон", "смартфон", "техніка"],
  marketplaces: ["marketplace", "classifieds", "online market", "маркетплейс", "оголошення"],
  home: ["home", "furniture", "hardware", "repair", "garden", "дім", "меблі", "будматеріали", "ремонт", "сад"],
  utilities: ["utilities", "electricity", "water", "gas", "heating", "osbb", "комунальні", "світло", "вода", "газ", "опалення", "осбб"],
  telecom: ["mobile", "internet", "telecom", "phone topup", "мобільний", "інтернет", "зв'язок", "поповнення мобільного"],
  beauty: ["beauty", "cosmetics", "salon", "barber", "spa", "краса", "косметика", "салон", "перукарня"],
  health: ["clinic", "doctor", "medical", "lab", "dentist", "health", "клініка", "лікар", "медицина", "лабораторія", "стоматолог"],
  pharmacy: ["pharmacy", "drugstore", "medicine", "аптека", "ліки", "медикаменти", "лекарства"],
  pets: ["pet", "zoo", "veterinary", "dog", "cat", "тварини", "зоомагазин", "ветеринар", "собака", "кіт"],
  kids: ["kids", "children", "toys", "baby", "діти", "дитячий", "іграшки", "ребенок"],
  education: ["education", "course", "school", "university", "lesson", "освіта", "курс", "школа", "університет", "урок"],
  books: ["book", "bookstore", "ebook", "книга", "книгарня", "книжковий"],
  music: ["music", "concert", "музика", "концерт"],
  gaming: ["game", "gaming", "steam", "playstation", "xbox", "ігри", "гра", "гейминг"],
  streaming: ["streaming", "video", "movie", "subscription video", "стримінг", "кіно", "фільм", "серіал"],
  subscription: ["subscription", "recurring", "membership", "підписка", "абонплата", "ежемесячно"],
  digital: ["software", "app", "digital", "domain", "hosting", "cloud", "софт", "додаток", "цифровий", "домен", "хостинг"],
  entertainment: ["cinema", "theater", "ticket", "club", "entertainment", "кінотеатр", "театр", "квитки", "розваги"],
  sport: ["sport", "fitness", "gym", "running", "спорт", "фітнес", "зал", "тренування"],
  travel: ["travel", "tour", "trip", "visa", "подорож", "тур", "мандрівка", "віза"],
  hotel: ["hotel", "hostel", "booking", "lodging", "готель", "хостел", "бронювання"],
  flight: ["airline", "flight", "airport", "авіа", "авіаквиток", "аеропорт", "рейс"],
  government: ["government", "fine", "court", "passport", "держпослуги", "штраф", "суд", "паспорт", "цнап"],
  charity: ["charity", "donation", "foundation", "волонтер", "донат", "благодійність", "фонд"],
};

function buildKeywords(merchantCollections = []) {
  const result = {};

  for (const [category, words] of Object.entries(keywordGroups)) {
    result[category] = [...new Set(words.flatMap(aliasVariants))].sort();
  }

  for (const collection of merchantCollections) {
    for (const merchant of collection.merchants) {
      const current = result[merchant.category] ?? [];
      result[merchant.category] = [
        ...new Set([...current, merchant.name, ...merchant.aliases].map(normalizeAlias)),
      ].sort();
    }
  }

  return result;
}

const regex = [
  { pattern: "\\bm\\s*c\\s*donald'?s?\\b|\\bмак\\s*дональдс\\b", replace: "mcdonalds", category: "fast_food", subcategory: "fast_food" },
  { pattern: "\\bnova\\s*poshta\\b|\\bnovaposhta\\b|\\bнова\\s*пошта\\b", replace: "nova poshta", category: "delivery", subcategory: "postal" },
  { pattern: "\\bapple\\.?com\\/bill\\b|\\bapple\\s+bill\\b", replace: "apple.com/bill", category: "digital", subcategory: "app_store" },
  { pattern: "\\byou\\s*tube\\b|\\byoutube\\s*premium\\b", replace: "youtube premium", category: "streaming", subcategory: "video_streaming" },
  { pattern: "\\bgoogle\\s*cloud\\b|\\bgcp\\b", replace: "google cloud", category: "cloud", subcategory: "cloud" },
  { pattern: "\\bamazon\\s*web\\s*services\\b|\\baws\\b", replace: "aws", category: "cloud", subcategory: "cloud" },
  { pattern: "\\bopen\\s*ai\\b|\\bchat\\s*gpt\\b", replace: "openai", category: "digital", subcategory: "ai" },
  { pattern: "\\bprivat\\s*bank\\b|\\bприват\\s*банк\\b", replace: "privatbank", category: "finance", subcategory: "banking" },
  { pattern: "\\bmono\\s*bank\\b|\\bmonobank\\b|\\bмоно\\s*банк\\b", replace: "monobank", category: "finance", subcategory: "banking" },
  { pattern: "\\bукр\\s*залізниця\\b|\\buz\\.?gov\\b|\\buz\\b", replace: "ukrzaliznytsia", category: "transport", subcategory: "rail" },
  { pattern: "\\bkyiv\\s*digital\\b|\\bкиїв\\s*цифровий\\b", replace: "kyiv digital", category: "transport", subcategory: "public_transport" },
  { pattern: "\\bаптека\\s*911\\b|\\bapteka\\s*911\\b", replace: "apteka 911", category: "pharmacy", subcategory: "pharmacy" },
  { pattern: "\\bатб\\b|\\batb\\b", replace: "atb", category: "supermarket", subcategory: "groceries" },
  { pattern: "\\bсiльпо\\b|\\bсільпо\\b|\\bsilpo\\b", replace: "silpo", category: "supermarket", subcategory: "groceries" },
  { pattern: "\\bbolt\\s*food\\b", replace: "bolt food", category: "delivery", subcategory: "food_delivery" },
  { pattern: "\\buber\\s*eats\\b", replace: "uber eats", category: "delivery", subcategory: "food_delivery" },
  { pattern: "\\bvisa\\s+direct\\b|\\bmastercard\\s+money\\s*send\\b", replace: "card transfer", category: "transfer", subcategory: "card_transfer" },
];

function writeJson(file, value) {
  fs.writeFileSync(path.join(outDir, file), `${JSON.stringify(value, null, 2)}\n`);
}

const mcc = buildMcc();
const merchantsUa = buildMerchants(merchantGroupsUa, "ua");
const merchantsGlobal = buildMerchants(merchantGroupsGlobal, "global");
const keywords = buildKeywords([merchantsUa, merchantsGlobal]);

writeJson("categories.json", categories);
writeJson("mcc.json", mcc);
writeJson("merchants_ua.json", merchantsUa);
writeJson("merchants_global.json", merchantsGlobal);
writeJson("keywords.json", keywords);
writeJson("regex.json", { version: 1, patterns: regex });

const counts = {
  categories: Object.keys(categories).length,
  mcc: Object.keys(mcc).length,
  merchants_ua: merchantsUa.merchants.length,
  merchants_ua_aliases: merchantsUa.merchants.reduce((sum, merchant) => sum + merchant.aliases.length, 0),
  merchants_global: merchantsGlobal.merchants.length,
  merchants_global_aliases: merchantsGlobal.merchants.reduce((sum, merchant) => sum + merchant.aliases.length, 0),
  keyword_categories: Object.keys(keywords).length,
  keyword_aliases: Object.values(keywords).reduce((sum, words) => sum + words.length, 0),
  regex: regex.length,
};

console.log(JSON.stringify(counts, null, 2));
