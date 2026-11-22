import React, { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import SeoHead from '../components/SeoHead'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'
import { notifyEvent } from '../lib/notifications'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Per-product mock reviews ─────────────────────────────────────────────────
const REVIEWS = {
  'mr-lee-alishan-tea-collector': [
    { name: 'RetroFan_TW', rating: 5, text: 'Incredible game! The tea collecting mechanics are so unique. The box art alone is worth it. Shipped from Taiwan faster than I expected — arrived in perfect condition.' },
    { name: 'NESCollector88', rating: 5, text: 'Amazing homebrew. Ships fast and packaged incredibly well. This is the real deal — not a bootleg. Feels like something that could have genuinely come out in 1993.' },
    { name: 'FamicomDude', rating: 4, text: 'Great game, tight controls. A little short but the replay value is high. The hidden routes add a lot. Worth every dollar at this price point.' },
  ],
  'hungry-ghost-night': [
    { name: 'GhostMonthGamer', rating: 5, text: "The two different artist editions are a brilliant collector touch. Robert Gasse's cover is stunning. The gameplay is frantic in the best way — perfect for two players." },
    { name: 'TaiwanCulture', rating: 5, text: 'As a Taiwanese person this game hits different. Seeing Ghost Month turned into a loving 8-bit tribute genuinely moved me. The attention to the altar offering mechanics is incredible.' },
    { name: 'HomebrewHunter', rating: 4, text: 'Solid action game with great co-op. The increasing difficulty keeps it fresh. Would love a save system but the short stage lengths make it manageable.' },
  ],
  'dragon-boat-fest': [
    { name: 'PaddleFaster', rating: 5, text: 'Sold out for a reason! If you see a restock, grab it immediately. The festival music is authentic and the paddling mechanics are surprisingly deep for 8-bit.' },
    { name: 'RetroSports', rating: 4, text: 'Great sports game that actually captures the energy of Duanwu Festival. Two-player makes it competitive and fun.' },
    { name: 'FamiCollector', rating: 4, text: 'Gorgeous box art. The Famicom-only version is a nice collector decision. Fast shipping even from Taiwan.' },
  ],
  'peace-love-trippy-club': [
    { name: 'SurrealGamer', rating: 5, text: '~50 stages and it never gets boring because reality itself keeps shifting. One of the most unique NES games ever made, homebrew or otherwise.' },
    { name: 'NightlifeNES', rating: 4, text: 'The escalating surrealism is a genius design choice. You genuinely start questioning what\'s happening by stage 30. Original soundtrack goes hard.' },
    { name: 'PixelPunk', rating: 5, text: 'Best game in the catalog IMO. The nightclub setting is unlike anything on the platform. Highly recommended for anyone who wants something genuinely new.' },
  ],
  'houyi-shot-the-suns': [
    { name: 'MythologyFan', rating: 5, text: 'Perfect execution of the HouYi legend. The vertical shooter format fits the narrative perfectly. Sold out but absolutely worth hunting down.' },
    { name: 'ShooterKing', rating: 4, text: 'Challenging but fair. The boss encounters are creative interpretations of the mythology. Famicom-only adds to the collectibility.' },
  ],
  'vigor-maze': [
    { name: 'MazeRunner', rating: 4, text: 'Clean maze mechanics that outshine many commercial titles. The speed run mode is surprisingly addictive.' },
    { name: 'RetroTwo', rating: 4, text: 'Two-player competitive mode is a lot of fun. Good value for a maze game.' },
  ],
  'desolate-love': [
    { name: 'NarrativeGamer', rating: 5, text: 'This game is art. The way it tells a story without words, purely through environments and music, is remarkable for an 8-bit game. Made me feel things.' },
    { name: 'FamiEmotions', rating: 5, text: 'I did not expect to be emotionally affected by a Famicom homebrew. The battery save is important — do not play this in one sitting.' },
    { name: 'SlowGaming', rating: 4, text: 'Not for everyone but absolutely for me. The melancholy atmosphere is exactly what I wanted from a "quiet" game.' },
  ],
  'never-say-die': [
    { name: 'ActionHero', rating: 4, text: 'Does exactly what it says on the tin. Fast, fun, no-frills action. Great entry point for the ITG-SOFT catalog.' },
    { name: 'OldSchool', rating: 4, text: 'Reminds me of playing NES in the early 90s. Pure arcade fun.' },
  ],
  'piss-the-fish': [
    { name: 'PartyGamePro', rating: 5, text: 'The vertical controller mechanic is genuinely inventive. As a party game this is hilarious. The food box original edition is collector history.' },
    { name: 'FormosaFan', rating: 4, text: "Formosa TV Game Company are legends. This game shouldn't work but absolutely does." },
  ],
  'dudes-with-attitude': [
    { name: 'NES1990', rating: 4, text: "I owned the original NES version as a kid. Seeing it on Famicom in 2024 is a dream. M. Crick's original vision translated perfectly." },
    { name: 'ClassicRevived', rating: 5, text: 'The 32 puzzles add great depth. Level editor means you never run out of content. First Famicom release of a classic deserves respect.' },
    { name: 'RetroMulti', rating: 4, text: 'Best two-player NES platformer I own. The treasure hunting mechanic ages beautifully.' },
  ],
  'infiltration': [
    { name: 'NESMakerUser', rating: 4, text: "Impressive for a high school project — would be impressive for a professional studio. Edward Thompson has real talent. The multi-directional shooting feels great." },
    { name: 'ShooterFan', rating: 4, text: 'Vanguard influence is obvious and I mean that as the highest compliment. Both NES and Famicom editions are worth owning.' },
  ],
  'poo-panties-the-cat': [
    { name: 'KickstarterBacker', rating: 5, text: "Backed this from day one and so glad I did. Multiple characters play completely differently. The secret exits and bonus rooms reward exploration." },
    { name: 'FamiCat', rating: 5, text: "The children's book adaptation works perfectly in 8-bit. Six full worlds of content is incredible value." },
    { name: 'PlatformKing', rating: 4, text: 'Charming game with real depth. Battery save is a must for a platformer this size.' },
  ],
}

// ── Cartridge color map ──────────────────────────────────────────────────────
const CART_COLORS = {
  green: '#3a7d44', red: '#c0392b', yellow: '#f0a500', purple: '#7d3c98',
  orange: '#e67e22', teal: '#17808c', grey: '#7f8c8d', blue: '#2980b9',
  black: '#1a1a1a', pink: '#e91e8c', white: '#f8f7f4',
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    in_stock:  { label: 'In Stock',   bg: '#e8f5e9', color: '#2e7d32', border: '#81c784' },
    sold_out:  { label: 'Sold Out',   bg: '#fce4ec', color: '#c62828', border: '#ef9a9a' },
    preorder:  { label: 'Pre-Order',  bg: '#fff3e0', color: '#e65100', border: '#ffb74d' },
    coming_soon: { label: 'Coming Soon', bg: '#e3f2fd', color: '#0277bd', border: '#64b5f6' },
  }
  const s = map[status] || map.in_stock
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 4, padding: '4px 12px', fontSize: 15, fontWeight: 700,
    }}>{s.label}</span>
  )
}

