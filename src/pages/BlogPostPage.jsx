import { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import { useStore } from '../context/StoreContext'
import SeoHead from '../components/SeoHead'
import { STRUCTURED_DATA, PAGE_SEO } from '../data/seo'
import { notifyEvent } from '../lib/notifications'

// Map category keys → display labels
const CAT_LABEL = {
  dev_diary:         'Dev Diary',
  retro_guide:       'Retro Guide',
  company_news:      'Company News',
  taiwan_culture:    'Taiwan Culture',
  product_spotlight: 'Product Spotlight',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Very simple markdown → HTML (bold, headings, line breaks only)
function renderMarkdown(text) {
  if (!text) return ''
  const lines = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').split('\n')
  const html = lines.map(line => {
    // h2
    if (line.startsWith('## ')) return `<h2 style="font-size:20px;font-weight:800;margin:28px 0 12px;color:#111">${line.slice(3)}</h2>`
    // h3
    if (line.startsWith('### ')) return `<h3 style="font-size:16px;font-weight:700;margin:22px 0 8px;color:#111">${line.slice(4)}</h3>`
    // h1
    if (line.startsWith('# ')) return `<h1 style="font-size:24px;font-weight:900;margin:28px 0 14px;color:#111">${line.slice(2)}</h1>`
    // empty line → paragraph break
    if (line.trim() === '') return '<br/>'
    // bold
    const bolded = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    return `<span>${bolded}</span><br/>`
  })
  return html.join('')
}

export default function BlogPostPage({ onNav, slug }) {
  const { blogPosts } = useStore()

  // Find post by slug or fall back to first published
  const post = slug ? blogPosts.find(p => p.slug === slug && p.status === 'published') : blogPosts.find(p => p.status === 'published')

  const [commentEmail, setCommentEmail] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentSent, setCommentSent] = useState(false)
  const [commentErr, setCommentErr] = useState('')

  if (!post) {
    return (
      <div className="page">
        <div className="container section" style={{ textAlign: 'center', padding: '80px 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h2 style={{ fontWeight: 800, marginBottom: 12 }}>Post not found</h2>
          <button className="btn btn-primary" onClick={() => onNav?.('blog')}>← Back to Dev Stories</button>
        </div>
      </div>
    )
  }

  const catLabel = CAT_LABEL[post.category] || post.category || 'General'
  const author = post.author_name || 'ITG-SOFT Team'
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const readTime = post.body ? Math.max(1, Math.round(post.body.split(/\s+/).length / 200)) : 5

  const bodyHtml = renderMarkdown(post.body || post.excerpt || 'Full article coming soon.')

  // Related posts: same category, exclude current
  const related = blogPosts
    .filter(p => p.status === 'published' && p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)
  const morePosts = related.length < 3
    ? [...related, ...blogPosts.filter(p => p.status === 'published' && p.slug !== post.slug && !related.find(r => r.id === p.id))].slice(0, 3)
    : related

  function handleComment(e) {
    e.preventDefault()
    const email = commentEmail.trim()
    const text = commentText.trim()
    if (!EMAIL_RE.test(email)) {
      setCommentErr('Enter a valid email address.')
      return
    }
    if (text.length < 10) {
      setCommentErr('Comment must be at least 10 characters.')
      return
    }
    setCommentErr('')
    setCommentEmail(email)
    setCommentText(text)
    setCommentSent(true)
    void notifyEvent('blog_comment_submitted', {
      slug: post.slug,
      title: post.title,
      email,
      message: text,
    })
  }

  // SEO
  const seoTitle = `${post.title} — ITG-SOFT Dev Stories`
  const seoDesc = post.excerpt || `${post.title}. Read the full article on ITG-SOFT Dev Stories.`
  const catKeywords = PAGE_SEO.blogPostKeywords?.[post.category] || []
  const postKeywords = [...catKeywords, ...(post.tags || []), 'ITG-SOFT dev stories', 'NES homebrew', 'famicom game']
  const postSchema = STRUCTURED_DATA.buildBlogPost(post)
  const breadcrumbSchema = STRUCTURED_DATA.buildBreadcrumb([
    { name: 'Home', path: '/' },
    { name: 'Dev Stories', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ])

  return (
    <div className="page">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        canonical={`/blog/${post.slug}`}
        keywords={postKeywords}
        ogType="article"
        ogImageAlt={`${post.title} — ITG-SOFT Dev Stories`}
        articlePublishedTime={post.published_at}
        articleAuthor={author}
        articleSection={catLabel}
        articleTags={post.tags}
        schema={[postSchema, breadcrumbSchema]}
      />
      {/* Header */}
      <div style={{ background: 'var(--darker)', padding: '32px 0', borderBottom: '3px solid var(--orange)' }}>
        <div className="container">
          <Breadcrumb items={['Home', 'Dev Stories', post.title]} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <span className="tag" style={{ cursor: 'pointer' }} onClick={() => onNav?.('blog')}>{catLabel}</span>
            <span className="tag">{readTime} min read</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(22px,4vw,36px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 14, maxWidth: 760 }}>
            {post.title}
          </h1>
          <div style={{ color: '#888', fontSize: 16 }}>
            By <span style={{ color: '#ccc', fontWeight: 600 }}>{author}</span>
            {dateStr && <> · {dateStr}</>}
            {typeof post.view_count === 'number' && <> · {post.view_count.toLocaleString()} views</>}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1100, padding: '48px 16px' }}>
        <div className="blog-layout" style={{ gap: 48, alignItems: 'start' }}>

          {/* ── Article body ── */}
          <div>
            {/* Cover image placeholder */}
            <div className="wf-img" style={{ height: 340, borderRadius: 10, marginBottom: 32 }}>
              {post.cover_image_url && <img src={post.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              <span style={{ fontSize: 16, color: '#bbb' }}>[ COVER IMAGE ]</span>
            </div>

            {/* Excerpt lead */}
            {post.excerpt && (
              <p style={{ fontSize: 17, fontWeight: 600, color: '#444', lineHeight: '1.75', marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #eee' }}>
                {post.excerpt}
              </p>
            )}

            {/* Body */}
            <div
              style={{ fontSize: 15, color: '#333', lineHeight: '1.9' }}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #eee', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.tags.map(t => (
                  <span key={t} className="tag" style={{ cursor: 'default' }}>#{t}</span>
                ))}
              </div>
            )}

            {/* Share */}
            <div style={{ marginTop: 28, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 16, color: '#999', fontWeight: 600 }}>Share:</span>
              {['Twitter/X', 'Facebook', 'Copy Link'].map(s => (
                <button key={s} className="btn btn-secondary btn-sm" style={{ fontSize: 14, padding: '4px 12px' }}>{s}</button>
              ))}
            </div>

            {/* Back link */}
            <div style={{ marginTop: 32 }}>
              <button className="btn btn-secondary" onClick={() => onNav?.('blog')}>← Back to Dev Stories</button>
            </div>

            {/* Comments */}
            <div style={{ marginTop: 56 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: '#111' }}>Leave a Comment</h3>
              {commentSent ? (
                <div style={{ background: '#e8f5e9', border: '1px solid #81c784', borderRadius: 8, padding: '20px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                  <div style={{ fontWeight: 700, color: '#2e7d32', fontSize: 15 }}>Comment submitted!</div>
                  <div style={{ color: '#555', fontSize: 16, marginTop: 4 }}>Thanks — it will appear after review.</div>
                </div>
              ) : (
                <form onSubmit={handleComment} style={{ background: '#fafafa', border: '1px solid #ebebeb', borderRadius: 10, padding: 24 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 }}>Email <span style={{ color: 'var(--orange)' }}>*</span></label>
                    <input
                      type="email" required
                      value={commentEmail}
                      onChange={e => setCommentEmail(e.target.value)}
                      placeholder="your@email.com"
                      autoComplete="email"
                      className="form-input"
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 6 }}>Comment <span style={{ color: 'var(--orange)' }}>*</span></label>
                    <textarea
                      required
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={4}
                      minLength={10}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                  {commentErr && <div style={{ color:'var(--red)', fontSize:15, marginBottom:12 }}>{commentErr}</div>}
                  <button type="submit" className="btn btn-primary">Post Comment</button>
                </form>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div>
            {/* Author card */}
            <div style={{ background: 'white', border: '2px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>About the Author</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                  {author.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{author}</div>
                  <div style={{ color: '#888', fontSize: 14, marginTop: 2 }}>ITG-SOFT Team</div>
                </div>
              </div>
            </div>

            {/* More Dev Stories */}
            {morePosts.length > 0 && (
              <div style={{ background: 'white', border: '2px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>More Articles</div>
                {morePosts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onNav?.('blogPost', p.slug)}
                    style={{ display: 'flex', gap: 10, marginBottom: 14, cursor: 'pointer' }}
                  >
                    <div className="wf-img" style={{ width: 52, height: 52, borderRadius: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: '#bbb' }}>IMG</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, lineHeight: '1.4', marginBottom: 3, color: '#111' }}>{p.title}</div>
                      <div style={{ fontSize: 14, color: '#999' }}>{CAT_LABEL[p.category] || p.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Newsletter CTA */}
            <NewsletterSidebarWidget />
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable sidebar newsletter widget
function NewsletterSidebarWidget() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  function handleSubscribe(e) {
    e.preventDefault()
    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setErr('Enter a valid email address.')
      return
    }
    setErr('')
    setEmail(value)
    setDone(true)
    void notifyEvent('newsletter_subscribed', { email: value, source: 'blog_post' })
  }

  return (
    <div style={{ background: 'var(--darker)', borderRadius: 10, padding: 20, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', marginBottom: 8 }}>NEWSLETTER</div>
      {done ? (
        <div style={{ color: '#aaa', fontSize: 16, padding: '8px 0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎮</div>
          <div style={{ color: 'white', fontWeight: 700, marginBottom: 4 }}>You're in!</div>
          <div style={{ fontSize: 15 }}>We'll send you new releases & updates.</div>
        </div>
      ) : (
        <form onSubmit={handleSubscribe}>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Never miss a post</div>
          <input
            type="email" required
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            style={{ marginBottom: 10, background: '#2a2a2a', borderColor: '#444', color: 'white' }}
          />
          {err && <div style={{ color:'#f87171', fontSize:15, marginBottom:10 }}>{err}</div>}
          <button type="submit" className="btn btn-primary btn-full btn-sm">Subscribe</button>
        </form>
      )}
    </div>
  )
}
