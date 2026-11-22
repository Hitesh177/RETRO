/**
 * LazyImg — performance-optimised image component.
 *
 * Features:
 *  • loading="lazy"  (native browser lazy loading)
 *  • <picture> element with WebP source + original format fallback
 *  • decoding="async" (off main thread image decode)
 *  • Enforced alt text (warns in dev if missing)
 *  • Optional aspectRatio to prevent layout shift (CLS)
 *  • Optional placeholder blur while loading
 *
 * Usage:
 *   <LazyImg src="/images/mr-lee-boxart.jpg" alt="Mr Lee's Alishan Tea Collector NES cartridge box art" width={600} height={400} />
 *   <LazyImg src="/images/hero.png" alt="..." aspectRatio="16/9" className="hero-img" />
 */

import { useState } from 'react'

/**
 * Derives the WebP URL from a source path.
 * e.g. "/images/mr-lee.jpg" → "/images/mr-lee.webp"
 * If the source is already .webp or an external URL, returns null (no <source> added).
 */
function toWebP(src) {
  if (!src) return null
  if (src.startsWith('http') || src.startsWith('//')) return null
  if (src.endsWith('.webp')) return null
  return src.replace(/\.(jpe?g|png|gif)$/i, '.webp')
}

export default function LazyImg({
  src,
  alt,
  width,
  height,
  aspectRatio,
  className,
  style,
  imgStyle,
  placeholder = true,
  priority = false,    // set true for LCP images (hero) → no lazy loading
  sizes,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false)
  const webpSrc = toWebP(src)

  if (!alt && process.env.NODE_ENV !== 'production') {
    console.warn('[LazyImg] Missing alt text on image:', src)
  }

  const wrapperStyle = {
    display: 'block',
    overflow: 'hidden',
    position: aspectRatio ? 'relative' : undefined,
    aspectRatio: aspectRatio || undefined,
    background: placeholder && !loaded ? '#e8e4df' : 'transparent',
    transition: 'background 0.3s',
    ...style,
  }

  const imageStyle = {
    display: 'block',
    width: '100%',
    height: aspectRatio ? '100%' : undefined,
    objectFit: aspectRatio ? 'cover' : undefined,
    opacity: placeholder ? (loaded ? 1 : 0) : 1,
    transition: 'opacity 0.4s ease',
    ...imgStyle,
  }

  return (
    <span style={wrapperStyle} className={className}>
      <picture>
        {webpSrc && (
          <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
        )}
        <img
          src={src}
          alt={alt || ''}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          style={imageStyle}
          {...rest}
        />
      </picture>
    </span>
  )
}
