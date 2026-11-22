import React, { useState } from 'react'
import { Breadcrumb } from '../components/Layout'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const STATUS_MAP = {
  pending:    { label:'Pending',    bg:'#fff3cd', color:'#856404'      },
  paid:       { label:'Paid',       bg:'#d4edda', color:'var(--green)' },
  processing: { label:'Processing', bg:'#fff3cd', color:'#856404'      },
  shipped:    { label:'Shipped',    bg:'#e2e3ff', color:'#4a5aef'      },
  delivered:  { label:'Delivered',  bg:'#d4edda', color:'var(--green)' },
  cancelled:  { label:'Cancelled',  bg:'#f8d7da', color:'var(--red)'   },
  refunded:   { label:'Refunded',   bg:'#f8d7da', color:'var(--red)'   },
}
const TABS = [
  { id:'dashboard', icon:'◈', label:'Dashboard'    },
  { id:'orders',    icon:'◫', label:'Order History' },
  { id:'wishlist',  icon:'♡', label:'Wishlist'      },
  { id:'addresses', icon:'◎', label:'Addresses'     },
  { id:'downloads', icon:'▽', label:'Downloads'     },
  { id:'newsletter',icon:'◻', label:'Newsletter'    },
  { id:'settings',  icon:'◉', label:'Settings'      },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Auth forms ────────────────────────────────────────────────────────────────

function LoginForm({ onMode }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState('')
  const [busy,  setBusy]  = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    const cleanEmail = email.trim()
    if (!EMAIL_RE.test(cleanEmail)) {
      setErr('Please enter a valid email address.')
      return
    }
    if (!pass.trim()) {
      setErr('Please enter your password.')
      return
    }
    setBusy(true)
    const { error } = await signIn(cleanEmail, pass)
    setBusy(false)
    if (error) setErr(error.message)
  }

  return (
    <div style={{maxWidth:400, margin:'0 auto', padding:'48px 0'}}>
      <div style={{textAlign:'center', marginBottom:32}}>
        <div style={{fontFamily:'var(--display)', fontSize:64, color:'var(--orange)', textShadow:'var(--glow-orange)', lineHeight:1, marginBottom:8}}>LOGIN</div>
        <div style={{fontFamily:'var(--pixel)', fontSize:12, color:'#888'}}>ENTER YOUR CREDENTIALS</div>
      </div>
      <form onSubmit={submit} style={{background:'white', border:'2px solid var(--border)', borderRadius:12, padding:28}}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="Your password" value={pass} onChange={e=>setPass(e.target.value)} required />
        </div>
        {err && <div style={{color:'var(--red)', fontSize:15, marginBottom:12}}>{err}</div>}
        <div style={{display:'flex', justifyContent:'flex-end', marginBottom:16}}>
          <button type="button" onClick={()=>onMode('forgot')} style={{background:'none',border:'none',color:'var(--orange)',fontSize:15,cursor:'pointer'}}>Forgot password?</button>
        </div>
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign In →'}
        </button>
        <div style={{textAlign:'center', marginTop:16, fontSize:16, color:'#888'}}>
          Don't have an account?{' '}
          <button type="button" onClick={()=>onMode('register')} style={{background:'none',border:'none',color:'var(--orange)',cursor:'pointer',fontWeight:600}}>Create one</button>
        </div>
      </form>
    </div>
  )
}

function RegisterForm({ onMode }) {
  const { signUp } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [pass,      setPass]      = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [err,       setErr]       = useState('')
  const [busy,      setBusy]      = useState(false)
  const [done,      setDone]      = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    const cleanEmail = email.trim()
    if (firstName.trim().length < 2) { setErr('Please enter your first name.'); return }
    if (!EMAIL_RE.test(cleanEmail)) { setErr('Please enter a valid email address.'); return }
    if (pass !== confirm) { setErr('Passwords do not match.'); return }
    if (pass.length < 8)  { setErr('Password must be at least 8 characters.'); return }
    setBusy(true)
    const { error } = await signUp(cleanEmail, pass, { first_name: firstName.trim(), last_name: lastName.trim() })
    setBusy(false)
    if (error) setErr(error.message)
    else setDone(true)
  }

  if (done) return (
    <div style={{maxWidth:400,margin:'0 auto',padding:'48px 0',textAlign:'center'}}>
      <div style={{fontSize:56,marginBottom:16}}>📧</div>
      <h2 style={{fontWeight:800,marginBottom:8}}>Check your inbox!</h2>
      <p style={{color:'#888',fontSize:16,marginBottom:20}}>We sent a confirmation email. Click the link to activate your account.</p>
      <button className="btn btn-secondary" onClick={()=>onMode('login')}>← Back to Login</button>
    </div>
  )

  return (
    <div style={{maxWidth:440, margin:'0 auto', padding:'48px 0'}}>
      <div style={{textAlign:'center', marginBottom:32}}>
        <div style={{fontFamily:'var(--display)', fontSize:56, color:'var(--orange)', textShadow:'var(--glow-orange)', lineHeight:1, marginBottom:8}}>REGISTER</div>
        <div style={{fontFamily:'var(--pixel)', fontSize:12, color:'#888'}}>CREATE YOUR ACCOUNT</div>
      </div>
      <form onSubmit={submit} style={{background:'white', border:'2px solid var(--border)', borderRadius:12, padding:28}}>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">First Name</label><input className="form-input" placeholder="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} required /></div>
          <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" placeholder="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="Min. 8 characters" value={pass} onChange={e=>setPass(e.target.value)} required /></div>
        <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Confirm" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></div>
        {err && <div style={{color:'var(--red)', fontSize:15, marginBottom:12}}>{err}</div>}
        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create Account →'}
        </button>
        <div style={{textAlign:'center', marginTop:16, fontSize:16, color:'#888'}}>
          Already have an account?{' '}
          <button type="button" onClick={()=>onMode('login')} style={{background:'none',border:'none',color:'var(--orange)',cursor:'pointer',fontWeight:600}}>Sign in</button>
        </div>
      </form>
    </div>
  )
}

