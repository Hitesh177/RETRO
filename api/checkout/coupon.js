import { assertOrigin, database, sendError } from '../_commerce.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    assertOrigin(req)
    const code = String(req.body?.code || '').trim().toUpperCase()
    if (!/^[A-Z0-9_-]{3,50}$/.test(code)) throw new Error('Invalid coupon code.')
    const { data, error } = await database().from('coupons').select('code,type,value,min_order_amount,max_discount,expires_at,uses_count,max_uses,description').eq('code', code).eq('is_active', true).maybeSingle()
    if (error || !data || (data.expires_at && new Date(data.expires_at) < new Date()) || (data.max_uses != null && data.uses_count >= data.max_uses)) throw new Error('Coupon is invalid or expired.')
    res.status(200).json({ code: data.code, type: data.type, value: Number(data.value), min: Number(data.min_order_amount || 0), maxDiscount: data.max_discount == null ? null : Number(data.max_discount), desc: data.description || 'Coupon applied.' })
  } catch (error) { sendError(res, error) }
}
