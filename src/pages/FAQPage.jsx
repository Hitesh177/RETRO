import React, { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import SeoHead from '../components/SeoHead'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'

const faqs = [
  {
    cat: 'Hardware & Compatibility',
    items: [
      { q: 'What consoles do your games work on?', a: 'All our physical cartridges are designed for original NES (North America) and Famicom (Japan/Asia) hardware. They also work on most Famiclone systems, including modern FPGA-based consoles like the Analogue Pocket (with adapter) and Mister FPGA NES core.' },
      { q: 'Do games work on original NES/Famicom hardware?', a: 'Yes! Every game is tested on original hardware. We use authentic 72-pin or 60-pin connectors (depending on NES vs Famicom edition). Some titles are NES-only, some Famicom-only, and some ship both versions — check each product page.' },
      { q: 'Will games work in my region? (PAL vs NTSC)', a: 'Most of our games run at NTSC timing (60Hz). They may run too fast on PAL consoles without a region mod. If you have a PAL NES, please check the product page for compatibility notes. Many players use the Everdrive N8 Pro to run our ROMs at correct speed.' },
      { q: 'Can I play these on emulators?', a: 'Yes! Most titles come with a ROM download code. You can play on any NES/Famicom emulator such as Mesen, Nestopia, RetroArch, or even your browser. ROM downloads are also sold separately on the digital downloads page.' },
    ]
  },
  {
    cat: 'Products & Ordering',
    items: [
      { q: 'What is "homebrew"? Are these reproduction/bootleg cartridges?', a: 'Homebrew games are 100% original games created by independent developers — NOT reproductions or bootlegs of existing Nintendo titles. Every ITG-SOFT game is an original creation with unique code, art, and music. We hold full rights to all games we publish.' },
      { q: 'What does CIB (Complete in Box) mean?', a: 'CIB means the game comes with the cartridge, a printed box with original artwork, an instruction manual, and any bonus items listed. It is the complete collector\'s experience — exactly like a game you would have bought in a store in 1990.' },
      { q: 'Do you offer digital-only purchases?', a: 'Yes! Selected titles are available as digital ROM downloads. These are available on their product pages and also in the Digital Downloads section. Prices range from FREE to $18. After purchase, download links appear in your account.' },
    ]
  },
  {
    cat: 'Shipping & Delivery',
    items: [
      { q: 'How long does shipping take?', a: 'Standard shipping from Taichung, Taiwan typically takes 5–15 business days internationally. Express shipping takes 2–5 business days. Domestic Taiwan orders arrive in 2–5 business days. All orders receive a tracking number via email.' },
      { q: 'Do you ship internationally?', a: 'Yes! We ship to 40+ countries worldwide including USA, Canada, UK, Australia, Japan, Germany, France, and more. Shipping costs and times vary by region. Orders over $100 qualify for free standard shipping worldwide.' },
      { q: 'What are your shipping zones and costs?', a: 'Taiwan (domestic): $5–8. Asia-Pacific: $8–15. North America: $8–15. Europe: $10–18. Rest of World: $12–20. Express shipping adds $10–20 depending on destination. Exact rates are calculated at checkout.' },
    ]
  },
  {
    cat: 'Returns & Support',
    items: [
      { q: "What's your return policy?", a: 'We accept returns within 30 days of delivery for sealed/unopened items in original condition. Digital purchases are non-refundable once downloaded. If your item arrives damaged or defective, contact us and we will replace it free of charge — no questions asked.' },
      { q: 'How can I submit a game for publishing?', a: 'We love working with homebrew developers! Visit our Developers page to learn about our publishing program. We review submissions on a rolling basis. Requirements: completed or near-complete NES/Famicom game, original IP, test ROM, and brief project overview.' },
      { q: 'Do you offer game development services?', a: 'We do not currently offer development services for hire. However, if you are an independent developer with an original NES/Famicom game, we may be able to assist with publishing, box art, manufacturing, and distribution through our partner program.' },
    ]
  },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ORDER_RE = /^ITG-\d{4}-\d{5}$/i

function Accordion({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:0}}>
      {items.map((item, i) => (
        <div key={i} style={{borderBottom:'1px solid var(--border)'}}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width:'100%', textAlign:'left', padding:'18px 0',
              border:'none', background:'none', cursor:'pointer',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              fontSize:17, fontWeight:600, color: open===i ? 'var(--orange)' : 'var(--dark)',
            }}
          >
            {item.q}
            <span style={{fontSize:18,color: open===i ? 'var(--orange)' : '#aaa',marginLeft:16,flexShrink:0}}>
              {open === i ? '−' : '+'}
            </span>
          </button>
          {open === i && (
            <div style={{paddingBottom:20,fontSize:17,color:'#555',lineHeight:'1.8'}}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState('all')
  const [orderNumber, setOrderNumber] = useState('')
  const [trackingEmail, setTrackingEmail] = useState('')
  const [trackingMsg, setTrackingMsg] = useState('')

  function handleTrackOrder() {
    const order = orderNumber.trim()
    const email = trackingEmail.trim()
    if (!ORDER_RE.test(order)) {
      setTrackingMsg('Enter an order number like ITG-2026-12345.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setTrackingMsg('Enter a valid email address.')
      return
    }
    setTrackingMsg('Tracking lookup is not connected yet. Please contact support with this order number.')
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap(cat =>
      cat.items.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      }))
    ),
  }

  return (
    <div className="page">
      <SeoHead
        title={PAGE_SEO.faq.title}
        description={PAGE_SEO.faq.description}
        canonical={PAGE_SEO.faq.canonical}
        keywords={PAGE_SEO.faq.keywords}
        ogImageAlt={PAGE_SEO.faq.og_image_alt}
        schema={[
          faqSchema,
          STRUCTURED_DATA.buildBreadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Support', path: '/support' },
            { name: 'FAQ', path: '/faq' },
          ]),
        ]}
      />
      <div style={{background:'var(--darker)',padding:'40px 0',borderBottom:'3px solid var(--orange)'}}>
        <div className="container">
          <Breadcrumb items={['Home','Support','FAQ']} />
          <h1 style={{color:'white',fontFamily:'var(--pixel)',fontSize:17,marginBottom:8}}>FAQ & SUPPORT</h1>
          <p style={{color:'#888',fontSize:17,maxWidth:560}}>Find answers to the most common questions about our games, hardware compatibility, shipping, and orders.</p>
        </div>
      </div>

      <div className="container section">
        {/* Search */}
        <div style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:24,marginBottom:40,maxWidth:600}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Search FAQ</div>
          <div style={{display:'flex',gap:10}}>
            <input className="form-input" placeholder="e.g. PAL compatibility, shipping times, returns..." style={{flex:1}} />
            <button className="btn btn-primary">Search</button>
          </div>
        </div>

        {/* Quick Nav */}
        <div style={{display:'flex',gap:8,marginBottom:32,flexWrap:'wrap'}}>
          <button onClick={() => setActiveSection('all')} className={`btn btn-sm ${activeSection==='all'?'btn-primary':'btn-secondary'}`}>All Topics</button>
          {faqs.map(f => (
            <button key={f.cat} onClick={() => setActiveSection(f.cat)} className={`btn btn-sm ${activeSection===f.cat?'btn-primary':'btn-secondary'}`}>
              {f.cat}
            </button>
          ))}
        </div>

        <div className="blog-layout" style={{gap:40}}>
          <div>
            {faqs
              .filter(f => activeSection === 'all' || f.cat === activeSection)
              .map(section => (
                <div key={section.cat} style={{marginBottom:40}}>
                  <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:4}}>{section.cat.toUpperCase()}</div>
                  <h2 style={{fontSize:18,fontWeight:700,marginBottom:0}}>{section.cat}</h2>
                  <Accordion items={section.items} />
                </div>
              ))
            }
          </div>

          {/* Sidebar */}
          <div>
            <div className="panel-pixel-light" style={{padding:20,marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:17,marginBottom:12}}>Still need help?</div>
              <p style={{fontSize:16,color:'#666',lineHeight:'1.6',marginBottom:16}}>Can't find your answer? Our team is here to help. Reach out via email or social media.</p>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <a href="mailto:support@itg-soft.tw" className="btn btn-primary btn-sm" style={{textAlign:'center'}}>
                  ✉ Email Support
                </a>
                <a href="https://x.com/indietaiwangame" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">💬 Twitter/X @indietaiwangame</a>
                <a href="https://www.facebook.com/profile.php?id=100093602714284" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">📘 Facebook: ITGSoft</a>
              </div>
            </div>

            <div className="panel-pixel-light" style={{padding:20,marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:12}}>Response Times</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,fontSize:15,color:'#555'}}>
                {[
                  ['💳 Payment issues','2–4 hours'],
                  ['📦 Shipping issues','4–8 hours'],
                  ['❓ General inquiries','24 hours'],
                  ['💬 General feedback','48 hours'],
                ].map(([type,time]) => (
                  <div key={type} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f0ece6'}}>
                    <span>{type}</span>
                    <span style={{fontWeight:600,color:'var(--green)'}}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-pixel" style={{padding:20}}>
              <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:8}}>ORDER TRACKING</div>
              <div style={{color:'white',fontSize:16,fontWeight:600,marginBottom:8}}>Track Your Order</div>
              <input
                className="form-input"
                placeholder="Order number"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                pattern="ITG-[0-9]{4}-[0-9]{5}"
                style={{marginBottom:8,background:'#2a2a2a',borderColor:'#444',color:'white'}}
              />
              <input
                className="form-input"
                type="email"
                placeholder="Email address"
                value={trackingEmail}
                onChange={e => setTrackingEmail(e.target.value)}
                autoComplete="email"
                style={{marginBottom:10,background:'#2a2a2a',borderColor:'#444',color:'white'}}
              />
              {trackingMsg && <div style={{color:trackingMsg.startsWith('Tracking') ? '#fbbf24' : '#f87171',fontSize:15,marginBottom:10,lineHeight:1.5}}>{trackingMsg}</div>}
              <button className="btn btn-primary btn-full btn-sm" onClick={handleTrackOrder}>Track →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
