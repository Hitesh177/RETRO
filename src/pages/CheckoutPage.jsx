import React, { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import SeoHead from '../components/SeoHead'
import { notifyEvent } from '../lib/notifications'

const STEPS = [
  { id:1, label:'Cart Review'  },
  { id:2, label:'Your Info'    },
  { id:3, label:'Payment'      },
]

const COUNTRIES = [
  'United States','Canada','United Kingdom','Australia','New Zealand',
  'Japan','South Korea','Hong Kong','Singapore','Taiwan',
  'Germany','France','Netherlands','Sweden','Norway','Denmark',
  'Spain','Italy','Poland','Switzerland','Austria','Belgium',
  'Philippines','Thailand','Malaysia','Indonesia','Vietnam',
  'Other',
]

// ── Progress indicator ────────────────────────────────────────────────────────

function StepsBar({ current }) {
  return (
    <div className="checkout-steps" style={{display:'flex', alignItems:'center', marginBottom:40}}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          {i > 0 && (
            <div className="checkout-step-line" style={{
              flex:1, height:2, margin:'0 8px',
              background: s.id <= current ? 'var(--orange)' : '#e0dbd4',
              transition:'background 0.3s',
            }} />
          )}
          <div className="checkout-step" style={{display:'flex', alignItems:'center', gap:8}}>
            <div style={{
              width:32, height:32, borderRadius:'50%', display:'flex',
              alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16,
              background: s.id < current ? 'var(--green)' : s.id === current ? 'var(--orange)' : '#e0dbd4',
              color: s.id <= current ? 'white' : '#999',
              transition:'all 0.3s',
              boxShadow: s.id === current ? 'var(--glow-orange)' : 'none',
            }}>
              {s.id < current ? '✓' : s.id}
            </div>
            <span className="checkout-step-label" style={{
              fontSize:16, fontWeight:600,
              color: s.id === current ? 'var(--dark)' : s.id < current ? 'var(--green)' : '#aaa',
            }}>{s.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Sidebar order summary ─────────────────────────────────────────────────────

function OrderSummary({ items, subtotal, shippingCost, discountAmount, total, coupon }) {
  return (
    <div className="sidebar-card">
      <div style={{fontWeight:800, fontSize:15, marginBottom:16}}>Order Summary</div>

      <div style={{marginBottom:12}}>
        {items.map(item => (
          <div key={`${item.id}-${item.format}`} style={{
            display:'flex', gap:12, alignItems:'center', marginBottom:12, minWidth:0,
          }}>
            <div className="wf-img" style={{width:52, height:52, borderRadius:6, flexShrink:0}}>
              <span style={{fontSize:12, color:'#bbb'}}>IMG</span>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:15, fontWeight:600, lineHeight:1.3, overflowWrap:'anywhere'}}>{item.title}</div>
              <div style={{fontSize:14, color:'#999'}}>
                Qty: {item.qty} · {item.format === 'digital' ? 'Digital' : 'Physical CIB'}
              </div>
            </div>
            <div style={{fontWeight:700, fontSize:16, whiteSpace:'nowrap', flexShrink:0}}>${(item.price * item.qty).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div style={{borderTop:'1px solid var(--border)', paddingTop:12, display:'flex', flexDirection:'column', gap:8, fontSize:16}}>
        <SRow label="Subtotal"   val={`$${subtotal.toFixed(2)}`} />
        <SRow label="Shipping"   val={shippingCost === 0 ? 'FREE' : `$${shippingCost}`} color={shippingCost === 0 ? 'var(--green)' : undefined} />
        {discountAmount > 0 && (
          <SRow label={`Coupon (${coupon?.code})`} val={`−$${discountAmount.toFixed(2)}`} color="var(--green)" />
        )}
        <div style={{
          borderTop:'2px solid var(--border)', paddingTop:10, marginTop:4,
          display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:16,
        }}>
          <span>Total</span>
          <span style={{color:'var(--orange)'}}>${total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{
        marginTop:16, background:'#f0f9f4', border:'1px solid #a3d4b4',
        borderRadius:6, padding:'8px 12px', fontSize:14, color:'var(--green)',
        fontWeight:600, textAlign:'center',
      }}>
        Payment handled by PayPal
      </div>
    </div>
  )
}

function SRow({ label, val, color }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between'}}>
      <span style={{color:'#666'}}>{label}</span>
      <span style={{fontWeight:600, color: color || 'var(--dark)'}}>{val}</span>
    </div>
  )
}

// ── Step 1: Cart Review ───────────────────────────────────────────────────────

function Step1({ items, onNav }) {
  return (
    <div>
      <h2 style={{fontSize:20, fontWeight:700, marginBottom:20}}>Review Your Cart</h2>

      {items.map(item => (
        <div key={`${item.id}-${item.format}`} style={{
          display:'flex', gap:16, alignItems:'center',
          padding:'16px 0', borderBottom:'1px solid var(--border)',
        }}>
          <div className="wf-img" style={{width:64, height:64, borderRadius:8, flexShrink:0}}>
            <span style={{fontSize:12, color:'#bbb'}}>IMG</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700, fontSize:17}}>{item.title}</div>
            <div style={{fontSize:15, color:'#888'}}>
              {item.format === 'digital' ? 'Digital Download' : 'Physical CIB'} · Qty: {item.qty}
            </div>
          </div>
          <div style={{fontWeight:700, color:'var(--orange)'}}>
            ${(item.price * item.qty).toFixed(2)}
          </div>
        </div>
      ))}

      <button
        className="btn btn-secondary btn-sm"
        style={{marginTop:16}}
        onClick={() => onNav?.('cart')}
      >
        ← Edit Cart
      </button>
    </div>
  )
}

// ── Step 2: Info form ─────────────────────────────────────────────────────────

const REQUIRED_SHIPPING_FIELDS = [
  ['email', 'Email address'],
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['line1', 'address line 1'],
  ['city', 'city'],
  ['postal', 'postal code'],
  ['country', 'country'],
]

const REQUIRED_BILLING_FIELDS = [
  ['billFirst', 'billing first name'],
  ['billLast', 'billing last name'],
  ['billLine1', 'billing address line 1'],
  ['billCity', 'billing city'],
  ['billPostal', 'billing postal code'],
  ['billCountry', 'billing country'],
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const US_ZIP_RE = /^\d{5}(-\d{4})?$/
const PHONE_RE = /^[+()\-\s\d]{7,20}$/
const NAME_RE = /^[\p{L}\p{M}' .-]{2,}$/u

function validatePostal(country, postal, label = 'postal code') {
  const value = String(postal ?? '').trim()
  if (country === 'United States' && !US_ZIP_RE.test(value)) {
    return `Please enter a valid US ZIP code.`
  }
  if (value.length < 3 || value.length > 12) {
    return `Please enter a valid ${label}.`
  }
  return ''
}

function validateCheckoutInfo(form) {
  const missing = REQUIRED_SHIPPING_FIELDS
    .filter(([key]) => !String(form[key] ?? '').trim())
    .map(([, label]) => label)

  if (missing.length) {
    return `Please enter ${missing.join(', ')} before continuing.`
  }

  if (!EMAIL_RE.test(String(form.email).trim())) {
    return 'Please enter a valid email address before continuing.'
  }

  if (!NAME_RE.test(String(form.firstName).trim()) || !NAME_RE.test(String(form.lastName).trim())) {
    return 'Please enter a valid first and last name.'
  }

  if (String(form.line1).trim().length < 5) {
    return 'Please enter a complete street address.'
  }

  if (String(form.city).trim().length < 2) {
    return 'Please enter a valid city.'
  }

  const shippingPostalError = validatePostal(form.country, form.postal)
  if (shippingPostalError) return shippingPostalError

  if (form.phone && !PHONE_RE.test(String(form.phone).trim())) {
    return 'Please enter a valid phone number or leave it blank.'
  }

  if (form.billingSame === false) {
    const billingMissing = REQUIRED_BILLING_FIELDS
      .filter(([key]) => !String(form[key] ?? '').trim())
      .map(([, label]) => label)

    if (billingMissing.length) {
      return `Please enter ${billingMissing.join(', ')} before continuing.`
    }

    const billingPostalError = validatePostal(form.billCountry, form.billPostal, 'billing postal code')
    if (billingPostalError) return billingPostalError
  }

  return ''
}

function Step2({ form, setForm, validationError }) {
  const [mode,         setMode]          = useState('guest')   // guest | account | login
  const billingSame = form.billingSame ?? true

  function field(key, label, placeholder, type = 'text', opts = {}) {
    const required = opts.required !== false
    return (
      <div className="form-group" style={opts.style}>
        <label className="form-label">{label}{required ? ' *' : ''}</label>
        {type === 'select' ? (
          <select
            className="form-select"
            value={form[key] || ''}
            onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
            required={required}
          >
            <option value="">Select country...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <input
            className="form-input"
            type={type}
            placeholder={placeholder}
            value={form[key] || ''}
            onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
            required={required}
            minLength={opts.minLength}
            pattern={opts.pattern}
            autoComplete={opts.autoComplete}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 style={{fontSize:20, fontWeight:700, marginBottom:20}}>Your Information</h2>
      {validationError && (
        <div style={{
          background:'#fff3f0', border:'1px solid #ef9a9a', color:'var(--red)',
          borderRadius:8, padding:'10px 12px', fontSize:16, fontWeight:600,
          marginBottom:18,
        }}>
          {validationError}
        </div>
      )}

      {/* Auth mode toggle */}
      <div style={{
        display:'flex', gap:4, marginBottom:24, background:'var(--bg-warm)',
        borderRadius:8, padding:4,
      }}>
        {[
          { id:'guest',   label:'Guest Checkout' },
          { id:'account', label:'Create Account' },
          { id:'login',   label:'Log In'          },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              flex:1, padding:'8px 12px', borderRadius:6, border:'none',
              background: mode === m.id ? 'white' : 'transparent',
              color: mode === m.id ? 'var(--dark)' : '#888',
              fontWeight: mode === m.id ? 700 : 500,
              fontSize:16, cursor:'pointer',
              boxShadow: mode === m.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition:'all 0.15s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Contact */}
      <div style={{
        fontFamily:'var(--pixel)', fontSize:12, color:'var(--orange)',
        letterSpacing:'0.08em', marginBottom:12,
      }}>CONTACT</div>

      {field('email', 'Email Address', 'you@example.com', 'email')}

      {mode === 'account' && (
        <div className="grid-2">
          {field('password',  'Password',         'Create password', 'password')}
          {field('password2', 'Confirm Password', 'Confirm password','password')}
        </div>
      )}
      {mode === 'login' && (
        <div className="grid-2">
          {field('password', 'Password', 'Your password', 'password')}
          <div style={{display:'flex', alignItems:'flex-end', paddingBottom:20}}>
            <button className="btn btn-secondary btn-sm">Forgot Password?</button>
          </div>
        </div>
      )}

      <label style={{
        display:'flex', gap:8, alignItems:'center',
        marginBottom:24, cursor:'pointer', fontSize:16, color:'#555',
      }}>
        <input
          type="checkbox"
          checked={form.newsletter ?? true}
          onChange={e => setForm(f => ({...f, newsletter: e.target.checked}))}
          style={{accentColor:'var(--orange)'}}
        />
        Subscribe for new release updates and exclusive discounts
      </label>

      {/* Shipping address */}
      <div style={{
        fontFamily:'var(--pixel)', fontSize:12, color:'var(--orange)',
        letterSpacing:'0.08em', marginBottom:12,
      }}>SHIPPING ADDRESS</div>

      <div className="grid-2">
        {field('firstName', 'First Name', 'First name', 'text', { minLength: 2, autoComplete: 'given-name' })}
        {field('lastName',  'Last Name',  'Last name', 'text', { minLength: 2, autoComplete: 'family-name' })}
      </div>
      {field('company', 'Company', 'Company (optional)', 'text', {required: false})}
      {field('line1',   'Address Line 1', 'Street address, P.O. box', 'text', { minLength: 5, autoComplete: 'address-line1' })}
      {field('line2',   'Address Line 2', 'Apartment, suite, floor (optional)', 'text', {required: false})}
      <div className="grid-2">
        {field('city',     'City',            'City', 'text', { minLength: 2, autoComplete: 'address-level2' })}
        {field('state',    'State / Province', 'State or province', 'text', {required: false})}
      </div>
      <div className="grid-2">
        {field('postal',  'ZIP / Postal Code', 'Postal code', 'text', { minLength: 3, autoComplete: 'postal-code' })}
        {field('country', 'Country', '', 'select')}
      </div>
      {field('phone', 'Phone', '+1 (555) 000-0000', 'tel', {required: false})}

      {/* Billing same */}
      <label style={{
        display:'flex', gap:8, alignItems:'center',
        marginBottom: billingSame ? 0 : 24,
        cursor:'pointer', fontSize:16, color:'#555',
      }}>
        <input
          type="checkbox"
          checked={billingSame}
          onChange={e => setForm(f => ({...f, billingSame: e.target.checked}))}
          style={{accentColor:'var(--orange)'}}
        />
        Billing address same as shipping address
      </label>

      {!billingSame && (
        <div style={{marginTop:24}}>
          <div style={{
            fontFamily:'var(--pixel)', fontSize:12, color:'var(--orange)',
            letterSpacing:'0.08em', marginBottom:12,
          }}>BILLING ADDRESS</div>
          <div className="grid-2">
            {field('billFirst', 'First Name', 'First name')}
            {field('billLast',  'Last Name',  'Last name')}
          </div>
          {field('billLine1',  'Address Line 1', 'Street address')}
          {field('billLine2',  'Address Line 2', 'Apartment, suite', 'text', {required: false})}
          <div className="grid-2">
            {field('billCity',    'City',   'City')}
            {field('billState',   'State',  'State')}
          </div>
          <div className="grid-2">
            {field('billPostal',  'ZIP',    'Postal code')}
            {field('billCountry', 'Country','', 'select')}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 3: Payment ───────────────────────────────────────────────────────────

function Step3({ form, total, onPlace, paymentError, placing }) {
  const [agreed,  setAgreed]  = useState(false)

  return (
    <div>
      <h2 style={{fontSize:20, fontWeight:700, marginBottom:20}}>Payment</h2>

      {/* Address review */}
      <div style={{
        background:'var(--bg-warm)', border:'1px solid var(--border)',
        borderRadius:8, padding:'14px 16px', marginBottom:24, fontSize:16,
      }}>
        <div style={{fontWeight:600, marginBottom:6, fontSize:15, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em'}}>
          Shipping to
        </div>
        <div style={{color:'#444', lineHeight:1.6}}>
          {[form.firstName, form.lastName].filter(Boolean).join(' ')}<br />
          {form.line1}, {form.city}, {form.country}<br />
          {form.email}
        </div>
      </div>

      {/* Payment method */}
      <div style={{
        fontFamily:'var(--pixel)', fontSize:12, color:'var(--orange)',
        letterSpacing:'0.08em', marginBottom:12,
      }}>PAYMENT METHOD</div>

      <p style={{ fontSize: 16, color: '#555', marginBottom: 24 }}>You will complete payment on PayPal's secure checkout. Card checkout is offered there when PayPal makes it available for your location.</p>

      {/* T&C */}
      <label style={{
        display:'flex', gap:10, alignItems:'flex-start',
        marginBottom:20, cursor:'pointer', fontSize:16, color:'#555', lineHeight:1.6,
      }}>
        <input
          type="checkbox" style={{marginTop:2, flexShrink:0, accentColor:'var(--orange)'}}
          checked={agreed} onChange={e => setAgreed(e.target.checked)}
        />
        I agree to the{' '}
        <span style={{color:'var(--orange)'}}>Terms & Conditions</span>,{' '}
        <span style={{color:'var(--orange)'}}>Privacy Policy</span>, and{' '}
        <span style={{color:'var(--orange)'}}>Shipping Policy</span>
      </label>

      {paymentError && (
        <div style={{
          background:'#fff3f0', border:'1px solid #ef9a9a', color:'var(--red)',
          borderRadius:8, padding:'10px 12px', fontSize:16, fontWeight:600,
          marginBottom:18,
        }}>
          {paymentError}
        </div>
      )}

      <button
        className="btn btn-full btn-lg"
        disabled={placing || !agreed}
        onClick={onPlace}
        style={{
          background: !agreed ? '#ccc' : 'var(--green)',
          borderColor: !agreed ? '#ccc' : 'var(--green)',
          color: 'white',
          cursor: placing ? 'not-allowed' : 'pointer',
          fontSize:16, fontWeight:700,
          transition:'all 0.2s',
        }}
      >
        {placing ? 'Opening PayPal...' : `Continue to PayPal — $${total.toFixed(2)}`}
      </button>
    </div>
  )
}

// ── Confirmation ──────────────────────────────────────────────────────────────

function Confirmation({ orderNumber, items, total, email, onNav }) {
  return (
    <div style={{textAlign:'center', padding:'48px 0'}}>
      <div style={{
        fontFamily:'var(--display)', fontSize:80, color:'var(--green)',
        textShadow:'var(--glow-green)', lineHeight:1, marginBottom:8,
      }}>
        CONFIRMED!
      </div>
      <div style={{
        fontFamily:'var(--pixel)', fontSize:13, color:'var(--nes-yellow)',
        marginBottom:24, letterSpacing:'0.1em',
      }}>
        ORDER PLACED SUCCESSFULLY
      </div>

      <div style={{
        display:'inline-block', background:'var(--bg-warm)',
        border:'2px solid var(--border)', borderRadius:10,
        padding:'20px 40px', marginBottom:32, textAlign:'left',
      }}>
        <div style={{
          fontFamily:'var(--pixel)', fontSize:12, color:'var(--orange)', marginBottom:12,
        }}>ORDER DETAILS</div>
        <div style={{display:'flex', flexDirection:'column', gap:8, fontSize:16}}>
          <CRow label="Order #"    val={<span style={{fontFamily:'var(--mono)', fontWeight:700}}>{orderNumber}</span>} />
          <CRow label="Email"      val={email} />
          <CRow label="Total"      val={<span style={{color:'var(--orange)', fontWeight:700}}>${total.toFixed(2)}</span>} />
          <CRow label="Delivery"   val="Shipping updates will follow by email" />
        </div>
      </div>

      {items.length > 0 && (
        <div style={{
          background:'white', border:'2px solid var(--border)',
          borderRadius:10, padding:20, maxWidth:520, margin:'0 auto 28px',
          textAlign:'left',
        }}>
          <div style={{fontWeight:800, fontSize:15, marginBottom:14}}>Order Items</div>
          {items.map(item => (
            <div key={`${item.id}-${item.format}`} style={{
              display:'flex', justifyContent:'space-between', gap:16,
              padding:'10px 0', borderTop:'1px solid var(--border)',
              fontSize:16,
            }}>
              <div>
                <div style={{fontWeight:700}}>{item.title}</div>
                <div style={{color:'#888', fontSize:15}}>
                  Qty: {item.qty} · {item.format === 'digital' ? 'Digital Download' : 'Physical CIB'}
                </div>
              </div>
              <div style={{fontWeight:800, color:'var(--orange)', whiteSpace:'nowrap'}}>
                {item.price === 0 ? 'FREE' : `$${(item.price * item.qty).toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{color:'#666', fontSize:17, marginBottom:28, maxWidth:480, margin:'0 auto 28px'}}>
        A confirmation email has been sent. Your order will be packed in Taichung, Taiwan and shipped worldwide.
      </p>

      <div style={{display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
        <button className="btn btn-primary btn-lg" onClick={() => onNav?.('account')}>
          View Order in Account
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => onNav?.('listing')}>
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

function CRow({ label, val }) {
  return (
    <div style={{display:'flex', gap:16}}>
      <span style={{color:'#888', width:80, flexShrink:0}}>{label}</span>
      <span style={{fontWeight:500}}>{val}</span>
    </div>
  )
}

// ── Main CheckoutPage ─────────────────────────────────────────────────────────

export default function CheckoutPage({ onNav }) {
  const { items, subtotal, shippingCost, discountAmount, total, coupon, shipping, SHIPPING_RATES, clearCart } = useCart()

  const [step,     setStep]    = useState(1)
  const [form,     setForm]    = useState({})
  const [confirmed,setConfirmed] = useState(false)
  const [orderNum, setOrderNum]  = useState('')
  const [formError,setFormError] = useState('')
  const [orderSnapshot, setOrderSnapshot] = useState(null)
  const [quote, setQuote] = useState(null)
  const [paymentError, setPaymentError] = useState('')
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('paypal') !== 'return' || !params.get('token')) return
    let cancelled = false
    setPlacing(true)
    fetch('/api/checkout/capture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: params.get('token') }) })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Payment failed.'); return data })
      .then(data => {
        if (cancelled) return
        const snapshot = { items: items.map(item => ({ ...item })), total: data.total, email: data.email }
        setOrderSnapshot(snapshot)
        setOrderNum(data.orderNumber)
        setConfirmed(true)
        clearCart()
        void notifyEvent('order_paid', { order_number: data.orderNumber, ...snapshot })
        window.history.replaceState({}, '', '/checkout')
      })
      .catch(err => { if (!cancelled) { setPaymentError(err.message); setStep(3) } })
      .finally(() => { if (!cancelled) setPlacing(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('paypal') === 'cancel') {
      setPaymentError('Payment was cancelled. Your cart is still here.')
      setStep(3)
      window.history.replaceState({}, '', '/checkout')
    }
  }, [])

  const checkoutInput = () => ({ items, address: { ...form }, couponCode: coupon?.code, shippingMethod: SHIPPING_RATES[shipping]?.label })

  async function requestJson(path, input) {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Checkout service is unavailable.')
    return data
  }

  async function goNext() {
    if (step === 2) {
      const err = validateCheckoutInfo(form)
      if (err) {
        setFormError(err)
        return
      }
      setPlacing(true)
      try { setQuote(await requestJson('/api/checkout/quote', checkoutInput())) }
      catch (error) { setFormError(error.message); setPlacing(false); return }
      setPlacing(false)
    }
    setFormError('')
    setStep(s => s + 1)
  }

  async function handlePlace() {
    setPlacing(true)
    setPaymentError('')
    try {
      const result = await requestJson('/api/checkout/create', checkoutInput())
      window.location.assign(result.approve)
    } catch (error) { setPaymentError(error.message); setPlacing(false) }
  }

  if (confirmed) {
    const snapshot = orderSnapshot || { items: [], total: 0, email: form.email }
    return (
      <div className="page">
        <div style={{background:'var(--darker)', padding:'12px 0', borderBottom:'2px solid #333'}}>
          <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontFamily:'var(--pixel)', fontSize:15, color:'var(--orange)'}}>ITG-SOFT</div>
            <div style={{fontSize:16, color:'#888'}}>🔒 Secure Checkout</div>
          </div>
        </div>
        <div className="container section">
          <Confirmation
            orderNumber={orderNum}
            items={snapshot.items}
            total={snapshot.total}
            email={snapshot.email}
            onNav={onNav}
          />
        </div>
      </div>
    )
  }

  if (items.length === 0 && !placing) {
    return (
      <div className="page">
        <SeoHead
          title="Checkout — ITG-SOFT"
          description="Complete your ITG-SOFT order securely."
          canonical="/checkout"
          noIndex={true}
        />
        <div style={{background:'var(--darker)', padding:'12px 0', borderBottom:'2px solid #333'}}>
          <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontFamily:'var(--pixel)', fontSize:15, color:'var(--orange)'}}>ITG-SOFT</div>
            <div style={{fontSize:16, color:'#888'}}>Secure Checkout</div>
          </div>
        </div>
        <div className="container section" style={{textAlign:'center', maxWidth:620}}>
          <h1 style={{fontSize:28, fontWeight:800, marginBottom:10}}>Your cart is empty</h1>
          <p style={{color:'#666', marginBottom:24}}>
            Add a game before starting checkout.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => onNav?.('listing')}>
            Browse Games
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <SeoHead
        title="Checkout — ITG-SOFT"
        description="Complete your ITG-SOFT order securely."
        canonical="/checkout"
        noIndex={true}
      />
      {/* Minimal checkout header */}
      <div style={{background:'var(--darker)', padding:'12px 0', borderBottom:'2px solid #333'}}>
        <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontFamily:'var(--pixel)', fontSize:15, color:'var(--orange)'}}>ITG-SOFT</div>
          <div style={{fontSize:16, color:'#888'}}>🔒 Secure Checkout</div>
        </div>
      </div>

      <div className="container section">
        <StepsBar current={step} />

        <div className="two-col">
          <div>
            {step === 1 && <Step1 items={items} onNav={onNav} />}
            {step === 2 && <Step2 form={form} setForm={setForm} validationError={formError} />}
            {step === 3 && <Step3 form={form} total={quote?.total ?? total} onPlace={handlePlace} paymentError={paymentError} placing={placing} />}

            <div style={{display:'flex', justifyContent:'space-between', marginTop:32, paddingTop:24, borderTop:'1px solid var(--border)'}}>
              {step > 1
                ? <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
                : <button className="btn btn-secondary" onClick={() => onNav?.('cart')}>← Back to Cart</button>
              }
              {step < 3 && (
                <button className="btn btn-primary btn-lg" onClick={goNext} disabled={placing}>
                  {placing ? 'Checking totals...' : 'Continue →'}
                </button>
              )}
            </div>
          </div>

          <OrderSummary
            items={items}
            subtotal={quote?.subtotal ?? subtotal}
            shippingCost={quote?.shipping ?? shippingCost}
            discountAmount={quote?.discount ?? discountAmount}
            total={quote?.total ?? total}
            coupon={coupon}
          />
        </div>
      </div>
    </div>
  )
}
