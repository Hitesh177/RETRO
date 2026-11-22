# Storefront QA Checklist

Date: 2026-06-05
Target: http://localhost:5173/

## Route Smoke

| Case | Expected | Status |
| --- | --- | --- |
| Home route `/` | Hero renders with brand/storefront content and no console errors. | Pass |
| Catalog route `/games` | Product grid and filters render with no console errors. | Pass |
| Product route `/games/mr-lee-alishan-tea-collector` | Correct product detail renders with add-to-cart controls. | Pass |
| Invalid product slug | Shows a product-not-found state instead of another game. | Pass after fix |
| Cart route `/cart` | Cart shell renders empty and filled states. | Pass |
| Checkout route `/checkout` with empty cart | Blocks checkout and prompts user to browse games. | Pass after fix |
| Account route `/account` | Auth screen renders. | Pass |
| Blog/about/FAQ/developers/clients/contact/legal routes | Pages render without console errors. | Pass |
| Unknown route | 404 screen renders. | Pass |

## Purchase Flow

| Case | Expected | Status |
| --- | --- | --- |
| Add in-stock product to cart | Cart badge and cart page include product. | Pass |
| Apply valid coupon `WELCOME10` | Discount appears in order summary. | Pass |
| Proceed to checkout from cart | Step 1 review renders selected items and totals. | Pass |
| Continue from Step 2 with blank required fields | Checkout remains on info step and shows validation message. | Pass after fix |
| Fill required info and continue | Payment step renders real entered address/email, no fake fallback data. | Pass after fix |
| Place order without accepting terms | Place Order button remains disabled. | Pass |
| Accept terms and place order | Confirmation renders order number, email, total, and purchased items. | Pass after fix |

## Placeholder/Input Validation

| Case | Expected | Status |
| --- | --- | --- |
| Checkout customer info placeholders | Required fields reject blank values, invalid email, incomplete address, invalid city, invalid postal/ZIP, and invalid optional phone. | Pass |
| Checkout billing fields | Billing fields become required when billing address is not the same as shipping. | Pass |
| Checkout cardholder placeholder | Card payment requires cardholder name before placing order. | Pass |
| Contact form placeholders | Name, email, and message are trimmed and validated before submission. | Pass |
| Newsletter placeholders | Homepage, blog list, and blog post newsletter emails validate before success/submission. | Pass |
| Product waitlist placeholders | Restock email fields validate before joining waitlist. | Pass |
| Blog comment placeholders | Comment email and minimum comment length validate before success. | Pass |
| FAQ tracking placeholders | Order number and email validate before displaying tracking status. | Pass |

## Validation Commands

| Command | Result |
| --- | --- |
| `npm run build` | Pass |
| `npm run lint` | Fails on existing repo-wide style/config issues, mostly `react/prop-types`, unescaped text, and admin table key warnings. No build blocker found. |

## Bugs Fixed In This Pass

- Checkout no longer starts when the cart is empty.
- Checkout Step 2 now validates required customer/shipping fields and email format.
- Payment review no longer displays fake fallback customer data.
- Confirmation preserves order details after clearing the cart.
- Confirmation now lists purchased items for physical orders.
- Invalid product URLs no longer render the first catalog product.
