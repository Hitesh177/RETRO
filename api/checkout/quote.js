import { assertOrigin, database, money, quoteCart, sendError } from '../_commerce.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    assertOrigin(req)
    const quote = await quoteCart(database(), req.body)
    res.status(200).json({ subtotal: Number(money(quote.subtotal)), discount: Number(money(quote.discount)), shipping: Number(money(quote.shipping)), total: Number(money(quote.total)), shippingMethod: quote.shippingMethod })
  } catch (error) { sendError(res, error) }
}
