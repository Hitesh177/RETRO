import React, { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import SeoHead from '../components/SeoHead'
import GameArtwork from '../components/GameArtwork'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'

function normaliseProducts(products, partners) {
  return products.map(p => ({
    id:           p.id,
    slug:         p.slug,
    title:        p.title,
    subtitle:     p.subtitle,
    price_physical: p.price_physical,
    price_digital:  p.price_digital,
    box_art_url:    p.box_art_url,
    badge:        p.status,
    genre:        p.genre?.charAt(0).toUpperCase() + p.genre?.slice(1),
    type:         p.format === 'digital_only' ? 'digital' : 'physical',
    platform:     p.platform === 'both' ? 'NES/Famicom' : p.platform === 'nes' ? 'NES' : 'Famicom',
    developer:    p.is_itgsoft_original
      ? 'ITG.Soft'
      : (partners.find(d => d.id === p.developer_id)?.name || 'ITG.Soft'),
    cartridge_color: p.cartridge_color || 'grey',
    review_stats: p.review_stats,
    is_original:  p.is_itgsoft_original,
  }))
}

const badgeMap = {
  'in_stock':    { label: 'In Stock',    cls: 'badge-in-stock'    },
  'sold_out':    { label: 'Sold Out',    cls: 'badge-coming-soon' },
  'preorder':    { label: 'Pre-Order',   cls: 'badge-preorder'    },
  'coming_soon': { label: 'Coming Soon', cls: 'badge-coming-soon' },
}

function GameCard({ game, onNav, addItem }) {
  const { id, slug, title, price_physical, price_digital, badge, genre, type,
          platform, developer, review_stats, is_original } = game
  const b = badgeMap[badge] || badgeMap['in_stock']
  const displayPrice = type === 'digital'
    ? (price_digital === 0 ? 'FREE' : `$${price_digital}`)
    : `$${(price_physical || 0).toFixed(2)}`
  const format = type === 'digital' ? 'digital' : 'physical_cib'
  const canBuy = badge === 'in_stock' || badge === 'preorder'

  function handleAddToCart() {
    addItem({ id, slug, title, price_physical, price_digital, box_art_url: game.box_art_url, status: badge }, format)
  }

  return (
    <div
      className="game-card"
      style={{ cursor: 'pointer' }}
      onClick={() => onNav?.('detail', slug)}
    >
      <div style={{ position: 'relative' }}>
        <GameArtwork src={game.box_art_url} title={title} genre={genre} platform={platform} />
        {is_original && (
          <div style={{ position: 'absolute', top: 12, right: 12, background: '#f09526', color: '#171717', fontSize: 12, fontFamily: 'var(--pixel)', padding: '5px 7px', borderRadius: 2 }}>
            ORIGINAL
          </div>
        )}
      </div>

      <div className="game-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div className="game-card-title" style={{ flex: 1, marginRight: 8, fontSize: 16 }}>{title}</div>
          <span style={{ fontSize: 13, color: '#999', whiteSpace: 'nowrap' }}>📦 CIB</span>
        </div>
        <div style={{ fontSize: 14, color: '#aaa', marginBottom: 6 }}>{platform} · {developer}</div>
        {review_stats?.review_count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <span style={{ color: '#f09526', fontSize: 14 }}>{'★'.repeat(Math.round(review_stats.average_rating))}</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>({review_stats.review_count})</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="game-card-price" style={{ opacity: badge === 'sold_out' ? 0.4 : 1 }}>{displayPrice}</span>
          <span className={`wf-badge ${b.cls}`}>{b.label}</span>
        </div>
      </div>

      <div className="game-card-footer" onClick={e => e.stopPropagation()}>
        {canBuy
          ? <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAddToCart}>
              {badge === 'preorder' ? '⊕ Pre-Order' : '+ Cart'}
            </button>
          : badge === 'sold_out'
            ? <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} disabled>Sold Out</button>
            : <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Notify Me</button>
        }
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onNav?.('detail', slug)}>Details</button>
      </div>
    </div>
  )
}

const GENRES = ['Action','Adventure','Platformer','Horror','Puzzle','Shooter','Arcade','RPG']
const PRICE_MAX = 60

