import { paypalRequest, sendError } from '../_commerce.js'
import { finalizePayment } from './capture.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) throw new Error('PayPal webhook is not configured.')
    const event = req.body
    const verification = await paypalRequest('/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      body: JSON.stringify({
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: event,
      }),
    })
    if (verification.verification_status !== 'SUCCESS') return res.status(401).json({ error: 'Invalid webhook signature.' })
    if (event?.event_type === 'CHECKOUT.ORDER.APPROVED') await finalizePayment(event.resource?.id)
    res.status(200).json({ ok: true })
  } catch (error) { sendError(res, error) }
}
