# Commerce launch setup

The owner tools are under `/admin`. Checkout uses PayPal Orders v2 through server routes in `api/checkout`. It never confirms an order before PayPal capture succeeds. PayPal may offer guest card payment on its hosted page, depending on account and buyer eligibility. A guaranteed on-site card form requires a separately approved PayPal card integration.

## 1. Database

1. Use the Supabase project named in `.env.local`, or replace `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with a new project's values.
2. On a new project, run `db/schema.sql` in the Supabase SQL editor. On an existing project, inspect the schema first and apply only missing objects.
3. Run `db/commerce-setup.sql` in the SQL editor. This adds the media bucket and policies, shipping rates, payment reference uniqueness, and the payment finalization function.
4. Run `db/seed.mjs` once with `SUPABASE_SERVICE_KEY` set to that project's service role key. Review product prices, stock, descriptions, and images before publishing. Do not rerun the seed after editing products in the dashboard; the current seed uses upserts and could replace edited fields.
5. Create the owner's account through `/account`, then promote the exact email in the SQL editor: `UPDATE public.profiles SET role = 'admin' WHERE email = 'owner@example.com';`. Confirm exactly one row changed. Admin access also depends on the RLS policies in `db/schema.sql`.

## 2. Server configuration

Set these as server environment variables in Vercel and in `.env.local` for local testing:

```text
SUPABASE_URL=https://PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_ENV=sandbox
SITE_URL=https://YOUR_DOMAIN
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are public browser values. The service role key and PayPal secret must never use the `VITE_` prefix. `SITE_URL` must match the actual storefront origin; locally it can be `http://127.0.0.1:5173` (or the Vite port shown in the terminal).

## 3. PayPal

Create a PayPal Business REST app, start with sandbox credentials, and register the webhook URL `https://YOUR_DOMAIN/api/checkout/webhook` for `CHECKOUT.ORDER.APPROVED`. Put the registered webhook ID in `PAYPAL_WEBHOOK_ID`. Test one successful payment and one cancellation. Inspect the order in Supabase and verify its status is `paid` only after capture. Then use live credentials and set `PAYPAL_ENV=live`. The `/admin` Payments view reports whether the basic server variables are present; it does not prove the PayPal account is approved or that a test payment succeeded.

## 4. Owner workflow

- Products: title, description, price, physical stock, status, box art, screenshots, and SEO fields.
- Dev Stories: draft/published posts, Markdown body, cover image, tags.
- Media: upload reusable JPG, PNG, WebP, or AVIF images; select the URL field to copy the URL.
- Shipping: edit countries, each method's price, and free shipping threshold. Checkout prices are calculated from these rows.
- Coupons: create, activate/deactivate, and delete codes. Checkout validates the code server side.
- Orders: review paid orders and fulfillment status. Refunds are performed in PayPal until a refund API workflow is built.

## Launch checks

- Confirm the final product catalog and stock are in Supabase. Mock fallback content is for local preview only and cannot be purchased.
- Confirm every shipping destination has an active zone and active rate for the selected method.
- Test PayPal with a foreign buyer account, including whether card checkout appears. The hosted card option is controlled by PayPal eligibility.
- Confirm order totals, coupon use counts, and inventory after payment. Keep the store in sandbox mode until these pass.
- Configure a production email service for receipts and shipping updates. The current notification helper only posts to an endpoint if configured; it does not itself deliver email.
