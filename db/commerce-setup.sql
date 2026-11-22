-- Run after db/schema.sql. Public reads; only authenticated admins can upload.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media_public_read" ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "media_admin_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "media_admin_update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'media' AND public.is_admin())
WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "media_admin_delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND public.is_admin());

-- Checkout only reads shipping/coupon information through trusted server code.
-- Remove client-side guest-order insertion; all paid orders are server-created.
DROP POLICY IF EXISTS "orders_insert_auth" ON public.orders;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "cart_own_session" ON public.cart_items;

CREATE OR REPLACE FUNCTION public.protect_profile_identity()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user <> 'postgres' AND auth.role() <> 'service_role'
     AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.email IS DISTINCT FROM OLD.email) THEN
    RAISE EXCEPTION 'Profile role and email cannot be changed from the client';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER protect_profile_identity_before_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_identity();

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_unique
ON public.orders (payment_intent_id) WHERE payment_intent_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.finalize_paid_order(p_order UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_order public.orders%ROWTYPE;
  item RECORD;
  updated_count INTEGER;
BEGIN
  SELECT * INTO current_order FROM public.orders WHERE id = p_order FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF current_order.status = 'paid' THEN RETURN; END IF;
  IF current_order.status <> 'pending' THEN RAISE EXCEPTION 'Order cannot be finalized'; END IF;

  UPDATE public.orders SET status = 'paid', updated_at = now() WHERE id = p_order;
  FOR item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order AND format = 'physical_cib' LOOP
    UPDATE public.inventory SET quantity_physical = quantity_physical - item.quantity, updated_at = now()
    WHERE product_id = item.product_id AND quantity_physical - quantity_reserved >= item.quantity;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count = 0 THEN
      UPDATE public.orders SET admin_notes = COALESCE(admin_notes || E'\n', '') || 'Inventory shortage after PayPal capture: ' || item.product_id::text
      WHERE id = p_order;
    END IF;
  END LOOP;
  IF current_order.coupon_id IS NOT NULL THEN
    UPDATE public.coupons SET uses_count = uses_count + 1 WHERE id = current_order.coupon_id;
  END IF;
  INSERT INTO public.order_status_history (order_id, status, note) VALUES (p_order, 'paid', 'PayPal capture completed');
END;
$$;
REVOKE ALL ON FUNCTION public.finalize_paid_order(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_paid_order(UUID) TO service_role;

INSERT INTO public.shipping_zones (name, country_codes)
SELECT 'Taiwan', ARRAY['TW'] WHERE NOT EXISTS (SELECT 1 FROM public.shipping_zones WHERE name = 'Taiwan');
INSERT INTO public.shipping_zones (name, country_codes)
SELECT 'North America', ARRAY['US','CA'] WHERE NOT EXISTS (SELECT 1 FROM public.shipping_zones WHERE name = 'North America');
INSERT INTO public.shipping_zones (name, country_codes)
SELECT 'Europe', ARRAY['GB','DE','FR','NL','SE','NO','DK','ES','IT','PL','CH','AT','BE'] WHERE NOT EXISTS (SELECT 1 FROM public.shipping_zones WHERE name = 'Europe');
INSERT INTO public.shipping_zones (name, country_codes)
SELECT 'Asia-Pacific', ARRAY['AU','NZ','JP','KR','HK','SG','PH','TH','MY','ID','VN'] WHERE NOT EXISTS (SELECT 1 FROM public.shipping_zones WHERE name = 'Asia-Pacific');

INSERT INTO public.shipping_rates (zone_id, name, base_rate, free_above, estimated_days_min, estimated_days_max)
SELECT z.id, r.name, r.amount, r.free_above, r.days_min, r.days_max
FROM public.shipping_zones z
CROSS JOIN (VALUES
  ('Standard Airmail', 12::numeric, 150::numeric, 10::smallint, 21::smallint),
  ('EMS Express', 24::numeric, NULL::numeric, 5::smallint, 10::smallint),
  ('EMS Priority', 32::numeric, NULL::numeric, 3::smallint, 7::smallint)
) r(name, amount, free_above, days_min, days_max)
WHERE z.name IN ('Taiwan', 'North America', 'Europe', 'Asia-Pacific')
AND NOT EXISTS (SELECT 1 FROM public.shipping_rates existing WHERE existing.zone_id = z.id AND existing.name = r.name);
