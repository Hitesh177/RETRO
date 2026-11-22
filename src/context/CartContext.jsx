import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const STORAGE_KEY  = 'itgsoft_cart'
const SAVED_KEY    = 'itgsoft_saved'
const WISHLIST_KEY = 'itgsoft_wishlist'

const SHIPPING_RATES = {
  standard: { label: 'Standard Airmail',  days: '10–21 days', price: 8  },
  express:  { label: 'EMS Express',       days: '5–10 days',  price: 18 },
  ems:      { label: 'EMS Priority',      days: '3–7 days',   price: 24 },
  free:     { label: 'Free Shipping',     days: '10–21 days', price: 0  },
}

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

// Only sync items whose product id is a real Supabase UUID
const isUUID = id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id ?? ''))

// Update a cart_items row; if none exists, insert it
async function upsertCartItem(userId, productId, format, qty) {
  if (!isUUID(productId)) return
  const { data } = await supabase
    .from('cart_items')
    .update({ quantity: qty, updated_at: new Date().toISOString() })
    .eq('user_id', userId).eq('product_id', productId).eq('format', format)
    .select('id')
  if (!data?.length) {
    await supabase.from('cart_items').insert({ user_id: userId, product_id: productId, quantity: qty, format })
  }
}

async function deleteCartItem(userId, productId, format) {
  if (!isUUID(productId)) return
  await supabase.from('cart_items').delete()
    .eq('user_id', userId).eq('product_id', productId).eq('format', format)
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items,        setItems]        = useState(() => load(STORAGE_KEY,  []))
  const [savedForLater,setSavedForLater] = useState(() => load(SAVED_KEY,   []))
  const [wishlist,     setWishlist]     = useState(() => load(WISHLIST_KEY, []))
  const [coupon,       setCoupon]       = useState(null)
  const [shipping,     setShipping]     = useState('standard')

  // Track which user's remote cart we've already loaded to avoid re-fetching
  const loadedForUser = useRef(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEY,  JSON.stringify(items))        }, [items])
  useEffect(() => { localStorage.setItem(SAVED_KEY,    JSON.stringify(savedForLater)) }, [savedForLater])
  useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))     }, [wishlist])

  // ── Load & merge remote cart + wishlist on sign-in ───────────────────────────
  useEffect(() => {
    if (!user || loadedForUser.current === user.id) return
    loadedForUser.current = user.id

    async function loadRemote() {
      const [{ data: remoteCart }, { data: remoteWishlist }] = await Promise.all([
        supabase
          .from('cart_items')
          .select('product_id, quantity, format, products(id, slug, title, price_physical, price_digital, box_art_url, status)')
          .eq('user_id', user.id),
        supabase
          .from('wishlist_items')
          .select('product_id, products(id, slug, title, price_physical, price_digital, box_art_url, status)')
          .eq('user_id', user.id),
      ])

      if (remoteCart?.length) {
        setItems(prev => {
          const merged = [...prev]
          remoteCart.forEach(ci => {
            if (!ci.products) return
            const idx = merged.findIndex(i => i.id === ci.product_id && i.format === ci.format)
            if (idx === -1) {
              const price = ci.format === 'digital'
                ? (ci.products.price_digital ?? 0)
                : (ci.products.price_physical ?? 0)
              merged.push({
                id: ci.product_id, slug: ci.products.slug, title: ci.products.title,
                price, qty: ci.quantity, format: ci.format,
                image: ci.products.box_art_url || null, status: ci.products.status,
              })
            } else {
              // Remote quantity wins (it reflects last confirmed state)
              merged[idx] = { ...merged[idx], qty: ci.quantity }
            }
          })
          return merged
        })
      }

      if (remoteWishlist?.length) {
        setWishlist(prev => {
          const merged = [...prev]
          remoteWishlist.forEach(wi => {
            if (!wi.products) return
            if (!merged.find(i => i.id === wi.product_id)) {
              merged.push({
                id: wi.product_id, slug: wi.products.slug, title: wi.products.title,
                price: wi.products.price_physical ?? wi.products.price_digital,
                image: wi.products.box_art_url || null, status: wi.products.status,
              })
            }
          })
          return merged
        })
      }
    }

    loadRemote()
  }, [user?.id])

  // Reset loaded flag on sign-out so next login re-fetches
  useEffect(() => {
    if (!user) loadedForUser.current = null
  }, [user])

  // ── Cart mutations ─────────────────────────────────────────────────────────

  function addItem(product, format = 'physical_cib', qty = 1) {
    let newQty = qty
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id && i.format === format)
      if (existing) {
        newQty = existing.qty + qty
        return prev.map(i =>
          i.id === product.id && i.format === format
            ? { ...i, qty: newQty }
            : i
        )
      }
      const price = format === 'digital' ? (product.price_digital ?? 0) : (product.price_physical ?? 0)
      return [...prev, {
        id: product.id, slug: product.slug, title: product.title,
        price, qty, format, image: product.box_art_url || null, status: product.status,
      }]
    })
    if (user) upsertCartItem(user.id, product.id, format, newQty)
  }

  function removeItem(id, format) {
    setItems(prev => prev.filter(i => !(i.id === id && i.format === format)))
    if (user) deleteCartItem(user.id, id, format)
  }

  function updateQty(id, format, delta) {
    setItems(prev => {
      const updated = prev.map(i =>
        i.id === id && i.format === format
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
      const item = updated.find(i => i.id === id && i.format === format)
      if (user && item) upsertCartItem(user.id, id, format, item.qty)
      return updated
    })
  }

  function saveForLater(id, format) {
    const item = items.find(i => i.id === id && i.format === format)
    if (!item) return
    removeItem(id, format)
    setSavedForLater(prev => [
      ...prev.filter(i => !(i.id === id && i.format === format)),
      item,
    ])
  }

  function moveToCart(id, format) {
    const item = savedForLater.find(i => i.id === id && i.format === format)
    if (!item) return
    setSavedForLater(prev => prev.filter(i => !(i.id === id && i.format === format)))
    setItems(prev => {
      const existing = prev.find(i => i.id === id && i.format === format)
      const newItems = existing
        ? prev.map(i => i.id === id && i.format === format ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }]
      const updated = newItems.find(i => i.id === id && i.format === format)
      if (user && updated) upsertCartItem(user.id, id, format, updated.qty)
      return newItems
    })
  }

  function removeSaved(id, format) {
    setSavedForLater(prev => prev.filter(i => !(i.id === id && i.format === format)))
  }

  // ── Wishlist ───────────────────────────────────────────────────────────────

  function toggleWishlist(product) {
    setWishlist(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) {
        if (user && isUUID(product.id)) {
          supabase.from('wishlist_items').delete()
            .eq('user_id', user.id).eq('product_id', product.id)
        }
        return prev.filter(i => i.id !== product.id)
      }
      if (user && isUUID(product.id)) {
        supabase.from('wishlist_items')
          .upsert({ user_id: user.id, product_id: product.id }, { onConflict: 'user_id,product_id' })
      }
      return [...prev, {
        id: product.id, slug: product.slug, title: product.title,
        price: product.price_physical ?? product.price_digital,
        image: product.box_art_url || null, status: product.status,
      }]
    })
  }

  function isWishlisted(id) { return wishlist.some(i => i.id === id) }

  function removeWishlistItem(id) {
    setWishlist(prev => prev.filter(i => i.id !== id))
    if (user && isUUID(id)) {
      supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', id)
    }
  }

  // ── Coupon ─────────────────────────────────────────────────────────────────

  async function applyCoupon(code) {
    try {
      const response = await fetch('/api/checkout/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
      const c = await response.json()
      if (!response.ok) return { ok: false, msg: c.error || 'Coupon could not be checked.' }
    const sub = items.reduce((s, i) => s + i.price * i.qty, 0)
    if (sub < c.min) return { ok: false, msg: `Minimum order of $${c.min} required.` }
    setCoupon(c)
    return { ok: true, msg: c.desc }
    } catch { return { ok: false, msg: 'Coupon service is unavailable.' } }
  }

  function removeCoupon() { setCoupon(null) }

  // ── Clear cart (after order placed) ───────────────────────────────────────

  function clearCart() {
    setItems([])
    setCoupon(null)
    setShipping('standard')
    localStorage.removeItem(STORAGE_KEY)
    if (user) supabase.from('cart_items').delete().eq('user_id', user.id)
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const subtotal    = items.reduce((s, i) => s + i.price * i.qty, 0)
  const itemCount   = items.reduce((s, i) => s + i.qty, 0)
  const shippingRate = SHIPPING_RATES[shipping] ?? SHIPPING_RATES.standard
  const shippingCost = coupon?.type === 'free_shipping'
    ? 0
    : shippingRate.price

  const discountAmount = (() => {
    if (!coupon) return 0
    if (coupon.type === 'percentage') return Math.min(+(subtotal * coupon.value / 100).toFixed(2), coupon.maxDiscount ?? Infinity)
    if (coupon.type === 'fixed_amount') return Math.min(coupon.value, subtotal)
    return 0
  })()

  const total = Math.max(0, subtotal - discountAmount + shippingCost)

  return (
    <CartContext.Provider value={{
      // state
      items, savedForLater, wishlist, coupon, shipping,
      // cart actions
      addItem, removeItem, updateQty, saveForLater, moveToCart, removeSaved, clearCart,
      // wishlist actions
      toggleWishlist, isWishlisted, removeWishlistItem,
      // coupon
      applyCoupon, removeCoupon,
      // shipping
      setShipping, SHIPPING_RATES,
      // derived
      subtotal, itemCount, shippingCost, discountAmount, total,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
