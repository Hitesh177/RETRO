import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { MOCK_USERS } from '../data/mockData'
import { useStore } from '../context/StoreContext'
import { supabase } from '../lib/supabase'
import { uploadMedia } from '../lib/media'

// ── Shared admin tokens ─────────────────────────────────────────────────────
const A = {
  bg:       '#f4f5f7',
  surface:  '#ffffff',
  border:   '#e1e4e8',
  text:     '#1a1a2e',
  muted:    '#6b7280',
  orange:   '#f09526',
  green:    '#16a34a',
  red:      '#dc2626',
  blue:     '#2563eb',
  purple:   '#7c3aed',
  sidebar:  '#1e1e2e',
  sideText: '#a0a8b8',
  sideAct:  '#f09526',
}

// ── Tiny helpers ─────────────────────────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{ background: A.surface, border: `1px solid ${A.border}`, borderRadius: 10, padding: 20, ...style }}>
      {children}
    </div>
  )
}
function Kpi({ label, value, sub, color = A.orange }) {
  return (
    <Card style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: A.text, margin: '4px 0 2px' }}>{label}</div>
      {sub && <div style={{ fontSize: 14, color: A.muted }}>{sub}</div>}
    </Card>
  )
}
function SectionHead({ title, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: A.text, margin: 0 }}>{title}</h2>
      {action}
    </div>
  )
}
function Btn({ children, variant = 'primary', sm, onClick, disabled, style }) {
  const base = {
    border: 'none', borderRadius: 6, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
    padding: sm ? '6px 14px' : '10px 20px', fontSize: sm ? 12 : 13,
    opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s', ...style,
  }
  const vars = {
    primary:   { background: A.orange,  color: '#fff' },
    secondary: { background: '#f0f0f0', color: A.text },
    danger:    { background: A.red,     color: '#fff' },
    success:   { background: A.green,   color: '#fff' },
    ghost:     { background: 'transparent', color: A.muted, border: `1px solid ${A.border}` },
  }
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...vars[variant] }}>{children}</button>
}
function Badge({ label, color = A.green }) {
  return (
    <span style={{ background: color + '20', color, border: `1px solid ${color}40`, borderRadius: 20, padding: '2px 10px', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}
function Input({ label, value, onChange, type = 'text', placeholder, style }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 15, fontWeight: 700, color: A.text, marginBottom: 5 }}>{label}</div>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', border: `1px solid ${A.border}`, borderRadius: 6, fontSize: 16, boxSizing: 'border-box', outline: 'none', color: A.text, ...style }}
      />
    </div>
  )
}
function Select({ label, value, onChange, options, style }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 15, fontWeight: 700, color: A.text, marginBottom: 5 }}>{label}</div>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', border: `1px solid ${A.border}`, borderRadius: 6, fontSize: 16, boxSizing: 'border-box', outline: 'none', color: A.text, background: '#fff', ...style }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
function Table({ cols, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} style={{ textAlign: 'left', padding: '10px 12px', background: A.bg, borderBottom: `2px solid ${A.border}`, fontWeight: 700, color: A.muted, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}
function TR({ cells, stripe }) {
  return (
    <tr style={{ background: stripe ? '#fafafa' : '#fff', borderBottom: `1px solid ${A.border}` }}>
      {cells.map((c, i) => (
        <td key={i} style={{ padding: '10px 12px', verticalAlign: 'middle' }}>{c}</td>
      ))}
    </tr>
  )
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: `1px solid ${A.border}` }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: A.muted, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}
function MiniBar({ pct, color = A.orange }) {
  return (
    <div style={{ background: A.border, borderRadius: 4, height: 8, flex: 1, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s' }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PANELS
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Dashboard ──────────────────────────────────────────────────────────────
function DashboardPanel() {
  const weeklySales = [3200, 4100, 3800, 5200, 4600, 6100, 5400]
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const maxSale = Math.max(...weeklySales)

  const topProducts = [
    { title: "Mr Lee's Alishan Tea Collector", sold: 47, revenue: 2347.65, pct: 90 },
    { title: 'Hungry Ghost Night', sold: 35, revenue: 1748.25, pct: 67 },
    { title: 'Mazu: Guardian of the Tides (Pre-order)', sold: 29, revenue: 1593.55, pct: 56 },
    { title: 'Dudes with Attitude', sold: 26, revenue: 1298.70, pct: 50 },
    { title: 'Peace, Love, Trippy Club', sold: 22, revenue: 1318.90, pct: 42 },
  ]

  const alerts = [
    { type: 'warning', msg: 'Hungry Ghost Night — only 16 units remaining' },
    { type: 'warning', msg: 'Piss the Fish — only 14 units remaining' },
    { type: 'danger',  msg: 'Dragon Boat Fest — OUT OF STOCK (0 units)' },
    { type: 'danger',  msg: 'HouYi Shot the Suns — OUT OF STOCK (0 units)' },
    { type: 'info',    msg: 'Horror, Taichung pre-orders: 187 pending fulfillment' },
  ]
  const alertColors = { warning: '#d97706', danger: A.red, info: A.blue }

  return (
    <div>
      <SectionHead title="Analytics Dashboard" />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <Kpi label="Total Revenue (MTD)" value="$12,408" sub="+18% vs last month" color={A.green} />
        <Kpi label="Orders (MTD)" value="148" sub="Avg. $83.84 / order" color={A.orange} />
        <Kpi label="New Customers" value="62" sub="34 returning" color={A.blue} />
        <Kpi label="Conversion Rate" value="3.2%" sub="↑ 0.4% vs last week" color={A.purple} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        <Kpi label="Avg. LTV" value="$214" sub="Based on 3-order avg" color={A.muted} />
        <Kpi label="Units Shipped" value="186" sub="this month" color={A.muted} />
        <Kpi label="Pending Orders" value="11" sub="awaiting fulfillment" color={A.muted} />
        <Kpi label="Refund Rate" value="0.7%" sub="2 refunds this month" color={A.muted} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>
        {/* Weekly Sales Chart */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Weekly Sales (USD)</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 140 }}>
            {weeklySales.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 13, color: A.muted }}>${(v/1000).toFixed(1)}k</div>
                <div style={{ width: '100%', background: A.orange, borderRadius: '4px 4px 0 0', height: `${(v / maxSale) * 100}px`, transition: 'height 0.4s' }} />
                <div style={{ fontSize: 13, color: A.muted }}>{days[i]}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Traffic Sources</div>
          {[
            { label: 'Direct', pct: 38, color: A.orange },
            { label: 'Social (Twitter/X)', pct: 24, color: A.blue },
            { label: 'Organic Search', pct: 18, color: A.green },
            { label: 'Facebook', pct: 12, color: '#1877f2' },
            { label: 'Referral', pct: 8, color: A.purple },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 15, width: 130, color: A.text }}>{s.label}</div>
              <MiniBar pct={s.pct} color={s.color} />
              <div style={{ fontSize: 15, fontWeight: 700, width: 32, color: A.text }}>{s.pct}%</div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Top Products */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Top Products by Revenue</div>
          {topProducts.map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: A.text }}>{p.title}</div>
                <div style={{ fontSize: 15, color: A.muted, whiteSpace: 'nowrap', marginLeft: 8 }}>{p.sold} sold · ${p.revenue.toLocaleString()}</div>
              </div>
              <MiniBar pct={p.pct} />
            </div>
          ))}
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Inventory Alerts</div>
          {alerts.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, padding: '10px 12px', background: alertColors[a.type] + '10', border: `1px solid ${alertColors[a.type]}30`, borderRadius: 6 }}>
              <span style={{ fontSize: 17 }}>{a.type === 'danger' ? '🔴' : a.type === 'warning' ? '🟡' : '🔵'}</span>
              <div style={{ fontSize: 15, color: alertColors[a.type], fontWeight: 600 }}>{a.msg}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

