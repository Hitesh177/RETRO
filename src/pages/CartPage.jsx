import React, { useState, useEffect, useRef } from 'react'
import { Breadcrumb } from '../components/Layout'
import { useCart } from '../context/CartContext'
import SeoHead from '../components/SeoHead'

// ── Exit-intent popup ─────────────────────────────────────────────────────────

function ExitIntentPopup({ onClose, onApply }) {
  const [code, setCode]   = useState('')
  const [msg,  setMsg]    = useState('')

  async function handleApply() {
    const r = await onApply(code)
    if (r.ok) { setMsg('✓ ' + r.msg); setTimeout(onClose, 1200) }
    else setMsg(r.msg)
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <div style={{
        background:'var(--darker)', border:'3px solid var(--orange)',
        borderRadius:12, padding:36, maxWidth:420, width:'90%', position:'relative',
        boxShadow:'var(--glow-orange)',
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:12, right:16, background:'none', border:'none',
          color:'#888', fontSize:20, cursor:'pointer', lineHeight:1,
        }}>✕</button>

        <div style={{textAlign:'center', marginBottom:24}}>
          <div style={{
            fontFamily:'var(--display)', fontSize:72, color:'var(--orange)',
            textShadow:'var(--glow-orange)', lineHeight:1, marginBottom:8,
          }}>WAIT!</div>
          <div style={{fontFamily:'var(--pixel)', fontSize:12, color:'var(--nes-yellow)', marginBottom:16}}>
            DON'T LEAVE YET
          </div>
          <div style={{color:'#ccc', fontSize:17, lineHeight:1.6}}>
            Your cart still has items. Have a coupon code? Enter it below.
          </div>
        </div>

        <div style={{
          background:'rgba(240,149,38,0.1)', border:'2px dashed var(--orange)',
          borderRadius:8, padding:'12px 20px', textAlign:'center', marginBottom:20,
        }}>
          <div style={{fontFamily:'var(--pixel)', fontSize:16, color:'var(--orange)', letterSpacing:'0.1em'}}>
            YOUR CODE
          </div>
          <div style={{fontSize:15, color:'#aaa', marginTop:4}}>Discount checked at checkout</div>
        </div>

        <div style={{display:'flex', gap:10}}>
          <input
            className="form-input"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{background:'#2a2a2a', borderColor:'#444', color:'white', flex:1}}
          />
          <button className="btn btn-primary" onClick={handleApply}>Apply</button>
        </div>
        {msg && <div style={{fontSize:15, marginTop:8, color: msg.startsWith('✓') ? 'var(--crt-green)' : 'var(--red)'}}>{msg}</div>}

        <button onClick={onClose} style={{
          width:'100%', marginTop:16, background:'none', border:'none',
          color:'#666', fontSize:15, cursor:'pointer', textDecoration:'underline',
        }}>
          No thanks, I'll pay full price
        </button>
      </div>
    </div>
  )
}

// ── Cart item row ──────────────────────────────────────────────────────────────

function CartItemRow({ item, onRemove, onQty, onSave }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      gap:12, padding:'16px 0', borderBottom:'1px solid var(--border)',
    }}
      className="cart-item-row"
    >
      {/* Product */}
      <div style={{display:'flex', gap:16, alignItems:'flex-start'}}>
        <div className="wf-img" style={{width:72, height:72, borderRadius:6, flexShrink:0}}>
          <span style={{fontSize:12, color:'#bbb'}}>IMG</span>
        </div>
        <div>
          <div style={{fontWeight:700, fontSize:17, marginBottom:3}}>{item.title}</div>
          <div style={{fontSize:15, color:'#888', marginBottom:8}}>
            {item.format === 'digital' ? 'Digital Download' : 'Physical CIB Cartridge'}
          </div>
          <div style={{display:'flex', gap:12}}>
            <button onClick={onRemove} style={{
              border:'none', background:'none', color:'var(--red)',
              fontSize:15, cursor:'pointer', padding:0,
            }}>✕ Remove</button>
            <button onClick={onSave} style={{
              border:'none', background:'none', color:'#888',
              fontSize:15, cursor:'pointer', padding:0,
            }}>♡ Save for Later</button>
          </div>
        </div>
      </div>

      {/* Price */}
      <div style={{textAlign:'center', fontWeight:700, color:'var(--orange)'}}>
        {item.price === 0 ? 'FREE' : `$${item.price}`}
      </div>

      {/* Qty */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        border:'2px solid var(--border)', borderRadius:6, overflow:'hidden',
        width:100, margin:'0 auto',
      }}>
        <button onClick={() => onQty(-1)} style={{
          width:32, height:34, border:'none', background:'#f5f5f5',
          cursor:'pointer', fontSize:16, lineHeight:1,
        }}>−</button>
        <span style={{flex:1, textAlign:'center', fontWeight:700, fontSize:17}}>{item.qty}</span>
        <button onClick={() => onQty(1)} style={{
          width:32, height:34, border:'none', background:'#f5f5f5',
          cursor:'pointer', fontSize:16, lineHeight:1,
        }}>+</button>
      </div>

      {/* Line total */}
      <div style={{textAlign:'right', fontWeight:800, fontSize:15}}>
        {item.price === 0 ? 'FREE' : `$${(item.price * item.qty).toFixed(2)}`}
      </div>
    </div>
  )
}

