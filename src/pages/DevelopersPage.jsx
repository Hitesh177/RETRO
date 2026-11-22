import { useState } from 'react'
import SeoHead from '../components/SeoHead'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'

const publishingFAQs = [
  {
    q: 'Why publish with Yī Tái Yóuxì Software Company?',
    a: "We were founded by gamers and collectors who know the Famicom and Famiclone market inside and out. We have distribution reach across South America, Europe, and Asia — markets that are hard to crack on your own. We handle the manufacturing, logistics, and marketing so you can focus on what matters: making a great game. And through it all, you keep full rights to your game, IP, and characters.",
  },
  {
    q: 'How much does publishing cost?',
    a: 'We do not charge an upfront platform fee. We usually work on a revenue-share model through our retail partners, so the cost depends on the manufacturing and distribution plan we agree on together.',
  },
  {
    q: 'Can I self-publish instead?',
    a: "Absolutely. If you'd prefer to handle sales yourself, you can request a quote for physical cartridge production and we'll produce copies at cost. You then sell them independently through your own channels. We're here to support developers, not lock them in.",
  },
  {
    q: 'Is there a minimum order quantity (MOQ)?',
    a: "We have no MOQ. If you want to order one or five copies, that's fine. Whether you need a single review copy or a full production run, we can accommodate you.",
  },
  {
    q: 'How do you prevent counterfeiting?',
    a: "We do not outsource production to any third-party manufacturers, and we do not distribute ROM files externally under any circumstances. Every cartridge is produced in-house under our direct oversight. This keeps bootleg copies off the market and protects the value of your work.",
  },
  {
    q: 'What customization options are available?',
    a: "We offer a wide range of options: multiple box designs, cartridge shell styles and colors, manual formats, and label configurations. Whether you want a minimalist design or a fully detailed collector's package, we can make it happen.",
  },
  {
    q: 'Can I include pack-in items?',
    a: "Yes! Some items like fliers and promotional inserts are offered at no additional cost. Other items such as posters, stickers, or special inserts may incur additional fees depending on complexity and quantity. Ask us and we'll give you a breakdown.",
  },
  {
    q: 'Do you support 72-PIN NES cartridges?',
    a: "We are happy to announce that yes we do! In addition to Famicom (60-pin), we can produce cartridges in the 72-pin NES format compatible with North American hardware.",
  },
  {
    q: 'Can you help with box and manual design?',
    a: "Yes. Our staff can assist with box art layout, cartridge label design, and instruction manual writing and design. You provide the artwork and direction — we'll help you turn it into a professional finished product.",
  },
  {
    q: "Should I be worried about shipping costs from Taiwan?",
    a: "Not at all. Shipping from Taiwan is incredibly affordable — registered international mail typically runs $6–8 USD globally, with delivery times of around 2 to 2.5 weeks. Our customers around the world regularly comment on how reasonable our shipping rates are.",
  },
  {
    q: 'Why don\'t you shrink-wrap your games?',
    a: "We deliberately skip the shrink wrap, and here's why: original Famicom games were never shrink-wrapped from the factory. Putting a shrink wrap on a new homebrew game feels inauthentic to the platform. Beyond that, shrink wrap can cause boxes to warp over time, and collectors are often reluctant to open sealed games — which means your game sits on a shelf unplayed. We want people to actually play your game.",
  },
]

