/**
 * ITG-SOFT — JS Schema Definitions
 * Mirrors db/schema.sql — used for frontend validation, mock data shape,
 * and future API contract documentation.
 */

// ---------------------------------------------------------------------------
// ENUMS  (single source of truth for dropdowns, filters, badges)
// ---------------------------------------------------------------------------

export const USER_ROLES = /** @type {const} */ (['customer', 'admin', 'developer_partner'])

export const PLATFORMS = /** @type {const} */ (['nes', 'famicom', 'both'])

export const PRODUCT_STATUSES = /** @type {const} */ ([
  'in_stock', 'low_stock', 'out_of_stock', 'preorder', 'coming_soon', 'discontinued',
])

export const PRODUCT_FORMATS = /** @type {const} */ (['physical_cib', 'digital', 'both'])

export const GENRES = /** @type {const} */ ([
  'platformer', 'rpg', 'shooter', 'adventure', 'puzzle',
  'horror', 'action', 'simulation', 'sports', 'strategy',
])

export const ORDER_STATUSES = /** @type {const} */ ([
  'pending', 'payment_processing', 'payment_failed', 'paid',
  'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded',
])

export const BLOG_CATEGORIES = /** @type {const} */ ([
  'dev_diary', 'retro_guide', 'company_news', 'taiwan_culture', 'product_spotlight',
])

export const BLOG_CATEGORY_LABELS = {
  dev_diary:         'Dev Diary',
  retro_guide:       'Retro Guide',
  company_news:      'Company News',
  taiwan_culture:    'Taiwan Culture',
  product_spotlight: 'Product Spotlight',
}

export const NES_MAPPERS = /** @type {const} */ ([
  'NROM', 'MMC1', 'UNROM', 'CNROM', 'MMC3', 'MMC5', 'AxROM', 'BxROM',
])

export const INVENTORY_REASONS = /** @type {const} */ ([
  'purchase', 'restock', 'adjustment', 'return', 'damage',
])

export const COUPON_TYPES = /** @type {const} */ (['percentage', 'fixed_amount', 'free_shipping'])

export const PARTNER_STATUSES = /** @type {const} */ (['pending', 'active', 'inactive'])

export const IMAGE_TYPES = /** @type {const} */ ([
  'box_front', 'box_back', 'cartridge', 'screenshot', 'manual', 'lifestyle',
])

// ---------------------------------------------------------------------------
// SHAPE DEFINITIONS  (plain objects — easy to swap for Zod/Yup schemas later)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} User
 * @property {string}    id
 * @property {string}    email
 * @property {string}    [first_name]
 * @property {string}    [last_name]
 * @property {string}    [phone]
 * @property {string}    [avatar_url]
 * @property {UserRole}  role
 * @property {boolean}   newsletter_subscribed
 * @property {boolean}   email_verified
 * @property {string}    created_at   ISO timestamp
 * @property {string|null} deleted_at
 */

/**
 * @typedef {Object} UserAddress
 * @property {string}  id
 * @property {string}  user_id
 * @property {string}  [label]
 * @property {string}  line1
 * @property {string}  [line2]
 * @property {string}  city
 * @property {string}  [state_province]
 * @property {string}  [postal_code]
 * @property {string}  country_code
 * @property {boolean} is_default
 */

/**
 * @typedef {Object} Product
 * @property {string}          id
 * @property {string}          slug
 * @property {string}          title
 * @property {string}          [subtitle]
 * @property {string}          [description]
 * @property {string}          [short_description]
 * @property {Platform}        platform
 * @property {string}          [genre]
 * @property {ProductStatus}   status
 * @property {ProductFormat}   format
 * @property {number|null}     price_physical
 * @property {number|null}     price_digital
 * @property {number|null}     compare_price
 * @property {boolean}         is_featured
 * @property {boolean}         is_itgsoft_original
 * @property {string|null}     developer_id
 * @property {string|null}     release_date
 * @property {string|null}     box_art_url
 * @property {string[]}        screenshots
 * @property {string}          [cartridge_color]
 * @property {string}          [mapper_type]
 * @property {string}          [prg_rom_size]
 * @property {string}          [chr_rom_size]
 * @property {string}          [save_type]
 * @property {number}          players_min
 * @property {number}          players_max
 * @property {string[]}        tags
 * @property {string|null}     published_at
 * @property {InventoryStats}  [inventory]    joined
 * @property {ReviewStats}     [review_stats] joined
 */

