/**
 * ITG-SOFT — SEO Keyword Strategy
 *
 * Structure:
 *   PRIMARY     — core money keywords (highest commercial intent, most competitive)
 *   SECONDARY   — supporting category/product-level keywords
 *   LONG_TAIL   — specific buyer-intent phrases (lower competition, high conversion)
 *   LOCAL       — geographic & cultural anchors (Taiwan, Taichung, Chinese-language)
 *   COMPETITOR  — gap analysis terms (don't target directly, use for content ideas)
 *
 * Usage: import PAGE_SEO to populate <title>, <meta description>, og:* tags per page.
 */

// ---------------------------------------------------------------------------
// MASTER KEYWORD MAP
// ---------------------------------------------------------------------------

export const KEYWORDS = {

  // ── PRIMARY  (brand + core product) ──────────────────────────────────────
  primary: [
    'buy NES homebrew games',
    'famicom homebrew cartridge',
    'NES homebrew games for sale',
    'physical NES game cartridges',
    'indie NES game shop',
    'famicom game online store',
    'ITG-SOFT',
    'indie taiwan game',
    'retro cartridge game shop',
    'complete in box NES homebrew',
  ],

  // ── SECONDARY  (category & product-type level) ────────────────────────────
  secondary: [
    // Platform
    'NES cartridge game',
    'famicom cartridge game',
    'NES and famicom homebrew',
    'retro 8-bit game cartridge',
    'physical homebrew game',

    // Format
    'complete in box retro game',
    'CIB NES game',
    'boxed famicom game',
    'NES game with manual',
    'physical indie game cartridge',

    // Genre
    'NES adventure game',
    'famicom RPG cartridge',
    'NES horror game',
    'NES puzzle game',
    'famicom platformer',
    'NES shooter game',
    'famicom simulation game',
    '8-bit sports game NES',

    // Digital
    'NES ROM digital download',
    'famicom ROM purchase',
    'indie NES digital game',

    // Cultural
    'taiwanese video game',
    'taiwanese culture game',
    'taiwanese mythology game',
    'taiwan retro game',
    'taiwanese indie game developer',
  ],

  // ── LONG-TAIL  (high intent, lower volume, best conversion) ──────────────
  longTail: [
    // Shopping intent
    'where to buy physical NES homebrew games',
    'buy famicom homebrew game online',
    'new NES game cartridge 2026',
    'new famicom game 2026',
    'legit physical NES homebrew for sale',
    'NES homebrew complete in box worldwide shipping',
    'indie NES game ships to USA',
    'indie famicom game ships to Japan',
    'best NES homebrew games to buy',
    'top famicom homebrew cartridges',

    // Cultural / unique value
    'taiwanese ghost festival video game',
    'dragon boat festival NES game',
    'alishan taiwan video game',
    'taiwanese night market game',
    'mazu goddess video game NES',
    'houyi archer NES game',
    'taiwan mythology retro game',
    'chinese new year video game NES',
    'ghost month video game',

    // Specific games
    "Mr Lee's Alishan Tea Collector game",
    'Hungry Ghost Night NES game',
    'Horror Taichung famicom',
    'Dragon Boat Fest NES cartridge',
    'Mazu Guardian of the Tides game',
    'HouYi Shot the Suns NES',
    'Barback famicom game',

    // Technical / collector
    'NES homebrew mapper MMC3 cartridge',
    'battery save NES homebrew game',
    'famicom 60 pin homebrew cartridge',
    'NES 72 pin indie game cartridge',
    'chiptune NES game buy',
    'original hardware compatible NES homebrew',
    'FPGA compatible homebrew NES',

    // B2B / developer
    'publish NES homebrew game',
    'famicom game publishing service',
    'NES homebrew game manufacturer taiwan',
    'indie NES game publishing deal',
    'how to publish homebrew NES game',

    // Content / informational
    'how to play NES homebrew on original hardware',
    'best famicom games for collectors 2026',
    'taiwanese indie game developers',
    'NES homebrew scene 2026',
    'famicom homebrew scene',
  ],

  // ── LOCAL  (Taiwan, Taichung, Chinese-language, diaspora) ────────────────
  local: {
    english: [
      'taiwan video game developer',
      'taichung game studio',
      'taiwan NES game',
      'taiwan famicom game',
      'made in taiwan retro game',
      'taiwanese game developer',
      'taiwan indie game store',
      'taiwan gaming culture',
      'taiwan retro gaming',
      'taiwan ghost festival game',
      'taiwan dragon boat game',
      'taiwan mythology game',
      'alishan mountain game',
      'taiwanese folklore game',
    ],
    traditional_chinese: [
      '台灣 NES 遊戲',        // Taiwan NES game
      '台灣 Famicom 遊戲',     // Taiwan Famicom game
      '台中 遊戲開發',          // Taichung game development
      '購買 FC 自製遊戲',       // Buy FC homebrew game
      '台灣自製 NES 遊戲',      // Taiwan homebrew NES game
      '紅白機 自製遊戲',         // Famicom homebrew game
      '台灣文化 電玩遊戲',       // Taiwanese culture video game
      '實體卡帶 遊戲',           // Physical cartridge game
      '購買 NES 卡帶',          // Buy NES cartridge
      '阿里山 電玩',             // Alishan video game
      '餓鬼道 遊戲',             // Hungry ghost game
      '媽祖 遊戲',               // Mazu game
      '龍舟 NES',               // Dragon Boat NES
      '台灣 獨立遊戲',           // Taiwan indie game
    ],
    diaspora: [
      'taiwanese american gamer',
      'taiwanese diaspora retro game',
      'taiwanese gift video game',
      'taiwan cultural gift',
      'learn about taiwan through games',
    ],
  },

  // ── COMPETITOR GAP  (research only — use for content gaps, not ad targeting) ──
  competitorGap: [
    'limited run games taiwan',
    'retro-bit famicom',
    'super nt famicom compatible',
    'analog nt mini game',
    'nes homebrew cartridge etsy',
    'famicom homebrew cartridge ebay',
    'nesworld homebrew',
    'itch.io NES game physical',
  ],
}