function AccordionItem({ q, a, isOpen, onToggle }) {
  return (
    <div style={{
      borderBottom: '1px solid #e8e8e8',
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#222',
          lineHeight: 1.4,
          flex: 1,
        }}>
          {q}
        </span>
        <span style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: isOpen ? '#f09526' : '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 18,
          color: isOpen ? 'white' : '#888',
          fontWeight: 300,
          transition: 'background 0.2s',
          lineHeight: 1,
        }}>
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div style={{
          paddingBottom: 20,
          fontSize: 17,
          color: '#555',
          lineHeight: '1.8',
        }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function DevelopersPage({ onNav }) {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div className="page">
      <SeoHead
        title={PAGE_SEO.developers.title}
        description={PAGE_SEO.developers.description}
        canonical={PAGE_SEO.developers.canonical}
        keywords={PAGE_SEO.developers.keywords}
        ogImageAlt={PAGE_SEO.developers.og_image_alt}
        schema={[
          STRUCTURED_DATA.publishingService,
          STRUCTURED_DATA.buildFAQPage(publishingFAQs),
          STRUCTURED_DATA.buildBreadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Developers', path: '/developers' },
          ]),
        ]}
      />

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop") center/cover no-repeat',
        padding: '80px 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <p style={{
            color: '#f09526',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            publishing opportunities available
          </p>
          <h1 style={{
            color: 'white',
            fontSize: 'clamp(22px, 4vw, 38px)',
            fontWeight: 900,
            lineHeight: 1.25,
            maxWidth: 700,
            margin: '0 auto',
          }}>
            PUBLISHING WITH<br />
            <span style={{ color: '#f09526' }}>YĪ TÁI YÓUXÌ SOFTWARE COMPANY</span>
          </h1>
        </div>
      </div>

      {/* Intro blurb */}
      <section style={{ background: 'white', padding: '52px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <p style={{ fontSize: 15, color: '#444', lineHeight: '1.9', marginBottom: 16 }}>
            We are always looking to team up with other developers to publish new games. When you publish with us, you <strong>maintain the rights to your game, IP, and characters</strong>. We handle the manufacturing, distribution, and sales so you can focus on what you do best.
          </p>
          <p style={{ fontSize: 15, color: '#444', lineHeight: '1.9' }}>
            Whether you're a solo developer or a small studio, if you're building for the Famicom or NES platform, we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Publishing FAQ */}
      <section style={{ background: '#fafafa', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <p style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.18em',
            color: '#f09526',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            FAQ
          </p>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 900,
            color: '#111',
            marginBottom: 36,
            lineHeight: 1.2,
          }}>
            Questions Concerning Game Publishing
          </h2>
          <div style={{ background: 'white', borderRadius: 12, padding: '0 28px', border: '1px solid #ebebeb' }}>
            {publishingFAQs.map((item, i) => (
              <AccordionItem
                key={i}
                q={item.q}
                a={item.a}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Game Development Program */}
      <section style={{ background: 'white', padding: '64px 0' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <p style={{
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.18em',
            color: '#f09526',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            FOR ASPIRING DEVELOPERS
          </p>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            fontWeight: 900,
            color: '#111',
            marginBottom: 24,
            lineHeight: 1.2,
          }}>
            Game Development Opportunities
          </h2>
          <p style={{ fontSize: 15, color: '#555', lineHeight: '1.9', marginBottom: 16 }}>
            Interested in making your first Famicom or NES game but don't know where to start? We offer a structured development program for new creators. We provide hands-on coaching throughout the production process and scope tool support case by case.
          </p>
          <p style={{ fontSize: 15, color: '#555', lineHeight: '1.9', marginBottom: 16 }}>
            In exchange, we publish your first completed game through our platform and share in the sales revenue. You retain full rights to your game, characters, and IP.
          </p>
          <p style={{ fontSize: 15, color: '#555', lineHeight: '1.9', marginBottom: 32 }}>
            Developers who complete the program and successfully ship their first title also receive an exclusive <strong>ITG-SOFT development shirt</strong> as a token of the milestone.
          </p>

          {/* What's included cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
            {[
              { icon: '🛠️', title: 'Tool Support', desc: 'We help identify the software and hardware tools you need for Famicom/NES development.' },
              { icon: '🎓', title: 'Hands-On Coaching', desc: 'Our team guides you through development — from coding basics to music, graphics, and QA.' },
              { icon: '📦', title: 'First Game Published', desc: 'We manufacture and distribute your first completed game through our global store.' },
              { icon: '💡', title: 'You Keep All Rights', desc: 'Your game, your IP, your characters. We never claim ownership — only a publishing partnership.' },
            ].map(card => (
              <div key={card.title} style={{
                background: '#fafafa',
                border: '2px solid #ebebeb',
                borderRadius: 10,
                padding: '24px 20px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#111', marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 15, color: '#666', lineHeight: '1.65' }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section style={{ background: '#111', padding: '64px 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ color: 'white', fontSize: 26, fontWeight: 900, marginBottom: 16 }}>
            Ready to Work Together?
          </h2>
          <p style={{ color: '#aaa', fontSize: 17, lineHeight: '1.8', marginBottom: 32 }}>
            Whether you want to publish an existing game or join our development program, get in touch and we'll figure out the best path forward.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://itg-soft.tw/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#f09526',
                color: 'white',
                padding: '14px 32px',
                borderRadius: 6,
                fontWeight: 800,
                fontSize: 17,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Contact Us →
            </a>
            <button
              onClick={() => onNav?.('listing')}
              style={{
                background: 'transparent',
                color: 'white',
                padding: '14px 32px',
                borderRadius: 6,
                fontWeight: 800,
                fontSize: 17,
                border: '2px solid #444',
                cursor: 'pointer',
              }}
            >
              Browse Our Games
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