// ── Star rating ──────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }) {
  return (
    <span>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= Math.round(rating) ? '#f09526' : '#ddd' }}>★</span>
      ))}
    </span>
  )
}

// ── Platform label ───────────────────────────────────────────────────────────
function platformLabel(p) {
  if (p === 'both') return 'NES & Famicom'
  if (p === 'nes') return 'NES Only'
  if (p === 'famicom') return 'Famicom Only'
  return p
}

// ── Build specs from product data ────────────────────────────────────────────
function buildSpecs(p, partners) {
  const year = p.release_date ? new Date(p.release_date).getFullYear() : '—'
  const players = p.players_min === p.players_max
    ? `${p.players_min} Player${p.players_min > 1 ? 's' : ''}`
    : `${p.players_min}–${p.players_max} Players`
  return [
    ['Platform',        platformLabel(p.platform)],
    ['Genre',           p.genre?.charAt(0).toUpperCase() + p.genre?.slice(1) || '—'],
    ['Region',          'NTSC (works on most Famiclones)'],
    ['Cartridge Type',  'CIB (Complete in Box)'],
    ['Release Year',    year],
    ['Developer',       p.is_itgsoft_original ? 'ITG-SOFT' : (partners.find(d => d.id === p.developer_id)?.name || 'ITG-SOFT')],
    ['Players',         players],
    ['Mapper',          p.mapper_type || '—'],
    ['PRG ROM',         p.prg_rom_size || '—'],
    ['CHR ROM',         p.chr_rom_size || '—'],
    ['Save',            p.save_type || 'None'],
    ['Manual',          'Yes — English & Traditional Chinese'],
    ...(p.age_rating ? [['Age Rating', p.age_rating]] : []),
  ]
}