// ── 2. Products ───────────────────────────────────────────────────────────────
function ProductsPanel() {
  const { products, updateProduct, addProduct: storeAddProduct, removeProduct } = useStore()
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'csv'
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const emptyForm = { title: '', price_physical: '', stock: 0, status: 'in_stock', genre: '', platform: 'both', short_description: '', description: '', tags: '', box_art_url: '', screenshots: [], seo_title: '', seo_description: '' }
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  function openEdit(p) {
    setEditing(p)
    setForm({ ...emptyForm, title: p.title, price_physical: p.price_physical ?? '', stock: p.inventory?.quantity_physical ?? 0, status: p.status, genre: p.genre || '', platform: p.platform || 'both', short_description: p.short_description || '', description: p.description || '', tags: (p.tags || []).join(', '), box_art_url: p.box_art_url || '', screenshots: p.screenshots || [], seo_title: p.seo_title || '', seo_description: p.seo_description || '' })
    setError('')
    setModal('edit')
  }
  async function saveProduct() {
    if (!form.title.trim() || !Number.isFinite(Number(form.price_physical)) || Number(form.price_physical) <= 0 || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
      setError('Enter a title, a price greater than zero, and valid stock quantity.')
      return
    }
    setSaving(true)
    setError('')
    const changes = { ...form, title: form.title.trim(), price_physical: Number(form.price_physical), stock: Number(form.stock), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      if (editing) await updateProduct(editing.id, changes)
      else await storeAddProduct({ ...changes, slug: changes.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })
      setModal(null)
      setForm(emptyForm)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }
  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return
    try { await removeProduct(id) } catch (err) { setError(err.message) }
  }

  async function chooseImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSaving(true)
    setError('')
    try {
      const url = await uploadMedia(file)
      setForm(f => ({ ...f, box_art_url: url }))
    }
    catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function chooseScreenshots(event) {
    const files = Array.from(event.target.files || [])
    setSaving(true)
    setError('')
    try {
      for (const file of files) {
        const url = await uploadMedia(file)
        setForm(f => ({ ...f, screenshots: [...f.screenshots, { url, caption: file.name }] }))
      }
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const statusColors = { in_stock: A.green, sold_out: A.muted, preorder: A.blue, coming_soon: A.purple }

  return (
    <div>
      <SectionHead title="Product Management" action={
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn sm onClick={() => { setEditing(null); setForm(emptyForm); setError(''); setModal('add') }}>+ Add Product</Btn>
        </div>
      } />
      {error && !modal && <p role="alert" style={{ color: A.red }}>{error}</p>}

      <Card style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ width: '100%', padding: '9px 12px', border: `1px solid ${A.border}`, borderRadius: 6, fontSize: 16, boxSizing: 'border-box', outline: 'none' }} />
      </Card>

      <Card style={{ padding: 0 }}>
        <Table
          cols={['', 'Title', 'Price', 'Platform', 'Status', 'Stock', 'Reviews', 'Actions']}
          rows={filtered.map((p, i) => (
            <TR key={p.id} stripe={i % 2 === 1} cells={[
              p.box_art_url ? <img src={p.box_art_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover' }} /> : <div style={{ width: 40, height: 40, background: A.bg }} />,
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: A.muted }}>{p.slug}</div>
              </div>,
              <div style={{ fontWeight: 700 }}>${Number(p.price_physical || 0).toFixed(2)}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{p.platform}</div>,
              <Badge label={p.status?.replace('_', ' ').toUpperCase()} color={statusColors[p.status] || A.muted} />,
              <div style={{ fontSize: 16 }}>{p.inventory?.available ?? '—'}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{p.review_stats?.review_count || 0} · ⭐{p.review_stats?.average_rating || '—'}</div>,
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn sm variant="ghost" onClick={() => openEdit(p)}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => deleteProduct(p.id)}>Del</Btn>
              </div>,
            ]} />
          ))}
        />
      </Card>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Product' : 'Edit Product'} onClose={() => setModal(null)}>
          <Input label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Price (USD)" type="number" value={form.price_physical} onChange={v => setForm(f => ({ ...f, price_physical: v }))} />
            <Input label="Physical stock" type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={[
              { value: 'in_stock', label: 'In Stock' }, { value: 'preorder', label: 'Pre-Order' },
              { value: 'sold_out', label: 'Sold Out' }, { value: 'coming_soon', label: 'Coming Soon' },
            ]} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Genre" value={form.genre} onChange={v => setForm(f => ({ ...f, genre: v }))} />
            <Select label="Platform" value={form.platform} onChange={v => setForm(f => ({ ...f, platform: v }))} options={[
              { value: 'both', label: 'NES & Famicom' }, { value: 'nes', label: 'NES Only' }, { value: 'famicom', label: 'Famicom Only' },
            ]} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: A.text, marginBottom: 5 }}>Short Description</div>
            <textarea value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} rows={3}
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${A.border}`, borderRadius: 6, fontSize: 16, boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} placeholder="adventure, taiwan, famicom" />
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 15, fontWeight: 700 }}>Box Art Image <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseImage} /></label>{form.box_art_url && <img src={form.box_art_url} alt="Box art preview" style={{ display: 'block', maxWidth: 120, maxHeight: 120, objectFit: 'contain', marginTop: 8 }} />}</div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 15, fontWeight: 700 }}>Screenshots <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseScreenshots} /></label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>{form.screenshots.map((shot, index) => <div key={`${shot.url}-${index}`}><img src={shot.url} alt={shot.caption || ''} style={{ width: 80, height: 60, objectFit: 'cover' }} /><button type="button" onClick={() => setForm(f => ({ ...f, screenshots: f.screenshots.filter((_, i) => i !== index) }))}>Remove</button></div>)}</div></div>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 15, fontWeight: 700 }}>Full Description</div><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} style={{ width: '100%', boxSizing: 'border-box' }} /></div>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: A.muted, marginBottom: 12 }}>SEO Fields</div>
            <Input label="Meta Title" value={form.seo_title} onChange={v => setForm(f => ({ ...f, seo_title: v }))} placeholder="Leave blank to use product title" />
            <Input label="Meta Description" value={form.seo_description} onChange={v => setForm(f => ({ ...f, seo_description: v }))} />
          </div>
          {error && <p role="alert" style={{ color: A.red }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveProduct} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}</Btn>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {modal === 'csv' && (
        <Modal title="Bulk CSV Import" onClose={() => setModal(null)}>
          <p style={{ fontSize: 16, color: A.muted, marginBottom: 16 }}>
            Upload a CSV file to bulk-import products. Required columns: <code>title, price_physical, status, platform, genre, short_description, tags</code>
          </p>
          <div style={{ border: `2px dashed ${A.border}`, borderRadius: 8, padding: '40px 20px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 16, color: A.muted }}>Drag & drop CSV file here, or <span style={{ color: A.orange, cursor: 'pointer', fontWeight: 700 }}>browse</span></div>
          </div>
          <Btn variant="ghost" onClick={() => setModal(null)}>Download Template CSV</Btn>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn>Import</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── 3. Orders ─────────────────────────────────────────────────────────────────
function OrdersPanel() {
  const { orders, loadAdminOrders, updateOrderStatus } = useStore()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadAdminOrders().catch(err => setError(err.message)) }, [])

  const statusColor = { pending: '#d97706', processing: A.blue, shipped: A.purple, delivered: A.green, refunded: A.red }
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  async function updateStatus(id, newStatus) {
    try { await updateOrderStatus(id, newStatus) }
    catch (err) { setError(err.message); return }
    // keep modal selection in sync
    setSelected(s => s?.id === id ? { ...s, status: newStatus } : s)
    setModal(false)
  }

  return (
    <div>
      <SectionHead title="Order Management" />
      {error && <p role="alert" style={{ color: A.red }}>{error}</p>}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all','pending','processing','shipped','delivered','refunded'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${filter===s ? A.orange : A.border}`,
            background: filter===s ? A.orange : '#fff', color: filter===s ? '#fff' : A.muted,
            fontSize: 15, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
          }}>{s} {s==='all' ? `(${orders.length})` : `(${orders.filter(o=>o.status===s).length})`}</button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          cols={['Order #', 'Date', 'Items', 'Shipping', 'Total', 'Status', 'Actions']}
          rows={filtered.map((o, i) => (
            <TR key={o.id} stripe={i%2===1} cells={[
              <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'monospace' }}>{o.order_number}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{o.created_at}</div>,
              <div style={{ fontSize: 15 }}>{o.items?.map(it => it.title).join(', ')}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{o.shipping_method}</div>,
              <div style={{ fontWeight: 700 }}>${Number(o.total || o.subtotal || 0).toFixed(2)}</div>,
              <Badge label={o.status?.toUpperCase()} color={statusColor[o.status] || A.muted} />,
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn sm variant="ghost" onClick={() => { setSelected(o); setModal(true) }}>Manage</Btn>
                <Btn sm variant="ghost">🖨️ Slip</Btn>
              </div>,
            ]} />
          ))}
        />
      </Card>

      {modal && selected && (
        <Modal title={`Order ${selected.order_number}`} onClose={() => setModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div><div style={{ fontSize: 14, color: A.muted, marginBottom: 4 }}>STATUS</div><Badge label={selected.status?.toUpperCase()} color={statusColor[selected.status] || A.muted} /></div>
            <div><div style={{ fontSize: 14, color: A.muted, marginBottom: 4 }}>TOTAL</div><div style={{ fontWeight: 700 }}>${Number(selected.total || selected.subtotal || 0).toFixed(2)}</div></div>
            <div><div style={{ fontSize: 14, color: A.muted, marginBottom: 4 }}>SHIPPING</div><div style={{ fontSize: 16 }}>{selected.shipping_method}</div></div>
            <div><div style={{ fontSize: 14, color: A.muted, marginBottom: 4 }}>TRACKING</div><div style={{ fontSize: 16, fontFamily: 'monospace' }}>{selected.tracking_number || '—'}</div></div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: A.muted, marginBottom: 8 }}>UPDATE STATUS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {['pending','processing','shipped','delivered'].map(s => (
              <Btn key={s} sm variant={selected.status === s ? 'primary' : 'ghost'} onClick={() => updateStatus(selected.id, s)} style={{ textTransform: 'capitalize' }}>{s}</Btn>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${A.border}`, paddingTop: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: A.muted, marginBottom: 8 }}>ITEMS</div>
            {selected.items?.map((it, i) => <div key={i} style={{ fontSize: 16, padding: '6px 0', borderBottom: `1px solid ${A.border}` }}>{it.title} {it.quantity ? `× ${it.quantity}` : ''}</div>)}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 15, color: A.muted }}>Refunds are handled in PayPal until refund integration is enabled.</span>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── 4. Customers ──────────────────────────────────────────────────────────────
function CustomersPanel() {
  const customers = [
    { id:'c1', name:'Alex Chen', email:'alex.chen@example.com', orders:3, ltv:214.90, country:'US', segment:'repeat', joined:'2024-06-15', newsletter:true },
    { id:'c2', name:'Sarah Kim', email:'sarah.kim@example.com', orders:1, ltv:49.95, country:'KR', segment:'new', joined:'2026-05-01', newsletter:false },
    { id:'c3', name:'Marco Rossi', email:'marco.r@example.com', orders:5, ltv:389.75, country:'IT', segment:'vip', joined:'2023-11-20', newsletter:true },
    { id:'c4', name:'田中 太郎', email:'tanaka@example.jp', orders:2, ltv:99.90, country:'JP', segment:'repeat', joined:'2025-03-10', newsletter:true },
    { id:'c5', name:'Emma Williams', email:'emma.w@example.com', orders:1, ltv:54.95, country:'GB', segment:'new', joined:'2026-04-28', newsletter:false },
    { id:'c6', name:'Luis García', email:'luis.g@example.com', orders:7, ltv:512.65, country:'MX', segment:'vip', joined:'2022-09-05', newsletter:true },
  ]
  const [seg, setSeg] = useState('all')
  const segColor = { new: A.blue, repeat: A.green, vip: A.orange }
  const filtered = seg === 'all' ? customers : customers.filter(c => c.segment === seg)

  return (
    <div>
      <SectionHead title="Customer Management" action={
        <Btn sm variant="ghost">📧 Export Segment CSV</Btn>
      } />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all','new','repeat','vip'].map(s => (
          <button key={s} onClick={() => setSeg(s)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${seg===s ? A.orange : A.border}`,
            background: seg===s ? A.orange : '#fff', color: seg===s ? '#fff' : A.muted,
            fontSize: 15, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
          }}>{s}</button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          cols={['Customer', 'Email', 'Country', 'Orders', 'LTV', 'Segment', 'Newsletter', 'Joined']}
          rows={filtered.map((c, i) => (
            <TR key={c.id} stripe={i%2===1} cells={[
              <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{c.email}</div>,
              <div style={{ fontSize: 15 }}>{c.country}</div>,
              <div style={{ fontSize: 16, fontWeight: 700 }}>{c.orders}</div>,
              <div style={{ fontWeight: 700 }}>${c.ltv.toFixed(2)}</div>,
              <Badge label={c.segment.toUpperCase()} color={segColor[c.segment]} />,
              <div style={{ fontSize: 16 }}>{c.newsletter ? '✅' : '—'}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{c.joined}</div>,
            ]} />
          ))}
        />
      </Card>
    </div>
  )
}

