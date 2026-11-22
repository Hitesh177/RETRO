-- =============================================================================
-- ITG-SOFT — Supabase Schema
-- PostgreSQL 15+ · Supabase conventions
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- Extensions (enabled by default in Supabase, but kept for clarity)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text


-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role        AS ENUM ('customer', 'admin', 'developer_partner');
CREATE TYPE platform_type    AS ENUM ('nes', 'famicom', 'both');
CREATE TYPE product_status   AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'preorder', 'coming_soon', 'discontinued');
CREATE TYPE product_format   AS ENUM ('physical_cib', 'digital', 'both');
CREATE TYPE image_type       AS ENUM ('box_front', 'box_back', 'cartridge', 'screenshot', 'manual', 'lifestyle');
CREATE TYPE order_status     AS ENUM ('pending', 'payment_processing', 'payment_failed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded');
CREATE TYPE coupon_type      AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
CREATE TYPE partner_status   AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE inventory_reason AS ENUM ('purchase', 'restock', 'adjustment', 'return', 'damage');
CREATE TYPE vote_type        AS ENUM ('helpful', 'not_helpful');
CREATE TYPE post_status      AS ENUM ('draft', 'published', 'archived');
CREATE TYPE cart_format      AS ENUM ('physical_cib', 'digital');


-- =============================================================================
-- PROFILES
-- Extends Supabase auth.users. Created automatically via trigger on sign-up.
-- =============================================================================

