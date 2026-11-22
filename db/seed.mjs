/**
 * ITG-SOFT — Supabase Seed Script
 * Inserts all mock data (developer partners, products, inventory) into Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<your-service-role-key> node db/seed.mjs
 *
 * Requires: @supabase/supabase-js (already installed)
 */

import { createClient } from '@supabase/supabase-js'
import { DEVELOPER_PARTNERS, PRODUCTS } from '../src/data/mockData.js'

const SUPABASE_URL = 'https://sibkqusxpimhneajmcck.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('\n❌  Missing SUPABASE_SERVICE_KEY environment variable.')
  console.error('    Run: SUPABASE_SERVICE_KEY=<your-secret-key> node db/seed.mjs\n')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Map mock enum values → Supabase enum values
const normaliseStatus = (s) => s === 'sold_out' ? 'out_of_stock' : s
const normaliseFormat = (f) => f === 'digital_only' ? 'digital' : f

async function seed() {
  console.log('\n🌱  ITG-SOFT seed starting…\n')

  // ── 1. Developer partners ─────────────────────────────────────────────────
  console.log('  Inserting developer partners…')

  const { data: insertedPartners, error: pErr } = await supabase
    .from('developer_partners')
    .upsert(
      DEVELOPER_PARTNERS.map(p => ({
        name:          p.name,
        slug:          p.slug,
        bio:           p.bio           ?? null,
        logo_url:      p.logo_url      ?? null,
        website_url:   p.website_url   ?? null,
        country_code:  p.country_code  ?? null,
        status:        p.status,
        revenue_share: p.revenue_share,
      })),
      { onConflict: 'slug' }
    )
    .select('id, slug')

  if (pErr) { console.error('  ❌  Partners error:', pErr.message); process.exit(1) }

  // Build mock-id → Supabase UUID map  (dp-001 → uuid)
  const partnerMap = {}
  DEVELOPER_PARTNERS.forEach(dp => {
    const row = insertedPartners.find(r => r.slug === dp.slug)
    if (row) partnerMap[dp.id] = row.id
  })

  console.log(`  ✓  ${insertedPartners.length} developer partners`)

  // ── 2. Products ───────────────────────────────────────────────────────────
  console.log('  Inserting products…')

  const productRows = PRODUCTS.map(p => ({
    slug:               p.slug,
    title:              p.title,
    subtitle:           p.subtitle           ?? null,
    description:        p.description        ?? null,
    short_description:  p.short_description  ?? null,
    platform:           p.platform,
    genre:              p.genre              ?? null,
    status:             normaliseStatus(p.status),
    format:             normaliseFormat(p.format),
    price_physical:     p.price_physical     ?? null,
    price_digital:      p.price_digital      ?? null,
    compare_price:      p.compare_price      ?? null,
    is_featured:        p.is_featured        ?? false,
    is_itgsoft_original: p.is_itgsoft_original ?? false,
    developer_id:       p.developer_id ? (partnerMap[p.developer_id] ?? null) : null,
    release_date:       p.release_date       ?? null,
    preorder_ship_date: p.preorder_ship_date ?? null,
    box_art_url:        p.box_art_url        ?? null,
    screenshots:        p.screenshots        ?? [],
    cartridge_color:    p.cartridge_color    ?? null,
    mapper_type:        p.mapper_type        ?? null,
    prg_rom_size:       p.prg_rom_size       ?? null,
    chr_rom_size:       p.chr_rom_size       ?? null,
    save_type:          p.save_type          ?? null,
    players_min:        p.players_min        ?? 1,
    players_max:        p.players_max        ?? 1,
    age_rating:         p.age_rating         ?? null,
    tags:               p.tags               ?? [],
    published_at:       p.published_at       ?? new Date().toISOString(),
  }))

  const { data: insertedProducts, error: prodErr } = await supabase
    .from('products')
    .upsert(productRows, { onConflict: 'slug' })
    .select('id, slug')

  if (prodErr) { console.error('  ❌  Products error:', prodErr.message); process.exit(1) }

  console.log(`  ✓  ${insertedProducts.length} products`)

  // ── 3. Inventory ──────────────────────────────────────────────────────────
  console.log('  Inserting inventory…')

  // Build slug → Supabase UUID map for products
  const productMap = {}
  insertedProducts.forEach(r => { productMap[r.slug] = r.id })

  const inventoryRows = PRODUCTS
    .filter(p => productMap[p.slug])
    .map(p => ({
      product_id:         productMap[p.slug],
      quantity_physical:  p.inventory?.quantity_physical  ?? 0,
      quantity_digital:   p.inventory?.quantity_digital   ?? -1,
      quantity_reserved:  p.inventory?.quantity_reserved  ?? 0,
    }))

  const { error: invErr } = await supabase
    .from('inventory')
    .upsert(inventoryRows, { onConflict: 'product_id' })

  if (invErr) { console.error('  ❌  Inventory error:', invErr.message); process.exit(1) }

  console.log(`  ✓  ${inventoryRows.length} inventory records`)

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n🎉  Seed complete! All mock data is now in Supabase.\n')
  console.log('    Next: wire StoreContext to fetch live from Supabase.\n')
}

seed().catch(err => {
  console.error('\n❌  Unexpected error:', err)
  process.exit(1)
})
