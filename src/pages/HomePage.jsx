import React from 'react'
import { useCart } from '../context/CartContext'
import { useStore } from '../context/StoreContext'
import SeoHead from '../components/SeoHead'
import GameArtwork from '../components/GameArtwork'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'
import { supabase } from '../lib/supabase'
import { notifyEvent } from '../lib/notifications'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const badgeMap = {
  'in_stock':    { label: 'In Stock',    cls: 'badge-in-stock'   },
  'preorder':    { label: 'Pre-Order',   cls: 'badge-preorder'   },
  'sold_out':    { label: 'Sold Out',    cls: 'badge-coming-soon'},
  'coming_soon': { label: 'Coming Soon', cls: 'badge-coming-soon'},
}

function GameCard({ game, onNav, addItem }) {
  const { id, title, price, badge, genre, platform, slug } = game
  const b = badgeMap[badge] || badgeMap['in_stock']
  const canBuy = badge === 'in_stock' || badge === 'preorder'
  return (
    <div className="game-card">
      <GameArtwork src={game.box_art_url} title={title} genre={genre} platform={platform} />
      <div className="game-card-body">
        <div className="game-card-title">{title}</div>
        <div style={{fontSize:14,color:'#aaa',marginBottom:4}}>{platform}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
          <span className="game-card-price">${price.toFixed(2)}</span>
          <span className={`wf-badge ${b.cls}`}>{b.label}</span>
        </div>
      </div>
      <div className="game-card-footer">
        {canBuy
          ? <button className="btn btn-primary btn-sm" style={{flex:1}} onClick={() => addItem({id,slug,title,price_physical:price,price_digital:null,box_art_url:game.box_art_url,status:badge},'physical_cib')}>
              {badge === 'preorder' ? '⊕ Pre-Order' : '+ Cart'}
            </button>
          : <button className="btn btn-secondary btn-sm" style={{flex:1}} disabled>Sold Out</button>
        }
        <button className="btn btn-secondary btn-sm" style={{flex:1}} onClick={() => onNav?.('detail', slug)}>Details</button>
      </div>
    </div>
  )
}