CREATE TABLE public.profiles (
  id                    UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email                 CITEXT      NOT NULL,
  first_name            VARCHAR(100),
  last_name             VARCHAR(100),
  phone                 VARCHAR(30),
  avatar_url            TEXT,
  role                  user_role   NOT NULL DEFAULT 'customer',
  newsletter_subscribed BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

CREATE INDEX idx_profiles_email      ON public.profiles (email);
CREATE INDEX idx_profiles_role       ON public.profiles (role);
CREATE INDEX idx_profiles_deleted_at ON public.profiles (deleted_at) WHERE deleted_at IS NULL;

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ── User addresses ────────────────────────────────────────────────────────────

CREATE TABLE public.user_addresses (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  label          VARCHAR(50),
  first_name     VARCHAR(100),
  last_name      VARCHAR(100),
  company        VARCHAR(150),
  line1          VARCHAR(255) NOT NULL,
  line2          VARCHAR(255),
  city           VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code    VARCHAR(20),
  country_code   CHAR(2)     NOT NULL DEFAULT 'TW',
  phone          VARCHAR(30),
  is_default     BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_addresses_user ON public.user_addresses (user_id);


-- =============================================================================
-- DEVELOPER PARTNERS
-- =============================================================================

CREATE TABLE public.developer_partners (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255)   NOT NULL,
  slug           VARCHAR(255)   UNIQUE NOT NULL,
  bio            TEXT,
  logo_url       TEXT,
  website_url    TEXT,
  contact_email  CITEXT,
  country_code   CHAR(2),
  status         partner_status NOT NULL DEFAULT 'pending',
  user_id        UUID           REFERENCES public.profiles (id),  -- portal account
  revenue_share  NUMERIC(5,2)   DEFAULT 70.00,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ    NOT NULL DEFAULT now()
);


-- =============================================================================
-- PRODUCTS
-- =============================================================================

CREATE TABLE public.products (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                VARCHAR(255)   UNIQUE NOT NULL,
  title               VARCHAR(255)   NOT NULL,
  subtitle            VARCHAR(255),
  description         TEXT,
  short_description   TEXT,

  platform            platform_type  NOT NULL DEFAULT 'both',
  genre               VARCHAR(50),
  status              product_status NOT NULL DEFAULT 'in_stock',
  format              product_format NOT NULL DEFAULT 'physical_cib',

  price_physical      NUMERIC(10,2),
  price_digital       NUMERIC(10,2),
  compare_price       NUMERIC(10,2),

  is_featured         BOOLEAN        NOT NULL DEFAULT false,
  is_itgsoft_original BOOLEAN        NOT NULL DEFAULT true,

  developer_id        UUID           REFERENCES public.developer_partners (id),

  release_date        DATE,
  preorder_ship_date  DATE,

  weight_grams        INTEGER,

  box_art_url         TEXT,
  video_url           TEXT,
  screenshots         JSONB          DEFAULT '[]',

  cartridge_color     VARCHAR(50),
  mapper_type         VARCHAR(50),
  prg_rom_size        VARCHAR(20),
  chr_rom_size        VARCHAR(20),
  save_type           VARCHAR(50),
  players_min         SMALLINT       NOT NULL DEFAULT 1,
  players_max         SMALLINT       NOT NULL DEFAULT 1,
  age_rating          VARCHAR(10),

  tags                TEXT[]         DEFAULT '{}',

  seo_title           VARCHAR(255),
  seo_description     TEXT,

  created_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT now(),
  published_at        TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_products_slug       ON public.products (slug);
CREATE INDEX idx_products_status     ON public.products (status);
CREATE INDEX idx_products_platform   ON public.products (platform);
CREATE INDEX idx_products_genre      ON public.products (genre);
CREATE INDEX idx_products_featured   ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_tags       ON public.products USING GIN (tags);
CREATE INDEX idx_products_deleted_at ON public.products (deleted_at) WHERE deleted_at IS NULL;


-- ── Product images ────────────────────────────────────────────────────────────

CREATE TABLE public.product_images (
  id          UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID       NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  url         TEXT       NOT NULL,   -- Supabase Storage public URL
  alt_text    VARCHAR(255),
  sort_order  SMALLINT   NOT NULL DEFAULT 0,
  image_type  image_type NOT NULL DEFAULT 'screenshot',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON public.product_images (product_id, sort_order);


-- =============================================================================
-- INVENTORY
-- =============================================================================

CREATE TABLE public.inventory (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID        NOT NULL UNIQUE REFERENCES public.products (id) ON DELETE CASCADE,
  quantity_physical   INTEGER     NOT NULL DEFAULT 0,
  quantity_digital    INTEGER     NOT NULL DEFAULT -1,  -- -1 = unlimited
  quantity_reserved   INTEGER     NOT NULL DEFAULT 0,
  reorder_point       INTEGER     NOT NULL DEFAULT 10,
  reorder_quantity    INTEGER     NOT NULL DEFAULT 50,
  warehouse_location  VARCHAR(50),
  last_restocked_at   TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Computed: available = quantity_physical - quantity_reserved

CREATE TABLE public.inventory_log (
  id           UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID             NOT NULL REFERENCES public.products (id),
  change_qty   INTEGER          NOT NULL,
  qty_after    INTEGER          NOT NULL,
  reason       inventory_reason NOT NULL,
  reference_id UUID,
  notes        TEXT,
  created_at   TIMESTAMPTZ      NOT NULL DEFAULT now(),
  created_by   UUID             REFERENCES public.profiles (id)
);

CREATE INDEX idx_inventory_log_product ON public.inventory_log (product_id, created_at DESC);


-- =============================================================================
-- COUPONS
-- =============================================================================

CREATE TABLE public.coupons (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code              VARCHAR(50) UNIQUE NOT NULL,
  description       TEXT,
  type              coupon_type NOT NULL,
  value             NUMERIC(10,2) NOT NULL,
  min_order_amount  NUMERIC(10,2),
  max_discount      NUMERIC(10,2),
  max_uses          INTEGER,
  max_uses_per_user INTEGER     DEFAULT 1,
  uses_count        INTEGER     NOT NULL DEFAULT 0,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  applies_to        TEXT[]      DEFAULT '{}',   -- product slugs; empty = all
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by        UUID        REFERENCES public.profiles (id)
);

CREATE INDEX idx_coupons_code      ON public.coupons (code);
CREATE INDEX idx_coupons_is_active ON public.coupons (is_active) WHERE is_active = true;


-- =============================================================================
-- ORDERS
-- =============================================================================

CREATE TABLE public.orders (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number        VARCHAR(30)  UNIQUE NOT NULL,
  user_id             UUID         REFERENCES public.profiles (id),
  guest_email         CITEXT,

  status              order_status NOT NULL DEFAULT 'pending',

  subtotal            NUMERIC(10,2) NOT NULL,
  discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total               NUMERIC(10,2) NOT NULL,
  currency            CHAR(3)       NOT NULL DEFAULT 'USD',

  coupon_code         VARCHAR(50),
  coupon_id           UUID          REFERENCES public.coupons (id),

  shipping_address    JSONB,   -- snapshot: {first_name, last_name, line1, city, country_code, …}
  billing_address     JSONB,

  shipping_method     VARCHAR(80),
  tracking_number     VARCHAR(100),
  carrier             VARCHAR(50),

  payment_provider    VARCHAR(50),     -- 'stripe' | 'paypal'
  payment_intent_id   VARCHAR(255),

  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,

  customer_notes      TEXT,
  admin_notes         TEXT,

  ip_address          INET,
  user_agent          TEXT,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user        ON public.orders (user_id);
CREATE INDEX idx_orders_number      ON public.orders (order_number);
CREATE INDEX idx_orders_status      ON public.orders (status);
CREATE INDEX idx_orders_guest_email ON public.orders (guest_email);
CREATE INDEX idx_orders_created     ON public.orders (created_at DESC);


-- ── Order items ───────────────────────────────────────────────────────────────

CREATE TABLE public.order_items (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 UUID        NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id               UUID        REFERENCES public.products (id),
  title                    VARCHAR(255) NOT NULL,   -- snapshot at purchase
  price                    NUMERIC(10,2) NOT NULL,
  quantity                 INTEGER      NOT NULL DEFAULT 1,
  format                   cart_format  NOT NULL DEFAULT 'physical_cib',
  digital_download_url     TEXT,
  digital_download_expires TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order   ON public.order_items (order_id);
CREATE INDEX idx_order_items_product ON public.order_items (product_id);


-- ── Order status history ──────────────────────────────────────────────────────

CREATE TABLE public.order_status_history (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID         NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by  UUID         REFERENCES public.profiles (id)
);

CREATE INDEX idx_order_status_history ON public.order_status_history (order_id, created_at DESC);


-- =============================================================================
-- REVIEWS
-- =============================================================================

CREATE TABLE public.reviews (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES public.profiles (id),
  order_item_id        UUID        REFERENCES public.order_items (id),
  rating               SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title                VARCHAR(255),
  body                 TEXT,
  is_verified_purchase BOOLEAN     NOT NULL DEFAULT false,
  is_approved          BOOLEAN     NOT NULL DEFAULT false,
  is_featured          BOOLEAN     NOT NULL DEFAULT false,
  helpful_count        INTEGER     NOT NULL DEFAULT 0,
  not_helpful_count    INTEGER     NOT NULL DEFAULT 0,
  admin_reply          TEXT,
  admin_reply_at       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ,
  UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product ON public.reviews (product_id, is_approved) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_user    ON public.reviews (user_id);
CREATE INDEX idx_reviews_rating  ON public.reviews (product_id, rating);


-- ── Review votes ──────────────────────────────────────────────────────────────

CREATE TABLE public.review_votes (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   UUID      NOT NULL REFERENCES public.reviews (id) ON DELETE CASCADE,
  user_id     UUID      NOT NULL REFERENCES public.profiles (id),
  vote        vote_type NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id)
);


-- =============================================================================
-- PRODUCT REVIEW STATS  (materialised cache — updated via trigger)
-- =============================================================================

CREATE TABLE public.product_review_stats (
  product_id     UUID    PRIMARY KEY REFERENCES public.products (id) ON DELETE CASCADE,
  review_count   INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_1       INTEGER NOT NULL DEFAULT 0,
  rating_2       INTEGER NOT NULL DEFAULT 0,
  rating_3       INTEGER NOT NULL DEFAULT 0,
  rating_4       INTEGER NOT NULL DEFAULT 0,
  rating_5       INTEGER NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-initialise stats row when a product is created
CREATE OR REPLACE FUNCTION public.init_review_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.product_review_stats (product_id)
  VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_init_stats
  AFTER INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.init_review_stats();

-- Recalculate stats when a review is inserted/updated/deleted
CREATE OR REPLACE FUNCTION public.refresh_review_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE pid UUID;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE public.product_review_stats
  SET
    review_count   = s.cnt,
    average_rating = ROUND(s.avg_r::NUMERIC, 2),
    rating_1       = s.r1, rating_2 = s.r2, rating_3 = s.r3,
    rating_4       = s.r4, rating_5 = s.r5,
    updated_at     = now()
  FROM (
    SELECT
      COUNT(*)                                             AS cnt,
      COALESCE(AVG(rating), 0)                            AS avg_r,
      COUNT(*) FILTER (WHERE rating=1)                    AS r1,
      COUNT(*) FILTER (WHERE rating=2)                    AS r2,
      COUNT(*) FILTER (WHERE rating=3)                    AS r3,
      COUNT(*) FILTER (WHERE rating=4)                    AS r4,
      COUNT(*) FILTER (WHERE rating=5)                    AS r5
    FROM public.reviews
    WHERE product_id = pid AND is_approved = true AND deleted_at IS NULL
  ) s
  WHERE product_id = pid;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_refresh_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_review_stats();


-- =============================================================================
-- BLOG
-- =============================================================================

CREATE TABLE public.blog_posts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(255) UNIQUE NOT NULL,
  title             VARCHAR(255) NOT NULL,
  excerpt           TEXT,
  body              TEXT,        -- Markdown / MDX
  cover_image_url   TEXT,
  author_id         UUID        NOT NULL REFERENCES public.profiles (id),

  category          VARCHAR(50), -- 'dev_diary'|'retro_guide'|'company_news'|'taiwan_culture'|'product_spotlight'
  tags              TEXT[]      DEFAULT '{}',

  status            post_status NOT NULL DEFAULT 'draft',
  is_featured       BOOLEAN     NOT NULL DEFAULT false,
  view_count        INTEGER     NOT NULL DEFAULT 0,

  related_product_id UUID       REFERENCES public.products (id),

  seo_title         VARCHAR(255),
  seo_description   TEXT,

  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_blog_posts_slug     ON public.blog_posts (slug);
CREATE INDEX idx_blog_posts_status   ON public.blog_posts (status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_blog_posts_category ON public.blog_posts (category);
CREATE INDEX idx_blog_posts_tags     ON public.blog_posts USING GIN (tags);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts (is_featured) WHERE is_featured = true AND deleted_at IS NULL;


-- ── Blog comments ──────────────────────────────────────────────────────────────

CREATE TABLE public.blog_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES public.blog_posts (id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES public.profiles (id),
  parent_id   UUID        REFERENCES public.blog_comments (id),
  body        TEXT        NOT NULL,
  is_approved BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_blog_comments_post   ON public.blog_comments (post_id, is_approved);
CREATE INDEX idx_blog_comments_parent ON public.blog_comments (parent_id);


-- =============================================================================
-- CART
-- =============================================================================

CREATE TABLE public.cart_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  VARCHAR(255),                       -- guest cart token
  user_id     UUID        REFERENCES public.profiles (id),
  product_id  UUID        NOT NULL REFERENCES public.products (id),
  quantity    INTEGER     NOT NULL DEFAULT 1,
  format      cart_format NOT NULL DEFAULT 'physical_cib',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_owner CHECK (session_id IS NOT NULL OR user_id IS NOT NULL)
);

CREATE INDEX idx_cart_items_user    ON public.cart_items (user_id);
CREATE INDEX idx_cart_items_session ON public.cart_items (session_id);


-- =============================================================================
-- WISHLIST
-- =============================================================================

CREATE TABLE public.wishlist_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  product_id  UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON public.wishlist_items (user_id);


-- =============================================================================
-- NEWSLETTER
-- =============================================================================

CREATE TABLE public.newsletter_subscribers (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            CITEXT      UNIQUE NOT NULL,
  user_id          UUID        REFERENCES public.profiles (id),
  first_name       VARCHAR(100),
  status           VARCHAR(20) NOT NULL DEFAULT 'active',  -- active | unsubscribed
  source           VARCHAR(50),                             -- 'footer'|'popup'|'checkout'
  subscribed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at  TIMESTAMPTZ
);


-- =============================================================================
-- WAITLIST  (restock notifications)
-- =============================================================================

CREATE TABLE public.waitlist (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  email       CITEXT      NOT NULL,
  user_id     UUID        REFERENCES public.profiles (id),
  notified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, email)
);

CREATE INDEX idx_waitlist_product ON public.waitlist (product_id);


-- =============================================================================
-- SHIPPING ZONES & RATES
-- =============================================================================

CREATE TABLE public.shipping_zones (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  country_codes TEXT[]      NOT NULL DEFAULT '{}',
  is_active     BOOLEAN     NOT NULL DEFAULT true
);

CREATE TABLE public.shipping_rates (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id            UUID        NOT NULL REFERENCES public.shipping_zones (id) ON DELETE CASCADE,
  name               VARCHAR(100) NOT NULL,
  min_weight_g       INTEGER     NOT NULL DEFAULT 0,
  max_weight_g       INTEGER,
  base_rate          NUMERIC(10,2) NOT NULL,
  per_kg_rate        NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_above         NUMERIC(10,2),
  estimated_days_min SMALLINT,
  estimated_days_max SMALLINT,
  carrier            VARCHAR(50),
  is_active          BOOLEAN     NOT NULL DEFAULT true
);


-- =============================================================================
-- CONTACT MESSAGES
-- =============================================================================

CREATE TABLE public.contact_messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(200) NOT NULL,
  email        CITEXT       NOT NULL,
  subject      VARCHAR(255),
  message      TEXT         NOT NULL,
  user_id      UUID         REFERENCES public.profiles (id),
  order_number VARCHAR(30),
  status       VARCHAR(20)  NOT NULL DEFAULT 'open',  -- open | in_progress | resolved
  admin_reply  TEXT,
  replied_at   TIMESTAMPTZ,
  replied_by   UUID         REFERENCES public.profiles (id),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_messages_status ON public.contact_messages (status, created_at DESC);
CREATE INDEX idx_contact_messages_email  ON public.contact_messages (email);


-- =============================================================================
-- UPDATED_AT triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$
DECLARE tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles','developer_partners','products','orders','reviews','blog_posts','cart_items'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END;
$$;


-- =============================================================================
-- ORDER NUMBER SEQUENCE
-- =============================================================================

CREATE SEQUENCE public.order_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ITG-' || to_char(now(), 'YYYY') || '-' ||
                        lpad(nextval('public.order_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_generate_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();


-- =============================================================================
-- INVENTORY trigger — decrement on order item insert
-- =============================================================================

CREATE OR REPLACE FUNCTION public.decrement_inventory_on_order()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.format = 'physical_cib' THEN
    UPDATE public.inventory
    SET quantity_physical = quantity_physical - NEW.quantity,
        updated_at        = now()
    WHERE product_id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_items_decrement_inventory
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.decrement_inventory_on_order();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_partners    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_review_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages      ENABLE ROW LEVEL SECURITY;


-- ── profiles ─────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_self"  ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_admin_all"    ON public.profiles FOR ALL USING (public.is_admin());

-- ── user_addresses ────────────────────────────────────────────────────────────
CREATE POLICY "addresses_own"   ON public.user_addresses FOR ALL USING (user_id = auth.uid());
CREATE POLICY "addresses_admin" ON public.user_addresses FOR ALL USING (public.is_admin());

-- ── developer_partners ───────────────────────────────────────────────────────
CREATE POLICY "partners_public_read"    ON public.developer_partners FOR SELECT USING (status = 'active');
CREATE POLICY "partners_admin_all"      ON public.developer_partners FOR ALL USING (public.is_admin());
CREATE POLICY "partners_own_read"       ON public.developer_partners FOR SELECT USING (user_id = auth.uid());

-- ── products ─────────────────────────────────────────────────────────────────
CREATE POLICY "products_public_read"  ON public.products FOR SELECT USING (published_at IS NOT NULL AND deleted_at IS NULL);
CREATE POLICY "products_admin_all"    ON public.products FOR ALL USING (public.is_admin());

-- ── product_images ────────────────────────────────────────────────────────────
CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_admin_all"   ON public.product_images FOR ALL USING (public.is_admin());

-- ── inventory (admin-only write; anonymous read for stock status) ────────────
CREATE POLICY "inventory_public_read" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "inventory_admin_all"   ON public.inventory FOR ALL USING (public.is_admin());

-- ── inventory_log ─────────────────────────────────────────────────────────────
CREATE POLICY "inventory_log_admin" ON public.inventory_log FOR ALL USING (public.is_admin());

-- ── coupons ───────────────────────────────────────────────────────────────────
CREATE POLICY "coupons_admin_all"   ON public.coupons FOR ALL USING (public.is_admin());
-- Authenticated users may read active coupons to validate codes at checkout
CREATE POLICY "coupons_auth_read"   ON public.coupons FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- ── orders ────────────────────────────────────────────────────────────────────
CREATE POLICY "orders_own"          ON public.orders FOR SELECT USING (user_id = auth.uid() OR guest_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "orders_insert_auth"  ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "orders_admin_all"    ON public.orders FOR ALL USING (public.is_admin());

-- ── order_items ──────────────────────────────────────────────────────────────
CREATE POLICY "order_items_own"     ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (user_id = auth.uid())));
CREATE POLICY "order_items_admin"   ON public.order_items FOR ALL USING (public.is_admin());

-- ── order_status_history ──────────────────────────────────────────────────────
CREATE POLICY "order_status_own"    ON public.order_status_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_status_history.order_id AND user_id = auth.uid()));
CREATE POLICY "order_status_admin"  ON public.order_status_history FOR ALL USING (public.is_admin());

-- ── reviews ───────────────────────────────────────────────────────────────────
CREATE POLICY "reviews_public_read"   ON public.reviews FOR SELECT USING (is_approved = true AND deleted_at IS NULL);
CREATE POLICY "reviews_own_write"     ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_own_update"    ON public.reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "reviews_admin_all"     ON public.reviews FOR ALL USING (public.is_admin());

-- ── review_votes ──────────────────────────────────────────────────────────────
CREATE POLICY "review_votes_auth"     ON public.review_votes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "review_votes_admin"    ON public.review_votes FOR ALL USING (public.is_admin());

-- ── product_review_stats ──────────────────────────────────────────────────────
CREATE POLICY "review_stats_public"   ON public.product_review_stats FOR SELECT USING (true);
CREATE POLICY "review_stats_admin"    ON public.product_review_stats FOR ALL USING (public.is_admin());

-- ── blog_posts ────────────────────────────────────────────────────────────────
CREATE POLICY "blog_public_read"      ON public.blog_posts FOR SELECT USING (status = 'published' AND deleted_at IS NULL);
CREATE POLICY "blog_admin_all"        ON public.blog_posts FOR ALL USING (public.is_admin());

-- ── blog_comments ─────────────────────────────────────────────────────────────
CREATE POLICY "blog_comments_public"  ON public.blog_comments FOR SELECT USING (is_approved = true AND deleted_at IS NULL);
CREATE POLICY "blog_comments_insert"  ON public.blog_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "blog_comments_admin"   ON public.blog_comments FOR ALL USING (public.is_admin());

-- ── cart_items ────────────────────────────────────────────────────────────────
CREATE POLICY "cart_own_user"         ON public.cart_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "cart_own_session"      ON public.cart_items FOR ALL USING (session_id IS NOT NULL);  -- guest cart via anon session
CREATE POLICY "cart_admin"            ON public.cart_items FOR ALL USING (public.is_admin());

-- ── wishlist ──────────────────────────────────────────────────────────────────
CREATE POLICY "wishlist_own"          ON public.wishlist_items FOR ALL USING (user_id = auth.uid());

-- ── newsletter ────────────────────────────────────────────────────────────────
CREATE POLICY "newsletter_own"        ON public.newsletter_subscribers FOR ALL USING (email = (SELECT email FROM public.profiles WHERE id = auth.uid()) OR user_id = auth.uid());
CREATE POLICY "newsletter_insert"     ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);  -- allow anonymous subscribe
CREATE POLICY "newsletter_admin"      ON public.newsletter_subscribers FOR ALL USING (public.is_admin());

-- ── waitlist ──────────────────────────────────────────────────────────────────
CREATE POLICY "waitlist_own"          ON public.waitlist FOR ALL USING (user_id = auth.uid() OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "waitlist_insert"       ON public.waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "waitlist_admin"        ON public.waitlist FOR ALL USING (public.is_admin());

-- ── shipping ──────────────────────────────────────────────────────────────────
CREATE POLICY "shipping_public_read"  ON public.shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "shipping_rates_read"   ON public.shipping_rates FOR SELECT USING (is_active = true);
CREATE POLICY "shipping_admin"        ON public.shipping_zones FOR ALL USING (public.is_admin());
CREATE POLICY "shipping_rates_admin"  ON public.shipping_rates FOR ALL USING (public.is_admin());

-- ── contact_messages ──────────────────────────────────────────────────────────
CREATE POLICY "contact_insert"        ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_own_read"      ON public.contact_messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "contact_admin"         ON public.contact_messages FOR ALL USING (public.is_admin());


-- =============================================================================
-- STORAGE BUCKETS
-- Create via Supabase Dashboard → Storage, or via API. Listed here for reference.
--
-- bucket: "product-images"   (public)   → box art, screenshots, cartridge photos
-- bucket: "blog-images"      (public)   → cover images, inline blog images
-- bucket: "partner-logos"    (public)   → developer partner logos
-- bucket: "avatars"          (public)   → user profile pictures
-- bucket: "digital-games"    (private)  → .nes / .rom download files
-- =============================================================================


-- =============================================================================
-- REALTIME  (enable on tables that benefit from live updates)
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;


-- =============================================================================
-- USEFUL VIEWS
-- =============================================================================

-- Products with live inventory & review stats joined
CREATE OR REPLACE VIEW public.products_full AS
SELECT
  p.*,
  COALESCE(i.quantity_physical - i.quantity_reserved, 0) AS available,
  i.quantity_physical,
  i.quantity_reserved,
  i.quantity_digital,
  r.review_count,
  r.average_rating,
  r.rating_1, r.rating_2, r.rating_3, r.rating_4, r.rating_5
FROM public.products p
LEFT JOIN public.inventory             i ON i.product_id = p.id
LEFT JOIN public.product_review_stats  r ON r.product_id = p.id
WHERE p.deleted_at IS NULL;

-- Orders with item count & customer info
CREATE OR REPLACE VIEW public.orders_admin AS
SELECT
  o.*,
  COUNT(oi.id) AS item_count,
  pr.first_name || ' ' || pr.last_name AS customer_name
FROM public.orders o
LEFT JOIN public.order_items  oi ON oi.order_id = o.id
LEFT JOIN public.profiles     pr ON pr.id = o.user_id
GROUP BY o.id, pr.first_name, pr.last_name;
