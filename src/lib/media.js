import { supabase } from './supabase'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

export async function uploadMedia(file) {
  if (!ALLOWED.has(file?.type)) throw new Error('Use a JPG, PNG, WebP, or AVIF image.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Images must be smaller than 8 MB.')
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1]
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}
