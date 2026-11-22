import { useState } from 'react'
import SeoHead from '../components/SeoHead'
import { PAGE_SEO, STRUCTURED_DATA } from '../data/seo'
import { supabase } from '../lib/supabase'
import { notifyEvent } from '../lib/notifications'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSend = async (e) => {
    e.preventDefault()
    setErr('')
    const name = form.name.trim()
    const email = form.email.trim()
    const subject = form.subject.trim()
    const message = form.message.trim()

    if (name.length < 2) {
      setErr('Please enter your name.')
      return
    }
    if (!EMAIL_RE.test(email)) {
      setErr('Please enter a valid email address.')
      return
    }
    if (message.length < 10) {
      setErr('Please enter a message with at least 10 characters.')
      return
    }

    setBusy(true)
    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      subject: subject || null,
      message,
    })
    setBusy(false)
    if (error) setErr('Something went wrong. Please try again.')
    else {
      setSent(true)
      void notifyEvent('contact_message_submitted', { name, email, subject, message })
    }
  }

  return (
    <div className="page" style={{ background: 'white', minHeight: '70vh' }}>
      <SeoHead
        title={PAGE_SEO.contact.title}
        description={PAGE_SEO.contact.description}
        canonical={PAGE_SEO.contact.canonical}
        keywords={PAGE_SEO.contact.keywords}
        ogImageAlt={PAGE_SEO.contact.og_image_alt}
        schema={[
          STRUCTURED_DATA.localBusiness,
          STRUCTURED_DATA.buildBreadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />

      {/* Page Header */}
      <div style={{
        borderBottom: '3px solid #f09526',
        padding: '40px 0 32px',
        background: 'white',
      }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 34px)',
            fontWeight: 900,
            color: '#111',
            marginBottom: 8,
          }}>
            Contact Us
          </h1>
          <p style={{ fontSize: 17, color: '#888' }}>
            Yī tái yóuxì Software Company
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 860, padding: '48px 16px' }}>
        <div className="blog-layout" style={{gap:48,alignItems:'start'}}>

          {/* Left — Form */}
          <div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#111' }}>
                  Message Sent!
                </h2>
                <p style={{ color: '#777', fontSize: 17, marginBottom: 24 }}>
                  Thanks for reaching out. We'll be in touch soon.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  style={{
                    background: '#f09526',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 700,
                    fontSize: 17,
                    cursor: 'pointer',
                  }}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 24 }}>
                  Send Message
                </h2>
                <form onSubmit={handleSend}>
                  {/* Name + Email row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                        Name <span style={{ color: '#f09526' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Your name"
                        minLength={2}
                        autoComplete="name"
                        style={{ width: '100%', padding: '11px 14px', fontSize: 17, border: '1px solid #ddd', borderRadius: 6, outline: 'none', boxSizing: 'border-box', color: '#222' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                        Email <span style={{ color: '#f09526' }}>*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={set('email')}
                        placeholder="your@email.com"
                        autoComplete="email"
                        style={{ width: '100%', padding: '11px 14px', fontSize: 17, border: '1px solid #ddd', borderRadius: 6, outline: 'none', boxSizing: 'border-box', color: '#222' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={set('subject')}
                      placeholder="e.g. Order question, Game feedback, Publishing inquiry…"
                      maxLength={120}
                      style={{ width: '100%', padding: '11px 14px', fontSize: 17, border: '1px solid #ddd', borderRadius: 6, outline: 'none', boxSizing: 'border-box', color: '#222' }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 6 }}>
                      Message <span style={{ color: '#f09526' }}>*</span>
                    </label>
                    <textarea
                      required
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Tell us what's on your mind…"
                      rows={5}
                      minLength={10}
                      style={{ width: '100%', padding: '11px 14px', fontSize: 17, border: '1px solid #ddd', borderRadius: 6, outline: 'none', boxSizing: 'border-box', color: '#222', resize: 'vertical' }}
                    />
                  </div>

                  {err && <div style={{color:'#dc2626',fontSize:16,marginBottom:12}}>{err}</div>}
                  <button
                    type="submit"
                    disabled={busy}
                    style={{
                      background: '#f09526',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      padding: '12px 32px',
                      fontWeight: 800,
                      fontSize: 17,
                      cursor: busy ? 'not-allowed' : 'pointer',
                      width: '100%',
                      opacity: busy ? 0.7 : 1,
                    }}
                  >
                    {busy ? 'Sending…' : 'Send Message'}
                  </button>

                  {/* reCAPTCHA notice */}
                  <p style={{
                    fontSize: 14,
                    color: '#aaa',
                    marginTop: 12,
                    lineHeight: '1.6',
                  }}>
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#f09526' }}>
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#f09526' }}>
                      Terms of Service
                    </a>{' '}
                    apply.
                  </p>
                </form>

                {/* We Want to Hear from You */}
                <div style={{
                  marginTop: 40,
                  paddingTop: 32,
                  borderTop: '1px solid #ebebeb',
                }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 12 }}>
                    We Want to Hear from You!!!
                  </h3>
                  <p style={{ fontSize: 17, color: '#555', lineHeight: '1.8' }}>
                    Whether you have feedback on our games, a question about an order, or want to discuss publishing opportunities — we'd love to hear from you. Drop us a message and we'll get back to you as soon as we can.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right — Company Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Address */}
            <div style={{
              background: '#fafafa',
              border: '1px solid #ebebeb',
              borderRadius: 10,
              padding: 20,
            }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111', marginBottom: 14 }}>
                Yī tái yóuxì Software Company
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>📍</span>
                <div style={{ fontSize: 16, color: '#555', lineHeight: '1.7' }}>
                  (Attn Dave Wang)<br />
                  P.O. Box 36-69, Nantun District<br />
                  Taichung City 408736<br />
                  Taiwan (R.O.C.)
                </div>
              </div>
            </div>

            {/* Hours */}
            <div style={{
              background: '#fafafa',
              border: '1px solid #ebebeb',
              borderRadius: 10,
              padding: 20,
            }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111', marginBottom: 14 }}>
                Hours
              </div>
              {[
                { day: 'Monday', hours: '9:00 AM – 6:00 PM' },
                { day: 'Tuesday', hours: '9:00 AM – 6:00 PM' },
                { day: 'Wednesday', hours: '9:00 AM – 6:00 PM' },
                { day: 'Thursday', hours: '9:00 AM – 6:00 PM' },
                { day: 'Friday', hours: '9:00 AM – 6:00 PM' },
                { day: 'Saturday', hours: 'Closed' },
                { day: 'Sunday', hours: 'Closed' },
              ].map(({ day, hours }) => (
                <div key={day} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid #ebebeb',
                  fontSize: 15,
                }}>
                  <span style={{ color: '#555' }}>{day}</span>
                  <span style={{
                    color: hours === 'Closed' ? '#aaa' : '#333',
                    fontWeight: hours === 'Closed' ? 400 : 600,
                  }}>
                    {hours}
                  </span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div style={{
              background: '#fafafa',
              border: '1px solid #ebebeb',
              borderRadius: 10,
              padding: 20,
            }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#111', marginBottom: 14 }}>
                Follow Us
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '𝕏', label: 'Twitter / X', handle: '@indietaiwangame', href: 'https://x.com/indietaiwangame' },
                  { icon: 'f', label: 'Facebook', handle: 'ITG.Soft', href: 'https://www.facebook.com/profile.php?id=100093602714284' },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: 8,
                      textDecoration: 'none',
                      background: 'white',
                    }}
                  >
                    <span style={{
                      width: 30,
                      height: 30,
                      background: '#f09526',
                      color: 'white',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 17,
                      flexShrink: 0,
                    }}>
                      {s.icon}
                    </span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{s.label}</div>
                      <div style={{ fontSize: 14, color: '#888' }}>{s.handle}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
