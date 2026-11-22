import { assertOrigin, database, money, paypalRequest, sendError } from '../_commerce.js'

export async function finalizePayment(token) {
  if (!/^[A-Za-z0-9-]{8,64}$/.test(String(token))) throw new Error('Invalid payment reference.')
  const db = database()
  const { data: order, error } = await db.from('orders').select('id,order_number,status,total,guest_email,payment_intent_id').eq('payment_intent_id', token).single()
  if (error || !order) throw new Error('Order not found.')
  if (order.status === 'paid') return { orderNumber: order.order_number, total: Number(order.total), email: order.guest_email }
  let capture
  try { capture = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(token)}/capture`, { method: 'POST', requestId: order.id }) }
  catch { capture = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(token)}`) }
  const payment = capture.purchase_units?.[0]?.payments?.captures?.[0]
  if (capture.status !== 'COMPLETED' || payment?.status !== 'COMPLETED' || payment.amount?.currency_code !== 'USD' || payment.amount?.value !== money(Math.round(Number(order.total) * 100))) throw new Error('Payment has not completed. Please contact support with your order number.')
  const { error: updateError } = await db.rpc('finalize_paid_order', { p_order: order.id })
  if (updateError) throw updateError
  return { orderNumber: order.order_number, total: Number(order.total), email: order.guest_email }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    assertOrigin(req)
    res.status(200).json(await finalizePayment(String(req.body?.token || '')))
  } catch (error) { sendError(res, error) }
}
