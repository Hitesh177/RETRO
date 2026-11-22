/**
 * SeoHead — dynamic <head> manager for every page.
 *
 * Handles:
 *  • Unique title (50-60 chars)
 *  • Unique meta description (150-160 chars)
 *  • Open Graph (og:*) tags incl. og:image:secure_url
 *  • Twitter Card tags
 *  • Canonical URL
 *  • hreflang (en default + zh-Hant prep for Phase 2)
 *  • JSON-LD structured data (any schema type)
 *  • Robots directive per page
 *  • Article-specific meta (section, tags, modified time)
 *  • Product-specific meta (price, availability)
 */

import { Helmet } from 'react-helmet-async'

const PROD_BASE_URL = import.meta.env.VITE_SITE_URL || 'https://itg-soft.tw'
const DEFAULT_OG_IMAGE = `${PROD_BASE_URL}/og-default.png`
const SITE_NAME = 'ITG-SOFT'
const TWITTER_HANDLE = '@indietaiwangame'

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return origin
    }
  }
  return PROD_BASE_URL
}

export default function SeoHead({
  title,
  description,
  canonical,
  ogImage,
  ogImageAlt,
  ogType = 'website',
  keywords = [],
  schema,
  noIndex = false,
  // Article
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
  // Product
  productPrice,
  productCurrency = 'USD',
  productAvailability,
}) {
  const baseUrl = getBaseUrl()
  const canonicalUrl = canonical
    ? `${baseUrl}${canonical.startsWith('/') ? canonical : '/' + canonical}`
    : baseUrl

  const image = ogImage || DEFAULT_OG_IMAGE
  const imageAlt = ogImageAlt || title
  const isProdHost = typeof window !== 'undefined'
    ? /(^|\.)itg-soft\.tw$/i.test(window.location.hostname)
    : true

  // Normalise schema to array
  const schemas = Array.isArray(schema) ? schema : schema ? [schema] : []

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {noIndex || !isProdHost
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      }

      {/* ── Canonical ── */}
      <link rel="canonical" href={canonicalUrl} />

      {/* ── hreflang (en default; zh-Hant prep for Phase 2) ── */}
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="zh-Hant" href={canonicalUrl.replace(baseUrl, `${baseUrl}/zh`)} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* ── Open Graph ── */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="zh_TW" />

      {/* ── Article-specific OG ── */}
      {ogType === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {ogType === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {ogType === 'article' && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}
      {ogType === 'article' && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {ogType === 'article' && articleTags && articleTags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* ── Product-specific OG ── */}
      {ogType === 'product' && productPrice != null && (
        <meta property="product:price:amount" content={String(productPrice)} />
      )}
      {ogType === 'product' && (
        <meta property="product:price:currency" content={productCurrency} />
      )}
      {ogType === 'product' && productAvailability && (
        <meta property="product:availability" content={productAvailability} />
      )}

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
      {ogType === 'article' && articlePublishedTime && (
        <meta name="twitter:label1" content="Published" />
      )}
      {ogType === 'article' && articlePublishedTime && (
        <meta name="twitter:data1" content={new Date(articlePublishedTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} />
      )}

      {/* ── JSON-LD Structured Data ── */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  )
}
