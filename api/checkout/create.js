import { assertOrigin, database, money, paypalRequest, quoteCart, sendError } from '../_commerce.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    assertOrigin(req)
    const input = req.body
    if (!input?.address?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.address.email)) throw new Error('A valid email is required.')
    if (!input.address.firstName?.trim() || !input.address.lastName?.trim() || !input.address.line1?.trim() || !input.address.city?.trim() || !input.address.postal?.trim()) throw new Error('Complete the shipping address.')
    const db = database()
    const quote = await quoteCart(db, input)
    if (quote.total <= 0) throw new Error('Order total must be greater than zero.')
    const site = process.env.SITE_URL
    if (!site) throw new Error('SITE_URL is not configured.')
    const orderId = crypto.randomUUID()
    const orderNumber = `ITG-${new Date().getUTCFullYear()}-${orderId.slice(0, 8).toUpperCase()}`
    const paypalOrder = await paypalRequest('/v2/checkout/orders', {
      method: 'POST', requestId: orderId,
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ reference_id: orderId, custom_id: orderId, amount: { currency_code: 'USD', value: money(quote.total) } }],
        application_context: { brand_name: 'ITG-SOFT', user_action: 'PAY_NOW', return_url: `${site}/checkout?paypal=return`, cancel_url: `${site}/checkout?paypal=cancel` },
      }),
    })
    const { error: orderError } = await db.from('orders').insert({
      id: orderId, order_number: orderNumber, guest_email: input.address.email.trim(), status: 'pending',
      subtotal: money(quote.subtotal), discount_amount: money(quote.discount), shipping_amount: money(quote.shipping), total: money(quote.total),
      coupon_id: quote.coupon?.id || null, coupon_code: quote.coupon?.code || null, shipping_address: input.address,
      shipping_method: quote.shippingMethod, payment_provider: 'paypal', payment_intent_id: paypalOrder.id,
    })
    if (orderError) throw orderError
    const { error: itemError } = await db.from('order_items').insert(quote.lines.map(line => ({
      order_id: orderId, product_id: line.product.id, title: line.product.title, price: money(line.unit), quantity: line.quantity, format: line.format,
    })))
    if (itemError) throw itemError
    const approve = paypalOrder.links?.find(link => link.rel === 'payer-action' || link.rel === 'approve')?.href
    if (!approve) throw new Error('PayPal did not provide an approval link.')
    res.status(200).json({ approve })
  } catch (error) { sendError(res, error) }
}