// ── Saved for later row ──────────────────────────────────────────────────────

function SavedRow({ item, onMoveToCart, onRemove }) {
  return (
    <div style={{
      display:'flex', gap:16, alignItems:'center',
      padding:'14px 0', borderBottom:'1px solid var(--border)',
    }}>
      <div className="wf-img" style={{width:60, height:60, borderRadius:6, flexShrink:0}}>
        <span style={{fontSize:12, color:'#bbb'}}>IMG</span>
      </div>
      <div style={{flex:1}}>
        <div style={{fontWeight:700, fontSize:16}}>{item.title}</div>
        <div style={{fontSize:15, color:'#888'}}>
          {item.format === 'digital' ? 'Digital' : 'Physical CIB'} · ${item.price}
        </div>
      </div>
      <div style={{display:'flex', gap:8}}>
        <button className="btn btn-primary btn-sm" onClick={onMoveToCart}>Move to Cart</button>
        <button className="btn btn-secondary btn-sm" style={{color:'var(--red)', borderColor:'var(--red)'}} onClick={onRemove}>✕</button>
      </div>
    </div>
  )
}

// ── Main CartPage ─────────────────────────────────────────────────────────────

export default function CartPage({ onNav }) {
  const {
    items, savedForLater, coupon, shipping,
    removeItem, updateQty, saveForLater, moveToCart, removeSaved,
    applyCoupon, removeCoupon, setShipping, SHIPPING_RATES,
    subtotal, itemCount, shippingCost, discountAmount, total,
  } = useCart()

  const [couponInput,  setCouponInput]  = useState('')
  const [couponMsg,    setCouponMsg]    = useState(null)
  const [showExit,     setShowExit]     = useState(false)
  const exitShown = useRef(false)

  // Exit-intent: fire once when mouse approaches top of viewport
  useEffect(() => {
    if (items.length === 0) return
    function handleMouseMove(e) {
      if (!exitShown.current && e.clientY < 40) {
        setShowExit(true)
        exitShown.current = true
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [items.length])

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    const r = await applyCoupon(couponInput)
    setCouponMsg({ ok: r.ok, msg: r.msg })
    if (r.ok) setCouponInput('')
    setTimeout(() => setCouponMsg(null), 4000)
  }

  const shippingOptions = [
    { id:'standard', ...SHIPPING_RATES.standard, label:'Standard Airmail',  tag:null                   },
    { id:'express',  ...SHIPPING_RATES.express,  label:'EMS Express',        tag:'Faster'               },
    { id:'ems',      ...SHIPPING_RATES.ems,       label:'EMS Priority',       tag:'Fastest'              },
  ]

  return (
    <div className="page">
      <SeoHead
        title="Your Cart — ITG-SOFT"
        description="Review your ITG-SOFT order before checkout."
        canonical="/cart"
        noIndex={true}
      />
      {showExit && (
        <ExitIntentPopup
          onClose={() => setShowExit(false)}
          onApply={(code) => {
            return applyCoupon(code)
          }}
        />
      )}

      <div style={{background:'var(--darker)', padding:'12px 0', borderBottom:'2px solid #333'}}>
        <div className="container">
          <Breadcrumb items={['Home', 'Cart']} />
        </div>
      </div>

      <div className="container section">
        <div style={{display:'flex', alignItems:'baseline', gap:12, marginBottom:32}}>
          <h1 style={{fontSize:26, fontWeight:800}}>Your Cart</h1>
          {itemCount > 0 && (
            <span style={{
              fontFamily:'var(--pixel)', fontSize:12,
              color:'var(--orange)', letterSpacing:'0.05em',
            }}>
              {itemCount} ITEM{itemCount !== 1 ? 'S' : ''}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 0'}}>
            {/* Pixel clouds floating above empty state */}
            <div style={{position:'relative', height:80, marginBottom:8}}>
              {[
                { w:120, h:60, left:'30%', top:0,    opacity:0.35, anim:'cloud-drift 40s linear -5s infinite' },
                { w:80,  h:40, left:'55%', top:12,   opacity:0.25, anim:'cloud-drift 55s linear -20s infinite' },
                { w:100, h:50, left:'15%', top:8,    opacity:0.20, anim:'cloud-drift 48s linear -30s infinite' },
              ].map((c, i) => (
                <img key={i} src="/cloud-pixel.png" alt="" style={{
                  position:'absolute', width:c.w, height:c.h, left:c.left, top:c.top,
                  opacity:c.opacity, imageRendering:'pixelated', pointerEvents:'none',
                  animation:c.anim,
                }} />
              ))}
            </div>
            <div style={{
              fontFamily:'var(--display)', fontSize:80,
              color:'var(--gray-light)', lineHeight:1, marginBottom:16,
            }}>EMPTY</div>
            <div style={{fontFamily:'var(--pixel)', fontSize:12, color:'#bbb', marginBottom:24}}>
              NO CARTRIDGE INSERTED
            </div>
            <p style={{color:'#888', marginBottom:28}}>
              Looks like you haven't added any games yet.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => onNav?.('listing')}>
              Browse Games →
            </button>
          </div>
        ) : (
          <div className="two-col">
            {/* ── Left: items ── */}
            <div>
              {/* Column headers */}
              <div className="cart-col-header" style={{
                display:'grid', gridTemplateColumns:'1fr 90px 120px 80px', gap:12,
                padding:'0 0 10px', borderBottom:'2px solid var(--border)',
                fontSize:14, fontWeight:600, color:'#888',
                textTransform:'uppercase', letterSpacing:'0.06em',
              }}>
                <span>Product</span>
                <span style={{textAlign:'center'}}>Price</span>
                <span style={{textAlign:'center'}}>Qty</span>
                <span style={{textAlign:'right'}}>Total</span>
              </div>

              {items.map(item => (
                <CartItemRow
                  key={`${item.id}-${item.format}`}
                  item={item}
                  onRemove={() => removeItem(item.id, item.format)}
                  onQty={d => updateQty(item.id, item.format, d)}
                  onSave={() => saveForLater(item.id, item.format)}
                />
              ))}

              {/* Coupon */}
              <div style={{padding:'20px 0', borderBottom:'1px solid var(--border)'}}>
                <div style={{fontWeight:600, fontSize:16, marginBottom:10}}>Coupon Code</div>
                {coupon ? (
                  <div style={{
                    display:'flex', alignItems:'center', gap:12,
                    background:'rgba(45,122,79,0.08)', border:'2px solid var(--green)',
                    borderRadius:8, padding:'10px 16px',
                  }}>
                    <span style={{fontSize:16, color:'var(--green)', fontWeight:700, flex:1}}>
                      ✓ <span style={{fontFamily:'var(--mono)'}}>{coupon.code}</span> — {coupon.desc}
                    </span>
                    <button onClick={removeCoupon} style={{
                      border:'none', background:'none', color:'#888',
                      fontSize:15, cursor:'pointer',
                    }}>Remove</button>
                  </div>
                ) : (
                  <div>
                    <div style={{display:'flex', gap:10}}>
                      <input
                        className="form-input"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                        style={{maxWidth:280}}
                      />
                      <button className="btn btn-secondary" onClick={handleApplyCoupon}>Apply</button>
                    </div>
                    {couponMsg && (
                      <div style={{
                        fontSize:15, marginTop:6,
                        color: couponMsg.ok ? 'var(--green)' : 'var(--red)',
                      }}>
                        {couponMsg.ok ? '✓ ' : '✕ '}{couponMsg.msg}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div style={{padding:'20px 0', borderBottom:'1px solid var(--border)'}}>
                <div style={{fontWeight:600, fontSize:16, marginBottom:12}}>Shipping Method</div>
                <div style={{display:'flex', flexDirection:'column', gap:10}}>
                  {shippingOptions.map(opt => (
                    <label key={opt.id} style={{
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      border:`2px solid ${shipping === opt.id ? 'var(--orange)' : 'var(--border)'}`,
                      borderRadius:8, padding:'12px 16px',
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      background: shipping === opt.id ? 'rgba(240,149,38,0.05)' : 'white',
                      opacity: opt.disabled ? 0.45 : 1,
                      transition:'all 0.15s',
                    }}>
                      <div style={{display:'flex', gap:12, alignItems:'center'}}>
                        <input
                          type="radio" name="shipping" value={opt.id}
                          checked={shipping === opt.id}
                          onChange={() => !opt.disabled && setShipping(opt.id)}
                          style={{accentColor:'var(--orange)'}}
                        />
                        <div>
                          <div style={{
                            fontWeight:600, fontSize:17, display:'flex', gap:8, alignItems:'center',
                          }}>
                            {opt.label}
                            {opt.tag && (
                              <span style={{
                                fontFamily:'var(--pixel)', fontSize:11,
                                background: opt.tag === 'Free' ? 'var(--green)' : 'var(--orange)',
                                color:'white', padding:'2px 6px', borderRadius:3,
                              }}>{opt.tag}</span>
                            )}
                          </div>
                          <div style={{fontSize:15, color:'#888'}}>
                            {opt.days}{opt.note ? ` · ${opt.note}` : ''}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        fontWeight:700,
                        color: opt.id === 'free' ? 'var(--green)' : 'var(--dark)',
                      }}>
                        {opt.price === 0 ? 'FREE' : `$${opt.price}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{paddingTop:16}}>
                <button className="btn btn-secondary btn-sm" onClick={() => onNav?.('listing')}>
                  ← Continue Shopping
                </button>
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div>
              <div className="sidebar-card">
                <div style={{fontWeight:800, fontSize:16, marginBottom:20}}>Order Summary</div>

                {/* Item breakdown */}
                <div style={{marginBottom:16}}>
                  {items.map(item => (
                    <div key={`${item.id}-${item.format}`} style={{
                      display:'flex', gap:12, alignItems:'center', marginBottom:12,
                    }}>
                      <div className="wf-img" style={{width:44, height:44, borderRadius:4, flexShrink:0}}>
                        <span style={{fontSize:12, color:'#bbb'}}>IMG</span>
                      </div>
                      <div style={{flex:1, fontSize:15}}>
                        <div style={{fontWeight:600, lineHeight:1.3}}>{item.title}</div>
                        <div style={{color:'#999'}}>Qty {item.qty}</div>
                      </div>
                      <div style={{fontWeight:700, fontSize:16}}>
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{borderTop:'1px solid var(--border)', paddingTop:12}}>
                  <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:12}}>
                    <Row label={`Subtotal (${itemCount} items)`} val={`$${subtotal.toFixed(2)}`} />
                    <Row
                      label="Shipping estimate"
                      val={shippingCost === 0 ? 'FREE' : `$${shippingCost}`}
                      valColor={shippingCost === 0 ? 'var(--green)' : undefined}
                    />
                    {discountAmount > 0 && (
                      <Row
                        label={`Coupon (${coupon.code})`}
                        val={`−$${discountAmount.toFixed(2)}`}
                        valColor="var(--green)"
                      />
                    )}
                    {coupon?.type === 'free_shipping' && (
                      <Row label={`Coupon (${coupon.code})`} val="Free shipping" valColor="var(--green)" />
                    )}
                  </div>

                  <div style={{
                    borderTop:'2px solid var(--border)', paddingTop:12,
                    display:'flex', justifyContent:'space-between',
                  }}>
                    <span style={{fontWeight:700, fontSize:16}}>Estimated total</span>
                    <span style={{fontWeight:900, fontSize:22, color:'var(--orange)'}}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#777', marginTop: 10 }}>Final shipping and coupon amounts are confirmed after you enter your address.</div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  style={{marginTop:20, marginBottom:12}}
                  onClick={() => onNav?.('checkout')}
                >
                  Proceed to Checkout →
                </button>

                <div style={{textAlign:'center', fontSize:14, color:'#aaa'}}>
                  Payment handled by PayPal
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Saved for later ── */}
        {savedForLater.length > 0 && (
          <div style={{marginTop:48, borderTop:'2px solid var(--border)', paddingTop:32}}>
            <h2 style={{fontSize:18, fontWeight:700, marginBottom:20}}>
              Saved for Later ({savedForLater.length})
            </h2>
            {savedForLater.map(item => (
              <SavedRow
                key={`${item.id}-${item.format}`}
                item={item}
                onMoveToCart={() => moveToCart(item.id, item.format)}
                onRemove={() => removeSaved(item.id, item.format)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, val, valColor }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', fontSize:16}}>
      <span style={{color:'#666'}}>{label}</span>
      <span style={{fontWeight:600, color: valColor || 'var(--dark)'}}>{val}</span>
    </div>
  )
}