// ---------------------------------------------------------------------------
// PER-PAGE SEO  (title, description, keywords, og image alt)
// ---------------------------------------------------------------------------

export const PAGE_SEO = {

  home: {
    title: 'ITG-SOFT — Authentic Taiwanese NES & Famicom Homebrew Games',
    description:
      'Buy original NES and Famicom homebrew games from Taiwan. Complete-in-box physical cartridges celebrating Taiwanese culture, mythology, and festivals. Ships worldwide from Taichung.',
    keywords: [
      'buy NES homebrew games', 'famicom homebrew cartridge',
      'taiwanese video game', 'physical NES game', 'ITG-SOFT',
      'taiwan retro game', 'complete in box NES',
    ],
    og_image_alt: 'ITG-SOFT — Taiwanese NES & Famicom homebrew game store',
    canonical: '/',
  },

  listing: {
    title: 'Shop All Games — ITG-SOFT Famicom & NES Cartridges',
    description:
      'Browse all ITG-SOFT NES and Famicom homebrew games. Physical CIB cartridges, digital downloads, and pre-orders. Authentic Taiwanese indie games shipped worldwide.',
    keywords: [
      'buy NES homebrew games', 'famicom game for sale',
      'physical NES cartridge', 'indie famicom game shop',
      'taiwan game store', 'NES game online store',
    ],
    og_image_alt: 'ITG-SOFT game catalogue — NES and Famicom homebrew cartridges',
    canonical: '/games',
  },

  // Individual product pages — merge with product-level keywords
  productBase: {
    titleTemplate: '{title} — NES/Famicom Game | ITG-SOFT',
    descriptionTemplate:
      '{title} — {short_description} Physical cartridge available. Ships worldwide from Taiwan.',
    og_image_alt: '{title} box art — ITG-SOFT Famicom homebrew game',
  },

  // Per-product keyword additions (merged with base)
  productKeywords: {
    'mr-lee-alishan-tea-collector': [
      "Mr Lee's Alishan Tea Collector", 'alishan famicom game',
      'taiwan mountain adventure game', 'alishan NES game',
    ],
    'hungry-ghost-night': [
      'Hungry Ghost Night NES', 'ghost festival video game',
      'ghost month game', 'taiwanese horror game NES',
    ],
    'dragon-boat-fest': [
      'Dragon Boat Fest NES', 'dragon boat festival game',
      'taiwan dragon boat NES', 'multiplayer famicom game',
    ],
    'peace-love-trippy-club': [
      'Peace Love Trippy Club NES', 'psychedelic NES puzzle',
      'night market puzzle game',
    ],
    'houyi-shot-the-suns': [
      'HouYi Shot the Suns NES', 'houyi archer game',
      'chinese mythology shooter NES',
    ],
    'horror-taichung': [
      'Horror Taichung famicom', 'famicom horror game 2026',
      'taichung haunted game', 'taiwan urban legend game',
    ],
    'mazu-guardian-of-the-tides': [
      'Mazu Guardian NES', 'mazu goddess game',
      'taiwan sea mythology RPG', 'NES RPG 2026',
    ],
    'barback': [
      'Barback famicom game', 'famicom bar management sim',
      'retro bar simulator NES',
    ],
  },

  about: {
    title: 'About ITG-SOFT — Taiwanese Game Studio, Taichung City',
    description:
      'Founded in 2019 in Taichung, Taiwan. ITG-SOFT creates original NES & Famicom games celebrating local culture, festivals, and stories. Meet the team behind the cartridges.',
    keywords: [
      'ITG-SOFT about', 'taiwanese game studio',
      'taichung game developer', 'taiwan indie game developer',
      'NES homebrew studio taiwan',
    ],
    og_image_alt: 'ITG-SOFT team — Taichung, Taiwan game studio',
    canonical: '/about',
  },

  blog: {
    title: 'Dev Stories — ITG-SOFT Dev Diaries, Retro Guides & Taiwan Culture',
    description:
      'Development diaries, NES hardware guides, Taiwanese gaming culture, and game spotlights from the ITG-SOFT team in Taichung.',
    keywords: [
      'NES homebrew dev diary', 'famicom development blog',
      'taiwan gaming culture', 'retro game guide 2026',
      'NES hardware setup guide',
    ],
    og_image_alt: 'ITG-SOFT Dev Stories — retro gaming and Taiwanese culture',
    canonical: '/blog',
  },

  // Per-post keyword suggestions (merge with post tags)
  blogPostKeywords: {
    'dev_diary':         ['NES homebrew development', 'famicom game dev', 'indie retro game making'],
    'retro_guide':       ['how to play NES original hardware', 'famicom setup guide', 'retro gaming tips'],
    'company_news':      ['ITG-SOFT news', 'taiwan game studio update'],
    'taiwan_culture':    ['taiwanese culture gaming', 'taiwan mythology', 'taiwan festival games'],
    'product_spotlight': ['NES game review', 'famicom homebrew review', 'best NES homebrew'],
  },

  developers: {
    title: 'Publish Your NES/Famicom Game — ITG-SOFT Developer Partners',
    description:
      'Publish your NES or Famicom homebrew game with ITG-SOFT. We handle manufacturing, distribution, and worldwide shipping. Revenue share model. Based in Taiwan.',
    keywords: [
      'publish NES homebrew game', 'NES game publishing service',
      'famicom game publisher', 'indie NES game manufacturer taiwan',
      'NES homebrew cartridge production', 'publish famicom game worldwide',
    ],
    og_image_alt: 'Publish your NES or Famicom game with ITG-SOFT',
    canonical: '/developers',
  },

  faq: {
    title: 'FAQ — Shipping, Orders, Hardware & Returns | ITG-SOFT',
    description:
      'Answers to common questions about ITG-SOFT orders, worldwide shipping from Taiwan, NES/Famicom hardware compatibility, returns, and game downloads.',
    keywords: [
      'ITG-SOFT FAQ', 'NES homebrew shipping worldwide',
      'famicom cartridge compatibility', 'NES homebrew returns',
      'taiwan game shipping time',
    ],
    og_image_alt: 'ITG-SOFT FAQ — shipping and product help',
    canonical: '/faq',
  },

  contact: {
    title: 'Contact ITG-SOFT — Support, Press & Developer Enquiries',
    description:
      'Get in touch with the ITG-SOFT team in Taichung, Taiwan. Order support, press enquiries, developer partnerships, and general questions.',
    keywords: [
      'ITG-SOFT contact', 'taiwan game store support',
      'NES game shop contact', 'ITG-SOFT email',
    ],
    og_image_alt: 'Contact ITG-SOFT — Taichung, Taiwan',
    canonical: '/contact',
  },
}