// ── 5. Blog CMS ───────────────────────────────────────────────────────────────
function BlogPanel() {
  const { blogPosts: posts, loadAdminPosts, updateBlogPost, addBlogPost, removeBlogPost } = useStore()
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const emptyForm = { title: '', excerpt: '', category: 'dev_diary', status: 'draft', tags: '', body: '', cover_image_url: '' }
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()

  useEffect(() => { loadAdminPosts().catch(err => setError(err.message)) }, [])

  const catColor = { dev_diary: A.orange, retro_guide: A.blue, product_spotlight: A.purple, taiwan_culture: A.green, company_news: A.muted }

  function openEdit(p) {
    setEditing(p)
    setForm({ title: p.title, excerpt: p.excerpt || '', category: p.category || 'dev_diary', status: p.status, tags: (p.tags||[]).join(', '), body: p.body || '', cover_image_url: p.cover_image_url || '' })
    setError('')
    setModal('edit')
  }
  async function save() {
    if (!form.title.trim()) { setError('Enter a title.'); return }
    setSaving(true)
    setError('')
    const changes = { ...form, title: form.title.trim(), tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean), published_at: form.status === 'published' ? (editing?.published_at || new Date().toISOString()) : null }
    try {
      if (editing) await updateBlogPost(editing.id, changes)
      else await addBlogPost({ ...changes, slug: changes.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), author_id: user.id })
      setModal(null)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }
  async function del(id) { if (window.confirm('Delete this post?')) { try { await removeBlogPost(id) } catch (err) { setError(err.message) } } }
  async function chooseImage(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setSaving(true)
    try { const url = await uploadMedia(file); setForm(f => ({ ...f, cover_image_url: url })) }
    catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <SectionHead title="Dev Stories CMS" action={
        <Btn sm onClick={() => { setEditing(null); setForm(emptyForm); setError(''); setModal('edit') }}>+ New Post</Btn>
      } />
      {error && !modal && <p role="alert" style={{ color: A.red }}>{error}</p>}

      <Card style={{ padding: 0 }}>
        <Table
          cols={['Title', 'Category', 'Status', 'Views', 'Published', 'Actions']}
          rows={posts.map((p, i) => (
            <TR key={p.id} stripe={i%2===1} cells={[
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: A.muted }}>{p.slug}</div>
              </div>,
              <Badge label={p.category?.replace('_',' ').toUpperCase()} color={catColor[p.category] || A.muted} />,
              <Badge label={p.status?.toUpperCase()} color={p.status === 'published' ? A.green : A.muted} />,
              <div style={{ fontSize: 16 }}>{(p.view_count||0).toLocaleString()}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{p.published_at?.slice(0,10) || '—'}</div>,
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn sm variant="ghost" onClick={() => openEdit(p)}>Edit</Btn>
                <Btn sm variant="danger" onClick={() => del(p.id)}>Del</Btn>
              </div>,
            ]} />
          ))}
        />
      </Card>

      {modal === 'edit' && (
        <Modal title={editing ? 'Edit Post' : 'New Post'} onClose={() => setModal(null)}>
          <Input label="Title" value={form.title} onChange={v => setForm(f=>({...f,title:v}))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Category" value={form.category} onChange={v => setForm(f=>({...f,category:v}))} options={[
              { value:'dev_diary',label:'Dev Diary' }, { value:'retro_guide',label:'Retro Guide' },
              { value:'product_spotlight',label:'Product Spotlight' }, { value:'taiwan_culture',label:'Taiwan Culture' }, { value:'company_news',label:'Company News' },
            ]} />
            <Select label="Status" value={form.status} onChange={v => setForm(f=>({...f,status:v}))} options={[{ value:'draft',label:'Draft' },{ value:'published',label:'Published' }]} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: A.text, marginBottom: 5 }}>Excerpt</div>
            <textarea value={form.excerpt} onChange={e => setForm(f=>({...f,excerpt:e.target.value}))} rows={2}
              style={{ width:'100%', padding:'9px 12px', border:`1px solid ${A.border}`, borderRadius:6, fontSize:16, boxSizing:'border-box', outline:'none', resize:'vertical' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: A.text, marginBottom: 5 }}>Body (Markdown supported)</div>
            <textarea value={form.body} onChange={e => setForm(f=>({...f,body:e.target.value}))} rows={8}
              style={{ width:'100%', padding:'9px 12px', border:`1px solid ${A.border}`, borderRadius:6, fontSize:15, fontFamily:'monospace', boxSizing:'border-box', outline:'none', resize:'vertical' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: A.muted, marginBottom: 8 }}>Cover Image</div>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseImage} />
            {form.cover_image_url && <img src={form.cover_image_url} alt="Cover preview" style={{ display: 'block', maxWidth: 200, maxHeight: 120, objectFit: 'contain', marginTop: 8 }} />}
          </div>
          <Input label="Tags (comma-separated)" value={form.tags} onChange={v => setForm(f=>({...f,tags:v}))} />
          {error && <p role="alert" style={{ color: A.red }}>{error}</p>}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Post'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

