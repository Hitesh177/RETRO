import React, { useState } from 'react'
import { useCart } from '../context/CartContext'

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'listing', label: 'Games' },
  { id: 'blog', label: 'Dev Stories' },
  { id: 'about', label: 'About' },
  { id: 'faq', label: 'FAQ' },
  { id: 'developers', label: 'Developers' },
  { id: 'contact', label: 'Contact' },
]

const NAV_IDS = ['home','listing','about','blog','developers','faq','contact']

export function Header({ current, onNav }) {
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleNav(id) {
    onNav(id)
    setMenuOpen(false)
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <div className="logo" style={{padding:0,background:'none',border:'none'}}>
            <img
              src="/logo.png"
              alt="Yī Tái Yóuxì Software Company"
              style={{height:48,width:'auto',display:'block',cursor:'pointer'}}
              onClick={() => handleNav('home')}
            />
          </div>
          <nav className="nav">
            {NAV_IDS.map(id => {
              const p = PAGES.find(p => p.id === id)
              return (
                <a key={id} className={current === id ? 'active' : ''} onClick={() => handleNav(id)}>
                  {p?.label}
                </a>
              )
            })}
          </nav>
          <div className="header-actions">
            <a className={`header-account${current === 'account' ? ' active' : ''}`} onClick={() => handleNav('account')}>My Account</a>
            <button className="cart-btn" onClick={() => handleNav('cart')}>
              🛒 Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>
            {/* Hamburger — visible on mobile only */}
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span style={menuOpen ? {transform:'rotate(45deg) translate(5px,5px)'} : {}} />
              <span style={menuOpen ? {opacity:0} : {}} />
              <span style={menuOpen ? {transform:'rotate(-45deg) translate(5px,-5px)'} : {}} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <nav className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        {NAV_IDS.map(id => {
          const p = PAGES.find(p => p.id === id)
          return (
            <a key={id} className={current === id ? 'active' : ''} onClick={() => handleNav(id)}>
              {p?.label}
            </a>
          )
        })}
        <a onClick={() => handleNav('account')} style={{marginTop:4}}>My Account</a>
      </nav>
    </>
  )
}

export function Footer({ onNav }) {
  const gameLinks = [
    { label: 'All Games', page: 'listing' },
    { label: 'New Releases', page: 'listing' },
    { label: 'Pre-Orders', page: 'listing' },
    { label: 'Digital Downloads', page: 'listing' },
  ]
  const companyLinks = [
    { label: 'Our Story', page: 'about' },
    { label: 'Dev Stories', page: 'blog' },
    { label: 'Developers', page: 'developers' },
    { label: 'Our Clients', page: 'clients' },
    { label: 'Contact Us', page: 'contact' },
  ]
  const supportLinks = [
    { label: 'FAQ', page: 'faq' },
    { label: 'Shipping Info', page: 'shipping' },
    { label: 'Returns Policy', page: 'terms' },
    { label: 'Order Tracking', page: 'account' },
  ]
  const legalLinks = [
    { label: 'Privacy Policy', page: 'privacy' },
    { label: 'Terms & Conditions', page: 'terms' },
    { label: 'Shipping Policy', page: 'shipping' },
    { label: 'Cookie Policy', page: 'cookies' },
  ]
  const socialLinks = [
    { label: 'Twitter/X', href: 'https://x.com/indietaiwangame' },
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100093602714284' },
  ]

  return (
    <footer className="site-footer" style={{position:'relative',overflow:'hidden'}}>
      {/* Decorative lanterns flanking footer */}
      {[
        { left:'0%',  top:0,  size:64, opacity:0.45, delay:'0s'    },
        { left:'4%',  top:0,  size:48, opacity:0.28, delay:'-2.5s' },
        { right:'0%', top:0,  size:60, opacity:0.40, delay:'-1.5s' },
        { right:'4%', top:0,  size:44, opacity:0.25, delay:'-3s'   },
      ].map((l,i) => (
        <img key={i} src="/lantern-pixel.png" alt="" style={{
          position:'absolute', top:l.top, left:l.left, right:l.right,
          width:l.size, height:'auto',
          opacity:l.opacity, imageRendering:'pixelated', pointerEvents:'none',
          transformOrigin:'top center',
          animation:`lantern-sway ${3.2 + i*0.6}s ease-in-out ${l.delay} infinite`,
          zIndex:0, mixBlendMode:'screen',
        }} />
      ))}
      {/* Floating can — small Easter egg bottom-right */}
      <img src="/can-pixel.png" alt="" style={{
        position:'absolute', right:'2%', bottom:8,
        width:44, height:'auto', imageRendering:'pixelated', pointerEvents:'none',
        opacity:0.3, animation:'can-float 6s ease-in-out -3s infinite', zIndex:0,
      }} />
      <div className="container" style={{position:'relative',zIndex:1}}>
        <div className="footer-grid">
          <div>
            <div style={{marginBottom:10}}>
              <img src="/logo.png" alt="Yī Tái Yóuxì Software Company" style={{height:36,width:'auto'}} />
            </div>
            <p style={{color:'#666',fontSize:16,lineHeight:'1.6',marginBottom:16}}>
              Authentic Taiwanese Famicom & NES homebrew games celebrating local culture, festivals, and stories. Based in Taichung City, Taiwan since 2019.
            </p>
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{background:'#333',color:'#aaa',padding:'5px 12px',borderRadius:4,fontSize:14,textDecoration:'none',transition:'background 0.15s'}}
                >
                  {s.label}
                </a>
              ))}
            </div>
            <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'#444',letterSpacing:'0.08em',marginTop:8}}>
              6502 MAKES YOU RELATED
            </div>
          </div>
          <div>
            <div className="footer-col-title">Games</div>
            <ul className="footer-links">
              {gameLinks.map(l => (
                <li key={l.label} style={{cursor:'pointer',transition:'color 0.15s'}} onClick={() => onNav?.(l.page)}>{l.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              {companyLinks.map(l => (
                <li key={l.label} style={{cursor:'pointer',transition:'color 0.15s'}} onClick={() => onNav?.(l.page)}>{l.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Support</div>
            <ul className="footer-links">
              {supportLinks.map(l => (
                <li key={l.label} style={{cursor:'pointer',transition:'color 0.15s'}} onClick={() => onNav?.(l.page)}>{l.label}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Yī Tái Yóuxì Software Company · Taichung, Taiwan · All rights reserved</span>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            {legalLinks.map(l => (
              <span
                key={l.label}
                onClick={() => onNav?.(l.page)}
                style={{cursor:'pointer',transition:'color 0.15s'}}
              >
                {l.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export function Breadcrumb({ items }) {
  return (
    <div style={{padding:'12px 0',fontSize:16,color:'#888',display:'flex',gap:6,alignItems:'center'}}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>›</span>}
          <span style={i === items.length - 1 ? {color:'#333',fontWeight:600} : {cursor:'pointer'}}>{item}</span>
        </React.Fragment>
      ))}
    </div>
  )
}