/**
 * @typedef {Object} InventoryStats
 * @property {number} quantity_physical
 * @property {number} quantity_digital
 * @property {number} quantity_reserved
 * @property {number} available  computed: physical - reserved
 */

/**
 * @typedef {Object} ReviewStats
 * @property {number} review_count
 * @property {number} average_rating
 * @property {{1:number,2:number,3:number,4:number,5:number}} distribution
 */

/**
 * @typedef {Object} Order
 * @property {string}       id
 * @property {string}       order_number    ITG-YYYY-NNNNN
 * @property {string|null}  user_id
 * @property {string|null}  guest_email
 * @property {OrderStatus}  status
 * @property {number}       subtotal
 * @property {number}       discount_amount
 * @property {number}       shipping_amount
 * @property {number}       tax_amount
 * @property {number}       total
 * @property {string}       currency
 * @property {string|null}  coupon_code
 * @property {Object}       shipping_address  JSON snapshot
 * @property {Object}       billing_address
 * @property {string}       [shipping_method]
 * @property {string}       [tracking_number]
 * @property {string}       [carrier]
 * @property {string}       [payment_provider]
 * @property {OrderItem[]}  [items]           joined
 * @property {string}       created_at
 */

/**
 * @typedef {Object} OrderItem
 * @property {string}     id
 * @property {string}     order_id
 * @property {string}     product_id
 * @property {string}     title       snapshot
 * @property {number}     price       snapshot
 * @property {number}     quantity
 * @property {CartFormat} format
 * @property {string}     [digital_download_url]
 */

/**
 * @typedef {Object} Review
 * @property {string}  id
 * @property {string}  product_id
 * @property {string}  user_id
 * @property {string}  [order_item_id]
 * @property {1|2|3|4|5} rating
 * @property {string}  [title]
 * @property {string}  [body]
 * @property {boolean} is_verified_purchase
 * @property {boolean} is_approved
 * @property {number}  helpful_count
 * @property {string}  [admin_reply]
 * @property {string}  created_at
 * @property {User}    [author]  joined
 */

/**
 * @typedef {Object} BlogPost
 * @property {string}     id
 * @property {string}     slug
 * @property {string}     title
 * @property {string}     [excerpt]
 * @property {string}     [body]       Markdown
 * @property {string}     [cover_image_url]
 * @property {string}     author_id
 * @property {string}     [category]
 * @property {string[]}   tags
 * @property {PostStatus} status
 * @property {boolean}    is_featured
 * @property {number}     view_count
 * @property {string}     [related_product_id]
 * @property {string}     [published_at]
 * @property {User}       [author]  joined
 * @property {Product}    [related_product] joined
 */

/**
 * @typedef {Object} DeveloperPartner
 * @property {string}        id
 * @property {string}        name
 * @property {string}        slug
 * @property {string}        [bio]
 * @property {string}        [logo_url]
 * @property {string}        [website_url]
 * @property {string}        [country_code]
 * @property {PartnerStatus} status
 * @property {number}        revenue_share  percentage
 */

/**
 * @typedef {Object} Coupon
 * @property {string}     id
 * @property {string}     code
 * @property {CouponType} type
 * @property {number}     value
 * @property {number}     [min_order_amount]
 * @property {number}     [max_uses]
 * @property {number}     uses_count
 * @property {boolean}    is_active
 * @property {string}     [expires_at]
 */

/**
 * @typedef {Object} CartItem
 * @property {string}     id
 * @property {string}     [session_id]
 * @property {string}     [user_id]
 * @property {string}     product_id
 * @property {number}     quantity
 * @property {CartFormat} format
 * @property {Product}    [product]  joined
 */

// ---------------------------------------------------------------------------
// FIELD METADATA  (for admin forms — label, type, required, options)
// ---------------------------------------------------------------------------

