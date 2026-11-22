import React, { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import { useStore } from '../context/StoreContext'
import SeoHead from '../components/SeoHead'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'
import { notifyEvent } from '../lib/notifications'

// Map mockData category keys → display labels
const CAT_LABEL = {
  dev_diary:         'Dev Diary',
  retro_guide:       'Retro Guide',
  company_news:      'Company News',
  taiwan_culture:    'Taiwan Culture',
  product_spotlight: 'Product Spotlight',
}

const cats = ['All', 'Dev Diary', 'Retro Guide', 'Company News', 'Taiwan Culture', 'Product Spotlight']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function BlogPage({ onNav }) {
  const { blogPosts } = useStore()
  const [activeCat, setActiveCat] = useState('All')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone] = useState(false)
  const [newsletterErr, setNewsletterErr] = useState('')

  // Only show published posts, normalise shape
  const published = blogPosts
    .filter(p => p.status === 'published')
    .map(p => ({
      id:       p.id,
      slug:     p.slug,
      cat:      CAT_LABEL[p.category] || p.category || 'General',
      title:    p.title,
      author:   p.author_name || 'ITG-SOFT Team',
      date:     p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '',
      read:     p.body ? Math.max(1, Math.round(p.body.split(/\s+/).length / 200)) + ' min read' : '5 min read',
      summary:  p.excerpt || '',
      featured: p.is_featured,
      image:    p.cover_image_url,
    }))

  // Apply category filter
  const byCat = activeCat === 'All' ? published : published.filter(p => p.cat === activeCat)

  // Apply search filter
  const filtered = search.trim()
    ? byCat.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.summary.toLowerCase().includes(search.toLowerCase())
      )
    : byCat

  const featured = filtered.find(p => p.featured) || filtered[0]
  const rest = filtered.filter(p => p !== featured)

  function handleSearch(e) {
    e.preventDefault()
    setSearch(searchInput)
  }

  function clearSearch() {
    setSearch('')
    setSearchInput('')
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault()
    const email = newsletterEmail.trim()
    if (!EMAIL_RE.test(email)) {
      setNewsletterErr('Enter a valid email address.')
      return
    }
    setNewsletterErr('')
    setNewsletterEmail(email)
    setNewsletterDone(true)
    void notifyEvent('newsletter_subscribed', { email, source: 'blog' })
  }

  return (
    <div className="page">
      <SeoHead
        title={PAGE_SEO.blog.title}
        description={PAGE_SEO.blog.description}
        canonical={PAGE_SEO.blog.canonical}
        keywords={PAGE_SEO.blog.keywords}
        ogImageAlt={PAGE_SEO.blog.og_image_alt}
        schema={STRUCTURED_DATA.buildBreadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Dev Stories', path: '/blog' },
        ])}
      />
      <div style={{background:'var(--darker)',padding:'32px 0',borderBottom:'3px solid var(--orange)'}}>
        <div className="container">
          <Breadcrumb items={['Home','Dev Stories']} />
          <h1 style={{color:'white',fontFamily:'var(--pixel)',fontSize:17,marginBottom:8}}>DEV STORIES</h1>
          <p style={{color:'#888',fontSize:17}}>Development diaries, retro gaming guides, and Taiwanese gaming culture</p>
        </div>
      </div>

      <div className="container section">
        {/* Category tabs */}
        <div style={{display:'flex',gap:8,marginBottom:32,flexWrap:'wrap'}}>
          {cats.map(c => (
            <button
              key={c}
              onClick={() => { setActiveCat(c); setSearch(''); setSearchInput('') }}
              className={`btn btn-sm ${activeCat===c ? 'btn-primary' : 'btn-secondary'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search active indicator */}
        {search && (
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16, color: '#555' }}>
              Results for <strong>"{search}"</strong> — {filtered.length} post{filtered.length !== 1 ? 's' : ''} found
            </span>
            <button className="btn btn-secondary btn-sm" onClick={clearSearch}>✕ Clear</button>
          </div>
        )}

        {/* Featured Post */}
        {featured && (
          <div className="panel-pixel-light" style={{overflow:'hidden',marginBottom:40,display:'grid',gridTemplateColumns:'1fr 1fr'}}>
            <div className="wf-img" style={{minHeight:300}}>{featured.image ? <img src={featured.image} alt="" style={{ width: '100%', height: 300, objectFit: 'cover' }} /> : <span style={{fontSize:16,color:'#bbb'}}>[ FEATURED POST IMAGE ]</span>}</div>
            <div style={{padding:32,display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <span className="tag">{featured.cat}</span>
                <span className="tag">Featured</span>
              </div>
              <h2 style={{fontSize:22,fontWeight:800,lineHeight:1.3,marginBottom:12}}>{featured.title}</h2>
              <p style={{color:'#666',fontSize:17,lineHeight:'1.7',marginBottom:16}}>{featured.summary}</p>
              <div style={{color:'#999',fontSize:15,marginBottom:20}}>
                {featured.author} · {featured.date} · {featured.read}
              </div>
              <button
                className="btn btn-primary"
                style={{alignSelf:'flex-start'}}
                onClick={() => onNav?.('blogPost', featured.slug)}
              >
                Read Article →
              </button>
            </div>
          </div>
        )}

        {/* Post Grid */}
        <div className="blog-layout" style={{gap:40}}>
          <div>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:20}}>
              {search ? 'Search Results' : 'Latest Posts'}
            </h2>
            {rest.length === 0 && !featured && (
              <p style={{color:'#999',fontSize:17}}>
                {search ? `No posts matching "${search}".` : 'No posts in this category yet.'}
              </p>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:24}}>
              {rest.map(p => (
                <div key={p.id} className="panel-pixel-light" style={{overflow:'hidden',display:'grid',gridTemplateColumns:'200px 1fr'}}>
                  <div className="wf-img" style={{minHeight:140}}>
                    {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: 140, objectFit: 'cover' }} /> : <span style={{fontSize:13,color:'#bbb'}}>[ IMG ]</span>}
                  </div>
                  <div style={{padding:20}}>
                    <div style={{display:'flex',gap:8,marginBottom:8}}>
                      <span className="tag">{p.cat}</span>
                    </div>
                    <h3 style={{fontSize:15,fontWeight:700,marginBottom:8,lineHeight:1.3}}>{p.title}</h3>
                    <p style={{color:'#666',fontSize:16,lineHeight:'1.6',marginBottom:12}}>{p.summary}</p>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{color:'#999',fontSize:14}}>{p.date} · {p.read}</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNav?.('blogPost', p.slug)}
                      >
                        Read →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Search */}
            <div style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:20,marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:12}}>Search Dev Stories</div>
              <form onSubmit={handleSearch} style={{display:'flex',gap:8}}>
                <input
                  className="form-input"
                  placeholder="Search posts..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{flex:1}}
                />
                <button type="submit" className="btn btn-primary btn-sm">🔍</button>
              </form>
              {search && (
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={clearSearch}
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Categories */}
            <div style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:20,marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:12}}>Categories</div>
              {cats.filter(c=>c!=='All').map(c => (
                <div
                  key={c}
                  onClick={() => { setActiveCat(c); setSearch(''); setSearchInput('') }}
                  style={{
                    display:'flex', justifyContent:'space-between', padding:'8px 0',
                    borderBottom:'1px solid #f0ece6', fontSize:16, cursor:'pointer',
                    color: activeCat === c ? 'var(--orange)' : '#555',
                    fontWeight: activeCat === c ? 700 : 400,
                  }}
                >
                  <span>{c}</span>
                  <span style={{background:'#f0ece6',borderRadius:10,padding:'1px 8px',fontSize:14}}>
                    {published.filter(p=>p.cat===c).length}
                  </span>
                </div>
              ))}
            </div>

            {/* Popular Posts */}
            <div style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:20,marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:16,marginBottom:12}}>Popular Posts</div>
              {published.slice(0,3).map((p,i) => (
                <div
                  key={p.id}
                  onClick={() => onNav?.('blogPost', p.slug)}
                  style={{display:'flex',gap:10,marginBottom:12,cursor:'pointer'}}
                >
                  <div className="wf-img" style={{width:52,height:52,borderRadius:6,flexShrink:0}}>
                    <span style={{fontSize:12,color:'#bbb'}}>{i+1}</span>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:600,lineHeight:'1.4',marginBottom:4,color:'#111'}}>{p.title}</div>
                    <div style={{fontSize:14,color:'#999'}}>{p.read}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter CTA */}
            <div style={{background:'var(--darker)',borderRadius:10,padding:20,textAlign:'center'}}>
              <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'var(--orange)',marginBottom:8}}>NEWSLETTER</div>
              {newsletterDone ? (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🎮</div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>You're subscribed!</div>
                  <div style={{ color: '#888', fontSize: 15 }}>We'll keep you posted on new releases & articles.</div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit}>
                  <div style={{color:'white',fontSize:16,fontWeight:600,marginBottom:8}}>Never miss a post</div>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    style={{marginBottom:10,background:'#2a2a2a',borderColor:'#444',color:'white'}}
                  />
                  {newsletterErr && <div style={{color:'#f87171',fontSize:15,marginBottom:10}}>{newsletterErr}</div>}
                  <button type="submit" className="btn btn-primary btn-full btn-sm">Subscribe</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