function MediaPanel() {
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const { data, error } = await supabase.storage.from('media').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    if (error) throw error
    setFiles(data || [])
  }

  useEffect(() => { refresh().catch(err => setError(err.message)) }, [])

  async function upload(event) {
    const selected = Array.from(event.target.files || [])
    setBusy(true)
    setError('')
    try {
      for (const file of selected) await uploadMedia(file)
      await refresh()
    } catch (err) { setError(err.message) }
    finally { setBusy(false); event.target.value = '' }
  }

  return <div>
    <SectionHead title="Media Library" />
    <label style={{ display: 'inline-block', padding: 12, border: `1px solid ${A.border}`, background: '#fff', cursor: 'pointer', marginBottom: 20 }}>
      {busy ? 'Uploading...' : 'Upload Images'}
      <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} disabled={busy} style={{ display: 'block', marginTop: 8 }} />
    </label>
    {error && <p role="alert" style={{ color: A.red }}>{error}</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
      {files.map(file => {
        const url = supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl
        return <div key={file.name} style={{ border: `1px solid ${A.border}`, background: '#fff', padding: 8 }}>
          <img src={url} alt={file.name} style={{ width: '100%', height: 120, objectFit: 'contain' }} />
          <div style={{ fontSize: 14, overflowWrap: 'anywhere', margin: '8px 0' }}>{file.name}</div>
          <input aria-label={`URL for ${file.name}`} readOnly value={url} onFocus={e => e.target.select()} style={{ width: '100%', boxSizing: 'border-box', fontSize: 14 }} />
        </div>
      })}
    </div>
  </div>
}