// ---------------------------------------------------------------------------
// STRUCTURED DATA helpers  (JSON-LD snippets per page type)
// ---------------------------------------------------------------------------

const BASE = 'https://itg-soft.tw'

export const STRUCTURED_DATA = {

  // ── Organization (rich, used on About + Home) ──────────────────────────────
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE}/#organization`,
    name: 'ITG-SOFT',
    alternateName: ['一台遊戲軟體公司', 'Yī Tái Yóuxì Software Company'],
    url: BASE,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE}/logo.png`,
      width: 512,
      height: 512,
    },
    description: 'Taiwanese NES & Famicom homebrew game publisher based in Taichung City, Taiwan since 2019. Original physical cartridges celebrating Taiwanese culture, mythology and festivals — shipped worldwide.',
    foundingDate: '2019',
    foundingLocation: {
      '@type': 'Place',
      name: 'Taichung City, Taiwan',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'P.O. Box 36-69, Nantun District',
      addressLocality: 'Taichung City',
      postalCode: '408736',
      addressCountry: 'TW',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'support@itg-soft.tw',
        contactType: 'customer support',
        availableLanguage: ['English', 'Traditional Chinese'],
        areaServed: 'Worldwide',
      },
      {
        '@type': 'ContactPoint',
        email: 'press@itg-soft.tw',
        contactType: 'press',
        availableLanguage: ['English'],
      },
    ],
    sameAs: [
      'https://x.com/indietaiwangame',
      'https://www.facebook.com/profile.php?id=100093602714284',
    ],
  },

  // ── WebSite schema (enables Google Sitelinks Searchbox) ───────────────────
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: 'ITG-SOFT',
    url: BASE,
    description: 'Buy authentic Taiwanese NES & Famicom homebrew games. Physical CIB cartridges, digital ROMs, and pre-orders. Ships worldwide from Taichung, Taiwan.',
    publisher: { '@id': `${BASE}/#organization` },
    inLanguage: ['en', 'zh-Hant'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE}/games?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },

  // ── LocalBusiness (ContactPage — improves local search) ───────────────────
  localBusiness: {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'VideoGameClub'],
    '@id': `${BASE}/#localbusiness`,
    name: 'ITG-SOFT — Yī Tái Yóuxì Software Company',
    url: BASE,
    logo: `${BASE}/logo.png`,
    image: `${BASE}/og-default.png`,
    description: 'Taiwanese indie NES & Famicom game publisher in Taichung City, Taiwan. Physical homebrew cartridges shipped worldwide since 2019.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'P.O. Box 36-69, Nantun District',
      addressLocality: 'Taichung City',
      postalCode: '408736',
      addressCountry: 'TW',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 24.1477,
      longitude: 120.6736,
    },
    telephone: null,
    email: 'support@itg-soft.tw',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    currenciesAccepted: 'USD, TWD',
    paymentAccepted: 'Card payments and digital wallets',
    priceRange: '$18–$60',
    sameAs: [
      'https://x.com/indietaiwangame',
      'https://www.facebook.com/profile.php?id=100093602714284',
    ],
  },

  // ── Publishing service (DevelopersPage) ───────────────────────────────────
  publishingService: {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${BASE}/developers#service`,
    name: 'NES & Famicom Homebrew Game Publishing',
    serviceType: 'Video Game Publishing',
    provider: { '@id': `${BASE}/#organization` },
    url: `${BASE}/developers`,
    description: 'ITG-SOFT publishes original NES and Famicom homebrew games. We handle manufacturing, physical cartridge production, worldwide distribution, and e-commerce. Revenue-share model with no upfront platform fee for accepted projects.',
    areaServed: 'Worldwide',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Revenue-share publishing model with no upfront platform fee for accepted projects.',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Developer Publishing Tiers',
      itemListElement: [
        { '@type': 'Offer', name: 'Standard Publishing', description: 'Full manufacturing + worldwide distribution, revenue share, no upfront platform fee' },
        { '@type': 'Offer', name: 'Production Only', description: 'Physical cartridge production at cost for self-publishing developers' },
      ],
    },
  },

  /** Build an enriched Product schema */
  buildProduct: (product) => {
    const physicalPrice = product.price_physical ?? null
    const digitalPrice  = product.price_digital  ?? null
    const offers = []

    if (physicalPrice != null) {
      offers.push({
        '@type': 'Offer',
        name: 'Physical CIB Cartridge',
        price: physicalPrice,
        priceCurrency: 'USD',
        availability: product.status === 'in_stock'
          ? 'https://schema.org/InStock'
          : product.status === 'preorder'
            ? 'https://schema.org/PreOrder'
            : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: `${BASE}/games/${product.slug}`,
        seller: { '@type': 'Organization', name: 'ITG-SOFT' },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: { '@type': 'MonetaryAmount', value: '8.00', currency: 'USD' },
          shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
            transitTime:  { '@type': 'QuantitativeValue', minValue: 5, maxValue: 15, unitCode: 'DAY' },
          },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 30,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
      })
    }
    if (digitalPrice != null) {
      offers.push({
        '@type': 'Offer',
        name: 'Digital ROM Download',
        price: digitalPrice,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${BASE}/games/${product.slug}`,
        seller: { '@type': 'Organization', name: 'ITG-SOFT' },
      })
    }

    const year = product.release_date ? new Date(product.release_date).getFullYear() : null

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${BASE}/games/${product.slug}#product`,
      name: product.title,
      description: product.short_description || product.description,
      image: product.box_art_url ? [product.box_art_url] : [`${BASE}/og-default.png`],
      sku: `ITGSOFT-${(product.slug || '').toUpperCase().replace(/-/g,'').slice(0,12)}`,
      mpn: product.slug,
      brand: { '@type': 'Brand', name: 'ITG-SOFT' },
      manufacturer: { '@type': 'Organization', name: 'ITG-SOFT', url: BASE },
      category: 'Video Games > NES/Famicom Homebrew',
      ...(year ? { productionDate: String(year) } : {}),
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Platform', value: product.platform === 'both' ? 'NES & Famicom' : product.platform === 'nes' ? 'NES' : 'Famicom' },
        { '@type': 'PropertyValue', name: 'Genre', value: product.genre || 'Action' },
        { '@type': 'PropertyValue', name: 'Format', value: 'Complete in Box (CIB)' },
        { '@type': 'PropertyValue', name: 'Region', value: 'NTSC' },
        ...(product.mapper_type ? [{ '@type': 'PropertyValue', name: 'Mapper', value: product.mapper_type }] : []),
        ...(product.save_type && product.save_type !== 'None' ? [{ '@type': 'PropertyValue', name: 'Save', value: product.save_type }] : []),
      ],
      offers: offers.length === 1 ? offers[0] : offers,
      ...(product.review_stats?.review_count > 0 ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.review_stats.average_rating,
          reviewCount: product.review_stats.review_count,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
    }
  },

  /** Build a BlogPosting schema (used on BlogPostPage) */
  buildBlogPost: (post) => {
    const authorName = post.author_name || (post.author ? `${post.author.first_name} ${post.author.last_name}` : 'ITG-SOFT Team')
    const wordCount = post.body ? post.body.split(/\s+/).length : null
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${BASE}/blog/${post.slug}#article`,
      headline: post.title,
      name: post.title,
      description: post.excerpt || '',
      image: {
        '@type': 'ImageObject',
        url: post.cover_image_url || `${BASE}/og-default.png`,
        width: 1200,
        height: 630,
      },
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      author: {
        '@type': 'Person',
        name: authorName,
        worksFor: { '@type': 'Organization', name: 'ITG-SOFT' },
      },
      publisher: {
        '@type': 'Organization',
        name: 'ITG-SOFT',
        logo: { '@type': 'ImageObject', url: `${BASE}/logo.png`, width: 512, height: 512 },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${post.slug}` },
      isPartOf: { '@type': 'Blog', '@id': `${BASE}/blog`, name: 'ITG-SOFT Dev Stories' },
      inLanguage: 'en',
      ...(post.tags?.length > 0 ? { keywords: post.tags.join(', ') } : {}),
      ...(wordCount ? { wordCount } : {}),
      ...(post.category ? { articleSection: post.category.replace(/_/g, ' ') } : {}),
    }
  },

  /** Build an ItemList schema for the product listing page */
  buildItemList: (products) => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${BASE}/games#itemlist`,
    name: 'ITG-SOFT NES & Famicom Homebrew Games',
    description: 'Complete catalogue of original Taiwanese NES and Famicom homebrew games — physical cartridges and digital ROMs.',
    url: `${BASE}/games`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE}/games/${p.slug}`,
      name: p.title,
      image: p.box_art_url || `${BASE}/og-default.png`,
    })),
  }),

  /** Build a FAQPage schema from an array of {q, a} objects */
  buildFAQPage: (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }),

  /** Breadcrumb list for product/blog pages */
  buildBreadcrumb: (crumbs) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${BASE}${crumb.path}`,
    })),
  }),
}

// ---------------------------------------------------------------------------
// SITEMAP priority hints  (use when generating sitemap.xml)
// ---------------------------------------------------------------------------

export const SITEMAP_CONFIG = {
  home:        { priority: 1.0,  changefreq: 'weekly'  },
  listing:     { priority: 0.9,  changefreq: 'daily'   },
  productPage: { priority: 0.85, changefreq: 'weekly'  },
  blogIndex:   { priority: 0.7,  changefreq: 'daily'   },
  blogPost:    { priority: 0.65, changefreq: 'monthly' },
  about:       { priority: 0.6,  changefreq: 'monthly' },
  developers:  { priority: 0.6,  changefreq: 'monthly' },
  faq:         { priority: 0.5,  changefreq: 'monthly' },
  contact:     { priority: 0.5,  changefreq: 'yearly'  },
}
