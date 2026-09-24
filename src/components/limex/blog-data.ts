export type BlogTone = "mint" | "violet" | "peach";

export type BlogContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "step"; number: string; title: string; text: string };

export type BlogRelatedService = {
  serviceKey: string;
  label: string;
  href: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type BlogVideoReel = {
  youtubeUrl: string;
  videoId: string;
  title: string;
  sortOrder: number;
};

export type BlogArticle = {
  id?: string;
  contentLocale?: "en" | "bn";
  slug: string;
  category: string;
  date: string;
  publishedAt?: string;
  updatedDate?: string;
  updatedAt?: string;
  readTime: string;
  author: string;
  title: string;
  summary: string;
  intro: string;
  atAGlance: string;
  coverTone: BlogTone;
  coverNote: string;
  coverNumber: string;
  media: "image" | "video";
  tags: string[];
  blocks?: BlogContentBlock[];
  bodyHtml?: string;
  coverUrl?: string;
  coverAlt?: string;
  coverCaption?: string;
  noIndex?: boolean;
  canonicalUrl?: string | null;
  sidebarVideo?: { url: string; videoId: string; title: string } | null;
  reels?: BlogVideoReel[];
  relatedServices?: BlogRelatedService[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
};

export const blogCoverFallbacks: Record<string, string> = {
  "Business setup": "/blog/business-setup-cover.jpg",
  "VAT & Tax": "/blog/vat-tax-cover.jpg",
  "Brand protection": "/blog/trademark-cover.jpg",
};

export function getBlogCoverFallbackUrl(article: Pick<BlogArticle, "category">) {
  return blogCoverFallbacks[article.category] ?? "";
}

const businessSetupBlocks: BlogContentBlock[] = [
  { type: "heading", text: "Before you file anything" },
  {
    type: "paragraph",
    text: "Use the time before submission to make your business information consistent across every document. It saves follow-up work and gives you a smoother start.",
  },
  {
    type: "step",
    number: "01",
    title: "Choose the right structure",
    text: "Decide what kind of business fits your ownership, responsibility and plans.",
  },
  {
    type: "step",
    number: "02",
    title: "Prepare the core documents",
    text: "Keep your identity, address and supporting information ready in one place.",
  },
  {
    type: "step",
    number: "03",
    title: "Map the registrations that follow",
    text: "Plan the trade license, tax, VAT and other permissions that fit your business activity.",
  },
];

const vatBlocks: BlogContentBlock[] = [
  { type: "heading", text: "Start with the right VAT picture" },
  {
    type: "paragraph",
    text: "VAT becomes easier to manage when your registration, invoices and monthly records all tell the same story.",
  },
  {
    type: "step",
    number: "01",
    title: "Confirm whether registration applies",
    text: "Review your business activity, turnover and supply type before you prepare the application.",
  },
  {
    type: "step",
    number: "02",
    title: "Collect the supporting details",
    text: "Keep your business identity, address and banking information consistent across the submission.",
  },
  {
    type: "step",
    number: "03",
    title: "Build a monthly filing rhythm",
    text: "A simple record of sales, purchases and VAT collected keeps every return easier to review.",
  },
];

const trademarkBlocks: BlogContentBlock[] = [
  { type: "heading", text: "Before you file the mark" },
  {
    type: "paragraph",
    text: "A thoughtful search gives you more confidence before you invest in packaging, promotion or a full application.",
  },
  {
    type: "step",
    number: "01",
    title: "Describe what your brand does",
    text: "List the goods or services you plan to offer so the relevant classes can be reviewed properly.",
  },
  {
    type: "step",
    number: "02",
    title: "Search the relevant classes",
    text: "Look for similar marks and understand where your name may face confusion or objection.",
  },
  {
    type: "step",
    number: "03",
    title: "Prepare a filing plan",
    text: "Move forward with clear information, the correct class direction and a realistic follow-up plan.",
  },
];

const generalBlocks: BlogContentBlock[] = [
  { type: "heading", text: "A clearer way to make the next decision" },
  {
    type: "paragraph",
    text: "Good business decisions become easier when the important information is gathered in the right order and translated into practical next steps.",
  },
  {
    type: "step",
    number: "01",
    title: "Start with the question",
    text: "Name the decision you need to make and the outcome you want to protect.",
  },
  {
    type: "step",
    number: "02",
    title: "Gather the useful context",
    text: "Collect the documents, numbers or observations that will help you compare the available paths.",
  },
  {
    type: "step",
    number: "03",
    title: "Turn insight into action",
    text: "Choose one practical next step and give it an owner, a timeline and a clear measure of progress.",
  },
];

export const featuredArticle: BlogArticle = {
  slug: "register-a-business-in-bangladesh",
  category: "Business setup",
  date: "12 AUG 2026",
  updatedDate: "15 AUG 2026",
  readTime: "8 MIN READ",
  author: "Limex Editorial",
  title: "How to register a business in Bangladesh: a practical guide",
  summary: "A concise overview of the steps, documents and decisions founders need before they begin.",
  intro: "Starting a business becomes much easier when the first decisions are made in the right order. This guide gives you a clear view of what to prepare before you begin.",
  atAGlance: "A good registration plan usually comes down to three things: choosing a structure, preparing the right documents, and knowing which registrations come next.",
  coverTone: "violet",
  coverNote: "Use a cover image or short video",
  coverNumber: "01",
  media: "image",
  tags: ["Business setup", "Registration", "Founders"],
  blocks: businessSetupBlocks,
};

export const blogArticles: BlogArticle[] = [
  {
    slug: "starting-a-company-what-to-prepare-first",
    category: "Business setup",
    date: "14 AUG 2026",
    readTime: "6 MIN READ",
    author: "Limex Editorial",
    title: "Starting a company? Here is what to prepare first",
    summary: "The essentials to collect before you submit your registration.",
    intro: "A strong start is less about collecting every possible document and more about preparing the right information in the right order.",
    atAGlance: "A simple preparation checklist helps founders avoid unnecessary back-and-forth and keep the registration moving.",
    coverTone: "mint",
    coverNote: "Documents, steps and first decisions",
    coverNumber: "01",
    media: "image",
    tags: ["Business setup", "Registration"],
    blocks: businessSetupBlocks,
  },
  {
    slug: "vat-registration-explained-for-small-businesses",
    category: "VAT & Tax",
    date: "10 AUG 2026",
    readTime: "5 MIN READ",
    author: "Limex Editorial",
    title: "VAT registration explained for small businesses",
    summary: "A clear starting point for understanding VAT and filing.",
    intro: "VAT registration feels more manageable when you understand what information the application needs and what your monthly rhythm will look like afterward.",
    atAGlance: "The right registration details, clean records and a predictable filing routine make VAT easier to manage.",
    coverTone: "violet",
    coverNote: "Simple guidance for growing teams",
    coverNumber: "02",
    media: "video",
    tags: ["VAT & Tax", "Compliance"],
    blocks: vatBlocks,
  },
  {
    slug: "trademark-basics-before-you-file",
    category: "Brand protection",
    date: "06 AUG 2026",
    readTime: "7 MIN READ",
    author: "Limex Editorial",
    title: "Trademark basics: protect your name before launch",
    summary: "What to search, prepare and protect before you invest.",
    intro: "Your name is one of the first assets people remember. A little preparation before filing can protect the work you build around it.",
    atAGlance: "Search the right class, understand similar marks and prepare the filing information before you commit to a launch.",
    coverTone: "peach",
    coverNote: "Search, file and build with confidence",
    coverNumber: "03",
    media: "image",
    tags: ["Brand protection", "Trademark"],
    blocks: trademarkBlocks,
  },
  {
    slug: "safeguarding-your-business-data",
    category: "Operations",
    date: "12 SEP 2026",
    readTime: "6 MIN READ",
    author: "Limex Editorial",
    title: "Top strategies for safeguarding your data",
    summary: "Learn practical ways to keep important information safe from avoidable breaches.",
    intro: "Data protection is a business habit, not only a technical project. Clear ownership and a few repeatable safeguards go a long way.",
    atAGlance: "Know what matters, limit access and make recovery part of the everyday workflow.",
    coverTone: "peach",
    coverNote: "Secure your digital assets effortlessly",
    coverNumber: "04",
    media: "image",
    tags: ["Operations", "Risk"],
    blocks: generalBlocks,
  },
  {
    slug: "emerging-techniques-in-product-design",
    category: "Operations",
    date: "25 JUL 2026",
    readTime: "5 MIN READ",
    author: "Limex Editorial",
    title: "Emerging techniques shaping the future",
    summary: "Discover tools and methods that can elevate your creative process.",
    intro: "Better product decisions come from combining a clear customer question with a lightweight process for exploring and testing ideas.",
    atAGlance: "Make the problem visible, test a focused direction and keep the feedback loop short.",
    coverTone: "mint",
    coverNote: "Innovate with confidence in product design",
    coverNumber: "05",
    media: "image",
    tags: ["Operations", "Design"],
    blocks: generalBlocks,
  },
  {
    slug: "building-lasting-connections-with-your-audience",
    category: "Operations",
    date: "18 OCT 2026",
    readTime: "6 MIN READ",
    author: "Limex Editorial",
    title: "Building lasting connections with your audience",
    summary: "Strategies and tips to strengthen loyalty and retention.",
    intro: "Audience trust grows when every interaction feels consistent, useful and connected to a real need.",
    atAGlance: "Listen closely, follow through consistently and make the value of the relationship easy to understand.",
    coverTone: "violet",
    coverNote: "Master the art of customer engagement",
    coverNumber: "06",
    media: "image",
    tags: ["Operations", "Marketing"],
    blocks: generalBlocks,
  },
  {
    slug: "boost-efficiency-without-sacrificing-quality",
    category: "Operations",
    date: "03 NOV 2026",
    readTime: "5 MIN READ",
    author: "Limex Editorial",
    title: "Boost efficiency without sacrificing quality",
    summary: "Implement tools that save time and reduce errors across projects.",
    intro: "Efficiency is not about rushing. It is about making the repeatable parts of the work clear enough to improve.",
    atAGlance: "Document the workflow, remove avoidable hand-offs and keep quality visible at every stage.",
    coverTone: "violet",
    coverNote: "Streamline your workflow with automation",
    coverNumber: "07",
    media: "image",
    tags: ["Operations", "Productivity"],
    blocks: generalBlocks,
  },
  {
    slug: "staying-ahead-in-international-regulations",
    category: "Operations",
    date: "29 DEC 2026",
    readTime: "7 MIN READ",
    author: "Limex Editorial",
    title: "Stay ahead in international regulations",
    summary: "Understand new policies that may affect your business worldwide.",
    intro: "Cross-border work becomes less uncertain when regulatory changes are turned into a short, owned review process.",
    atAGlance: "Track the markets that matter, understand the changes and give your team a clear response path.",
    coverTone: "peach",
    coverNote: "Navigate the complexities of global compliance",
    coverNumber: "08",
    media: "image",
    tags: ["Operations", "Compliance"],
    blocks: generalBlocks,
  },
  {
    slug: "turning-data-insights-into-business-actions",
    category: "Operations",
    date: "14 JAN 2027",
    readTime: "6 MIN READ",
    author: "Limex Editorial",
    title: "Transform insights into impactful actions",
    summary: "Learn to interpret data trends and use them to drive business growth.",
    intro: "Useful data is not only a report. It is a shared way to make decisions with less guesswork and clearer accountability.",
    atAGlance: "Choose the signal, explain what it means and connect it to one decision your team can make now.",
    coverTone: "mint",
    coverNote: "Harness data analytics for smarter decisions",
    coverNumber: "09",
    media: "image",
    tags: ["Operations", "Data"],
    blocks: generalBlocks,
  },
];

export const allBlogArticles = [featuredArticle, ...blogArticles];
export const homeArticles = blogArticles.slice(0, 3);

export const blogFilters = [
  { label: "All posts", value: "all" },
  { label: "Business setup", value: "Business setup" },
  { label: "VAT & Tax", value: "VAT & Tax" },
  { label: "Brand protection", value: "Brand protection" },
  { label: "Operations", value: "Operations" },
] as const;

export function getBlogArticle(slug: string) {
  return allBlogArticles.find((article) => article.slug === slug);
}

export function getRelatedBlogArticles(slug: string, limit = 3) {
  return allBlogArticles.filter((article) => article.slug !== slug).slice(0, limit);
}