export default function HomePage({ onNav }) {
  const { addItem } = useCart()
  const { products, blogPosts } = useStore()
  const [nlEmail, setNlEmail] = React.useState('')
  const [nlDone,  setNlDone]  = React.useState(false)
  const [nlBusy,  setNlBusy]  = React.useState(false)
  const [nlErr,   setNlErr]   = React.useState('')

  async function handleNewsletter(e) {
    e.preventDefault()
    const email = nlEmail.trim().toLowerCase()
    setNlErr('')
    if (!EMAIL_RE.test(email)) {
      setNlErr('Enter a valid email address.')
      return
    }
    setNlBusy(true)
    const { error } = await supabase.from('newsletter_subscribers').upsert(
      { email, source: 'homepage' },
      { onConflict: 'email' }
    )
    setNlBusy(false)
    if (error) setNlErr('Something went wrong. Try again.')
    else {
      setNlDone(true)
      void notifyEvent('newsletter_subscribed', { email, source: 'homepage' })
    }
  }

  // Build featured list from live store — first 8 non-discontinued products
  const FEATURED = products
    .filter(p => p.status !== 'discontinued')
    .slice(0, 8)
    .map(p => ({
      id:       p.id,
      title:    p.title,
      price:    p.price_physical || 0,
      badge:    p.status,
      genre:    p.genre ? p.genre.charAt(0).toUpperCase() + p.genre.slice(1) : '',
      slug:     p.slug,
      box_art_url: p.box_art_url,
      platform: p.platform === 'both' ? 'NES/Famicom' : p.platform === 'nes' ? 'NES' : 'Famicom',
    }))

  const PREORDERS = products.filter(p => p.status === 'preorder').slice(0, 2)
  const COMING_SOON = products.filter(p => p.status === 'coming_soon').slice(0, 2)
  return (
    <div className="page">
      <SeoHead
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        canonical={PAGE_SEO.home.canonical}
        keywords={PAGE_SEO.home.keywords}
        ogImageAlt={PAGE_SEO.home.og_image_alt}
        schema={[
          STRUCTURED_DATA.organization,
          STRUCTURED_DATA.website,
          STRUCTURED_DATA.buildBreadcrumb([{ name: 'Home', path: '/' }]),
        ]}
      />
      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}>
        {/* Full-bleed background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/hero-taichung.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }} />

        {/* Gradient overlay: dark left → transparent right */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, rgba(5,5,5,0.78) 0%, rgba(10,10,10,0.76) 38%, rgba(10,10,10,0.42) 60%, rgba(0,0,0,0.15) 100%)',
        }} />

        {/* Hanging pixel lanterns */}
        {[
          { right:'8%',  delay:'0s',   size:90,  opacity:0.85 },
          { right:'16%', delay:'-1.5s',size:72,  opacity:0.65 },
          { right:'24%', delay:'-3s',  size:58,  opacity:0.45 },
        ].map((l, i) => (
          <img key={i} src="/lantern-pixel.png" alt="" style={{
            position:'absolute', top:0, right:l.right,
            width:l.size, height:'auto',
            opacity:l.opacity, imageRendering:'pixelated', pointerEvents:'none',
            transformOrigin:'top center',
            animation:`lantern-sway ${2.8 + i * 0.6}s ease-in-out ${l.delay} infinite`,
            zIndex:2, mixBlendMode:'screen',
          }} />
        ))}

        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.12) 3px,rgba(0,0,0,0.12) 4px)',
        }} />

        {/* Floating pixel clouds */}
        {[
          { w:220, h:110, top:'10%', left:'62%', opacity:0.20, duration:'55s', delay:'0s'   },
          { w:150, h:75,  top:'20%', left:'80%', opacity:0.14, duration:'70s', delay:'-22s' },
          { w:190, h:95,  top:'6%',  left:'44%', opacity:0.16, duration:'48s', delay:'-35s' },
          { w:110, h:55,  top:'28%', left:'92%', opacity:0.10, duration:'80s', delay:'-12s' },
          { w:135, h:68,  top:'15%', left:'30%', opacity:0.10, duration:'65s', delay:'-50s' },
        ].map((c, i) => (
          <img key={i} src="/cloud-pixel.png" alt="" style={{
            position:'absolute', width:c.w, height:c.h, top:c.top, left:c.left,
            opacity:c.opacity, imageRendering:'pixelated', pointerEvents:'none',
            animation:`cloud-drift ${c.duration} linear ${c.delay} infinite`,
            zIndex:1,
          }} />
        ))}

        {/* Bottom vignette */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, pointerEvents: 'none',
          background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)',
        }} />

        {/* Content */}
        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ maxWidth: 600 }}>

            {/* Pixel eyebrow label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(240,149,38,0.12)', border: '1px solid rgba(240,149,38,0.35)',
              borderRadius: 4, padding: '6px 14px', marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)', boxShadow: '0 0 6px var(--orange)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', letterSpacing: '0.1em' }}>
                6502 MAKES YOU RELATED · LOYALTY MAKES YOU FAMILY
              </span>
            </div>

            {/* Main headline */}
            <h1 style={{
              fontFamily: 'var(--heading)',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'white',
              marginBottom: 10,
            }}>
              Authentic Taiwanese
            </h1>
            <h1 style={{
              fontFamily: 'var(--heading)',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--orange)',
              textShadow: '0 0 40px rgba(240,149,38,0.5)',
              marginBottom: 10,
            }}>
              NES & Famicom
            </h1>
            <h1 style={{
              fontFamily: 'var(--heading)',
              fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'white',
              marginBottom: 28,
            }}>
              Homebrew Games
            </h1>

            {/* Subheadline */}
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 16,
              lineHeight: 1.75,
              marginBottom: 40,
              maxWidth: 480,
            }}>
              Celebrating Taiwan's culture through retro gaming since&nbsp;2019.
              Physical cartridges, complete-in-box editions & digital downloads.
              Ships worldwide from Taichung, Taiwan.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
              <button
                className="btn btn-primary btn-lg"
                style={{
                  boxShadow: 'inset 4px 4px 0 #e8843a, inset -4px -4px 0 #7a2e00, inset 6px 6px 0 #d4701a, inset -6px -6px 0 #903800, 0 4px 20px rgba(240,149,38,0.45)',
                  gap: 8
                }}
                onClick={() => onNav?.('listing')}
              >
                <span style={{ fontSize: 17 }}>🎮</span> Shop Games
              </button>
              <button
                className="btn btn-secondary btn-lg"
                style={{ color: 'rgba(255,255,255,0.85)', outlineColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)' }}
                onClick={() => onNav?.('listing')}
              >
                View Pre-Orders →
              </button>
            </div>

            {/* Stats row */}
            <div className="hero-stats">
              {[
                { num: '14+', label: 'Titles' },
                { num: '2019', label: 'Founded' },
                { num: 'CIB', label: 'Physical' },
                { num: '🌏', label: 'Ships Worldwide' },
              ].map(({ num, label }) => (
                <div key={label} className="hero-stat">
                  <div style={{
                    fontFamily: 'var(--pixel)',
                    fontSize: 16,
                    color: 'var(--orange)',
                    textShadow: '0 0 10px rgba(240,149,38,0.5)',
                    marginBottom: 5,
                  }}>{num}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom-right brand watermark */}
          <div style={{
            position: 'absolute',
            right: 24,
            bottom: -20,
            textAlign: 'right',
            pointerEvents: 'none',
          }}>
            <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'rgba(240,149,38,0.25)', letterSpacing: '0.12em' }}>YI TÁI YÓUXÌ SOFTWARE</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, color: 'rgba(240,149,38,0.18)', letterSpacing: '0.08em' }}>一臺遊戲 · TAICHUNG, TAIWAN</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator" style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 2,
          opacity: 0.5,
        }}>
          <span style={{ fontFamily: 'var(--pixel)', fontSize: 10, color: 'white', letterSpacing: '0.1em' }}>SCROLL</span>
          <div style={{
            width: 1, height: 36,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)',
          }} />
        </div>
      </section>


      {/* ── FEATURED GAMES ── */}
      <section className="section">
        <div className="container">
          <div className="section-title">FEATURED GAMES</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24}}>
            <h2 className="section-heading" style={{margin:0}}>Best Sellers</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => onNav?.('listing')}>View All Games →</button>
          </div>
          <div className="grid-4">
            {FEATURED.map(g => <GameCard key={g.id} game={g} onNav={onNav} addItem={addItem} />)}
          </div>
        </div>
      </section>

      {/* Cloud divider with ground bushes */}
      <div className="cloud-row cloud-row-light" style={{background:'var(--bg)',position:'relative'}}>
        {[
          { right:'5%',  size:72, delay:'0s'   },
          { right:'12%', size:58, delay:'-2s'  },
          { right:'18%', size:44, delay:'-1s'  },
          { left:'3%',   size:68, delay:'-0.5s'},
          { left:'10%',  size:50, delay:'-3s'  },
        ].map((b, i) => (
          <img key={i} src="/bush-pixel.png" alt="" style={{
            position:'absolute', bottom:0,
            right:b.right, left:b.left,
            width:b.size, height:'auto',
            imageRendering:'pixelated', pointerEvents:'none',
            opacity:0.55,
            animation:`bush-sway ${3.5 + i * 0.7}s ease-in-out ${b.delay} infinite`,
          }} />
        ))}
      </div>

      {/* ── PRE-ORDERS BANNER ── */}
      <section style={{background:'#1a1a1a',padding:'48px 0',position:'relative',overflow:'hidden'}}>
        {/* Lanterns hanging in dark banner */}
        {[
          { left:'1%',  delay:'0s',    size:80, opacity:0.7 },
          { left:'5%',  delay:'-2s',   size:62, opacity:0.5 },
          { right:'2%', delay:'-1s',   size:76, opacity:0.65 },
          { right:'7%', delay:'-3.5s', size:55, opacity:0.4 },
        ].map((l,i) => (
          <img key={i} src="/lantern-pixel.png" alt="" style={{
            position:'absolute', top:-8,
            left:l.left, right:l.right,
            width:l.size, height:'auto',
            opacity:l.opacity, imageRendering:'pixelated', pointerEvents:'none',
            transformOrigin:'top center',
            animation:`lantern-sway ${3 + i*0.5}s ease-in-out ${l.delay} infinite`,
            zIndex:1, mixBlendMode:'screen',
          }} />
        ))}
        <div className="container layout-2col" style={{gap:40,alignItems:'center',position:'relative',zIndex:2}}>
          <div>
            <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:12}}>COMING SOON</div>
            <h2 style={{color:'white',fontSize:28,fontWeight:800,marginBottom:12}}>
              Pre-Order Now —<br/>New Titles Available
            </h2>
            <p style={{color:'#888',fontSize:17,lineHeight:'1.7',marginBottom:24}}>
              Lock in your copy of our upcoming releases. Limited quantities available. Pre-orders ship at launch.
            </p>
            <div style={{display:'flex',gap:16}}>
              <button className="btn btn-primary" onClick={() => onNav?.('listing')}>Pre-Order Horror, Taichung — $49.95</button>
            </div>
          </div>
          <div className="grid-2" style={{gap:16}}>
            {[...PREORDERS, ...COMING_SOON].slice(0, 4).map(p => (
              <div key={p.id} className="panel-pixel" style={{padding:16}}>
                <div className="wf-img" style={{height:100,marginBottom:10,border:'1px solid #4a1a0a'}}>
                  <span style={{fontSize:13,color:'#444'}}>[ ART ]</span>
                </div>
                <div style={{color:'white',fontSize:15,fontWeight:600,marginBottom:4}}>{p.title}</div>
                <div style={{color:'#666',fontSize:14,marginBottom:8}}>{p.short_description?.slice(0, 60) || p.subtitle || ''}</div>
                <span className={`wf-badge ${p.status === 'preorder' ? 'badge-preorder' : 'badge-coming-soon'}`}>
                  {p.status === 'preorder' ? 'Pre-Order' : 'Coming Soon'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud divider */}
      <div className="cloud-row cloud-row-dark" style={{background:'#1a1a1a'}} />

      {/* ── ABOUT TEASER ── */}
      <section className="section" style={{background:'white'}}>
        <div className="container layout-2col" style={{gap:48,alignItems:'center'}}>
          <div>
            <div className="wf-img" style={{height:280,borderRadius:10}}>
              <span style={{fontSize:15,color:'#bbb'}}>[ TEAM / STUDIO PHOTO ]</span>
            </div>
          </div>
          <div>
            <div className="section-title">OUR STORY</div>
            <h2 className="section-heading">Made in Taiwan. Built with Passion.</h2>
            <p style={{color:'#666',fontSize:17,lineHeight:'1.8',marginBottom:16}}>
              Founded in 2019 in Taichung City, ITG-SOFT (Yī tái yóuxì) creates original NES & Famicom games that celebrate Taiwan's rich cultural heritage — from ghost festivals and dragon boat races to mountain tea collectors and lunar mythology.
            </p>
            <p style={{color:'#666',fontSize:17,lineHeight:'1.8',marginBottom:24}}>
              Every game is a love letter to the island we call home. Complete-in-box, authentic cartridges that work on original hardware.
            </p>
            <button className="btn btn-primary" onClick={() => onNav?.('about')}>Read Our Story →</button>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section">
        <div className="container">
          <div className="section-title">WHY ITG-SOFT</div>
          <h2 className="section-heading">The Real Deal.</h2>
          <div className="grid-4">
            {[
              { icon:'🎮', title:'Authentic Cartridges', desc:'Real CIB physical cartridges that work on original NES & Famicom hardware.' },
              { icon:'🏮', title:'Taiwan Culture', desc:'Unique games celebrating local festivals, mythology, and stories you won\'t find elsewhere.' },
              { icon:'🌏', title:'Worldwide Shipping', desc:'Ships from Taichung, Taiwan to anywhere in the world. Multiple shipping options.' },
              { icon:'🤝', title:'Developer Partnerships', desc:'We publish partner homebrew devs. Same quality standards, global reach.' },
            ].map(f => (
              <div key={f.title} className="panel-pixel-light" style={{padding:24,textAlign:'center'}}>
                <div style={{fontSize:36,marginBottom:12}}>{f.icon}</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:8}}>{f.title}</div>
                <div style={{color:'#777',fontSize:16,lineHeight:'1.6'}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST BLOG ── */}
      <section className="section" style={{background:'white'}}>
        <div className="container">
          <div className="section-title">LATEST NEWS</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:24}}>
            <h2 className="section-heading" style={{margin:0}}>Dev Stories</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => onNav?.('blog')}>All Stories →</button>
          </div>
          <div className="grid-3">
            {blogPosts.filter(p => p.status === 'published').slice(0, 3).map(p => (
              <div key={p.id} className="panel-pixel-light" style={{overflow:'hidden',cursor:'pointer'}} onClick={() => onNav?.('blogPost', p.slug)}>
                <div className="wf-img" style={{height:140}}>
                  {p.cover_image_url ? <img src={p.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize:14,color:'#bbb'}}>[ BLOG IMAGE ]</span>}
                </div>
                <div style={{padding:16}}>
                  <span className="tag">{p.category?.replaceAll('_', ' ')}</span>
                  <div style={{fontWeight:700,fontSize:17,margin:'10px 0 6px'}}>{p.title}</div>
                  <div style={{color:'#999',fontSize:15}}>{p.published_at?.slice(0, 10)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{background:'linear-gradient(135deg,#1a1a1a,#2a1a0a)',padding:'60px 0',position:'relative',overflow:'hidden'}}>
        {/* Decorative cans + lanterns */}
        <img src="/can-pixel.png" alt="" style={{
          position:'absolute', right:'6%', bottom:20,
          width:80, height:'auto', imageRendering:'pixelated', pointerEvents:'none',
          opacity:0.55, animation:'can-float 4s ease-in-out 0s infinite',
        }} />
        <img src="/can-pixel.png" alt="" style={{
          position:'absolute', left:'5%', bottom:28,
          width:56, height:'auto', imageRendering:'pixelated', pointerEvents:'none',
          opacity:0.35, animation:'can-float 5.5s ease-in-out -2s infinite',
        }} />
        <img src="/lantern-pixel.png" alt="" style={{
          position:'absolute', right:'18%', top:-10,
          width:64, height:'auto', imageRendering:'pixelated', pointerEvents:'none',
          opacity:0.5, mixBlendMode:'screen',
          transformOrigin:'top center',
          animation:'lantern-sway 3.5s ease-in-out -1s infinite',
        }} />
        <div className="container" style={{textAlign:'center',maxWidth:540,margin:'0 auto',position:'relative',zIndex:2}}>
          <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:12}}>STAY UPDATED</div>
          <h2 style={{color:'white',fontSize:26,fontWeight:800,marginBottom:12}}>Get Updates on New Releases</h2>
          <p style={{color:'#888',fontSize:17,marginBottom:28}}>
            Be first to know about new games, behind-the-scenes content, and special offers.
          </p>
          {nlDone ? (
            <div style={{padding:'12px 0'}}>
              <div style={{fontSize:40,marginBottom:12}}>🎮</div>
              <div style={{color:'white',fontWeight:800,fontSize:17,marginBottom:6}}>You're in!</div>
              <div style={{color:'#888',fontSize:16}}>Thanks for subscribing.</div>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} style={{display:'flex',gap:12}}>
              <input
                type="email"
                required
                className="form-input"
                value={nlEmail}
                onChange={e => setNlEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                style={{flex:1,background:'#2a2a2a',borderColor:'#444',color:'white'}}
              />
              <button type="submit" className="btn btn-primary" style={{whiteSpace:'nowrap'}} disabled={nlBusy}>
                {nlBusy ? '…' : 'Subscribe →'}
              </button>
            </form>
          )}
          {nlErr && <div style={{color:'#f87171',fontSize:15,marginTop:8}}>{nlErr}</div>}
          {!nlDone && <div style={{color:'#555',fontSize:14,marginTop:12}}>No spam. Unsubscribe anytime.</div>}
        </div>
      </section>
    </div>
  )
}