export default function ListingPage({ onNav }) {
  const { addItem } = useCart()
  const { products, partners } = useStore()
  const ALL_GAMES = normaliseProducts(products, partners)

  // Tab filter
  const [activeTab, setActiveTab] = useState('all')
  // Sidebar filters
  const [genres, setGenres] = useState(new Set()) // empty = all
  const [typeFilter, setTypeFilter] = useState('all') // all | physical | digital
  const [priceMax, setPriceMax] = useState(PRICE_MAX)
  const [showOriginal, setShowOriginal] = useState(true)
  const [showPartner, setShowPartner] = useState(true)
  // Sort
  const [sortBy, setSortBy] = useState('featured')

  const tabs = [
    { id: 'all',          label: 'All Games' },
    { id: 'in-stock',     label: 'In Stock' },
    { id: 'preorder',     label: 'Pre-Orders' },
    { id: 'coming-soon',  label: 'Coming Soon' },
    { id: 'digital',      label: 'Digital Downloads' },
  ]

  function toggleGenre(g) {
    setGenres(prev => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }

  function resetFilters() {
    setActiveTab('all')
    setGenres(new Set())
    setTypeFilter('all')
    setPriceMax(PRICE_MAX)
    setShowOriginal(true)
    setShowPartner(true)
    setSortBy('featured')
  }

  // Apply filters
  let filtered = ALL_GAMES

  // Tab
  if (activeTab === 'in-stock')    filtered = filtered.filter(g => g.badge === 'in_stock')
  else if (activeTab === 'preorder')     filtered = filtered.filter(g => g.badge === 'preorder')
  else if (activeTab === 'coming-soon')  filtered = filtered.filter(g => g.badge === 'coming_soon')
  else if (activeTab === 'digital')      filtered = filtered.filter(g => g.type === 'digital')

  // Genre
  if (genres.size > 0) filtered = filtered.filter(g => genres.has(g.genre))

  // Type
  if (typeFilter === 'physical') filtered = filtered.filter(g => g.type === 'physical')
  else if (typeFilter === 'digital') filtered = filtered.filter(g => g.type === 'digital')

  // Price
  filtered = filtered.filter(g => {
    const price = g.type === 'digital' ? (g.price_digital || 0) : (g.price_physical || 0)
    return price <= priceMax
  })

  // Developer
  if (!showOriginal) filtered = filtered.filter(g => !g.is_original)
  if (!showPartner)  filtered = filtered.filter(g => g.is_original)

  // Sort
  if (sortBy === 'price-asc')  filtered = [...filtered].sort((a,b) => (a.price_physical||0) - (b.price_physical||0))
  else if (sortBy === 'price-desc') filtered = [...filtered].sort((a,b) => (b.price_physical||0) - (a.price_physical||0))
  else if (sortBy === 'title') filtered = [...filtered].sort((a,b) => a.title.localeCompare(b.title))

  return (
    <div className="page">
      <SeoHead
        title={PAGE_SEO.listing.title}
        description={PAGE_SEO.listing.description}
        canonical={PAGE_SEO.listing.canonical}
        keywords={PAGE_SEO.listing.keywords}
        ogImageAlt={PAGE_SEO.listing.og_image_alt}
        schema={[
          STRUCTURED_DATA.buildItemList(products),
          STRUCTURED_DATA.buildBreadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Shop All Games', path: '/games' },
          ]),
        ]}
      />
      {/* Page Hero */}
      <div style={{background:'var(--darker)',padding:'32px 0',borderBottom:'3px solid var(--orange)'}}>
        <div className="container">
          <Breadcrumb items={['Home','Games']} />
          <h1 style={{color:'white',fontFamily:'var(--pixel)',fontSize:16,marginBottom:8}}>ALL GAMES</h1>
          <p style={{color:'#888',fontSize:17}}>Browse our full catalog of Taiwanese homebrew NES & Famicom games</p>
        </div>
      </div>

      <div className="container section">
        {/* Tab filters */}
        <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="layout-sidebar" style={{gap:32}}>
          {/* ── SIDEBAR FILTERS ── */}
          <div>
            <div style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:20,marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:14,textTransform:'uppercase',letterSpacing:'0.05em'}}>Filter</div>

              <div style={{marginBottom:20}}>
                <div className="form-label">Genre</div>
                {GENRES.map(g => (
                  <label key={g} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,cursor:'pointer',fontSize:16}}>
                    <input
                      type="checkbox"
                      checked={genres.has(g)}
                      onChange={() => toggleGenre(g)}
                    />
                    {g}
                  </label>
                ))}
              </div>

              <div style={{marginBottom:20}}>
                <div className="form-label">Type</div>
                {[['all','All'],['physical','Physical CIB'],['digital','Digital ROM']].map(([val,label]) => (
                  <label key={val} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,cursor:'pointer',fontSize:16}}>
                    <input
                      type="radio"
                      name="type"
                      checked={typeFilter === val}
                      onChange={() => setTypeFilter(val)}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div style={{marginBottom:20}}>
                <div className="form-label">Max Price: ${priceMax}</div>
                <input
                  type="range"
                  min={0}
                  max={PRICE_MAX}
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  style={{width:'100%'}}
                />
                <div style={{display:'flex',justifyContent:'space-between',fontSize:14,color:'#999',marginTop:4}}>
                  <span>$0</span><span>${PRICE_MAX}</span>
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <div className="form-label">Developer</div>
                <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,cursor:'pointer',fontSize:16}}>
                  <input type="checkbox" checked={showOriginal} onChange={e => setShowOriginal(e.target.checked)} />
                  ITG-SOFT Originals
                </label>
                <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,cursor:'pointer',fontSize:16}}>
                  <input type="checkbox" checked={showPartner} onChange={e => setShowPartner(e.target.checked)} />
                  Partner Devs
                </label>
              </div>

              <button className="btn btn-secondary btn-sm btn-full" onClick={resetFilters}>Reset Filters</button>
            </div>

            {/* Promo sidebar */}
            <div style={{background:'var(--darker)',borderRadius:10,padding:20,textAlign:'center'}}>
              <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:8}}>FREE SHIPPING</div>
              <div style={{color:'white',fontSize:16,fontWeight:600,marginBottom:6}}>Orders over $100</div>
              <div style={{color:'#666',fontSize:15}}>Worldwide delivery</div>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div>
            {/* Sort / Results bar */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,padding:'12px 16px',background:'white',border:'1px solid var(--border)',borderRadius:8}}>
              <div style={{fontSize:16,color:'#666'}}>
                <strong style={{color:'#333'}}>{filtered.length}</strong> of {ALL_GAMES.length} titles
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <label style={{fontSize:16,color:'#666'}}>Sort by:</label>
                <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{width:'auto',padding:'6px 12px',fontSize:16}}>
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="title">A–Z</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px 0',color:'#999',fontSize:17}}>
                No games match your filters.{' '}
                <button className="btn btn-secondary btn-sm" onClick={resetFilters}>Reset</button>
              </div>
            ) : (
              <div className="grid-3">
                {filtered.map(g => (
                  <GameCard key={g.id} game={g} onNav={onNav} addItem={addItem} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