function ForgotForm({ onMode }) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent,  setSent]  = useState(false)
  const [err,   setErr]   = useState('')
  const [busy,  setBusy]  = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    const cleanEmail = email.trim()
    if (!EMAIL_RE.test(cleanEmail)) {
      setErr('Please enter a valid email address.')
      return
    }
    setBusy(true)
    const { error } = await resetPassword(cleanEmail)
    setBusy(false)
    if (error) setErr(error.message)
    else setSent(true)
  }

  return (
    <div style={{maxWidth:380, margin:'0 auto', padding:'48px 0'}}>
      <div style={{textAlign:'center', marginBottom:32}}>
        <div style={{fontFamily:'var(--display)', fontSize:44, color:'var(--orange)', textShadow:'var(--glow-orange)', lineHeight:1, marginBottom:8}}>RESET</div>
        <div style={{fontFamily:'var(--pixel)', fontSize:12, color:'#888'}}>PASSWORD RECOVERY</div>
      </div>
      {sent ? (
        <div style={{textAlign:'center', background:'white', border:'2px solid var(--border)', borderRadius:12, padding:28}}>
          <div style={{fontSize:48, marginBottom:12}}>📧</div>
          <div style={{fontWeight:700, marginBottom:8}}>Check your inbox!</div>
          <p style={{color:'#888', fontSize:16, marginBottom:20}}>We sent a reset link to {email}.</p>
          <button className="btn btn-secondary" onClick={()=>onMode('login')}>← Back to Login</button>
        </div>
      ) : (
        <form onSubmit={submit} style={{background:'white', border:'2px solid var(--border)', borderRadius:12, padding:28}}>
          <p style={{color:'#666', fontSize:16, marginBottom:20}}>Enter your email and we'll send you a reset link.</p>
          <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
          {err && <div style={{color:'var(--red)', fontSize:15, marginBottom:12}}>{err}</div>}
          <button className="btn btn-primary btn-full" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link →'}</button>
          <div style={{textAlign:'center', marginTop:16}}>
            <button type="button" onClick={()=>onMode('login')} style={{background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:16}}>← Back to Login</button>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function DashboardTab({ user, profile, onTab }) {
  const displayName = profile?.first_name || user.email.split('@')[0]
  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', { month:'long', year:'numeric' })
  const stats = [
    { label:'Total Orders',   value:'0' },
    { label:'Games Owned',    value:'0' },
    { label:'Downloads',      value:'0' },
    { label:'Loyalty Points', value:'0' },
  ]
  return (
    <div>
      <h1 style={{fontSize:22, fontWeight:800, marginBottom:4}}>Welcome back, {displayName} 👾</h1>
      <p style={{color:'#888', fontSize:16, marginBottom:28}}>Member since {joinDate}</p>
      <div className="grid-4" style={{marginBottom:32}}>
        {stats.map(s => (
          <div key={s.label} style={{background:'white', border:'2px solid var(--border)', borderRadius:10, padding:20, textAlign:'center'}}>
            <div style={{fontFamily:'var(--heading)', fontSize:28, fontWeight:900, color:'var(--orange)'}}>{s.value}</div>
            <div style={{fontSize:15, color:'#888', marginTop:4}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{textAlign:'center',padding:'32px 0',color:'#888',border:'2px dashed var(--border)',borderRadius:10}}>
        <div style={{fontSize:36,marginBottom:8}}>◫</div>
        <p style={{fontSize:16}}>No orders yet.</p>
      </div>
    </div>
  )
}

function OrdersTab() {
  return (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:20}}>Order History</h1>
      <div style={{textAlign:'center',padding:'48px 0',color:'#888',border:'2px dashed var(--border)',borderRadius:10}}>
        <div style={{fontSize:48,marginBottom:12}}>◫</div>
        <p>No orders yet.</p>
      </div>
    </div>
  )
}

function WishlistTab() {
  const { wishlist, removeWishlistItem, addItem } = useCart()
  return (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:24}}>My Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <div style={{textAlign:'center',padding:'48px 0',color:'#888',border:'2px dashed var(--border)',borderRadius:10}}>
          <div style={{fontSize:48,marginBottom:12}}>♡</div>
          <p>No items yet. Heart a game to save it here.</p>
        </div>
      ) : (
        <div className="grid-3">
          {wishlist.map(item => (
            <div key={item.id} style={{background:'white',border:'2px solid var(--border)',borderRadius:10,overflow:'hidden'}}>
              <div className="wf-img" style={{height:140}}><span style={{fontSize:13,color:'#bbb'}}>[ BOX ART ]</span></div>
              <div style={{padding:14}}>
                <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{item.title}</div>
                <div style={{fontWeight:800,color:'var(--orange)',marginBottom:12}}>${item.price}</div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-primary btn-sm" style={{flex:1}}
                    onClick={()=>addItem({id:item.id,slug:item.slug||item.id,title:item.title,price_physical:item.price,box_art_url:null,status:item.status},'physical_cib')}
                  >+ Cart</button>
                  <button className="btn btn-secondary btn-sm" style={{color:'var(--red)',borderColor:'var(--red)'}}
                    onClick={()=>removeWishlistItem(item.id)}
                  >✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddressesTab() {
  const [showAdd, setShowAdd] = useState(false)
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h1 style={{fontSize:22,fontWeight:800}}>Saved Addresses</h1>
        <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(v=>!v)}>+ Add Address</button>
      </div>
      {showAdd && (
        <div style={{background:'white',border:'2px solid var(--orange)',borderRadius:10,padding:24,marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>New Address</div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">First Name</label><input className="form-input" /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" /></div>
          </div>
          <div className="form-group"><label className="form-label">Address Line 1</label><input className="form-input" /></div>
          <div className="grid-2">
            <div className="form-group"><label className="form-label">City</label><input className="form-input" /></div>
            <div className="form-group"><label className="form-label">Postal Code</label><input className="form-input" /></div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-primary btn-sm">Save Address</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{textAlign:'center',padding:'48px 0',color:'#888',border:'2px dashed var(--border)',borderRadius:10}}>
        <div style={{fontSize:36,marginBottom:8}}>◎</div>
        <p style={{fontSize:16}}>No saved addresses yet.</p>
      </div>
    </div>
  )
}

function DownloadsTab() {
  return (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Digital Downloads</h1>
      <p style={{color:'#888',fontSize:16,marginBottom:24}}>Your purchased ROM files. Links valid for 1 year from purchase date.</p>
      <div style={{textAlign:'center',padding:'48px 0',color:'#888',border:'2px dashed var(--border)',borderRadius:10}}>
        <div style={{fontSize:48,marginBottom:12}}>💾</div>
        <p>No digital purchases yet.</p>
      </div>
    </div>
  )
}

function NewsletterTab() {
  const [saved, setSaved] = useState(false)
  const prefs = [
    { id:'orders',    label:'Order updates & shipping notifications', def:true  },
    { id:'releases',  label:'New game releases & pre-order alerts',   def:true  },
    { id:'offers',    label:'Exclusive discounts & coupon codes',      def:true  },
    { id:'blog',      label:'Dev stories & behind-the-scenes',        def:false },
    { id:'developers',label:'Developer partner announcements',        def:false },
  ]
  return (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Newsletter Preferences</h1>
      <p style={{color:'#888',fontSize:16,marginBottom:24}}>Manage what emails you receive from ITG-SOFT.</p>
      <div style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:24,marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:17,marginBottom:16}}>Email Preferences</div>
        {prefs.map(p => (
          <label key={p.id} style={{display:'flex',gap:10,alignItems:'center',marginBottom:14,cursor:'pointer',fontSize:17,color:'#444'}}>
            <input type="checkbox" defaultChecked={p.def} style={{accentColor:'var(--orange)',width:16,height:16}} />
            {p.label}
          </label>
        ))}
        <button className="btn btn-primary" style={{marginTop:8}} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000)}}>
          {saved ? '✓ Saved!' : 'Save Preferences'}
        </button>
      </div>
      <div style={{background:'var(--bg-warm)',border:'1px solid var(--border)',borderRadius:10,padding:20}}>
        <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>Unsubscribe from All</div>
        <p style={{color:'#888',fontSize:16,marginBottom:12}}>Stop all marketing emails. Order confirmations are still sent.</p>
        <button className="btn btn-secondary btn-sm" style={{color:'var(--red)',borderColor:'var(--red)'}}>Unsubscribe from All Marketing</button>
      </div>
    </div>
  )
}

function SettingsTab({ user, profile }) {
  const { signOut, updateProfile } = useAuth()
  const [firstName, setFirstName] = useState(profile?.first_name || '')
  const [lastName,  setLastName]  = useState(profile?.last_name  || '')
  const [saved, setSaved] = useState(false)
  const [err,   setErr]   = useState('')

  async function saveProfile(e) {
    e.preventDefault()
    setErr('')
    const { error } = await updateProfile({ first_name: firstName, last_name: lastName })
    if (error) setErr(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div>
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:24}}>Account Settings</h1>
      <form onSubmit={saveProfile} style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:24,marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Profile Information</div>
        <div className="grid-2">
          <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={firstName} onChange={e=>setFirstName(e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={lastName} onChange={e=>setLastName(e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={user.email} readOnly style={{opacity:0.6}} /></div>
        {err && <div style={{color:'var(--red)',fontSize:15,marginBottom:12}}>{err}</div>}
        <button className="btn btn-primary" type="submit">{saved ? '✓ Saved!' : 'Save Changes'}</button>
      </form>
      <div style={{background:'#fff5f5',border:'2px solid #f5c6c6',borderRadius:10,padding:24}}>
        <div style={{fontWeight:700,fontSize:15,color:'var(--red)',marginBottom:8}}>Danger Zone</div>
        <p style={{color:'#888',fontSize:16,marginBottom:16}}>These actions are permanent and cannot be undone.</p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button className="btn btn-secondary btn-sm" style={{color:'var(--red)',borderColor:'var(--red)'}} onClick={signOut}>Sign Out</button>
          <button className="btn btn-secondary btn-sm" style={{color:'var(--red)',borderColor:'var(--red)'}}>Delete Account</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AccountPage({ onNav }) {
  const { user, profile, loading } = useAuth()
  const [authMode,  setAuthMode]  = useState('login')
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) return (
    <div className="page" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}>
      <div style={{fontFamily:'var(--pixel)',fontSize:12,color:'#888',letterSpacing:'0.1em'}}>LOADING…</div>
    </div>
  )

  if (!user) {
    return (
      <div className="page">
        <div style={{background:'var(--darker)',padding:'12px 0',borderBottom:'2px solid #333'}}>
          <div className="container"><Breadcrumb items={['Home','My Account']} /></div>
        </div>
        <div className="container">
          {authMode === 'login'    && <LoginForm    onMode={setAuthMode} />}
          {authMode === 'register' && <RegisterForm onMode={setAuthMode} />}
          {authMode === 'forgot'   && <ForgotForm   onMode={setAuthMode} />}
        </div>
      </div>
    )
  }

  const displayName = profile?.first_name || user.email.split('@')[0]
  const initial     = displayName[0].toUpperCase()

  return (
    <div className="page">
      <div style={{background:'var(--darker)',padding:'12px 0',borderBottom:'2px solid #333'}}>
        <div className="container"><Breadcrumb items={['Home','My Account']} /></div>
      </div>

      <div className="container section">
        <div className="layout-sidebar" style={{gap:32,alignItems:'start'}}>

          {/* Sidebar */}
          <div>
            <div style={{background:'white',border:'2px solid var(--border)',borderRadius:10,padding:20,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'var(--orange)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:20,flexShrink:0,boxShadow:'var(--glow-orange)'}}>
                  {initial}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:17}}>{displayName}</div>
                  <div style={{fontSize:14,color:'#888'}}>{user.email}</div>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:2}}>
                {TABS.map(t => (
                  <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                    textAlign:'left',padding:'9px 12px',border:'none',borderRadius:6,
                    background: activeTab===t.id ? 'rgba(240,149,38,0.12)' : 'none',
                    color: activeTab===t.id ? 'var(--orange)' : '#555',
                    fontWeight: activeTab===t.id ? 700 : 500,
                    fontSize:16,cursor:'pointer',
                    borderLeft: activeTab===t.id ? '3px solid var(--orange)' : '3px solid transparent',
                    transition:'all 0.12s',
                  }}>
                    <span style={{marginRight:8,opacity:0.6}}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab==='dashboard'  && <DashboardTab  user={user} profile={profile} onTab={setActiveTab} />}
            {activeTab==='orders'     && <OrdersTab />}
            {activeTab==='wishlist'   && <WishlistTab />}
            {activeTab==='addresses'  && <AddressesTab />}
            {activeTab==='downloads'  && <DownloadsTab />}
            {activeTab==='newsletter' && <NewsletterTab />}
            {activeTab==='settings'   && <SettingsTab user={user} profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  )
}
