import { createClient } from '@supabase/supabase-js'

const countryCodes = {
  'United States': 'US', Canada: 'CA', 'United Kingdom': 'GB', Australia: 'AU',
  'New Zealand': 'NZ', Japan: 'JP', 'South Korea': 'KR', 'Hong Kong': 'HK',
  Singapore: 'SG', Taiwan: 'TW', Germany: 'DE', France: 'FR', Netherlands: 'NL',
  Sweden: 'SE', Norway: 'NO', Denmark: 'DK', Spain: 'ES', Italy: 'IT', Poland: 'PL',
  Switzerland: 'CH', Austria: 'AT', Belgium: 'BE', Philippines: 'PH', Thailand: 'TH',
  Malaysia: 'MY', Indonesia: 'ID', Vietnam: 'VN',
}

export function database() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Checkout database is not configured.')
  return createClient(url, key, { auth: { persistSession: false } })
}

export function paypalBase() {
  return process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

export async function paypalRequest(path, options = {}) {
  const { PAYPAL_CLIENT_ID: id, PAYPAL_CLIENT_SECRET: secret } = process.env
  if (!id || !secret) throw new Error('PayPal checkout is not configured.')
  const tokenResponse = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!tokenResponse.ok) throw new Error('PayPal authentication failed.')
  const { access_token: token } = await tokenResponse.json()
  const response = await fetch(`${paypalBase()}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': options.requestId || crypto.randomUUID(), Prefer: 'return=representation' },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `PayPal error ${response.status}`)
  return data
}

export function assertOrigin(req) {
  const origin = req.headers.origin
  const expected = process.env.SITE_URL
  if (expected && origin && new URL(origin).origin !== new URL(expected).origin) throw new Error('Invalid checkout origin.')
}

export function sendError(res, error) {
  console.error('[checkout]', error)
  res.status(400).json({ error: error.message || 'Checkout failed.' })
}

export const asMoney = value => Math.round(Number(value) * 100)
export const money = cents => (cents / 100).toFixed(2)

export async function quoteCart(db, input) {
  const cart = input?.items
  if (!Array.isArray(cart) || !cart.length || cart.length > 50) throw new Error('Your cart is empty or too large.')
  const lines = []
  const physicalQuantities = new Map()
  for (const item of cart) {
    const quantity = Number(item.qty)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Invalid quantity.')
    if (!['digital', 'physical_cib'].includes(item.format)) throw new Error('Invalid product format.')
    const format = item.format
    const { data: product, error } = await db.from('products').select('id,slug,title,status,format,price_physical,price_digital,deleted_at,published_at').eq('slug', item.slug).single()
    if (error || !product || product.deleted_at || !product.published_at || !['in_stock', 'low_stock', 'preorder'].includes(product.status)) throw new Error('A product in your cart is unavailable. Please review your cart.')
    if (product.format !== 'both' && product.format !== format) throw new Error(`${product.title} is not available in this format.`)
    const unit = asMoney(format === 'digital' ? product.price_digital : product.price_physical)
    if (!Number.isFinite(unit) || unit <= 0) throw new Error(`${product.title} has no valid price.`)
    if (format === 'physical_cib') {
      const requested = (physicalQuantities.get(product.id) || 0) + quantity
      physicalQuantities.set(product.id, requested)
      const { data: inventory } = await db.from('inventory').select('quantity_physical,quantity_reserved').eq('product_id', product.id).maybeSingle()
      if (product.status !== 'preorder' && (!inventory || inventory.quantity_physical - inventory.quantity_reserved < requested)) throw new Error(`${product.title} is out of stock.`)
    }
    lines.push({ product, quantity, format, unit })
  }
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.quantity, 0)
  let discount = 0
  let freeShipping = false
  let coupon = null
  if (input.couponCode) {
    const { data, error } = await db.from('coupons').select('*').eq('code', String(input.couponCode).trim().toUpperCase()).eq('is_active', true).maybeSingle()
    if (error || !data || (data.expires_at && new Date(data.expires_at) < new Date()) || (data.max_uses != null && data.uses_count >= data.max_uses) || subtotal < asMoney(data.min_order_amount || 0)) throw new Error('Coupon is invalid or no longer available.')
    if (data.applies_to?.length && !lines.some(line => data.applies_to.includes(line.product.slug))) throw new Error('Coupon does not apply to these products.')
    if (data.max_uses_per_user && input?.address?.email) {
      const { count } = await db.from('orders').select('id', { count: 'exact', head: true }).eq('coupon_id', data.id).eq('guest_email', input.address.email.trim()).eq('status', 'paid')
      if (count >= data.max_uses_per_user) throw new Error('This coupon has already been used on this account.')
    }
    coupon = data
    if (data.type === 'percentage') discount = Math.round(subtotal * Number(data.value) / 100)
    if (data.type === 'fixed_amount') discount = Math.min(subtotal, asMoney(data.value))
    if (data.max_discount != null) discount = Math.min(discount, asMoney(data.max_discount))
    freeShipping = data.type === 'free_shipping'
  }
  const physical = lines.some(line => line.format === 'physical_cib')
  let shipping = 0
  let shippingMethod = 'Digital delivery'
  if (physical) {
    const code = countryCodes[input?.address?.country]
    if (!code) throw new Error('Choose a supported shipping country.')
    const { data: zones, error: zoneError } = await db.from('shipping_zones').select('id,name,country_codes,shipping_rates(id,name,base_rate,free_above,is_active)').eq('is_active', true)
    if (zoneError) throw zoneError
    const zone = zones?.find(z => z.country_codes?.includes(code))
    const rate = zone?.shipping_rates?.find(r => r.is_active && r.name === input.shippingMethod)
    if (!rate) throw new Error('No shipping rate is available for this address and method.')
    shipping = freeShipping || (rate.free_above != null && subtotal >= asMoney(rate.free_above)) ? 0 : asMoney(rate.base_rate)
    shippingMethod = rate.name
  }
  return { lines, subtotal, discount, shipping, shippingMethod, coupon, total: subtotal - discount + shipping }
}
