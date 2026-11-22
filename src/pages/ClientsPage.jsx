import { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import { useStore } from '../context/StoreContext'

const COUNTRY_FLAGS = { TW: '🇹🇼', US: '🇺🇸', JP: '🇯🇵', GB: '🇬🇧', AU: '🇦🇺', CA: '🇨🇦', DE: '🇩🇪', FR: '🇫🇷' }
const COUNTRY_NAMES = { TW: 'Taiwan', US: 'United States', JP: 'Japan', GB: 'United Kingdom', AU: 'Australia', CA: 'Canada', DE: 'Germany', FR: 'France' }

const CART_COLORS = {
  green:'#3a7d44', red:'#c0392b', yellow:'#f0a500', purple:'#7d3c98',
  orange:'#e67e22', teal:'#17808c', grey:'#7f8c8d', blue:'#2980b9',
  black:'#1a1a1a', pink:'#e91e8c', white:'#ddd',
}

const PARTNER_EXTRA = {
  'dp-001': {
    founded: '2019',
    specialty: 'Party Games & Experimental',
    highlight: 'Boundary-pushing concepts nobody else would greenlight',
    quote: '"ITG-SOFT believed in Piss the Fish when no one else did. That says everything."',
  },
  'dp-002': {
    founded: '1989',
    specialty: 'Puzzle Platformers',
    highlight: 'First Famicom release of a beloved 1989 NES classic',
    quote: '"Getting a 35-year-old game onto Famicom cartridge felt impossible. ITG made it real."',
  },
  'dp-003': {
    founded: '2023',
    specialty: 'Action Shooters',
    highlight: 'Published with NESmaker — a showcase of modern NES dev tools',
    quote: '"They treated my game like it deserved to exist on cartridge. Because it does."',
  },
  'dp-004': {
    founded: '2024',
    specialty: 'Platformers',
    highlight: 'Multiple titles in development with ITG-SOFT',
    quote: '"The manufacturing quality is exactly what you want for a collector-grade release."',
  },
  'dp-005': {
    founded: '2022',
    specialty: 'Action & Bio-Themed Puzzlers',
    highlight: 'Known for high-detail sprite work and tight gameplay loops',
    quote: '"Working with ITG means our games reach collectors in every corner of the world."',
  },
  'dp-006': {
    founded: '2021',
    specialty: 'Action-Adventure',
    highlight: 'Pushing the 6502 processor to its limits with rich storytelling',
    quote: '"The production value ITG brings to physical releases is unmatched in homebrew."',
  },
  'dp-007': {
    founded: '2020',
    specialty: 'Classic Design Indie',
    highlight: 'Multiple titles crafted with old-school game design principles',
    quote: '"No minimum order, no upfront costs. That alone sets ITG apart from everyone else."',
  },
  'dp-008': {
    founded: '2022',
    specialty: 'Genre-Blending NES',
    highlight: 'Known for polished presentation and engaging mechanics',
    quote: '"The rev share is fair and the reporting is transparent. Exactly what you need."',
  },
  'dp-009': {
    founded: '2023',
    specialty: 'Atmospheric / Nature-Themed',
    highlight: 'Beautifully crafted tile sets inspired by the natural world',
    quote: '"ITG handles everything from the box art layout to worldwide fulfilment."',
  },
  'dp-010': {
    founded: '2021',
    specialty: 'Fast-Paced Action',
    highlight: 'A favorite among speed runners and hardcore retro fans',
    quote: '"Fast shipping from Taiwan, incredible build quality. Our fans love the carts."',
  },
  'dp-011': {
    founded: '2023',
    specialty: 'Experimental / Avant-Garde',
    highlight: 'Bold visual styles and concepts unlike anything else on NES',
    quote: '"ITG has never once told us to tone it down. They get it."',
  },
}

const PROCESS_STEPS = [
  { num: '01', title: 'Submit Your ROM', desc: 'Send us your completed or near-complete NES/Famicom ROM. We review every submission personally — no automated gatekeeping.' },
  { num: '02', title: 'We Review & Chat', desc: "We play it, give honest feedback, and discuss your vision. If we're a match, we move forward. No fees. No contracts with lock-ins." },
  { num: '03', title: 'Design & Production', desc: 'Our team handles box layout, cartridge label, manual design, and full CIB manufacturing. You approve every step.' },
  { num: '04', title: 'Ship & Sell Worldwide', desc: 'Your game goes live in our store and global distribution network. We handle fulfilment from Taichung to doorsteps worldwide.' },
  { num: '05', title: 'You Get Paid', desc: 'Revenue share deposited monthly. You keep all IP rights. Transparent reporting, no surprises.' },
]

const STATS = [
  { value: '11', label: 'Active Publishing Partners' },
  { value: '34+', label: 'Games in Catalog' },
  { value: '70%', label: 'Avg Developer Revenue Share' },
  { value: '$0', label: 'Upfront Cost to Publish' },
]

export default function ClientsPage({ onNav }) {
  const { products, partners } = useStore()
  const [activePartner, setActivePartner] = useState(null)

  function getPartnerGames(partnerId) {
    return products.filter(p => p.developer_id === partnerId)
  }

  return (
    <div className="page">
      {/* ── HERO ── */}
      <div style={{ background: 'var(--darker)', padding: '48px 0 40px', borderBottom: '3px solid var(--orange)' }}>
        <div className="container">
          <Breadcrumb items={['Home', 'Our Clients']} />
          <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', letterSpacing: '0.12em', marginBottom: 12 }}>
            PUBLISHING PARTNERS
          </div>
          <h1 style={{ color: 'white', fontFamily: 'var(--pixel)', fontSize: 18, marginBottom: 12, lineHeight: 1.4 }}>
            OUR CLIENTS
          </h1>
          <p style={{ color: '#aaa', fontSize: 15, maxWidth: 560, lineHeight: 1.7 }}>
            Every game in the ITG-SOFT catalog is a real collaboration. These are the developers and studios who trusted us to manufacture, distribute, and sell their work — worldwide, on physical cartridge.
          </p>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: 'var(--orange)', padding: '20px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--pixel)', fontSize: 20, color: 'white', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PARTNER CARDS ── */}
      <div className="container section">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', letterSpacing: '0.1em', marginBottom: 8 }}>CURRENT ROSTER</div>
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Publishing Clients</h2>
          </div>
          <button className="btn btn-primary" onClick={() => onNav?.('developers')}>
            Become a Client →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {partners.map((partner, idx) => {
            const extra = PARTNER_EXTRA[partner.id] || {}
            const games = getPartnerGames(partner.id)
            const isOpen = activePartner === partner.id

            return (
              <div
                key={partner.id}
                className="panel-pixel-light"
                style={{ overflow: 'hidden' }}
              >
                {/* Partner header */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 20, padding: '24px 28px',
                    cursor: 'pointer', borderBottom: isOpen ? '2px solid var(--border)' : 'none',
                  }}
                  onClick={() => setActivePartner(isOpen ? null : partner.id)}
                >
                  {/* Avatar / index */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                    background: `linear-gradient(135deg, var(--orange), #7a2e00)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--pixel)', fontSize: 17, color: 'white',
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>{partner.name}</h3>
                      <span style={{ fontSize: 18 }}>{COUNTRY_FLAGS[partner.country_code] || '🌏'}</span>
                      <span style={{ fontSize: 14, color: '#888' }}>{COUNTRY_NAMES[partner.country_code] || partner.country_code}</span>
                      <span style={{
                        background: '#e8f5e9', color: '#2e7d32', border: '1px solid #81c784',
                        borderRadius: 4, padding: '2px 8px', fontSize: 13, fontWeight: 700,
                      }}>
                        {partner.status === 'active' ? 'Active' : partner.status}
                      </span>
                    </div>
                    <div style={{ color: '#666', fontSize: 16, lineHeight: 1.5 }}>{extra.specialty && <><strong>{extra.specialty}</strong> · </>}{partner.bio}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--pixel)', fontSize: 14, color: 'var(--orange)' }}>
                      {partner.revenue_share}%
                    </div>
                    <div style={{ fontSize: 13, color: '#999' }}>rev share</div>
                    <div style={{ fontSize: 20, color: '#ccc', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

                      {/* Left: info */}
                      <div>
                        {extra.quote && (
                          <blockquote style={{
                            borderLeft: '3px solid var(--orange)', paddingLeft: 16, margin: '0 0 20px',
                            fontStyle: 'italic', color: '#555', fontSize: 17, lineHeight: 1.7,
                          }}>
                            {extra.quote}
                          </blockquote>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                          {[
                            ['Founded', extra.founded || '—'],
                            ['Games Shipped', extra.games_shipped || games.length || '—'],
                            ['Revenue Share', `${partner.revenue_share}%`],
                            ['Country', COUNTRY_NAMES[partner.country_code] || partner.country_code],
                          ].map(([label, val]) => (
                            <div key={label} style={{ background: '#f8f7f4', borderRadius: 6, padding: '10px 14px' }}>
                              <div style={{ fontSize: 13, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{label}</div>
                              <div style={{ fontWeight: 700, fontSize: 17 }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {extra.highlight && (
                          <div style={{ background: 'rgba(240,149,38,0.08)', border: '1px solid rgba(240,149,38,0.3)', borderRadius: 6, padding: '10px 14px', fontSize: 16, color: '#7a3800' }}>
                            ★ {extra.highlight}
                          </div>
                        )}
                      </div>

                      {/* Right: published games */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
                          Published Games
                        </div>
                        {games.length === 0 ? (
                          <p style={{ color: '#aaa', fontSize: 16 }}>No games linked yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {games.map(g => {
                              const col = CART_COLORS[g.cartridge_color] || '#555'
                              const badgeStyle = {
                                in_stock:    { bg: '#e8f5e9', color: '#2e7d32' },
                                sold_out:    { bg: '#fce4ec', color: '#c62828' },
                                preorder:    { bg: '#fff3e0', color: '#e65100' },
                                coming_soon: { bg: '#e3f2fd', color: '#0277bd' },
                              }[g.status] || { bg: '#f0ece6', color: '#555' }

                              return (
                                <div
                                  key={g.id}
                                  onClick={() => onNav?.('detail', g.slug)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                                    border: '1px solid var(--border)', background: 'white',
                                    transition: 'border-color 0.15s',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.borderColor = col}
                                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                  {/* Mini cartridge */}
                                  <div style={{
                                    width: 28, height: 38, background: col, borderRadius: 3, flexShrink: 0,
                                    boxShadow: `0 2px 8px ${col}44`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.5 }}>ITG</span>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</div>
                                    <div style={{ fontSize: 14, color: '#999' }}>{g.platform === 'both' ? 'NES & Famicom' : g.platform === 'nes' ? 'NES' : 'Famicom'} · ${(g.price_physical || g.price_digital || 0).toFixed(2)}</div>
                                  </div>
                                  <span style={{ background: badgeStyle.bg, color: badgeStyle.color, fontSize: 13, fontWeight: 700, padding: '2px 8px', borderRadius: 3, whiteSpace: 'nowrap' }}>
                                    {{ in_stock: 'In Stock', sold_out: 'Sold Out', preorder: 'Pre-Order', coming_soon: 'Coming Soon' }[g.status] || g.status}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background: 'var(--darker)', padding: '64px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', letterSpacing: '0.1em', marginBottom: 12 }}>THE PROCESS</div>
            <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900 }}>How Publishing Works</h2>
            <p style={{ color: '#888', fontSize: 17, maxWidth: 480, margin: '12px auto 0' }}>
              From ROM file to physical cartridge in customers' hands — here's what working with us looks like.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.num} style={{ textAlign: 'center', position: 'relative' }}>
                {/* Connector line */}
                {i < PROCESS_STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 24, left: '60%', right: '-40%', height: 2, background: 'rgba(240,149,38,0.2)', display: 'none' }} />
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
                  background: 'rgba(240,149,38,0.15)', border: '2px solid rgba(240,149,38,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--pixel)', fontSize: 13, color: 'var(--orange)',
                }}>
                  {step.num}
                </div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{step.title}</div>
                <div style={{ color: '#666', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TERMS SNAPSHOT ── */}
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
          <div>
            <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', letterSpacing: '0.1em', marginBottom: 12 }}>THE DEAL</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20 }}>What You Get</h2>
            {[
              ['$0 upfront', 'No manufacturing fees, no setup costs. We invest in your game.'],
              ['You keep your IP', 'Full ownership of your game, characters, and source code — always.'],
              ['70% revenue share', 'Industry-leading split. You built it, you deserve the majority.'],
              ['Global distribution', 'Taiwan, South America, Europe, Asia — our network, your reach.'],
              ['No minimum order', 'One copy or one thousand — we can accommodate any run size.'],
              ['NES + Famicom formats', '60-pin Famicom and 72-pin NES cartridge production both available.'],
              ['CIB manufacturing', 'Full box, manual, cartridge label, and insert design included.'],
              ['Monthly payouts', 'Transparent sales reporting and monthly revenue deposits.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ color: 'var(--orange)', fontWeight: 900, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{title}</div>
                  <div style={{ color: '#666', fontSize: 16, lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ background: 'var(--darker)', borderRadius: 12, padding: 32, border: '2px solid #333', marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', marginBottom: 16, letterSpacing: '0.1em' }}>READY TO PUBLISH?</div>
              <h3 style={{ color: 'white', fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Submit Your Game</h3>
              <p style={{ color: '#888', fontSize: 17, lineHeight: 1.7, marginBottom: 24 }}>
                Have an NES or Famicom ROM ready to publish? Or still in development and want to talk first? Either way, reach out. We read every message.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => onNav?.('contact')}
                >
                  Contact Us to Get Started
                </button>
                <button
                  className="btn btn-secondary btn-full"
                  onClick={() => onNav?.('developers')}
                >
                  Read Publishing FAQ →
                </button>
              </div>
            </div>

            <div style={{ background: '#f8f7f4', borderRadius: 10, padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Requirements</div>
              {[
                'Completed or near-complete NES/Famicom ROM',
                'Original game — no ROM hacks or unlicensed ports',
                'You hold full rights to the game and all assets',
                'Willingness to collaborate on box/manual design',
              ].map(r => (
                <div key={r} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 16, color: '#555' }}>
                  <span style={{ color: 'var(--orange)', flexShrink: 0 }}>—</span>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <div style={{ background: 'var(--orange)', padding: '48px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', marginBottom: 12 }}>
            6502 MAKES YOU RELATED
          </div>
          <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 12 }}>
            Your game deserves to exist on cartridge.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            We've helped developers from Taiwan, the US, and beyond get their NES homebrew into collectors' hands. You could be next.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-lg"
              style={{ background: 'white', color: 'var(--orange)', fontWeight: 800, border: 'none' }}
              onClick={() => onNav?.('contact')}
            >
              Get in Touch
            </button>
            <button
              className="btn btn-lg btn-secondary"
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
              onClick={() => onNav?.('listing')}
            >
              Browse the Catalog →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
