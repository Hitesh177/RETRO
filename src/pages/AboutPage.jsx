import React, { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import SeoHead from '../components/SeoHead'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'

const team = [
  { name: 'Founder / Lead Dev', role: 'Game Design & Programming', note: 'Taichung-born, NES obsessed since 1992' },
  { name: 'Art Director', role: 'Pixel Art & Box Design', note: 'Taiwan culture visualized through 8-bit pixels' },
  { name: 'Composer', role: 'Chiptune Music & Sound FX', note: 'FamiTracker wizard. 12+ original soundtracks' },
  { name: 'Community Manager', role: 'Partnerships & Publishing', note: 'Bridging homebrew devs worldwide with ITG-SOFT' },
]

const partners = [
  { name: 'Formosa TV Game Company', game: 'Piss the Fish (2021)', country: 'TW' },
  { name: 'M. Crick', game: 'Dudes with Attitude (2024)', country: 'US' },
  { name: 'Edward Thompson', game: 'Infiltration (2024)', country: 'US' },
  { name: 'Kickstarter Dev', game: 'The Legend of Poo Panties the Cat (2025)', country: 'TW' },
]

const milestones = [
  { year: '2019', event: 'Yī tái yóuxì Software Company (ITG.Soft) founded in Taichung City, Taiwan' },
  { year: '2020', event: 'First releases: "Never Say Die" and "Peace, Love, Trippy Club" — our surreal nightclub action game' },
  { year: '2021', event: 'Dragon Boat Fest & Desolate Love released. Formosa TV Game Company publishes Piss the Fish through ITG.Soft' },
  { year: '2022', event: "Vigor Maze & Mr Lee's Alishan Tea Collector released — our most beloved title to date" },
  { year: '2023', event: 'HouYi Shot the Suns & Hungry Ghost Night (two editions by Robert Gasse & Sydney Wang) released' },
  { year: '2024', event: 'Partner publishing expands: Dudes with Attitude (M. Crick) & Infiltration (Edward Thompson) shipped globally' },
  { year: '2025', event: 'The Legend of Poo Panties the Cat (Kickstarter) released. Mazu & Horror, Taichung announced.' },
  { year: '2026', event: 'New direct-to-consumer store. Mazu & Horror, Taichung pre-orders open. More coming soon.' },
]

// ── City hotspots on the Taiwan map ────────────────────────────────────────
// [x%, y%] = percentage position from top-left of image
const CITIES = [
  {
    id: 'taipei',
    name: '台北', en: 'Taipei',
    x: 64, y: 12,
    color: '#f09526',
    hq: false,
    desc: 'Taiwan\'s capital & gaming culture hub. Home to major retro game expos where ITG-SOFT games debut.',
    game: null,
  },
  {
    id: 'keelung',
    name: '基隆', en: 'Keelung',
    x: 78, y: 17,
    color: '#64b5f6',
    hq: false,
    desc: 'Taiwan\'s historic port city — gateway for ITG-SOFT international shipments heading to Japan & the West.',
    game: null,
  },
  {
    id: 'hsinchu',
    name: '新竹', en: 'Hsinchu',
    x: 47, y: 30,
    color: '#81c784',
    hq: false,
    desc: 'Known as the "Windy City" and Taiwan\'s Silicon Valley — inspiration for future game settings.',
    game: null,
  },
  {
    id: 'taichung',
    name: '台中', en: 'Taichung',
    x: 43, y: 44,
    color: '#f09526',
    hq: true,
    desc: 'ITG-SOFT HQ! Founded here in 2019. Taichung\'s urban legends and night markets inspired "Horror, Taichung!" — our most anticipated pre-order.',
    game: 'Horror, Taichung! (Pre-order 2026)',
  },
  {
    id: 'hualien',
    name: '花蓮', en: 'Hualien',
    x: 72, y: 39,
    color: '#ce93d8',
    hq: false,
    desc: 'East coast mountain city, gateway to Taroko Gorge. Rugged landscapes feature in our upcoming adventure titles.',
    game: null,
  },
  {
    id: 'alishan',
    name: '阿里山', en: 'Alishan',
    x: 39, y: 52,
    color: '#a5d6a7',
    hq: false,
    desc: 'Taiwan\'s most famous mountain range — birthplace of our most beloved game!',
    game: "Mr Lee's Alishan Tea Collector (2022)",
  },
  {
    id: 'tainan',
    name: '台南', en: 'Tainan',
    x: 38, y: 64,
    color: '#ffcc02',
    hq: false,
    desc: 'Ancient capital of Taiwan, rich in temples & ghost folklore. Setting for Hungry Ghost Night and future supernatural titles.',
    game: 'Hungry Ghost Night (2023)',
  },
  {
    id: 'kaohsiung',
    name: '高雄', en: 'Kaohsiung',
    x: 42, y: 74,
    color: '#4fc3f7',
    hq: false,
    desc: "Taiwan's harbor city — Dragon Boat Festival races launch from here every Duanwu. Inspiration for Dragon Boat Fest.",
    game: 'Dragon Boat Fest (2021)',
  },
  {
    id: 'penghu',
    name: '澎湖', en: 'Penghu',
    x: 19, y: 55,
    color: '#80cbc4',
    hq: false,
    desc: 'Penghu archipelago — azure waters, ancient temples, and the spiritual domain of Mazu, Goddess of the Sea.',
    game: 'Mazu: Guardian of the Tides (Pre-order)',
  },
  {
    id: 'kenting',
    name: '墾丁', en: 'Kenting',
    x: 51, y: 87,
    color: '#ff8a65',
    hq: false,
    desc: "Taiwan's tropical southern tip. Beaches, surf culture, and a wild nightlife scene — future setting ideas already brewing.",
    game: null,
  },
]

// ── Interactive Taiwan Map component ───────────────────────────────────────
function TaiwanMap() {
  const [active, setActive] = useState(null)
  const activeCity = CITIES.find(c => c.id === active)

  return (
    <section style={{ background: '#0a0f1a', padding: '72px 0', overflow: 'hidden' }}>
      <div className="container" style={{ maxWidth: 580 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', marginBottom: 10 }}>
            MADE IN TAIWAN
          </div>
          <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900, lineHeight: 1.2 }}>
            The Island That Inspired It All
          </h2>
        </div>

        {/* ── Map wrapper — all dots and tooltips are children ── */}
        <div style={{ position: 'relative', userSelect: 'none' }}>
          <img
            src="/taiwan-map.png"
            alt="Pixel art map of Taiwan"
            draggable={false}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              imageRendering: 'pixelated',
              borderRadius: 8,
            }}
          />

          {CITIES.map(city => {
            const isActive = active === city.id
            // Flip tooltip to left side for right-edge cities
            const flipX = city.x > 60
            // Flip tooltip upward for bottom-half cities
            const flipY = city.y > 60

            return (
              <React.Fragment key={city.id}>
                {/* Dot */}
                <button
                  onMouseEnter={() => setActive(city.id)}
                  onMouseLeave={() => setActive(null)}
                  style={{
                    position: 'absolute',
                    left: `${city.x}%`,
                    top: `${city.y}%`,
                    transform: `translate(-50%, -50%) scale(${isActive ? 1.5 : 1})`,
                    width: city.hq ? 14 : 10,
                    height: city.hq ? 14 : 10,
                    borderRadius: '50%',
                    background: city.color,
                    border: `2px solid ${isActive ? 'white' : 'rgba(0,0,0,0.5)'}`,
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    boxShadow: isActive
                      ? `0 0 0 4px ${city.color}55, 0 0 16px ${city.color}`
                      : `0 0 6px ${city.color}99`,
                    zIndex: isActive ? 20 : 5,
                    animation: city.hq ? 'hq-pulse 2.4s ease-in-out infinite' : 'none',
                  }}
                />

                {/* HQ pulse ring */}
                {city.hq && (
                  <div style={{
                    position: 'absolute',
                    left: `${city.x}%`,
                    top: `${city.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 28, height: 28,
                    borderRadius: '50%',
                    border: `1.5px solid ${city.color}66`,
                    animation: 'hq-ring 2.4s ease-out infinite',
                    pointerEvents: 'none',
                    zIndex: 4,
                  }} />
                )}

                {/* Tooltip */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: flipX ? `${city.x - 2}%` : `${city.x + 2}%`,
                    top: flipY ? `${city.y - 2}%` : `${city.y + 2}%`,
                    transform: flipX
                      ? (flipY ? 'translate(-100%, -100%)' : 'translate(-100%, 0)')
                      : (flipY ? 'translate(0, -100%)' : 'translate(0, 0)'),
                    width: 200,
                    background: '#0d1b2e',
                    border: `2px solid ${city.color}`,
                    borderRadius: 6,
                    padding: '10px 12px',
                    zIndex: 30,
                    pointerEvents: 'none',
                    boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px ${city.color}22`,
                  }}>
                    {/* Corner pixel accents */}
                    <div style={{ position:'absolute', top:-1, left:-1, width:6, height:6, background: city.color }} />
                    <div style={{ position:'absolute', top:-1, right:-1, width:6, height:6, background: city.color }} />
                    <div style={{ position:'absolute', bottom:-1, left:-1, width:6, height:6, background: city.color }} />
                    <div style={{ position:'absolute', bottom:-1, right:-1, width:6, height:6, background: city.color }} />

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5 }}>
                      <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{city.en}</span>
                      <span style={{ color: city.color, fontSize: 14, fontWeight: 600 }}>{city.name}</span>
                      {city.hq && (
                        <span style={{
                          marginLeft: 'auto', fontFamily: 'var(--pixel)',
                          fontSize: 11, color: city.color, whiteSpace: 'nowrap',
                        }}>★ HQ</span>
                      )}
                    </div>
                    <p style={{ color: '#9aabb8', fontSize: 14, lineHeight: '1.6', margin: 0, marginBottom: city.game ? 7 : 0 }}>
                      {city.desc}
                    </p>
                    {city.game && (
                      <div style={{
                        borderTop: `1px solid ${city.color}33`,
                        paddingTop: 6,
                        color: city.color,
                        fontSize: 13,
                        fontWeight: 700,
                      }}>
                        ▶ {city.game}
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        <p style={{ color: '#3a4a5a', fontSize: 15, textAlign: 'center', marginTop: 16 }}>
          Hover any city dot to learn more
        </p>
      </div>

      <style>{`
        @keyframes hq-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(240,149,38,0.7), 0 0 6px rgba(240,149,38,0.5); }
          50%      { box-shadow: 0 0 0 6px rgba(240,149,38,0), 0 0 14px rgba(240,149,38,0.8); }
        }
        @keyframes hq-ring {
          0%   { transform: translate(-50%,-50%) scale(0.9); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; }
        }
      `}</style>
    </section>
  )
}

export default function AboutPage({ onNav }) {
  return (
    <div className="page">
      <SeoHead
        title={PAGE_SEO.about.title}
        description={PAGE_SEO.about.description}
        canonical={PAGE_SEO.about.canonical}
        keywords={PAGE_SEO.about.keywords}
        ogImageAlt={PAGE_SEO.about.og_image_alt}
        schema={[
          STRUCTURED_DATA.organization,
          STRUCTURED_DATA.buildBreadcrumb([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ]}
      />
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg,#1a1a1a,#2a1a0a)',padding:'80px 0',position:'relative',overflow:'hidden'}}>
        {[
          { right:'3%',  delay:'0s',    size:88, opacity:0.8 },
          { right:'10%', delay:'-1.8s', size:68, opacity:0.55 },
          { right:'17%', delay:'-3.5s', size:52, opacity:0.35 },
        ].map((l,i) => (
          <img key={i} src="/lantern-pixel.png" alt="" style={{
            position:'absolute', top:0, right:l.right,
            width:l.size, height:'auto',
            opacity:l.opacity, imageRendering:'pixelated', pointerEvents:'none',
            transformOrigin:'top center',
            animation:`lantern-sway ${3 + i*0.7}s ease-in-out ${l.delay} infinite`,
            zIndex:1, mixBlendMode:'screen',
          }} />
        ))}
        <img src="/can-pixel.png" alt="" style={{
          position:'absolute', left:'4%', bottom:20,
          width:70, height:'auto', imageRendering:'pixelated', pointerEvents:'none',
          opacity:0.5, animation:'can-float 4.5s ease-in-out -1s infinite',
          zIndex:1,
        }} />
        <div className="container" style={{position:'relative',zIndex:2}}>
          <Breadcrumb items={['Home','About']} />
          <div className="layout-2col" style={{gap:48,alignItems:'center'}}>
            <div>
              <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:12}}>ABOUT ITG-SOFT</div>
              <h1 style={{color:'white',fontSize:36,fontWeight:900,lineHeight:1.2,marginBottom:16}}>
                Made in Taiwan.<br/>
                <span style={{color:'var(--orange)'}}>Built with Passion.</span>
              </h1>
              <p style={{color:'#aaa',fontSize:15,lineHeight:'1.8'}}>
                Situated in the heart of Taiwan, we have been developing and publishing Famicom games since 2019. Yī tái yóuxì Software Company — creating original NES and Famicom games that celebrate Taiwan's rich cultural heritage, and publishing games for independent developers worldwide.
              </p>
            </div>
            <div className="wf-img" style={{height:300,borderRadius:12,border:'2px solid #333'}}>
              <span style={{fontSize:16,color:'#555'}}>[ STUDIO / TEAM HERO PHOTO ]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="section" style={{background:'white'}}>
        <div className="container" style={{maxWidth:780,margin:'0 auto'}}>
          <div className="section-title">OUR MISSION</div>
          <h2 className="section-heading">Why We Make Games</h2>
          <div style={{fontSize:15,lineHeight:'1.9',color:'#444'}}>
            {[
              'Taiwan has a unique cultural soul — ghost festivals, dragon boat races, mountain tea farmers, lunar mythology. These stories deserve to be told, and we believe 8-bit games are the perfect medium.',
              'The NES/Famicom platform may be 40 years old, but it\'s still the most tactile, immediate, and universally understood game console ever made. There\'s something magical about blowing on a cartridge and seeing sprites dance on a CRT.',
              'We founded ITG-SOFT because we wanted to see Taiwanese landmarks, festivals, and mythology become video game heroes. Every game we release is a slice of island life rendered in pixels and beeps.',
              '"6502 Makes You Related, Loyalty Makes You Family" — our code of craft is simple: make games with heart, ship physical cartridges with pride, and build a community that lasts.'
            ].map((p,i) => <p key={i} style={{marginBottom:20}}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE TAIWAN MAP ── */}
      <TaiwanMap />

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div className="section-title">HISTORY</div>
          <h2 className="section-heading">Our Story, Year by Year</h2>
          <div style={{position:'relative',maxWidth:700}}>
            <div style={{position:'absolute',left:80,top:0,bottom:0,width:2,background:'var(--border)'}} />
            {milestones.map((m,i) => (
              <div key={m.year} style={{display:'flex',gap:24,alignItems:'flex-start',marginBottom:24,position:'relative'}}>
                <div style={{
                  width:64, height:64, borderRadius:'50%',
                  background: i === milestones.length-1 ? 'var(--orange)' : 'white',
                  border:`3px solid ${i === milestones.length-1 ? 'var(--orange)' : 'var(--border)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--pixel)', fontSize:12,
                  color: i === milestones.length-1 ? 'white' : 'var(--orange)',
                  flexShrink:0, zIndex:1, position:'relative'
                }}>
                  {m.year}
                </div>
                <div style={{paddingTop:18,paddingLeft:8}}>
                  <div style={{fontSize:17,fontWeight:600,color:'#333'}}>{m.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section" style={{background:'white'}}>
        <div className="container">
          <div className="section-title">THE TEAM</div>
          <h2 className="section-heading">Who We Are</h2>
          <div className="grid-4">
            {team.map(m => (
              <div key={m.name} style={{background:'var(--bg)',border:'2px solid var(--border)',borderRadius:10,padding:24,textAlign:'center'}}>
                <div className="wf-img" style={{width:96,height:96,borderRadius:'50%',margin:'0 auto 16px',border:'3px solid var(--orange)'}}>
                  <span style={{fontSize:13,color:'#bbb'}}>PHOTO</span>
                </div>
                <div style={{fontWeight:700,fontSize:17,marginBottom:4}}>{m.name}</div>
                <div style={{fontSize:15,color:'var(--orange)',fontWeight:600,marginBottom:8}}>{m.role}</div>
                <div style={{fontSize:15,color:'#888',lineHeight:'1.5'}}>{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section" style={{background:'var(--darker)'}}>
        <div className="container">
          <div className="layout-2col" style={{gap:48}}>
            <div>
              <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:12}}>PHILOSOPHY</div>
              <h2 style={{color:'white',fontSize:26,fontWeight:800,lineHeight:1.3,marginBottom:20}}>Why Famicom? Why Now?</h2>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {[
                  { icon:'🎮', title:'Real Hardware First', desc:'Every game we ship works on original NES & Famicom hardware. No emulation required — though ROMs are available too.' },
                  { icon:'🏮', title:'Culture Over Commerce', desc:'Games about Hungry Ghost Festival and Dragon Boat races don\'t fit the mainstream market. That\'s exactly why we make them.' },
                  { icon:'📦', title:'Physical Matters', desc:'In a world of digital downloads, we believe in objects you can hold. Box art, manuals, cartridges — the complete experience.' },
                ].map(f => (
                  <div key={f.title} style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                    <span style={{fontSize:24,flexShrink:0}}>{f.icon}</span>
                    <div>
                      <div style={{color:'white',fontWeight:700,fontSize:17,marginBottom:4}}>{f.title}</div>
                      <div style={{color:'#888',fontSize:16,lineHeight:'1.6'}}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:12}}>PARTNERS</div>
              <h2 style={{color:'white',fontSize:26,fontWeight:800,lineHeight:1.3,marginBottom:20}}>Publishing Partners</h2>
              <p style={{color:'#888',fontSize:17,lineHeight:'1.7',marginBottom:20}}>
                We work with independent homebrew developers worldwide to publish and distribute their games under the ITG-SOFT quality seal. Same standards, global reach, fair revenue share.
              </p>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {partners.map(p => (
                  <div key={p.name} style={{background:'#252525',border:'1px solid #333',borderRadius:8,padding:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{color:'white',fontWeight:600,fontSize:16}}>{p.name} <span style={{color:'#666',fontWeight:400}}>({p.country})</span></div>
                      <div style={{color:'#777',fontSize:15}}>{p.game}</div>
                    </div>
                    <span className="wf-badge badge-in-stock">Published</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" style={{marginTop:20,color:'white',borderColor:'#555'}} onClick={() => onNav?.('developers')}>
                Submit Your Game →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Press Kit CTA */}
      <section style={{background:'var(--orange)',padding:'40px 0'}}>
        <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{color:'white',fontWeight:800,fontSize:20,marginBottom:4}}>Press Kit Available</div>
            <div style={{color:'rgba(255,255,255,0.8)',fontSize:17}}>Logos, screenshots, bios, and company facts for media coverage</div>
          </div>
          <button className="btn btn-dark btn-lg">⬇ Download Press Kit</button>
        </div>
      </section>
    </div>
  )
}
