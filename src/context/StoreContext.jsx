/**
 * StoreContext — single source of truth for all mutable site data.
 * Fetches live data from Supabase; falls back to mock data on error.
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  PRODUCTS        as MOCK_PRODUCTS,
  BLOG_POSTS,
  MOCK_ORDERS,
  DEVELOPER_PARTNERS as MOCK_PARTNERS,
} from '../data/mockData'

const StoreContext = createContext(null)

const EXTRA_ORDERS = [
  { id:'o3', order_number:'ITG-2026-00912', status:'pending',    total:49.95,  shipping_method:'Standard', created_at:'2026-05-13', items:[{title:'Infiltration'}] },
  { id:'o4', order_number:'ITG-2026-00898', status:'processing', total:104.90, shipping_method:'EMS',      created_at:'2026-05-12', items:[{title:'Mr Lee + Hungry Ghost Night'}] },
  { id:'o5', order_number:'ITG-2026-00876', status:'refunded',   total:44.95,  shipping_method:'Standard', created_at:'2026-05-10', items:[{title:'Dragon Boat Fest'}] },
]

// Normalise a Supabase product row to match the mock data shape
function normaliseProduct(row) {
  return {
    ...row,
    // Supabase returns out_of_stock; the UI uses sold_out
    status: row.status === 'out_of_stock' ? 'sold_out' : row.status,
    inventory: {
      quantity_physical: row.quantity_physical ?? 0,
      quantity_digital:  row.quantity_digital  ?? -1,
      quantity_reserved: row.quantity_reserved ?? 0,
      available:         row.available         ?? 0,
    },
    review_stats: {
      review_count:   row.review_count   ?? 0,
      average_rating: row.average_rating ?? 0,
      distribution: {
        1: row.rating_1 ?? 0,
        2: row.rating_2 ?? 0,
        3: row.rating_3 ?? 0,
        4: row.rating_4 ?? 0,
        5: row.rating_5 ?? 0,
      },
    },
  }
}

export function StoreProvider({ children }) {
  const [products,  setProducts]  = useState(() => MOCK_PRODUCTS.map(p => ({ ...p })))
  const [blogPosts, setBlogPosts] = useState(() => BLOG_POSTS.map(p => ({ ...p })))
  const [partners,  setPartners]  = useState(() => MOCK_PARTNERS.map(p => ({ ...p })))
  const [orders,    setOrders]    = useState(() => [
    ...MOCK_ORDERS.map(o => ({ ...o, created_at: o.created_at?.slice(0, 10) })),
    ...EXTRA_ORDERS,
  ])
  const [loading, setLoading] = useState(true)

  // ── Fetch live data from Supabase on mount ────────────────────────────────
  useEffect(() => {
    async function fetchLiveData() {
      try {
        const [{ data: liveProducts, error: pErr }, { data: livePartners, error: dErr }, { data: livePosts, error: bErr }] =
          await Promise.all([
            supabase
              .from('products_full')
              .select('*')
              .is('deleted_at', null)
              .order('published_at', { ascending: false }),
            supabase
              .from('developer_partners')
              .select('*')
              .eq('status', 'active')
              .order('name'),
            supabase.from('blog_posts').select('*').eq('status', 'published').is('deleted_at', null).order('published_at', { ascending: false }),
          ])

        if (pErr) throw pErr
        if (dErr) throw dErr
        if (bErr) throw bErr

        setProducts((liveProducts || []).map(normaliseProduct))
        if (livePartners?.length)  setPartners(livePartners)
        setBlogPosts(livePosts || [])
      } catch (err) {
        console.warn('[StoreContext] Supabase fetch failed, using mock data:', err.message)
        // Mock data is already set as initial state — nothing to do
      } finally {
        setLoading(false)
      }
    }

    fetchLiveData()
  }, [])

  // ── Products ──────────────────────────────────────────────────────────────
  async function updateProduct(id, changes) {
    const sbChanges = {}
    const map = {
      title: 'title', subtitle: 'subtitle', short_description: 'short_description',
      description: 'description', genre: 'genre', platform: 'platform',
      price_physical: 'price_physical', price_digital: 'price_digital',
      compare_price: 'compare_price', is_featured: 'is_featured',
      cartridge_color: 'cartridge_color', box_art_url: 'box_art_url',
      screenshots: 'screenshots', tags: 'tags', published_at: 'published_at',
      seo_title: 'seo_title', seo_description: 'seo_description',
    }
    Object.entries(map).forEach(([k, v]) => {
      if (changes[k] !== undefined) sbChanges[v] = changes[k]
    })
    if (changes.status !== undefined) {
      sbChanges.status = changes.status === 'sold_out' ? 'out_of_stock' : changes.status
    }
    if (Object.keys(sbChanges).length) {
      const { data, error } = await supabase.from('products').update(sbChanges).eq('id', id).select().single()
      if (error) throw error
      setProducts(ps => ps.map(p => p.id === id ? normaliseProduct({ ...p, ...data }) : p))
    }
    if (changes.stock !== undefined) {
      const { error } = await supabase.from('inventory').upsert({ product_id: id, quantity_physical: changes.stock }, { onConflict: 'product_id' })
      if (error) throw error
      setProducts(ps => ps.map(p => p.id === id ? { ...p, inventory: { ...p.inventory, quantity_physical: changes.stock, available: changes.stock - (p.inventory?.quantity_reserved || 0) } } : p))
    }
  }
  async function addProduct(product) {
    const { data, error } = await supabase.from('products').insert({
      slug:                product.slug,
      title:               product.title,
      subtitle:            product.subtitle            ?? null,
      short_description:   product.short_description   ?? null,
      description:         product.description         ?? null,
      platform:            product.platform,
      genre:               product.genre               ?? null,
      status:              product.status === 'sold_out' ? 'out_of_stock' : (product.status ?? 'in_stock'),
      format:              product.format              ?? 'physical_cib',
      price_physical:      product.price_physical      ?? null,
      price_digital:       product.price_digital       ?? null,
      is_featured:         product.is_featured         ?? false,
      is_itgsoft_original: product.is_itgsoft_original ?? false,
      developer_id:        product.developer_id        ?? null,
      tags:                product.tags                ?? [],
      screenshots:         product.screenshots         ?? [],
      box_art_url:        product.box_art_url         ?? null,
      seo_title:          product.seo_title           ?? null,
      seo_description:    product.seo_description     ?? null,
      published_at:        product.published_at        ?? new Date().toISOString(),
    }).select().single()
    if (error) throw error
    const { error: inventoryError } = await supabase.from('inventory').insert({ product_id: data.id, quantity_physical: product.stock ?? 0 })
    if (inventoryError) throw inventoryError
    setProducts(ps => [normaliseProduct({ ...data, quantity_physical: product.stock ?? 0, available: product.stock ?? 0 }), ...ps])
    return data
  }
  async function removeProduct(id) {
    const { error } = await supabase.from('products').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    setProducts(ps => ps.filter(p => p.id !== id))
  }

  // ── Blog ──────────────────────────────────────────────────────────────────
  async function loadAdminPosts() {
    const { data, error } = await supabase.from('blog_posts').select('*').is('deleted_at', null).order('created_at', { ascending: false })
    if (error) throw error
    setBlogPosts(data)
  }
  async function updateBlogPost(id, changes) {
    const { data, error } = await supabase.from('blog_posts').update(changes).eq('id', id).select().single()
    if (error) throw error
    setBlogPosts(ps => ps.map(p => p.id === id ? data : p))
  }
  async function addBlogPost(post) {
    const { data, error } = await supabase.from('blog_posts').insert(post).select().single()
    if (error) throw error
    setBlogPosts(ps => [data, ...ps])
  }
  async function removeBlogPost(id) {
    const { error } = await supabase.from('blog_posts').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    setBlogPosts(ps => ps.filter(p => p.id !== id))
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  async function loadAdminOrders() {
    const { data, error } = await supabase.from('orders').select('*, order_items(title,quantity,price)').order('created_at', { ascending: false })
    if (error) throw error
    setOrders((data || []).map(order => ({ ...order, items: order.order_items || [] })))
  }
  async function updateOrderStatus(id, newStatus) {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    if (error) throw error
    setOrders(os => os.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  return (
    <StoreContext.Provider value={{
      products,  setProducts,  updateProduct,  addProduct,  removeProduct,
      blogPosts, setBlogPosts, loadAdminPosts, updateBlogPost, addBlogPost, removeBlogPost,
      partners,  setPartners,
      orders,    setOrders,    loadAdminOrders, updateOrderStatus,
      loading,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
