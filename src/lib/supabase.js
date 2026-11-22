import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local\n' +
    'Copy .env.example → .env.local and fill in your Supabase project values.'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnon ?? '', {
  auth: {
    persistSession:    true,
    autoRefreshToken:  true,
    detectSessionInUrl: true,
  },
})

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export const auth = supabase.auth

/** Sign up with email + password */
export async function signUp(email, password, meta = {}) {
  return supabase.auth.signUp({ email, password, options: { data: meta } })
}

/** Sign in with email + password */
export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

/** Sign out */
export async function signOut() {
  return supabase.auth.signOut()
}

/** Get current session user (sync, from cache) */
export function getUser() {
  return supabase.auth.getUser()
}

// ---------------------------------------------------------------------------
// Table helpers  (thin wrappers — swap mock data for these when backend is live)
// ---------------------------------------------------------------------------

export const db = {
  /** products */
  products: () => supabase.from('products'),

  /** inventory joined with product */
  inventory: () => supabase.from('inventory'),

  /** orders for current user */
  orders: (userId) =>
    supabase.from('orders').select('*, order_items(*)').eq('user_id', userId),

  /** reviews for a product */
  reviews: (productId) =>
    supabase
      .from('reviews')
      .select('*, users(first_name, last_name, avatar_url)')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false }),

  /** published blog posts */
  blogPosts: () =>
    supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image_url, category, tags, published_at, view_count, is_featured')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false }),

  /** single blog post by slug */
  blogPost: (slug) =>
    supabase
      .from('blog_posts')
      .select('*, users(first_name, last_name, avatar_url)')
      .eq('slug', slug)
      .single(),

  /** cart items for user or session */
  cartItems: (userIdOrSession, isUser = true) =>
    supabase
      .from('cart_items')
      .select('*, products(id, slug, title, price_physical, price_digital, status, box_art_url)')
      .eq(isUser ? 'user_id' : 'session_id', userIdOrSession),

  /** wishlist for user */
  wishlist: (userId) =>
    supabase
      .from('wishlist_items')
      .select('*, products(id, slug, title, price_physical, status, box_art_url)')
      .eq('user_id', userId),

  /** developer partners (active only) */
  devPartners: () =>
    supabase.from('developer_partners').select('*').eq('status', 'active'),
}
