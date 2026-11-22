import test from 'node:test'
import assert from 'node:assert/strict'
import { quoteCart } from '../api/_commerce.js'

function fixture({ stock = 10, price = 49.95, coupon = null } = {}) {
  const product = { id: 'product-id', slug: 'tea-game', title: 'Tea Game', status: 'in_stock', format: 'physical_cib', price_physical: price, price_digital: null, deleted_at: null, published_at: '2026-01-01' }
  const tables = {
    products: product,
    inventory: { quantity_physical: stock, quantity_reserved: 0 },
    shipping_zones: [{ id: 'zone-id', name: 'USA', country_codes: ['US'], shipping_rates: [{ id: 'rate-id', name: 'Standard Airmail', base_rate: 12, free_above: 100, is_active: true }] }],
    coupons: coupon,
  }
  return {
    from(name) {
      return {
        select() { return this },
        eq() { return this },
        single() { return Promise.resolve({ data: tables[name], error: null }) },
        maybeSingle() { return Promise.resolve({ data: tables[name], error: null }) },
        then(resolve) { return Promise.resolve({ data: tables[name], error: null }).then(resolve) },
      }
    },
  }
}

const cart = { items: [{ slug: 'tea-game', qty: 1, format: 'physical_cib', price: 0.01 }], address: { country: 'United States' }, shippingMethod: 'Standard Airmail' }

test('server uses database price, not a forged browser price', async () => {
  const quote = await quoteCart(fixture(), cart)
  assert.equal(quote.subtotal, 4995)
  assert.equal(quote.shipping, 1200)
  assert.equal(quote.total, 6195)
})

test('out-of-stock items cannot be charged', async () => {
  await assert.rejects(() => quoteCart(fixture({ stock: 0 }), cart), /out of stock/)
})

test('duplicate lines cannot exceed available stock', async () => {
  await assert.rejects(() => quoteCart(fixture({ stock: 1 }), { ...cart, items: [cart.items[0], cart.items[0]] }), /out of stock/)
})

test('unavailable formats cannot be charged', async () => {
  await assert.rejects(() => quoteCart(fixture(), { ...cart, items: [{ ...cart.items[0], format: 'digital' }] }), /not available in this format/)
})

test('coupon and shipping threshold are calculated on server', async () => {
  const db = fixture({ price: 120, coupon: { id: 'coupon-id', code: 'SAVE10', type: 'percentage', value: 10, is_active: true, min_order_amount: 0, max_uses: null, uses_count: 0, applies_to: [] } })
  const quote = await quoteCart(db, { ...cart, couponCode: 'SAVE10' })
  assert.equal(quote.discount, 1200)
  assert.equal(quote.shipping, 0)
  assert.equal(quote.total, 10800)
})

test('unsupported destination is rejected', async () => {
  await assert.rejects(() => quoteCart(fixture(), { ...cart, address: { country: 'Other' } }), /supported shipping country/)
})