// ── 6. Pages Editor ───────────────────────────────────────────────────────────
function PagesPanel() {
  const [activePage, setActivePage] = useState('about')
  const [saved, setSaved] = useState(false)
  const pages = {
    about: { title:'About / Our Story', content:'Founded in 2019 in Taichung City, ITG.Soft creates original NES & Famicom games celebrating Taiwan\'s rich cultural heritage.' },
    faq: { title:'FAQ', content:'**Q: Do your games work on original hardware?**\nYes — all physical cartridges are tested on original NES and Famicom hardware...' },
    developers: { title:'Developers / Publishing', content:'We are always looking to team up with other developers. There is no upfront platform fee for accepted projects, and you keep your rights.' },
    shipping: { title:'Shipping Info', content:'We ship worldwide from Taichung, Taiwan. Standard airmail typically $6–8 USD globally with delivery in 2–2.5 weeks.' },
  }
  const [content, setContent] = useState(pages[activePage].content)

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <SectionHead title="Page Editor" action={
        <Btn sm onClick={handleSave} variant={saved ? 'success' : 'primary'}>{saved ? '✓ Saved!' : 'Save Page'}</Btn>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        <Card style={{ padding: 0 }}>
          {Object.entries(pages).map(([id, p]) => (
            <button key={id} onClick={() => { setActivePage(id); setContent(pages[id].content) }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px',
              background: activePage === id ? A.orange + '15' : 'transparent',
              borderLeft: `3px solid ${activePage === id ? A.orange : 'transparent'}`,
              border: 'none', borderBottom: `1px solid ${A.border}`, cursor: 'pointer',
              fontSize: 16, fontWeight: activePage === id ? 700 : 500, color: activePage === id ? A.orange : A.text,
            }}>{p.title}</button>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{pages[activePage].title}</div>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={16}
            style={{ width:'100%', padding:'10px 14px', border:`1px solid ${A.border}`, borderRadius:6, fontSize:16, fontFamily:'monospace', boxSizing:'border-box', outline:'none', resize:'vertical', lineHeight:'1.6' }} />
          <div style={{ fontSize: 14, color: A.muted, marginTop: 8 }}>Markdown is supported. Changes go live immediately on save.</div>
        </Card>
      </div>
    </div>
  )
}

// ── 7. Shipping ───────────────────────────────────────────────────────────────
function ShippingPanel() {
  const [zones, setZones] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('shipping_zones').select('id,name,country_codes,shipping_rates(id,name,base_rate,free_above,estimated_days_min,estimated_days_max,is_active)').order('name')
      .then(({ data, error }) => { if (error) setError(error.message); else setZones(data || []) })
  }, [])

  async function save(updated) {
    setSaving(true)
    setError('')
    try {
      const { error: zoneError } = await supabase.from('shipping_zones').update({ name: updated.name, country_codes: updated.country_codes }).eq('id', updated.id)
      if (zoneError) throw zoneError
      for (const rate of updated.shipping_rates) {
        const { error: rateError } = await supabase.from('shipping_rates').update({ base_rate: Number(rate.base_rate), free_above: rate.free_above === '' ? null : rate.free_above, estimated_days_min: rate.estimated_days_min, estimated_days_max: rate.estimated_days_max }).eq('id', rate.id)
        if (rateError) throw rateError
      }
      setZones(zs => zs.map(z => z.id === updated.id ? updated : z))
      setEditing(null)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <SectionHead title="Shipping Zones & Rates" />
      {error && <p role="alert" style={{ color: A.red }}>{error}</p>}
      <Card style={{ padding: 0 }}>
        <Table
          cols={['Zone', 'Countries', 'Rates', 'Actions']}
          rows={zones.map((z, i) => (
            <TR key={z.id} stripe={i%2===1} cells={[
              <div style={{ fontWeight: 700, fontSize: 16 }}>{z.name}</div>,
              <div style={{ fontSize: 14, color: A.muted, maxWidth: 180 }}>{z.country_codes?.join(', ')}</div>,
              <div style={{ fontSize: 15 }}>{z.shipping_rates?.map(r => `${r.name}: $${Number(r.base_rate).toFixed(2)}`).join(' / ')}</div>,
              <Btn sm variant="ghost" onClick={() => setEditing({ ...z })}>Edit</Btn>,
            ]} />
          ))}
        />
      </Card>

      {editing && (
        <Modal title={`Edit Zone: ${editing.name}`} onClose={() => setEditing(null)}>
          <Input label="Zone Name" value={editing.name} onChange={v => setEditing(e=>({...e,name:v}))} />
          <Input label="Countries (ISO codes, comma-separated)" value={editing.country_codes.join(', ')} onChange={v => setEditing(e=>({...e,country_codes:v.toUpperCase().split(',').map(c=>c.trim()).filter(Boolean)}))} />
          {editing.shipping_rates?.map(rate => <div key={rate.id} style={{ borderTop: `1px solid ${A.border}`, paddingTop: 10 }}>
            <strong>{rate.name}</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="Price (USD)" type="number" value={rate.base_rate} onChange={v => setEditing(e=>({...e,shipping_rates:e.shipping_rates.map(r=>r.id===rate.id?{...r,base_rate:v}:r)}))} />
              <Input label="Free above (USD)" type="number" value={rate.free_above ?? ''} onChange={v => setEditing(e=>({...e,shipping_rates:e.shipping_rates.map(r=>r.id===rate.id?{...r,free_above:v}:r)}))} />
            </div>
          </div>)}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn onClick={() => save(editing)} disabled={saving}>{saving ? 'Saving...' : 'Save Zone'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── 8. Tax Settings ───────────────────────────────────────────────────────────
function TaxPanel() {
  const [rules] = useState([
    { region:'Taiwan (TW)', rate:5, type:'VAT', included:true, note:'5% Business Tax (VAT) — included in display price' },
    { region:'European Union', rate:0, type:'VAT', included:false, note:'EU customers may owe local VAT. Not collected at checkout.' },
    { region:'United States', rate:0, type:'Sales Tax', included:false, note:'Not registered for US sales tax. Customer responsibility.' },
    { region:'Japan', rate:10, type:'Consumption Tax', included:false, note:'JCT not collected. Customer-declared at import.' },
    { region:'Australia / NZ', rate:10, type:'GST', included:false, note:'GST not collected below A$1000 threshold.' },
  ])
  const [nexus, setNexus] = useState(false)
  const [digitalVat, setDigitalVat] = useState(false)

  return (
    <div>
      <SectionHead title="Tax Settings" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          <Card>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Tax Rules by Region</div>
            <Table
              cols={['Region', 'Rate', 'Type', 'Collected', 'Note']}
              rows={rules.map((r, i) => (
                <TR key={i} stripe={i%2===1} cells={[
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{r.region}</div>,
                  <div style={{ fontWeight: 700 }}>{r.rate}%</div>,
                  <div style={{ fontSize: 15, color: A.muted }}>{r.type}</div>,
                  <Badge label={r.included ? 'YES' : 'NO'} color={r.included ? A.green : A.muted} />,
                  <div style={{ fontSize: 14, color: A.muted }}>{r.note}</div>,
                ]} />
              ))}
            />
          </Card>
        </div>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Global Options</div>
            {[
              { label: 'Display prices inclusive of tax', value: true },
              { label: 'Collect EU VAT (OSS registration)', value: nexus, set: setNexus },
              { label: 'Charge VAT on digital products', value: digitalVat, set: setDigitalVat },
            ].map((opt, i) => (
              <label key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, cursor: 'pointer', fontSize: 16 }}>
                <input type="checkbox" checked={opt.value} onChange={opt.set ? () => opt.set(v => !v) : undefined} readOnly={!opt.set} />
                {opt.label}
              </label>
            ))}
          </Card>
          <Card>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Tax ID / Business Info</div>
            <div style={{ fontSize: 15, color: A.muted, marginBottom: 12 }}>Yī tái yóuxì Software Company</div>
            <Input label="Taiwan Business Number" value="12345678" onChange={() => {}} />
            <Input label="VAT / GST Number" value="" onChange={() => {}} placeholder="If registered" />
            <Btn sm>Save</Btn>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── 9. Payment Gateway ────────────────────────────────────────────────────────
function PaymentsPanel() {
  const [status, setStatus] = useState(null)
  useEffect(() => { fetch('/api/checkout/status').then(r => r.json()).then(setStatus).catch(() => setStatus({ ready: false })) }, [])
  return <div>
    <SectionHead title="PayPal Checkout" />
    <Card>
      <Badge label={status?.ready ? `${status.mode.toUpperCase()} CONFIGURED` : 'SETUP REQUIRED'} color={status?.ready ? A.green : A.orange} />
      <p style={{ fontSize: 16, lineHeight: 1.6 }}>Payment credentials are stored on the server, never in this dashboard. Configure the PayPal Business client ID and secret, Supabase service role key, and site URL in the deployment environment. See docs/commerce-launch.md.</p>
      <p style={{ fontSize: 15, color: A.muted }}>Checkout takes the customer to PayPal, then confirms the order only after capture succeeds.</p>
    </Card>
  </div>
}

// ── 10. Email Templates ───────────────────────────────────────────────────────
function EmailPanel() {
  const templates = [
    { id:'order_confirm', label:'Order Confirmation', subject:'Your ITG.Soft order #{order_number} is confirmed!' },
    { id:'order_shipped', label:'Order Shipped', subject:'Your order #{order_number} is on its way! 🎮' },
    { id:'order_delivered', label:'Order Delivered', subject:'Your ITG.Soft order has arrived!' },
    { id:'welcome', label:'Welcome Email', subject:'Welcome to the ITG.Soft family!' },
    { id:'password_reset', label:'Password Reset', subject:'Reset your ITG.Soft password' },
    { id:'newsletter', label:'Newsletter Template', subject:'ITG.Soft — New games and updates' },
    { id:'preorder_reminder', label:'Pre-Order Reminder', subject:'Your pre-order ships soon!' },
    { id:'abandoned_cart', label:'Abandoned Cart', subject:'You left something behind at ITG.Soft 🕹️' },
  ]
  const [active, setActive] = useState('order_confirm')
  const [body, setBody] = useState(`Hi {{first_name}},

Thank you for your order at Yī tái yóuxì Software Company!

Order: {{order_number}}
Total: {{total}}
Shipping to: {{shipping_address}}

We'll send you a tracking number once your order ships from Taichung, Taiwan.

Play on!
— ITG.Soft Team`)
  const [saved, setSaved] = useState(false)

  return (
    <div>
      <SectionHead title="Email Template Editor" action={
        <Btn sm onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }} variant={saved ? 'success' : 'primary'}>{saved ? '✓ Saved!' : 'Save Template'}</Btn>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        <Card style={{ padding: 0 }}>
          {templates.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px',
              background: active === t.id ? A.orange + '15' : 'transparent',
              borderLeft: `3px solid ${active === t.id ? A.orange : 'transparent'}`,
              border: 'none', borderBottom: `1px solid ${A.border}`, cursor: 'pointer',
              fontSize: 15, fontWeight: active === t.id ? 700 : 500, color: active === t.id ? A.orange : A.text,
            }}>{t.label}</button>
          ))}
        </Card>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <Input label="Subject Line" value={templates.find(t=>t.id===active)?.subject || ''} onChange={()=>{}} />
            <div style={{ fontSize: 14, color: A.muted }}>Available variables: {'{{first_name}}, {{order_number}}, {{total}}, {{shipping_address}}, {{tracking_number}}'}</div>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Body (HTML/Text)</div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={14}
              style={{ width:'100%', padding:'10px 14px', border:`1px solid ${A.border}`, borderRadius:6, fontSize:15, fontFamily:'monospace', boxSizing:'border-box', outline:'none', resize:'vertical', lineHeight:'1.6' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn sm variant="ghost">Send Test Email</Btn>
              <Btn sm variant="ghost">Preview</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ── 11. Coupons ───────────────────────────────────────────────────────────────
function CouponsPanel() {
  const [coupons, setCoupons] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ code:'', type:'percentage', value:'', min_order:'', max_uses:'', expires:'', desc:'' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('coupons').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (error) setError(error.message); else setCoupons(data || []) })
  }, [])

  async function addCoupon() {
    if (!/^[A-Z0-9_-]{3,50}$/.test(form.code) || (form.type !== 'free_shipping' && (!(Number(form.value) > 0) || (form.type === 'percentage' && Number(form.value) > 100)))) { setError('Enter a valid code and discount value.'); return }
    setSaving(true)
    setError('')
    const { data, error } = await supabase.from('coupons').insert({ code:form.code, type:form.type, value:form.type==='free_shipping'?0:Number(form.value), min_order_amount:Number(form.min_order)||0, max_uses:form.max_uses?Number(form.max_uses):null, expires_at:form.expires?`${form.expires}T23:59:59Z`:null, description:form.desc }).select().single()
    setSaving(false)
    if (error) { setError(error.message); return }
    setCoupons(cs => [data, ...cs])
    setModal(false)
    setForm({ code:'', type:'percentage', value:'', min_order:'', max_uses:'', expires:'', desc:'' })
  }
  async function toggle(coupon) {
    const { data, error } = await supabase.from('coupons').update({ is_active: !coupon.is_active }).eq('id', coupon.id).select().single()
    if (error) setError(error.message)
    else setCoupons(cs => cs.map(c => c.id === data.id ? data : c))
  }
  async function del(id) {
    if (!window.confirm('Delete coupon?')) return
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) setError(error.message)
    else setCoupons(cs => cs.filter(c => c.id !== id))
  }

  return (
    <div>
      <SectionHead title="Coupon Code Management" action={
        <Btn sm onClick={() => setModal(true)}>+ New Coupon</Btn>
      } />
      {error && <p role="alert" style={{ color: A.red }}>{error}</p>}

      <Card style={{ padding: 0 }}>
        <Table
          cols={['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Expires', 'Status', 'Actions']}
          rows={coupons.map((c, i) => (
            <TR key={c.id} stripe={i%2===1} cells={[
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{c.code}</div>
                <div style={{ fontSize: 14, color: A.muted }}>{c.description}</div>
              </div>,
              <Badge label={c.type.replace('_',' ').toUpperCase()} color={c.type==='percentage'?A.orange:c.type==='fixed_amount'?A.blue:A.green} />,
              <div style={{ fontWeight: 700 }}>{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed_amount' ? `$${c.value}` : 'Free'}</div>,
              <div style={{ fontSize: 16 }}>{c.min_order_amount > 0 ? `$${c.min_order_amount}` : '—'}</div>,
              <div style={{ fontSize: 16 }}>{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</div>,
              <div style={{ fontSize: 15, color: A.muted }}>{c.expires_at?.slice(0,10) || '—'}</div>,
              <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer' }}>
                <input type="checkbox" checked={c.is_active} onChange={() => toggle(c)} />
                <span style={{ fontSize:15, color: c.is_active ? A.green : A.muted }}>{c.is_active ? 'Active' : 'Off'}</span>
              </label>,
              <Btn sm variant="danger" onClick={() => del(c.id)}>Del</Btn>,
            ]} />
          ))}
        />
      </Card>

      {modal && (
        <Modal title="New Coupon Code" onClose={() => setModal(false)}>
          <Input label="Code (uppercase)" value={form.code} onChange={v => setForm(f=>({...f,code:v.toUpperCase()}))} placeholder="e.g. SUMMER20" />
          <Select label="Discount Type" value={form.type} onChange={v => setForm(f=>({...f,type:v}))} options={[
            {value:'percentage',label:'Percentage (%)'},
            {value:'fixed_amount',label:'Fixed Amount ($)'},
            {value:'free_shipping',label:'Free Shipping'},
          ]} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Input label={form.type==='percentage' ? 'Discount %' : 'Discount Amount ($)'} type="number" value={form.value} onChange={v => setForm(f=>({...f,value:v}))} />
            <Input label="Minimum Order ($)" type="number" value={form.min_order} onChange={v => setForm(f=>({...f,min_order:v}))} placeholder="0 = no minimum" />
            <Input label="Max Uses" type="number" value={form.max_uses} onChange={v => setForm(f=>({...f,max_uses:v}))} placeholder="Leave blank for unlimited" />
            <Input label="Expiry Date" type="date" value={form.expires} onChange={v => setForm(f=>({...f,expires:v}))} />
          </div>
          <Input label="Internal Description" value={form.desc} onChange={v => setForm(f=>({...f,desc:v}))} placeholder="e.g. Ghost Month promo" />
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={addCoupon} disabled={saving || !form.code}>{saving ? 'Saving...' : 'Create Coupon'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── 12. User Roles ────────────────────────────────────────────────────────────
function RolesPanel() {
  const [users, setUsers] = useState([
    { id:'u1', name:'Dave Wang', email:'admin@itg-soft.tw', role:'admin', status:'active', last_login:'2026-05-14' },
    { id:'u2', name:'Chen Wei', email:'chen@itg-soft.tw', role:'editor', status:'active', last_login:'2026-05-12' },
    { id:'u3', name:'Lin Mei', email:'lin@itg-soft.tw', role:'fulfillment', status:'active', last_login:'2026-05-10' },
    { id:'u4', name:'Sam Park', email:'sam.park@agency.com', role:'developer', status:'inactive', last_login:'2026-03-01' },
  ])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', role:'editor' })

  const roleColor = { admin: A.red, editor: A.orange, fulfillment: A.blue, developer: A.purple }
  const rolePerms = {
    admin: ['All permissions — full system access'],
    editor: ['Products: read/write', 'Dev Stories: read/write', 'Pages: read/write', 'Analytics: read'],
    fulfillment: ['Orders: read/write (status + packing)', 'Customers: read', 'Shipping: read'],
    developer: ['Products: read', 'Analytics: read', 'Settings: read'],
  }

  function addUser() {
    setUsers(us => [...us, { id:'u-'+Date.now(), ...form, status:'active', last_login:'—' }])
    setModal(false)
    setForm({ name:'', email:'', role:'editor' })
  }
  function updateRole(id, role) { setUsers(us => us.map(u => u.id === id ? { ...u, role } : u)) }
  function toggleStatus(id) { setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status==='active'?'inactive':'active' } : u)) }

  return (
    <div>
      <SectionHead title="User Role Management" action={
        <Btn sm onClick={() => setModal(true)}>+ Invite User</Btn>
      } />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <Card style={{ padding: 0 }}>
          <Table
            cols={['User', 'Email', 'Role', 'Status', 'Last Login', 'Actions']}
            rows={users.map((u, i) => (
              <TR key={u.id} stripe={i%2===1} cells={[
                <div style={{ fontWeight: 700 }}>{u.name}</div>,
                <div style={{ fontSize: 15, color: A.muted }}>{u.email}</div>,
                <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                  style={{ padding:'4px 8px', border:`1px solid ${A.border}`, borderRadius:4, fontSize:15, color: roleColor[u.role], fontWeight:700, background:'#fff', cursor:'pointer' }}>
                  {Object.keys(rolePerms).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>,
                <Badge label={u.status.toUpperCase()} color={u.status==='active'?A.green:A.muted} />,
                <div style={{ fontSize: 15, color: A.muted }}>{u.last_login}</div>,
                <div style={{ display:'flex', gap:6 }}>
                  <Btn sm variant="ghost" onClick={() => toggleStatus(u.id)}>{u.status==='active'?'Disable':'Enable'}</Btn>
                </div>,
              ]} />
            ))}
          />
        </Card>

        {/* Role Permissions Reference */}
        <Card>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 14 }}>Role Permissions</div>
          {Object.entries(rolePerms).map(([role, perms]) => (
            <div key={role} style={{ marginBottom: 16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <Badge label={role.toUpperCase()} color={roleColor[role]} />
              </div>
              <ul style={{ margin:0, paddingLeft:16 }}>
                {perms.map((p,i) => <li key={i} style={{ fontSize:14, color:A.muted, marginBottom:2 }}>{p}</li>)}
              </ul>
            </div>
          ))}
        </Card>
      </div>

      {modal && (
        <Modal title="Invite Team Member" onClose={() => setModal(false)}>
          <Input label="Full Name" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} />
          <Input label="Email Address" type="email" value={form.email} onChange={v => setForm(f=>({...f,email:v}))} />
          <Select label="Role" value={form.role} onChange={v => setForm(f=>({...f,role:v}))} options={Object.keys(rolePerms).map(r=>({value:r,label:r.charAt(0).toUpperCase()+r.slice(1)}))} />
          <div style={{ fontSize: 15, color: A.muted, marginBottom: 16 }}>An invitation email will be sent with a temporary password.</div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={addUser} disabled={!form.name || !form.email}>Send Invite</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ══════════════════════════════════════════════════════════════════════════════
function AdminLogin() {
  const { signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function attempt(e) {
    e.preventDefault()
    setErr('')
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      setErr('Enter your admin email and password.')
      return
    }
    setBusy(true)
    const { data, error } = await signIn(cleanEmail, password)
    if (error) {
      setBusy(false)
      setErr(error.message)
      return
    }
    const userId = data?.user?.id
    if (!userId) {
      setBusy(false)
      setErr('Could not verify admin access.')
      await signOut()
      return
    }

    const { data: profileRow, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      setBusy(false)
      setErr('Could not verify admin access.')
      await signOut()
      return
    }

    if (profileRow?.role !== 'admin') {
      setBusy(false)
      setErr('This account does not have admin access.')
      await signOut()
      return
    }

    setBusy(false)
  }
  return (
    <div style={{ minHeight:'100vh', background: A.sidebar, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:48, width:360, boxShadow:'0 24px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <img src="/logo.png" alt="ITG.Soft" style={{ height:48, marginBottom:16 }} />
          <div style={{ fontSize:16, fontWeight:800, color: A.text }}>Admin Panel</div>
          <div style={{ fontSize:16, color: A.muted, marginTop:4 }}>Sign in with an admin account</div>
        </div>
        <form onSubmit={attempt}>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@itg-soft.tw"
              style={{ width:'100%', padding:'12px 14px', border:`2px solid ${A.border}`, borderRadius:8, fontSize:17, boxSizing:'border-box', outline:'none' }}
            />
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={{ width:'100%', padding:'12px 14px', border:`2px solid ${A.border}`, borderRadius:8, fontSize:17, boxSizing:'border-box', outline:'none' }}
            />
          </div>
          {err && <div style={{ color: A.red, fontSize:15, marginBottom:8 }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ width:'100%', background: A.orange, color:'#fff', border:'none', borderRadius:8, padding:'13px', fontSize:15, fontWeight:800, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.8 : 1 }}>
            {busy ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN LAYOUT
// ══════════════════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:'products',   icon:'🎮', label:'Products' },
  { id:'orders',     icon:'📦', label:'Orders' },
  { id:'blog',       icon:'✏️',  label:'Dev Stories' },
  { id:'media',      icon:'🖼️', label:'Media' },
  { id:'shipping',   icon:'🌏', label:'Shipping' },
  { id:'payments',   icon:'💳', label:'Payments' },
  { id:'coupons',    icon:'🏷️',  label:'Coupons' },
]

const PANELS = {
  dashboard: DashboardPanel,
  products:  ProductsPanel,
  orders:    OrdersPanel,
  customers: CustomersPanel,
  blog:      BlogPanel,
  media:     MediaPanel,
  pages:     PagesPanel,
  shipping:  ShippingPanel,
  tax:       TaxPanel,
  payments:  PaymentsPanel,
  emails:    EmailPanel,
  coupons:   CouponsPanel,
  roles:     RolesPanel,
}

export default function AdminPage({ onNav }) {
  const [active, setActive] = useState('products')
  const { user, profile, loading, isAdmin, signOut } = useAuth()

  useEffect(() => {
    if (user && profile && !isAdmin) {
      void signOut()
    }
  }, [user, profile, isAdmin, signOut])

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:A.sidebar, color:'#fff', fontSize:17 }}>
        Loading admin session…
      </div>
    )
  }

  if (!user || !isAdmin) return <AdminLogin />

  const Panel = PANELS[active]

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: A.bg }}>
      {/* Sidebar */}
      <div style={{ width:220, background: A.sidebar, display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
        {/* Logo */}
        <div style={{ padding:'20px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <img src="/logo.png" alt="ITG.Soft" style={{ height:36, marginBottom:8 }} />
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', fontWeight:700, letterSpacing:'0.12em' }}>ADMIN PANEL</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 0' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                display:'flex', alignItems:'center', gap:10,
                width:'100%', padding:'10px 18px',
                background: active === item.id ? 'rgba(240,149,38,0.15)' : 'transparent',
                borderLeft: `3px solid ${active === item.id ? A.sideAct : 'transparent'}`,
                border:'none', cursor:'pointer',
                color: active === item.id ? A.sideAct : A.sideText,
                fontWeight: active === item.id ? 700 : 500,
                fontSize:16, textAlign:'left',
                transition:'all 0.15s',
              }}
            >
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => onNav?.('home')}
            style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px', background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:15 }}
          >
            ← Back to Store
          </button>
          <button
            onClick={() => void signOut()}
            style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px', background:'transparent', border:'none', cursor:'pointer', color:A.red+'aa', fontSize:15 }}
          >
            🔓 Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, overflowY:'auto', padding:'32px 36px', maxWidth:'calc(100vw - 220px)' }}>
        <Panel />
      </div>
    </div>
  )
}