// ── What's included ──────────────────────────────────────────────────────────
function buildIncludes(p) {
  const base = [
    '📦 Game cartridge (authentic PCB)',
    '🗂️ Full-color printed box',
    '📄 Instruction manual (EN/ZH)',
    '🏷️ ITG-SOFT collectible sticker sheet',
    '🎫 Insert/cartridge art card',
  ]
  if (p.save_type && p.save_type !== 'None') base.push('🔋 Battery-backed save (no password needed)')
  if (p.slug === 'mazu-guardian-of-the-tides') base.push('🪬 Authentic blessed Mazu pendant (pre-order bonus)')
  if (p.slug === 'hungry-ghost-night') base.push('🎨 Choice of Robert Gasse or Sydney Wang cover art edition')
  return base
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
export default function ProductDetailPage({ onNav, slug }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart()
  const { products, partners } = useStore()
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [addedMsg, setAddedMsg] = useState('')
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistDone, setWaitlistDone] = useState(false)
  const [waitlistErr, setWaitlistErr] = useState('')

  // Look up product. A bad slug should not silently render a different game.
  const product = slug ? products.find(p => p.slug === slug) : products[0]

  if (!product) {
    return (
      <div className="page">
        <SeoHead
          title="Game Not Found — ITG-SOFT"
          description="This ITG-SOFT game could not be found."
          canonical={slug ? `/games/${slug}` : '/games'}
          noIndex={true}
        />
        <div style={{ background: 'var(--darker)', padding: '12px 0', borderBottom: '2px solid #333' }}>
          <div className="container">
            <Breadcrumb items={['Home', 'Games', 'Not Found']} />
          </div>
        </div>
        <div className="container section" style={{ textAlign:'center', maxWidth:620 }}>
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:10 }}>Game not found</h1>
          <p style={{ color:'#666', marginBottom:24 }}>
            That cartridge is not in the catalog anymore, or the link was typed incorrectly.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => onNav?.('listing')}>
            Browse All Games
          </button>
        </div>
      </div>
    )
  }

  const developer = partners.find(d => d.id === product?.developer_id)

  // Related: same genre, exclude current, max 4
  const related = products.filter(p => p.slug !== product?.slug && p.genre === product?.genre).slice(0, 4)
  const relatedFallback = related.length < 4
    ? [...related, ...products.filter(p => p.slug !== product.slug && !related.find(r => r.slug === p.slug))].slice(0, 4)
    : related

  const productReviews = REVIEWS[product.slug] || []
  const specs = buildSpecs(product, partners)
  const includes = buildIncludes(product)

  const wishlisted = isWishlisted(product.id)

  function handleWaitlist(e) {
    e.preventDefault()
    const email = waitlistEmail.trim()
    if (!EMAIL_RE.test(email)) {
      setWaitlistErr('Enter a valid email address.')
      return
    }
    setWaitlistErr('')
    setWaitlistEmail(email)
    setWaitlistDone(true)
    void notifyEvent('product_waitlist_submitted', {
      slug: product.slug,
      title: product.title,
      email,
    })
  }

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) addItem(product, 'physical_cib')
    setAddedMsg('✓ Added to cart!')
    setTimeout(() => setAddedMsg(''), 2500)
  }

  // SEO
  const seoTitle = `${product.title} — NES/Famicom Game | ITG-SOFT`
  const seoDesc = `${product.title} — ${product.short_description} Physical CIB cartridge. Ships worldwide from Taiwan.`
  const productSchema = STRUCTURED_DATA.buildProduct({
    ...product,
    review_stats: product.review_stats?.review_count > 0 ? product.review_stats : undefined,
  })
  const breadcrumbSchema = STRUCTURED_DATA.buildBreadcrumb([
    { name: 'Home', path: '/' },
    { name: 'Shop All Games', path: '/games' },
    { name: product.title, path: `/games/${product.slug}` },
  ])

  const cartColor = CART_COLORS[product.cartridge_color] || '#555'
  const isAvailable = product.status === 'in_stock' && product.inventory?.available > 0
  const isPreorder = product.status === 'preorder'
  const isSoldOut = product.status === 'sold_out'
  const gallery = [...(product.box_art_url ? [{ url: product.box_art_url, caption: `${product.title} box art` }] : []), ...(product.screenshots || [])]

  return (
    <div className="page">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        canonical={`/games/${product.slug}`}
        keywords={PAGE_SEO.productKeywords[product.slug] || []}
        ogType="product"
        schema={[productSchema, breadcrumbSchema]}
      />

      {/* Breadcrumb */}
      <div style={{ background: 'var(--darker)', padding: '12px 0', borderBottom: '2px solid #333' }}>
        <div className="container">
          <Breadcrumb items={['Home', 'Games', product.title]} />
        </div>
      </div>

      <div className="container section">
        {/* ── TOP: Image + Buy Box ── */}
        <div className="layout-2col" style={{ gap: 48, marginBottom: 48 }}>

          {/* Left: Image gallery */}
          <div>
            {gallery.length > 0 ? (
              <>
                {/* Main screenshot */}
                <div style={{
                  borderRadius: 10, marginBottom: 12, overflow: 'hidden',
                  background: '#111', border: '2px solid #333', position: 'relative',
                  lineHeight: 0,
                }}>
                  <img
                    src={gallery[activeImg]?.url}
                    alt={gallery[activeImg]?.caption || product.title}
                    style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }}
                  />
                  {gallery[activeImg]?.caption && (
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                      padding: '20px 12px 10px', color: '#ddd', fontSize: 14,
                    }}>
                      {gallery[activeImg].caption}
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 10, right: 10, fontFamily: 'var(--pixel)', fontSize: 11, color: 'var(--orange)', background: 'rgba(0,0,0,0.6)', padding: '3px 6px', borderRadius: 2, letterSpacing: '0.1em' }}>
                    {activeImg + 1} / {gallery.length}
                  </div>
                </div>

                {/* Thumbnail strip */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {gallery.map((shot, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImg(i)}
                      style={{
                        width: 80, height: 56, borderRadius: 6, cursor: 'pointer', overflow: 'hidden',
                        border: `2px solid ${activeImg === i ? cartColor : '#ddd'}`,
                        transition: 'border-color 0.15s', flexShrink: 0, lineHeight: 0,
                      }}
                    >
                      <img src={shot.url} alt={shot.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Fallback: cartridge graphic */}
                <div style={{
                  height: 380, borderRadius: 10, marginBottom: 12, overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', border: '2px solid #333',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 120, height: 160, margin: '0 auto 16px',
                      background: cartColor, borderRadius: 6,
                      boxShadow: `0 8px 32px ${cartColor}66, inset 0 1px 0 rgba(255,255,255,0.1)`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', border: '2px solid rgba(255,255,255,0.1)',
                    }}>
                      <div style={{ fontFamily: 'var(--pixel)', fontSize: 10, color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: '0 8px', lineHeight: 1.6, letterSpacing: '0.05em' }}>
                        ITG<br/>SOFT<br/><br/>{product.title.substring(0, 12).toUpperCase()}
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }} />
                    </div>
                    <div style={{ color: '#888', fontSize: 15 }}>{product.title}</div>
                    <div style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
                      {platformLabel(product.platform)} · {product.genre?.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} onClick={() => setActiveImg(i)} style={{
                      width: 72, height: 56, borderRadius: 6, cursor: 'pointer',
                      background: activeImg === i ? `${cartColor}22` : '#f0ece6',
                      border: `2px solid ${activeImg === i ? cartColor : '#ddd'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#999', fontFamily: 'var(--pixel)', transition: 'all 0.15s',
                    }}>
                      {['FRONT','BACK','CART','BOX','MANUAL'][i]}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Trailer CTA */}
            <div style={{
              background: '#1a1a1a', border: '1px solid #333', borderRadius: 8,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontSize: 17, marginLeft: 2 }}>▶</span>
              </div>
              <div>
                <div style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Watch Gameplay Trailer</div>
                <div style={{ color: '#666', fontSize: 14 }}>YouTube · ~90 seconds</div>
              </div>
            </div>
          </div>

          {/* Right: Buy box */}
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={product.status} />
              {product.is_itgsoft_original && (
                <span style={{ background: 'rgba(240,149,38,0.1)', color: 'var(--orange)', border: '1px solid rgba(240,149,38,0.3)', borderRadius: 4, padding: '4px 10px', fontSize: 14, fontWeight: 700 }}>
                  ITG-SOFT Original
                </span>
              )}
              <span style={{ background: '#f0ece6', color: '#555', borderRadius: 4, padding: '4px 10px', fontSize: 14 }}>
                {platformLabel(product.platform)}
              </span>
              {product.age_rating && (
                <span style={{ background: '#fce4ec', color: '#c62828', borderRadius: 4, padding: '4px 10px', fontSize: 14, fontWeight: 700 }}>
                  {product.age_rating}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, lineHeight: 1.15, fontFamily: 'var(--heading)' }}>
              {product.title}
            </h1>
            {product.subtitle && (
              <p style={{ color: '#888', fontSize: 16, marginBottom: 6 }}>{product.subtitle}</p>
            )}
            <div style={{ color: '#aaa', fontSize: 15, marginBottom: 16 }}>
              by {product.is_itgsoft_original ? 'ITG-SOFT' : (developer?.name || 'ITG-SOFT')}
              {product.release_date && ` · Released ${new Date(product.release_date).getFullYear()}`}
            </div>

            {/* Price + rating */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--dark)', fontFamily: 'var(--heading)' }}>
                ${(product.price_physical || product.price_digital || 0).toFixed(2)}
              </span>
              <span style={{ color: '#999', fontSize: 16 }}>USD</span>
              {product.compare_price && (
                <span style={{ color: '#bbb', fontSize: 17, textDecoration: 'line-through' }}>
                  ${product.compare_price.toFixed(2)}
                </span>
              )}
            </div>

            {product.review_stats?.review_count > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Stars rating={product.review_stats.average_rating} size={16} />
                <span style={{ fontSize: 16, color: '#888' }}>
                  {product.review_stats.average_rating.toFixed(1)} / 5
                  &nbsp;({product.review_stats.review_count} reviews)
                </span>
              </div>
            ) : (
              <div style={{ marginBottom: 20, fontSize: 15, color: '#aaa' }}>No reviews yet — be the first!</div>
            )}

            {/* Short description */}
            <p style={{ color: '#555', fontSize: 17, lineHeight: '1.75', marginBottom: 20 }}>
              {product.short_description}
            </p>

            {/* Pre-order info */}
            {isPreorder && product.preorder_ship_date && (
              <div style={{ background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 16 }}>
                <strong>📅 Estimated ship date:</strong> {new Date(product.preorder_ship_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {product.inventory?.quantity_reserved > 0 && (
                  <div style={{ marginTop: 4, color: '#e65100' }}>
                    🔥 {product.inventory.quantity_reserved} people have pre-ordered
                  </div>
                )}
              </div>
            )}

            {/* Scarcity */}
            {isAvailable && product.inventory.available <= 20 && (
              <div style={{ background: '#fff8e1', border: '1px solid #ffc107', borderRadius: 6, padding: '8px 14px', marginBottom: 16, fontSize: 16, color: '#856404' }}>
                ⚠️ <strong>Only {product.inventory.available} left in stock</strong> — order soon!
              </div>
            )}

            {isSoldOut && (
              <div style={{ background: '#fce4ec', border: '1px solid #ef9a9a', borderRadius: 6, padding: '14px', marginBottom: 16, fontSize: 16, color: '#c62828' }}>
                {waitlistDone ? (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>✉️</div>
                    <div style={{ fontWeight: 700, color: '#c62828', marginBottom: 4 }}>You're on the list!</div>
                    <div style={{ fontSize: 15, color: '#888' }}>We'll email you the moment this item is back in stock.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 10 }}>😔 <strong>Currently sold out.</strong> Join the waitlist to be notified on restock.</div>
                    <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email"
                        required
                        value={waitlistEmail}
                        onChange={e => setWaitlistEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoComplete="email"
                        style={{ flex: 1, padding: '7px 10px', border: '1px solid #ef9a9a', borderRadius: 4, fontSize: 15, outline: 'none', color: '#222', boxSizing: 'border-box' }}
                      />
                      <button type="submit" style={{ background: 'var(--orange)', color: 'white', border: 'none', borderRadius: 4, padding: '7px 14px', fontSize: 15, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Notify Me
                      </button>
                    </form>
                    {waitlistErr && <div style={{ color:'#c62828', fontSize:15, marginTop:6 }}>{waitlistErr}</div>}
                  </>
                )}
              </div>
            )}

            {/* Qty + Add to Cart */}
            {!isSoldOut && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '10px 16px', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>−</button>
                  <span style={{ padding: '0 20px', fontWeight: 700, fontSize: 15, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ padding: '10px 16px', border: 'none', background: '#f5f5f5', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>+</button>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, boxShadow: 'inset 4px 4px 0 #e8843a, inset -4px -4px 0 #7a2e00, inset 6px 6px 0 #d4701a, inset -6px -6px 0 #903800, 0 4px 12px rgba(240,149,38,0.3)' }}
                  onClick={handleAddToCart}
                >
                  {addedMsg || (isPreorder ? '🛒 Pre-Order Now' : '🛒 Add to Cart')}
                </button>
              </div>
            )}

            <button
              className="btn btn-secondary btn-full"
              style={{ marginBottom: 20 }}
              onClick={() => toggleWishlist(product)}
            >
              {wishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </button>

            {/* Trust signals */}
            <div style={{ background: '#f8f7f4', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              {[
                ['🔒', 'Secure checkout via approved payment providers'],
                ['📦', 'Ships from Taichung, Taiwan in 2–3 business days'],
                ['🌏', 'Free standard shipping on orders over $100'],
                ['↩️', '30-day return policy on physical items'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 16, color: '#555', marginBottom: 8 }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>

            {/* Share */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 15, color: '#999' }}>Share:</span>
              {['Twitter', 'Facebook', 'Reddit', 'Copy Link'].map(s => (
                <button key={s} className="btn btn-secondary btn-sm" style={{ fontSize: 14, padding: '4px 10px' }}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ borderBottom: '2px solid var(--border)', marginBottom: 32, display: 'flex', gap: 0, overflowX: 'auto' }}>
          {['description', 'specs', "what's included", 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px', border: 'none',
                borderBottom: activeTab === tab ? '3px solid var(--orange)' : '3px solid transparent',
                background: 'none',
                color: activeTab === tab ? 'var(--orange)' : '#666',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: 17, cursor: 'pointer',
                textTransform: 'capitalize', marginBottom: -2, whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="two-col">
          <div>
            {/* ── Description tab ── */}
            {activeTab === 'description' && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, fontFamily: 'var(--heading)' }}>About the Game</h2>
                <p style={{ fontSize: 17, lineHeight: '1.85', color: '#444', marginBottom: 20 }}>{product.description}</p>
                {!product.is_itgsoft_original && developer && (
                  <div style={{ background: '#f8f7f4', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>About the Developer</div>
                    <p style={{ fontSize: 16, color: '#555', lineHeight: '1.7' }}>{developer.bio}</p>
                  </div>
                )}
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, marginTop: 24 }}>Key Features</h3>
                <ul style={{ paddingLeft: 20, color: '#555', fontSize: 17, lineHeight: '2' }}>
                  {[
                    `Original ${platformLabel(product.platform)} cartridge`,
                    'Complete-in-Box (CIB): box, cartridge, manual, inserts',
                    `${product.players_max > 1 ? `${product.players_min}–${product.players_max} player ${product.genre} gameplay` : `Single-player ${product.genre} gameplay`}`,
                    'Original chiptune soundtrack composed for NES APU',
                    'Supports original hardware, Famiclones & FPGA systems',
                    ...(product.save_type && product.save_type !== 'None' ? [`Battery-backed save — ${product.save_type}`] : []),
                    'Ships worldwide from Taichung City, Taiwan',
                  ].map(f => <li key={f}>{f}</li>)}
                </ul>
                {product.tags?.length > 0 && (
                  <div style={{ marginTop: 24, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {product.tags.map(t => (
                      <span key={t} style={{ background: '#f0ece6', color: '#666', borderRadius: 20, padding: '4px 12px', fontSize: 14 }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Specs tab ── */}
            {activeTab === 'specs' && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, fontFamily: 'var(--heading)' }}>Technical Specifications</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 17 }}>
                  <tbody>
                    {specs.map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#555', width: '40%', background: '#f8f7f4' }}>{k}</td>
                        <td style={{ padding: '12px 16px', color: '#333' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 16, padding: '12px 16px', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: 6, fontSize: 16, color: '#0d47a1' }}>
                  💡 <strong>Hardware Tip:</strong> All ITG-SOFT games are tested on original NES (72-pin) and Famicom (60-pin) hardware. They also work on Everdrive N8 Pro, Analogue Pocket (NES adapter), and MiSTer FPGA NES core.
                </div>
              </div>
            )}

            {/* ── What's included tab ── */}
            {activeTab === "what's included" && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, fontFamily: 'var(--heading)' }}>What's Included</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {includes.map(item => (
                    <div key={item} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: 'white', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '14px 18px', fontSize: 17, fontWeight: 500,
                    }}>{item}</div>
                  ))}
                </div>
                <div style={{ marginTop: 20, padding: '14px 18px', background: '#f8f7f4', border: '1px solid var(--border)', borderRadius: 8, fontSize: 16, color: '#555', lineHeight: '1.7' }}>
                  📦 <strong>Packaging:</strong> All games are shipped with bubble-wrap protection inside a rigid cardboard outer box. We take great pride in the unboxing experience — every order arrives in collector-ready condition.
                </div>
              </div>
            )}

            {/* ── Reviews tab ── */}
            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--heading)' }}>Customer Reviews</h2>
                  <button className="btn btn-primary btn-sm">Write a Review</button>
                </div>

                {product.review_stats?.review_count > 0 ? (
                  <>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'center', background: '#f8f7f4', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--orange)', lineHeight: 1 }}>
                          {product.review_stats.average_rating.toFixed(1)}
                        </div>
                        <Stars rating={product.review_stats.average_rating} size={14} />
                        <div style={{ fontSize: 15, color: '#888', marginTop: 4 }}>{product.review_stats.review_count} reviews</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {[5,4,3,2,1].map(s => {
                          const count = product.review_stats.distribution?.[s] || 0
                          const pct = product.review_stats.review_count > 0
                            ? (count / product.review_stats.review_count) * 100 : 0
                          return (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: 15, width: 10, color: '#666', textAlign: 'right' }}>{s}</span>
                              <span style={{ color: '#f09526', fontSize: 14 }}>★</span>
                              <div style={{ flex: 1, height: 8, background: '#e0dbd4', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--orange)', borderRadius: 4, transition: 'width 0.6s' }} />
                              </div>
                              <span style={{ fontSize: 15, color: '#888', width: 24, textAlign: 'right' }}>{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {productReviews.map(r => (
                      <div key={r.name} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, padding: 20, marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 17 }}>{r.name}</div>
                          <Stars rating={r.rating} size={13} />
                        </div>
                        <p style={{ fontSize: 16, color: '#555', lineHeight: '1.7' }}>{r.text}</p>
                        <div style={{ fontSize: 14, color: '#999', marginTop: 8 }}>✅ Verified Purchase</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
                    <p>No reviews yet. Be the first to review this game!</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Write the First Review</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="sidebar-card" style={{ position: 'sticky', top: 80 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>Quick Buy</div>
            {/* Cart thumbnail */}
            <div style={{
              height: 120, borderRadius: 8, marginBottom: 14,
              background: `linear-gradient(135deg, ${cartColor}33, ${cartColor}11)`,
              border: `1px solid ${cartColor}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 50, height: 68,
                background: cartColor, borderRadius: 4,
                boxShadow: `0 4px 12px ${cartColor}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: '0 4px', lineHeight: 1.6 }}>
                  ITG<br/>SOFT
                </span>
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, lineHeight: 1.3 }}>{product.title}</div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>{platformLabel(product.platform)}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--orange)', marginBottom: 14, fontFamily: 'var(--heading)' }}>
              ${(product.price_physical || product.price_digital || 0).toFixed(2)}
            </div>
            {!isSoldOut && (
              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginBottom: 10, boxShadow: 'inset 4px 4px 0 #e8843a, inset -4px -4px 0 #7a2e00, inset 6px 6px 0 #d4701a, inset -6px -6px 0 #903800, 0 4px 12px rgba(240,149,38,0.3)' }}
                onClick={handleAddToCart}
              >
                {addedMsg || (isPreorder ? '🛒 Pre-Order' : '🛒 Add to Cart')}
              </button>
            )}
            {isSoldOut && (
              waitlistDone ? (
                <div style={{ marginBottom: 10, padding: '8px', background: '#e8f5e9', border: '1px solid #81c784', borderRadius: 6, textAlign: 'center', fontSize: 15, color: '#2e7d32', fontWeight: 700 }}>
                  ✓ You're on the waitlist!
                </div>
              ) : (
                <form onSubmit={handleWaitlist} style={{ marginBottom: 10 }}>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)}
                    placeholder="Email for restock alert"
                    autoComplete="email"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 15, outline: 'none', color: '#222', boxSizing: 'border-box', marginBottom: 6 }}
                  />
                  <button type="submit" className="btn btn-secondary btn-full" style={{ fontSize: 15 }}>
                    Notify on Restock
                  </button>
                  {waitlistErr && <div style={{ color:'#c62828', fontSize:15, marginTop:6 }}>{waitlistErr}</div>}
                </form>
              )
            )}
            <div style={{ color: '#888', fontSize: 15, textAlign: 'center', lineHeight: '1.8' }}>
              Free shipping on orders $100+<br />
              Ships from Taiwan in 2–3 days<br />
              30-day return policy
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedFallback.length > 0 && (
          <div style={{ marginTop: 56, paddingTop: 40, borderTop: '2px solid var(--border)' }}>
            <div className="section-title">YOU MAY ALSO LIKE</div>
            <h2 className="section-heading">Related Games</h2>
            <div className="grid-4">
              {relatedFallback.map(g => (
                <div
                  key={g.id}
                  style={{ background: 'white', border: '2px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                  onClick={() => onNav?.('detail', g.slug)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(240,149,38,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{
                    height: 140, background: `linear-gradient(135deg, ${CART_COLORS[g.cartridge_color] || '#555'}33, ${CART_COLORS[g.cartridge_color] || '#555'}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 50, height: 68, background: CART_COLORS[g.cartridge_color] || '#555', borderRadius: 3, boxShadow: `0 4px 10px ${CART_COLORS[g.cartridge_color] || '#555'}55` }} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <StatusBadge status={g.status} />
                    <div style={{ fontWeight: 600, fontSize: 16, margin: '8px 0', lineHeight: 1.3 }}>{g.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: 'var(--orange)', fontSize: 15 }}>
                        ${(g.price_physical || g.price_digital || 0).toFixed(2)}
                      </span>
                      <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onNav?.('detail', g.slug) }}>
                        View →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
