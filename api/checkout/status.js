export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  res.status(200).json({ ready: Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_WEBHOOK_ID && process.env.SITE_URL), mode: process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox' })
}
