export type TrademarkClassType = "goods" | "services";

export type TrademarkClassExample = {
  label: string;
  detail: string;
};

export type TrademarkClass = {
  number: number;
  name: string;
  type: TrademarkClassType;
  description: string;
  examples: TrademarkClassExample[];
};

// Concise, searchable summaries distilled from the Limex reference PDF.
// The final goods/services wording should still be confirmed with DPDT before filing.
export const trademarkClasses: TrademarkClass[] = [
  {
    number: 1,
    name: "Chemicals",
    type: "goods",
    description: "Industrial, scientific, agricultural and forestry chemicals, unprocessed resins and plastics, fertilizers, fire-extinguishing compositions and industrial adhesives.",
    examples: [
      { label: "Adhesives", detail: "industrial and wood" },
      { label: "Synthetic resins", detail: "unprocessed materials" },
      { label: "Fertilizers", detail: "agricultural chemicals" },
    ],
  },
  {
    number: 2,
    name: "Paints and colorants",
    type: "goods",
    description: "Paints, varnishes, lacquers, enamels, primers, waterproofing cements, colours, putty and preservatives for wood.",
    examples: [
      { label: "Paints", detail: "decorative coatings" },
      { label: "Varnishes", detail: "protective finishes" },
      { label: "Putty", detail: "surface preparation" },
    ],
  },
  {
    number: 3,
    name: "Cosmetics and cleaning",
    type: "goods",
    description: "Cosmetics, soaps, shampoos, perfumes, essential oils, personal care, cleaning, polishing and abrasive preparations.",
    examples: [
      { label: "Cosmetics", detail: "skin and beauty care" },
      { label: "Shampoo", detail: "personal care" },
      { label: "Cleaners", detail: "polishing and household" },
    ],
  },
  {
    number: 4,
    name: "Industrial oils and fuels",
    type: "goods",
    description: "Industrial oils and greases, lubricants, fuels, dust-absorbing and wetting compositions, candles and wicks.",
    examples: [
      { label: "Motor oil", detail: "industrial lubricant" },
      { label: "Brake fluid", detail: "automotive fluids" },
      { label: "Candles", detail: "illuminants and wicks" },
    ],
  },
  {
    number: 5,
    name: "Pharmaceuticals",
    type: "goods",
    description: "Ayurvedic, herbal, Unani, medicinal and pharmaceutical preparations, mosquito repellents and food supplements.",
    examples: [
      { label: "Medicines", detail: "ayurvedic and herbal" },
      { label: "Repellents", detail: "mosquito protection" },
      { label: "Supplements", detail: "healthcare products" },
    ],
  },
  {
    number: 6,
    name: "Common metals",
    type: "goods",
    description: "Common metals and alloys, aluminium sheets, locks, fasteners, hardware, chains and door and window fittings.",
    examples: [
      { label: "Locks", detail: "security hardware" },
      { label: "Fasteners", detail: "nuts, bolts and clips" },
      { label: "Door fittings", detail: "hinges and handles" },
    ],
  },
  {
    number: 7,
    name: "Machines",
    type: "goods",
    description: "Machines, machine tools, motors, pumps, engines, agricultural implements, washing machines and their parts.",
    examples: [
      { label: "Pumps", detail: "water and industrial" },
      { label: "Motors", detail: "electric machinery" },
      { label: "Machine tools", detail: "cutting and drilling" },
    ],
  },
  {
    number: 8,
    name: "Hand tools and cutlery",
    type: "goods",
    description: "Hand-operated tools, knives, cutlery, razors, scrapers, pliers, screwdrivers, wrenches and hammers.",
    examples: [
      { label: "Hand tools", detail: "scrapers and blades" },
      { label: "Cutlery", detail: "forks and spoons" },
      { label: "Razors", detail: "shaving tools" },
    ],
  },
  {
    number: 9,
    name: "Scientific and software",
    type: "goods",
    description: "Electrical and electronic apparatus, computers, software, data equipment, cables, batteries, audio/video and communication devices.",
    examples: [
      { label: "Software", detail: "computer programs" },
      { label: "Batteries", detail: "power accessories" },
      { label: "Audio systems", detail: "speakers and players" },
    ],
  },
  {
    number: 10,
    name: "Medical apparatus",
    type: "goods",
    description: "Medical, surgical, dental and veterinary instruments, apparatus, laboratory equipment, orthopedic articles and surgical materials.",
    examples: [
      { label: "Medical instruments", detail: "clinical equipment" },
      { label: "Dental apparatus", detail: "dental care" },
      { label: "Orthopedic goods", detail: "support articles" },
    ],
  },
  {
    number: 11,
    name: "Lighting and sanitary",
    type: "goods",
    description: "Lighting, heating, cooling, cooking, ventilation, drying, water purification and sanitary installations.",
    examples: [
      { label: "Lighting", detail: "lamps and bulbs" },
      { label: "Water purifiers", detail: "filtration equipment" },
      { label: "Bathroom fittings", detail: "sanitary installations" },
    ],
  },
  {
    number: 12,
    name: "Vehicles",
    type: "goods",
    description: "Vehicles and automobile parts and fittings, including brakes, clutch parts, bearings, shafts, springs and steering components.",
    examples: [
      { label: "Brake parts", detail: "automotive components" },
      { label: "Clutch parts", detail: "vehicle fittings" },
      { label: "Steering parts", detail: "suspension systems" },
    ],
  },
  {
    number: 13,
    name: "Firearms and fireworks",
    type: "goods",
    description: "Fireworks, explosives, firearms, ammunition, gun accessories and related cleaning equipment.",
    examples: [
      { label: "Fireworks", detail: "pyrotechnic goods" },
      { label: "Firearms", detail: "guns and rifles" },
      { label: "Ammunition", detail: "cartridges and cases" },
    ],
  },
  {
    number: 14,
    name: "Jewellery and watches",
    type: "goods",
    description: "Precious metals and alloys, jewellery, diamonds, gemstones, watches, clocks and horological instruments.",
    examples: [
      { label: "Jewellery", detail: "gold and silver" },
      { label: "Gemstones", detail: "precious and artificial" },
      { label: "Watches", detail: "timepieces" },
    ],
  },
  {
    number: 15,
    name: "Musical instruments",
    type: "goods",
    description: "Musical instruments, including flutes, guitars, basses, strings, picks, straps and tremolos.",
    examples: [
      { label: "Guitars", detail: "instruments and parts" },
      { label: "Flutes", detail: "musical instruments" },
      { label: "Strings", detail: "instrument accessories" },
    ],
  },
  {
    number: 16,
    name: "Paper and stationery",
    type: "goods",
    description: "Printed matter, books, publications, paper, stationery, educational materials, printer cartridges, inks and office supplies.",
    examples: [
      { label: "Printed matter", detail: "books and publications" },
      { label: "Stationery", detail: "pens and paper goods" },
      { label: "Cartridges", detail: "inkjet and laser" },
    ],
  },
  {
    number: 17,
    name: "Rubber and plastics",
    type: "goods",
    description: "Rubber, PVC and flexible pipes, hoses, insulation, packing and stopping materials, tapes and electrical fittings.",
    examples: [
      { label: "PVC pipes", detail: "electrical fittings" },
      { label: "Adhesive tape", detail: "packing and insulation" },
      { label: "Rubber parts", detail: "industrial components" },
    ],
  },
  {
    number: 18,
    name: "Leather goods",
    type: "goods",
    description: "Leather and imitations, luggage, travel and sports bags, handbags, wallets, purses, umbrellas and saddlery.",
    examples: [
      { label: "Handbags", detail: "leather accessories" },
      { label: "Luggage", detail: "travel and sports bags" },
      { label: "Wallets", detail: "purses and card cases" },
    ],
  },
  {
    number: 19,
    name: "Building materials",
    type: "goods",
    description: "Building materials, cement, lime, mortar, plaster, plywood, timber, stone, tiles, glass, pipes and paving materials.",
    examples: [
      { label: "Cement", detail: "construction materials" },
      { label: "Plywood", detail: "boards and timber" },
      { label: "Tiles", detail: "ceramic and stone" },
    ],
  },
  {
    number: 20,
    name: "Furniture and containers",
    type: "goods",
    description: "Furniture, mirrors, containers, mattresses, pillows, cushions, bedding and sleeping accessories.",
    examples: [
      { label: "Furniture", detail: "home and office" },
      { label: "Mattresses", detail: "bedding articles" },
      { label: "Mirrors", detail: "interior goods" },
    ],
  },
  {
    number: 21,
    name: "Household utensils",
    type: "goods",
    description: "Stainless-steel utensils, containers, pressure cookers, glassware, porcelain and earthenware.",
    examples: [
      { label: "Utensils", detail: "stainless steel" },
      { label: "Cookware", detail: "pressure cookers" },
      { label: "Glassware", detail: "home and kitchen" },
    ],
  },
  {
    number: 22,
    name: "Ropes and tents",
    type: "goods",
    description: "Bags and sacks, ropes, string, nets, tents, tarpaulins, sails, stuffing and raw textile fibres.",
    examples: [
      { label: "Ropes", detail: "string and net twine" },
      { label: "Tents", detail: "outdoor coverings" },
      { label: "Sacks", detail: "packaging goods" },
    ],
  },
  {
    number: 23,
    name: "Yarns and threads",
    type: "goods",
    description: "Yarns for textile use, including polyester, cotton and hand-knitting yarns.",
    examples: [
      { label: "Cotton yarn", detail: "textile materials" },
      { label: "Polyester yarn", detail: "synthetic fibres" },
      { label: "Knitting yarn", detail: "handcraft supplies" },
    ],
  },
  {
    number: 24,
    name: "Textiles and linen",
    type: "goods",
    description: "Textiles and textile goods, fabrics, clothing materials, sarees, blankets, towels, bed and table covers.",
    examples: [
      { label: "Dress materials", detail: "suiting and shirting" },
      { label: "Bed covers", detail: "home textiles" },
      { label: "Sarees", detail: "textile goods" },
    ],
  },
  {
    number: 25,
    name: "Clothing and footwear",
    type: "goods",
    description: "Clothing, footwear, hosiery, ready-made garments, undergarments, uniforms, headwear, belts and gloves.",
    examples: [
      { label: "Garments", detail: "ready-made clothing" },
      { label: "Footwear", detail: "boots and shoes" },
      { label: "Headwear", detail: "caps and hats" },
    ],
  },
  {
    number: 26,
    name: "Lace and buttons",
    type: "goods",
    description: "Lace and embroidery, ribbons, bows, buttons, hooks, pins, needles, zips, fasteners, elastic and garment trimmings.",
    examples: [
      { label: "Buttons", detail: "metal and garment" },
      { label: "Zips", detail: "zip fasteners" },
      { label: "Trimmings", detail: "lace and embroidery" },
    ],
  },
  {
    number: 27,
    name: "Floor coverings",
    type: "goods",
    description: "Carpets, rugs, mats, wall coverings, wallpaper and other floor coverings.",
    examples: [
      { label: "Carpets", detail: "floor coverings" },
      { label: "Mats", detail: "rubber and plastic" },
      { label: "Wallpaper", detail: "wall coverings" },
    ],
  },
  {
    number: 28,
    name: "Games and sporting goods",
    type: "goods",
    description: "Games, toys, gymnastic and sporting articles, balloons, sports equipment and Christmas decorations.",
    examples: [
      { label: "Toys", detail: "games and playthings" },
      { label: "Sports goods", detail: "cricket and football" },
      { label: "Gym equipment", detail: "fitness articles" },
    ],
  },
  {
    number: 29,
    name: "Prepared foods",
    type: "goods",
    description: "Preserved, dried and cooked fruits and vegetables, dairy products, oils, jams, pickles, meat, fish and soups.",
    examples: [
      { label: "Dairy products", detail: "milk and cheese" },
      { label: "Pickles", detail: "preserved foods" },
      { label: "Edible oils", detail: "cooking products" },
    ],
  },
  {
    number: 30,
    name: "Staple foods",
    type: "goods",
    description: "Coffee, tea, cocoa, rice, flour, pulses, spices, bread, biscuits, confectionery, sauces, noodles and snacks.",
    examples: [
      { label: "Spices", detail: "masala and seasonings" },
      { label: "Snacks", detail: "biscuits and namkeen" },
      { label: "Confectionery", detail: "sweets and cakes" },
    ],
  },
  {
    number: 31,
    name: "Agricultural products",
    type: "goods",
    description: "Agricultural, horticultural and forestry products, grains, seeds, fresh fruit, vegetables, plants, flowers and animal feed.",
    examples: [
      { label: "Animal feed", detail: "cattle and poultry" },
      { label: "Seeds", detail: "agricultural goods" },
      { label: "Fresh produce", detail: "fruits and vegetables" },
    ],
  },
  {
    number: 32,
    name: "Beer and soft drinks",
    type: "goods",
    description: "Beer, mineral and aerated waters, soft drinks, fruit drinks, juices, syrups and other non-alcoholic beverages.",
    examples: [
      { label: "Soft drinks", detail: "carbonated beverages" },
      { label: "Fruit juices", detail: "drinks and squashes" },
      { label: "Mineral water", detail: "aerated waters" },
    ],
  },
  {
    number: 33,
    name: "Alcoholic beverages",
    type: "goods",
    description: "Alcoholic beverages, including wine, spirits, liquors, whisky, brandy, rum, vodka, gin and scotch.",
    examples: [
      { label: "Wine", detail: "alcoholic beverages" },
      { label: "Spirits", detail: "liquors and whisky" },
      { label: "Brandy", detail: "distilled drinks" },
    ],
  },
  {
    number: 34,
    name: "Tobacco products",
    type: "goods",
    description: "Tobacco, smoking and chewing products, cigarettes, bidis, cigars, snuff, matches and smokers’ articles.",
    examples: [
      { label: "Cigarettes", detail: "smoking tobacco" },
      { label: "Matches", detail: "smokers’ articles" },
      { label: "Chewing tobacco", detail: "tobacco products" },
    ],
  },
  {
    number: 35,
    name: "Advertising and business",
    type: "services",
    description: "Advertising, business management, administration, retail and wholesale services, distribution, marketing, brand and recruitment support.",
    examples: [
      { label: "Marketing", detail: "brand promotion" },
      { label: "Consulting", detail: "business advice" },
      { label: "Retail", detail: "product selling" },
    ],
  },
  {
    number: 36,
    name: "Finance and real estate",
    type: "services",
    description: "Financial and monetary affairs, share brokerage, investment, insurance brokerage and related financial advice.",
    examples: [
      { label: "Share brokerage", detail: "securities services" },
      { label: "Investment", detail: "capital advice" },
      { label: "Insurance", detail: "financial affairs" },
    ],
  },
  {
    number: 37,
    name: "Construction and repair",
    type: "services",
    description: "Building construction, repair and installation, property development, civil works and maintenance of industrial or water-treatment equipment.",
    examples: [
      { label: "Construction", detail: "building services" },
      { label: "Property development", detail: "land and buildings" },
      { label: "Repair", detail: "installation and maintenance" },
    ],
  },
  {
    number: 38,
    name: "Telecommunications",
    type: "services",
    description: "Telecommunications, data transmission, internet access, electronic mail, call centres, helplines and technical advisory services.",
    examples: [
      { label: "Internet access", detail: "telecom services" },
      { label: "Call centres", detail: "customer communications" },
      { label: "Data transmission", detail: "network services" },
    ],
  },
  {
    number: 39,
    name: "Transport and travel",
    type: "services",
    description: "Transport, packaging and storage, logistics, warehousing, travel arrangement, reservations, tours, ticketing and vehicle rental.",
    examples: [
      { label: "Travel booking", detail: "tickets and reservations" },
      { label: "Logistics", detail: "storage and freight" },
      { label: "Vehicle rental", detail: "cars and coaches" },
    ],
  },
  {
    number: 40,
    name: "Material treatment",
    type: "services",
    description: "Treatment of metals and jewellery, cutting, polishing, plating, casting, smithing, abrasion, handcrafting and embroidery.",
    examples: [
      { label: "Metal treatment", detail: "cutting and polishing" },
      { label: "Jewellery work", detail: "casting and plating" },
      { label: "Embroidery", detail: "handcrafting services" },
    ],
  },
  {
    number: 41,
    name: "Education and entertainment",
    type: "services",
    description: "Education, tuition, coaching, training, publishing, conferences, cultural exhibitions, entertainment, films and live performances.",
    examples: [
      { label: "Education", detail: "tuition and coaching" },
      { label: "Publishing", detail: "books and media" },
      { label: "Entertainment", detail: "films and live shows" },
    ],
  },
  {
    number: 42,
    name: "Technology and design",
    type: "services",
    description: "Website creation and hosting, software development, programming, IT consultancy, e-commerce, networking and technology design.",
    examples: [
      { label: "Websites", detail: "creation and hosting" },
      { label: "Software", detail: "development and support" },
      { label: "IT consulting", detail: "technology advisory" },
    ],
  },
  {
    number: 43,
    name: "Food and accommodation",
    type: "services",
    description: "Food and drink services, cafés, restaurants, hotels, resorts, catering, snack bars, ice-cream parlours and canteens.",
    examples: [
      { label: "Restaurants", detail: "food and drink" },
      { label: "Catering", detail: "events and meals" },
      { label: "Hotels", detail: "accommodation services" },
    ],
  },
  {
    number: 44,
    name: "Medical and beauty care",
    type: "services",
    description: "Medical, hygienic, beauty, healthcare and veterinary services, hospitals, clinics, dental care, salons, massage and physiotherapy.",
    examples: [
      { label: "Healthcare", detail: "medical and clinics" },
      { label: "Beauty salons", detail: "beauty care" },
      { label: "Dental care", detail: "treatment services" },
    ],
  },
  {
    number: 45,
    name: "Legal and security",
    type: "services",
    description: "Legal, personal and social services, NGO support, security, astrology, spiritual activities, meditation, healing and numerology.",
    examples: [
      { label: "Legal services", detail: "professional advice" },
      { label: "Security", detail: "personal protection" },
      { label: "Astrology", detail: "spiritual activities" },
    ],
  },
];

export const trademarkClassStats = {
  total: trademarkClasses.length,
  goods: trademarkClasses.filter((item) => item.type === "goods").length,
  services: trademarkClasses.filter((item) => item.type === "services").length,
} as const;