export const PRODUCT_FIELDS = [
  { key: 'title',             label: 'Title',               type: 'text',     required: true  },
  { key: 'slug',              label: 'Slug',                type: 'text',     required: true  },
  { key: 'subtitle',          label: 'Subtitle',            type: 'text',     required: false },
  { key: 'short_description', label: 'Short Description',   type: 'textarea', required: false },
  { key: 'description',       label: 'Description',         type: 'richtext', required: false },
  { key: 'platform',          label: 'Platform',            type: 'select',   required: true,  options: PLATFORMS        },
  { key: 'genre',             label: 'Genre',               type: 'select',   required: false, options: GENRES           },
  { key: 'status',            label: 'Status',              type: 'select',   required: true,  options: PRODUCT_STATUSES },
  { key: 'format',            label: 'Format',              type: 'select',   required: true,  options: PRODUCT_FORMATS  },
  { key: 'price_physical',    label: 'Physical Price (USD)', type: 'number',  required: false },
  { key: 'price_digital',     label: 'Digital Price (USD)', type: 'number',   required: false },
  { key: 'compare_price',     label: 'Compare Price',       type: 'number',   required: false },
  { key: 'release_date',      label: 'Release Date',        type: 'date',     required: false },
  { key: 'mapper_type',       label: 'Mapper',              type: 'select',   required: false, options: NES_MAPPERS },
  { key: 'prg_rom_size',      label: 'PRG ROM Size',        type: 'text',     required: false },
  { key: 'chr_rom_size',      label: 'CHR ROM Size',        type: 'text',     required: false },
  { key: 'save_type',         label: 'Save Type',           type: 'text',     required: false },
  { key: 'players_min',       label: 'Min Players',         type: 'number',   required: false },
  { key: 'players_max',       label: 'Max Players',         type: 'number',   required: false },
  { key: 'weight_grams',      label: 'Weight (grams)',      type: 'number',   required: false },
  { key: 'tags',              label: 'Tags',                type: 'tags',     required: false },
  { key: 'is_featured',       label: 'Featured',            type: 'boolean',  required: false },
  { key: 'seo_title',         label: 'SEO Title',           type: 'text',     required: false },
  { key: 'seo_description',   label: 'SEO Description',     type: 'textarea', required: false },
]

export const ORDER_STATUS_LABELS = {
  pending:               'Pending',
  payment_processing:    'Processing Payment',
  payment_failed:        'Payment Failed',
  paid:                  'Paid',
  processing:            'Preparing Order',
  shipped:               'Shipped',
  delivered:             'Delivered',
  cancelled:             'Cancelled',
  refunded:              'Refunded',
  partially_refunded:    'Partially Refunded',
}

export const ORDER_STATUS_COLORS = {
  pending:            '#856404',
  payment_processing: '#0058f8',
  payment_failed:     '#c0392b',
  paid:               '#2d7a4f',
  processing:         '#f09526',
  shipped:            '#0058f8',
  delivered:          '#2d7a4f',
  cancelled:          '#555',
  refunded:           '#9400d4',
  partially_refunded: '#9400d4',
}

export const PRODUCT_STATUS_LABELS = {
  in_stock:     'In Stock',
  low_stock:    'Low Stock',
  out_of_stock: 'Out of Stock',
  preorder:     'Pre-Order',
  coming_soon:  'Coming Soon',
  discontinued: 'Discontinued',
}

export const PRODUCT_STATUS_COLORS = {
  in_stock:     { bg: '#d4edda', color: '#2d7a4f', border: '#a3d4b4' },
  low_stock:    { bg: '#fff3cd', color: '#856404', border: '#ffc107' },
  out_of_stock: { bg: '#f8d7da', color: '#721c24', border: '#f5a1a7' },
  preorder:     { bg: '#fff3cd', color: '#856404', border: '#ffc107' },
  coming_soon:  { bg: '#e2e3ff', color: '#4a5aef', border: '#a0a8f5' },
  discontinued: { bg: '#e9ecef', color: '#555',    border: '#ced4da' },
}
