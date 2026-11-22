/**
 * ITG-SOFT Legal Pages
 * Privacy Policy · Terms & Conditions · Shipping Policy · Cookie Policy
 */

import { useState } from 'react'
import SeoHead from '../components/SeoHead'

// ── Shared layout shell ──────────────────────────────────────────────────────
function LegalShell({ title, lastUpdated, sections, onNav, seo }) {
  const [active, setActive] = useState(sections[0].id)

  return (
    <div className="page" style={{ background: '#f8f7f4' }}>
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonical={seo.canonical}
        noIndex={false}
      />

      {/* Header bar */}
      <div style={{ background: 'var(--darker)', borderBottom: '3px solid var(--orange)', padding: '28px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              onClick={() => onNav?.('home')}
              style={{ color: '#888', fontSize: 15, cursor: 'pointer' }}
            >Home</span>
            <span style={{ color: '#555' }}>›</span>
            <span style={{ color: 'var(--orange)', fontSize: 15, fontFamily: 'var(--pixel)', letterSpacing: '0.06em' }}>
              {title}
            </span>
          </div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, fontFamily: 'var(--heading)' }}>{title}</h1>
          <p style={{ color: '#666', fontSize: 15, marginTop: 6 }}>Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>

        {/* Sidebar TOC */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'white', border: '1px solid #e8e4df', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: 'var(--darker)', padding: '12px 16px', fontFamily: 'var(--pixel)', fontSize: 12, color: 'var(--orange)', letterSpacing: '0.1em' }}>
              CONTENTS
            </div>
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  setActive(s.id)
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px',
                  background: active === s.id ? 'rgba(240,149,38,0.08)' : 'white',
                  borderLeft: `3px solid ${active === s.id ? 'var(--orange)' : 'transparent'}`,
                  border: 'none', borderBottom: i < sections.length - 1 ? '1px solid #f0ece6' : 'none',
                  fontSize: 15, fontWeight: active === s.id ? 700 : 400,
                  color: active === s.id ? 'var(--orange)' : '#555',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {i + 1}. {s.label}
              </button>
            ))}
          </div>

          {/* Back links */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => onNav?.('faq')} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '8px 12px', fontSize: 15, color: '#666', cursor: 'pointer', textAlign: 'left' }}>
              → FAQ & Support
            </button>
            <button onClick={() => onNav?.('contact')} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '8px 12px', fontSize: 15, color: '#666', cursor: 'pointer', textAlign: 'left' }}>
              → Contact Us
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 720 }}>
          {sections.map(s => (
            <section key={s.id} id={s.id} style={{ marginBottom: 48, scrollMarginTop: 100 }}>
              <h2 style={{
                fontFamily: 'var(--heading)', fontSize: 22, fontWeight: 800,
                color: 'var(--dark)', marginBottom: 16, paddingBottom: 10,
                borderBottom: '2px solid #f0ece6',
              }}>{s.label}</h2>
              <div style={{ fontSize: 17, lineHeight: 1.8, color: '#444' }}>
                {s.content}
              </div>
            </section>
          ))}

          {/* Footer note */}
          <div style={{ background: 'rgba(240,149,38,0.06)', border: '1px solid rgba(240,149,38,0.2)', borderRadius: 8, padding: '16px 20px', marginTop: 32 }}>
            <p style={{ fontSize: 16, color: '#666', margin: 0 }}>
              Questions about this policy? Contact us at{' '}
              <a href="mailto:support@itg-soft.tw" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: 600 }}>
                support@itg-soft.tw
              </a>
              {' '}— we respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Prose helpers ────────────────────────────────────────────────────────────
function P({ children }) {
  return <p style={{ marginBottom: 14 }}>{children}</p>
}
function H3({ children }) {
  return <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--dark)', margin: '20px 0 8px', fontFamily: 'var(--sans)' }}>{children}</h3>
}
function UL({ items }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 14 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 6 }}>{item}</li>
      ))}
    </ul>
  )
}
function InfoBox({ children }) {
  return (
    <div style={{ background: '#e8f4fd', border: '1px solid #b3d9f7', borderRadius: 6, padding: '12px 16px', marginBottom: 14, fontSize: 16 }}>
      {children}
    </div>
  )
}
function Table({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 14 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#faf9f7' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 14px', border: '1px solid #e8e4df', verticalAlign: 'top', fontWeight: j === 0 ? 600 : 400, width: j === 0 ? 180 : undefined }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// 1. PRIVACY POLICY
// ════════════════════════════════════════════════════════════════════════════════
export function PrivacyPolicyPage({ onNav }) {
  const sections = [
    {
      id: 'overview', label: 'Overview',
      content: (
        <>
          <P>Yī Tái Yóuxì Software Company (<strong>"ITG-SOFT"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, <strong>"our"</strong>), registered in Taichung City, Taiwan, operates the website itg-soft.tw and is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.</P>
          <P>This policy applies to all visitors, customers, and users of itg-soft.tw and any associated services. By using our website you agree to the collection and use of information in accordance with this policy.</P>
          <InfoBox><strong>GDPR Compliance:</strong> If you are located in the European Economic Area (EEA), this policy covers your rights under the General Data Protection Regulation (GDPR).</InfoBox>
        </>
      ),
    },
    {
      id: 'data-collected', label: 'Data We Collect',
      content: (
        <>
          <H3>Information You Provide Directly</H3>
          <UL items={[
            'Full name and email address (account creation, newsletter signup, checkout)',
            'Shipping and billing address (physical orders)',
            'Order history and purchase records',
            'Messages and enquiries sent via the contact form',
            'Reviews and ratings you submit for products',
          ]} />
          <H3>Information Collected Automatically</H3>
          <UL items={[
            'IP address and approximate geographic location',
            'Browser type, operating system, and device type',
            'Pages visited, time spent, and referral source',
            'Shopping cart contents and wishlist items (via cookies)',
            'Clickstream data and interaction events',
          ]} />
          <H3>Payment Information</H3>
          <P>We do not store credit card numbers or full payment details on our servers. Payment is processed by approved third-party payment providers and we receive only a transaction ID, partial card details when available, and billing country for record-keeping.</P>
        </>
      ),
    },
    {
      id: 'how-we-use', label: 'How We Use Your Data',
      content: (
        <>
          <P>We use your personal data for the following purposes:</P>
          <Table rows={[
            ['Order Fulfilment', 'Processing payments, shipping physical cartridges, sending tracking numbers and delivery confirmation.'],
            ['Account Management', 'Creating and managing your customer account, order history, and digital download access.'],
            ['Customer Support', 'Responding to enquiries, resolving disputes, and providing after-sales support.'],
            ['Marketing (opt-in)', 'Sending newsletters, new release announcements, and promotional offers — only if you have opted in.'],
            ['Analytics', 'Understanding site usage to improve performance, content, and user experience.'],
            ['Legal Obligations', 'Complying with tax, export, and consumer protection laws in Taiwan, the EU, and other jurisdictions.'],
          ]} />
          <InfoBox>
            <strong>Legal Basis (GDPR):</strong> We process your data under the following bases: <em>contract performance</em> (orders), <em>legitimate interests</em> (analytics, fraud prevention), and <em>consent</em> (marketing emails, cookies).
          </InfoBox>
        </>
      ),
    },
    {
      id: 'sharing', label: 'Data Sharing',
      content: (
        <>
          <P>We do not sell, trade, or rent your personal data to third parties. We share data only with trusted service providers who operate under strict data processing agreements:</P>
          <Table rows={[
            ['Payment provider', 'Payment processing for card or wallet transactions, subject to the provider\'s privacy policy.'],
            ['Shipping carriers', 'Name, address, phone — shared with courier services (DHL, Taiwan Post, FedEx) to fulfil your order.'],
            ['Google Analytics', 'Anonymised usage data for site analytics. Data is pseudonymised and stored on Google servers.'],
            ['Mailchimp', 'Email address (newsletter subscribers only, with explicit consent).'],
            ['Supabase', 'Secure cloud database hosting for order and account data. Servers located in the EU/US.'],
          ]} />
          <P>We may disclose personal data if required by law, court order, or to protect the rights and safety of ITG-SOFT, our customers, or the public.</P>
        </>
      ),
    },
    {
      id: 'retention', label: 'Data Retention',
      content: (
        <>
          <P>We retain your personal data for as long as necessary to fulfil the purposes described in this policy:</P>
          <UL items={[
            'Order records: 7 years (legal/tax obligation under Taiwan Commercial Law)',
            'Account data: until account deletion is requested',
            'Newsletter subscription: until you unsubscribe',
            'Analytics data: 26 months (Google Analytics default)',
            'Support correspondence: 3 years',
          ]} />
          <P>You may request deletion of your data at any time by contacting privacy@itg-soft.tw. We will action deletion requests within 30 days, subject to legal retention requirements.</P>
        </>
      ),
    },
    {
      id: 'your-rights', label: 'Your Rights',
      content: (
        <>
          <P>Depending on your location, you have the following rights regarding your personal data:</P>
          <Table rows={[
            ['Right to Access', 'Request a copy of all personal data we hold about you.'],
            ['Right to Rectification', 'Request correction of inaccurate or incomplete data.'],
            ['Right to Erasure', 'Request deletion of your data ("right to be forgotten").'],
            ['Right to Portability', 'Receive your data in a machine-readable format.'],
            ['Right to Object', 'Object to processing of your data for marketing purposes.'],
            ['Right to Restrict', 'Request that we limit how we use your data in certain circumstances.'],
            ['Right to Withdraw Consent', 'Withdraw marketing consent at any time via unsubscribe links or by contacting us.'],
          ]} />
          <P>To exercise any of these rights, email <strong>privacy@itg-soft.tw</strong> with your request. We will respond within 30 days. EEA residents may also file a complaint with their national data protection authority.</P>
        </>
      ),
    },
    {
      id: 'security', label: 'Data Security',
      content: (
        <>
          <P>We take data security seriously and implement the following measures:</P>
          <UL items={[
            'SSL/TLS encryption on all pages (HTTPS)',
            'Passwords hashed with bcrypt (never stored in plaintext)',
            'PCI DSS-compliant payment processing via approved third-party providers',
            'Database access restricted by role-based permissions',
            'Regular security audits and vulnerability testing',
            'Two-factor authentication on all admin accounts',
          ]} />
          <P>While we use industry-standard security measures, no method of transmission over the Internet is 100% secure. In the event of a data breach affecting your rights, we will notify you within 72 hours in accordance with GDPR Article 33.</P>
        </>
      ),
    },
    {
      id: 'international', label: 'International Transfers',
      content: (
        <>
          <P>ITG-SOFT is based in Taichung City, Taiwan. If you are accessing our site from outside Taiwan, your data will be transferred to and processed in Taiwan and potentially other countries (e.g., EU/US for cloud service providers).</P>
          <P>For transfers to countries outside the EEA, we rely on Standard Contractual Clauses (SCCs) and adequacy decisions where applicable to ensure your data is protected to GDPR standards.</P>
        </>
      ),
    },
    {
      id: 'children', label: "Children's Privacy",
      content: (
        <>
          <P>Our website and services are not directed at children under the age of 13. We do not knowingly collect personal data from children under 13. If we become aware that we have collected data from a child under 13, we will delete it promptly.</P>
          <P>If you are a parent or guardian and believe your child has provided personal data to us, please contact privacy@itg-soft.tw.</P>
        </>
      ),
    },
    {
      id: 'changes', label: 'Changes to This Policy',
      content: (
        <>
          <P>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. The date at the top of this page reflects the most recent update.</P>
          <P>For significant changes, we will notify registered customers by email at least 14 days before the changes take effect. Continued use of the website after that date constitutes acceptance of the updated policy.</P>
          <P>Contact us: <strong>privacy@itg-soft.tw</strong> · Yī Tái Yóuxì Software Company, Taichung City, Taiwan</P>
        </>
      ),
    },
  ]

  return (
    <LegalShell
      title="Privacy Policy"
      lastUpdated="May 15, 2026"
      sections={sections}
      onNav={onNav}
      seo={{
        title: 'Privacy Policy — ITG-SOFT',
        description: 'How ITG-SOFT collects, uses, and protects your personal data. GDPR compliant. Based in Taichung, Taiwan.',
        canonical: '/privacy',
      }}
    />
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// 2. TERMS & CONDITIONS
// ════════════════════════════════════════════════════════════════════════════════
export function TermsPage({ onNav }) {
  const sections = [
    {
      id: 'acceptance', label: 'Acceptance of Terms',
      content: (
        <>
          <P>By accessing or using itg-soft.tw, placing an order, or creating an account, you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.</P>
          <P>These Terms constitute the entire agreement between you and Yī Tái Yóuxì Software Company ("ITG-SOFT") regarding use of this website and supersede any prior agreements.</P>
          <InfoBox><strong>Entity:</strong> Yī Tái Yóuxì Software Company · Taichung City, Taiwan · support@itg-soft.tw</InfoBox>
        </>
      ),
    },
    {
      id: 'products', label: 'Products & Orders',
      content: (
        <>
          <H3>Product Descriptions</H3>
          <P>We endeavour to display our products as accurately as possible. Colours and packaging details may vary slightly from photographs due to screen calibration and manufacturing tolerances. All games are original homebrew titles and are NOT reproductions or unauthorised copies of Nintendo or any other company's intellectual property.</P>
          <H3>Pricing</H3>
          <P>All prices are listed in USD (US Dollars) unless otherwise stated. Prices are subject to change without notice. The price applicable to your order is the price displayed at the time you complete checkout.</P>
          <H3>Order Acceptance</H3>
          <P>Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel any order at our discretion, including in cases of pricing errors, suspected fraud, or stock inaccuracies. You will receive a full refund if your order is cancelled by us.</P>
          <H3>Pre-Orders</H3>
          <P>Pre-order release dates are estimates only. ITG-SOFT is not liable for delays beyond our control. You may cancel a pre-order at any time before shipment for a full refund.</P>
        </>
      ),
    },
    {
      id: 'payment', label: 'Payment',
      content: (
        <>
          <P>We accept payment via approved third-party payment providers. By providing payment information, you represent that you are authorised to use the payment method and that the information is accurate.</P>
          <P>All transactions are encrypted and processed by PCI DSS-compliant third-party payment processors. ITG-SOFT does not store full credit card details on its servers.</P>
          <P>Orders are charged at the time of checkout. For pre-orders, payment is collected immediately to secure your copy. If a pre-order is cancelled, you will receive a full refund.</P>
        </>
      ),
    },
    {
      id: 'shipping', label: 'Shipping & Delivery',
      content: (
        <>
          <P>Physical products are shipped from Taichung City, Taiwan. Shipping times and costs are calculated at checkout based on your delivery address. Please refer to our <strong>Shipping Policy</strong> for full details on shipping zones, rates, and estimated delivery times.</P>
          <P>Risk of loss and title for physical products passes to you upon delivery to the carrier. ITG-SOFT is not responsible for delays caused by customs, natural disasters, carrier errors, or other events outside our control.</P>
          <P>International orders may be subject to import duties and taxes, which are the buyer's responsibility.</P>
        </>
      ),
    },
    {
      id: 'returns', label: 'Returns & Refunds',
      content: (
        <>
          <H3>Physical Products</H3>
          <P>We accept returns within 30 days of delivery for items in original, unopened condition. To initiate a return, email support@itg-soft.tw with your order number and reason for return. Return shipping costs are the customer's responsibility unless the item is defective or incorrectly sent.</P>
          <P>Refunds are processed within 5–10 business days of receiving the returned item. Refunds are issued to the original payment method.</P>
          <H3>Digital Products</H3>
          <P>Digital ROM downloads are non-refundable once the download link has been accessed. If you experience technical issues with a digital purchase, contact us and we will work to resolve the problem.</P>
          <H3>Defective Products</H3>
          <P>If you receive a defective or damaged product, contact us within 14 days of delivery with photos of the damage. We will offer a replacement or full refund at no cost to you, including return shipping.</P>
        </>
      ),
    },
    {
      id: 'intellectual-property', label: 'Intellectual Property',
      content: (
        <>
          <P>All games published by ITG-SOFT are original creative works. All code, artwork, music, characters, stories, and branding are owned by ITG-SOFT or the respective partner developer, and are protected by copyright law.</P>
          <P>Our games are NOT reproductions, ROM hacks, or unauthorised copies of any existing commercial titles. The NES and Famicom hardware formats are open standards; creating original software for these platforms is legal.</P>
          <P>You may not copy, reproduce, distribute, modify, or create derivative works based on our games without explicit written permission. Personal, non-commercial use is permitted.</P>
          <P>The ITG-SOFT name, logo, and "Yī Tái Yóuxì Software Company" brand are trademarks of ITG-SOFT. You may not use these marks without prior written consent.</P>
        </>
      ),
    },
    {
      id: 'accounts', label: 'User Accounts',
      content: (
        <>
          <P>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at support@itg-soft.tw if you suspect unauthorised access.</P>
          <P>You may not create accounts for fraudulent purposes, impersonate others, or use automated tools to access our services. We reserve the right to suspend or terminate accounts that violate these terms.</P>
        </>
      ),
    },
    {
      id: 'liability', label: 'Limitation of Liability',
      content: (
        <>
          <P>To the fullest extent permitted by law, ITG-SOFT's total liability to you for any claim arising from use of this website or purchase of our products shall not exceed the total amount you paid for the product(s) giving rise to the claim.</P>
          <P>ITG-SOFT is not liable for: indirect, incidental, or consequential damages; loss of data or profits; or damages arising from your use of products on hardware that may be incompatible.</P>
          <P>Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any matter where exclusion is not permitted by law.</P>
        </>
      ),
    },
    {
      id: 'governing-law', label: 'Governing Law',
      content: (
        <>
          <P>These Terms are governed by the laws of Taiwan (Republic of China). Any disputes shall be subject to the exclusive jurisdiction of the courts of Taichung City, Taiwan, except where mandatory consumer protection laws in your country provide additional rights.</P>
          <P>EU/EEA customers: Nothing in these Terms affects your statutory rights under applicable EU consumer protection legislation, including the EU Consumer Rights Directive.</P>
          <P>Last updated: May 15, 2026 · Yī Tái Yóuxì Software Company, Taichung City, Taiwan</P>
        </>
      ),
    },
  ]

  return (
    <LegalShell
      title="Terms & Conditions"
      lastUpdated="May 15, 2026"
      sections={sections}
      onNav={onNav}
      seo={{
        title: 'Terms & Conditions — ITG-SOFT',
        description: 'Terms of use and purchase for itg-soft.tw. Orders, returns, intellectual property, and governing law.',
        canonical: '/terms',
      }}
    />
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// 3. SHIPPING POLICY
// ════════════════════════════════════════════════════════════════════════════════
export function ShippingPolicyPage({ onNav }) {
  const sections = [
    {
      id: 'overview', label: 'Overview',
      content: (
        <>
          <P>All physical orders are shipped from our fulfilment centre in <strong>Taichung City, Taiwan</strong>. We ship to 40+ countries worldwide. Digital ROM downloads are available immediately after purchase — no shipping required.</P>
          <InfoBox>
            <strong>Free Standard Shipping</strong> on all orders over <strong>$100 USD</strong> worldwide. Discount applied automatically at checkout.
          </InfoBox>
          <P>Orders are processed Monday–Friday. Orders placed before 2:00 PM (UTC+8) on a business day are typically processed the same day. Orders placed on weekends or Taiwanese public holidays are processed the next business day.</P>
        </>
      ),
    },
    {
      id: 'processing', label: 'Processing Times',
      content: (
        <>
          <Table rows={[
            ['In-Stock Items', '1–2 business days'],
            ['Pre-Order Items', 'Ships on or after the announced release date'],
            ['Mixed Orders (in-stock + pre-order)', 'Shipped together on the pre-order release date, or split into two shipments upon request'],
            ['Digital Downloads', 'Instant — download link sent via email immediately after payment'],
          ]} />
          <P>You will receive a shipping confirmation email with a tracking number once your order has been dispatched.</P>
        </>
      ),
    },
    {
      id: 'zones', label: 'Shipping Zones & Rates',
      content: (
        <>
          <H3>Zone 1 — Taiwan (Domestic)</H3>
          <Table rows={[
            ['Standard (2–5 business days)', '$5 USD · Free on orders over $50'],
            ['Express (1–2 business days)', '$12 USD'],
          ]} />

          <H3>Zone 2 — Asia-Pacific</H3>
          <P>Japan, South Korea, Hong Kong, Macau, Singapore, Malaysia, Thailand, Philippines, Indonesia, Australia, New Zealand, and surrounding territories.</P>
          <Table rows={[
            ['Standard (7–14 business days)', '$8–12 USD · Free on orders over $100'],
            ['Express (3–5 business days)', '$22–30 USD'],
          ]} />

          <H3>Zone 3 — North America</H3>
          <P>United States, Canada, Mexico.</P>
          <Table rows={[
            ['Standard (8–15 business days)', '$10–14 USD · Free on orders over $100'],
            ['Express (4–7 business days)', '$28–36 USD'],
          ]} />

          <H3>Zone 4 — Europe</H3>
          <P>European Union, United Kingdom, Norway, Switzerland, and surrounding territories.</P>
          <Table rows={[
            ['Standard (10–18 business days)', '$12–16 USD · Free on orders over $100'],
            ['Express (5–8 business days)', '$32–42 USD'],
          ]} />

          <H3>Zone 5 — Rest of World</H3>
          <P>All other countries we ship to. Check checkout for exact rate.</P>
          <Table rows={[
            ['Standard (12–21 business days)', '$14–20 USD · Free on orders over $100'],
            ['Express (6–10 business days)', '$35–50 USD'],
          ]} />
        </>
      ),
    },
    {
      id: 'tracking', label: 'Order Tracking',
      content: (
        <>
          <P>All orders include tracking. Once your order is shipped, you will receive an email with:</P>
          <UL items={[
            'Your tracking number',
            'A link to track your package on the carrier\'s website',
            'Estimated delivery date',
          ]} />
          <P>You can also view your order status at any time by logging into your account at itg-soft.tw/account.</P>
          <P>Standard shipping from Taiwan may transfer between multiple carriers. Tracking updates can sometimes be delayed by 24–48 hours during international handoffs.</P>
        </>
      ),
    },
    {
      id: 'customs', label: 'Customs & Import Duties',
      content: (
        <>
          <P>When shipping internationally, your order may be subject to import duties, taxes, and customs fees levied by your country's customs authority. These charges are the buyer's responsibility and are not included in the shipping price.</P>
          <P>We declare all packages accurately at their full purchase value on customs forms. We cannot mark packages as "gifts" or under-declare their value as this is illegal.</P>
          <P>Customs processing can add 1–10 additional business days to delivery time. ITG-SOFT has no control over customs procedures and is not responsible for delays caused by customs holds.</P>
          <InfoBox>
            <strong>EU customers:</strong> Since July 2021, all goods entering the EU are subject to VAT regardless of value. Packages may be held until VAT is paid. We recommend using a package forwarding service if customs delays in your country are common.
          </InfoBox>
        </>
      ),
    },
    {
      id: 'lost-damaged', label: 'Lost or Damaged Orders',
      content: (
        <>
          <H3>Lost Packages</H3>
          <P>If your tracking shows no movement for 10+ business days (standard) or 5+ business days (express), contact us at support@itg-soft.tw. We will open a trace with the carrier. If a package is confirmed lost, we will ship a replacement or issue a full refund.</P>
          <H3>Damaged on Arrival</H3>
          <P>If your order arrives damaged, take photos immediately and contact us within 14 days. We will send a replacement or issue a refund, and cover return shipping for damaged items.</P>
          <H3>Wrong Item Received</H3>
          <P>If you receive the wrong item, contact us within 14 days. We will send the correct item and arrange collection of the wrong one at no cost to you.</P>
        </>
      ),
    },
    {
      id: 'packaging', label: 'Packaging',
      content: (
        <>
          <P>We take great care in packaging our physical cartridges. Each order is packed with:</P>
          <UL items={[
            'Bubble wrap or foam padding around each game box',
            'Rigid cardboard outer box to prevent crushing',
            'Packing slip with order details',
            'Any bonus items (stickers, inserts) secured within',
          ]} />
          <P>We use recycled and recyclable packaging materials where possible. If you'd like your order gift-wrapped, mention it in the order notes and we'll do our best.</P>
        </>
      ),
    },
  ]

  return (
    <LegalShell
      title="Shipping Policy"
      lastUpdated="May 15, 2026"
      sections={sections}
      onNav={onNav}
      seo={{
        title: 'Shipping Policy — ITG-SOFT',
        description: 'ITG-SOFT shipping zones, rates, processing times, tracking, and customs info. Ships worldwide from Taichung, Taiwan.',
        canonical: '/shipping',
      }}
    />
  )
}

// ════════════════════════════════════════════════════════════════════════════════
// 4. COOKIE POLICY
// ════════════════════════════════════════════════════════════════════════════════
export function CookiePolicyPage({ onNav }) {
  const sections = [
    {
      id: 'what-are-cookies', label: 'What Are Cookies?',
      content: (
        <>
          <P>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to website owners about how their site is used.</P>
          <P>We also use similar technologies including <strong>local storage</strong> (for your shopping cart), <strong>session storage</strong>, and tracking pixels. This policy covers all of these technologies collectively referred to as "cookies".</P>
        </>
      ),
    },
    {
      id: 'cookies-we-use', label: 'Cookies We Use',
      content: (
        <>
          <H3>1. Strictly Necessary Cookies</H3>
          <P>These cookies are essential for the website to function and cannot be disabled. They enable core functionality such as security, network management, and accessibility.</P>
          <Table rows={[
            ['cart_session', 'Remembers items in your shopping cart', 'Session (cleared on browser close)'],
            ['auth_token', 'Keeps you logged in to your account', '30 days'],
            ['csrf_token', 'Security token to prevent cross-site request forgery', 'Session'],
          ]} />

          <H3>2. Performance & Analytics Cookies</H3>
          <P>These cookies help us understand how visitors interact with our website so we can improve the user experience. All data is anonymised or pseudonymised.</P>
          <Table rows={[
            ['_ga, _ga_*', 'Google Analytics 4 — tracks page views, sessions, traffic sources', '2 years'],
            ['_gid', 'Google Analytics — distinguishes users', '24 hours'],
            ['clarity_*', 'Microsoft Clarity — heatmaps and session recordings (anonymised)', '1 year'],
          ]} />

          <H3>3. Functional Cookies</H3>
          <P>These cookies enable enhanced functionality and personalisation.</P>
          <Table rows={[
            ['currency_pref', 'Remembers your preferred display currency', '1 year'],
            ['wishlist', 'Saves your wishlist items when not logged in', '30 days'],
            ['cookie_consent', 'Remembers your cookie consent choices', '1 year'],
          ]} />

          <H3>4. Marketing & Targeting Cookies (opt-in only)</H3>
          <P>These cookies are only set if you consent. They are used for retargeting and measuring the effectiveness of our advertising campaigns.</P>
          <Table rows={[
            ['_fbp', 'Facebook Pixel — tracks conversions from Facebook/Instagram ads', '90 days'],
            ['_fbc', 'Facebook — click ID for attribution', '90 days'],
          ]} />
          <InfoBox>Marketing cookies are only activated if you click "Accept All" on the cookie banner. You can change your preference at any time via the Cookie Settings button in the footer.</InfoBox>
        </>
      ),
    },
    {
      id: 'third-party', label: 'Third-Party Cookies',
      content: (
        <>
          <P>Some pages on our website embed content from third-party services, which may set their own cookies:</P>
          <Table rows={[
            ['YouTube', 'Set when you watch embedded game trailers. Governed by Google\'s privacy policy.'],
            ['Payment provider', 'Set during checkout to enable secure payment processing.'],
          ]} />
          <P>We have no control over these third-party cookies. Please refer to the respective privacy policies of those services for more information.</P>
        </>
      ),
    },
    {
      id: 'managing', label: 'Managing Your Preferences',
      content: (
        <>
          <H3>Cookie Banner</H3>
          <P>When you first visit itg-soft.tw, a cookie consent banner will appear. You can choose to accept all cookies, reject optional cookies, or customise your preferences. Strictly necessary cookies are always active.</P>
          <H3>Browser Settings</H3>
          <P>You can control cookies through your browser settings. Most browsers allow you to:</P>
          <UL items={[
            'View and delete individual cookies',
            'Block cookies from specific websites',
            'Block all third-party cookies',
            'Set your browser to notify you when cookies are set',
          ]} />
          <P>Note: Disabling cookies may affect the functionality of our website. Your shopping cart, login state, and wishlist may not work correctly if cookies are blocked.</P>
          <H3>Opt-Out Links</H3>
          <UL items={[
            'Google Analytics: tools.google.com/dlpage/gaoptout',
            'Facebook Ads: facebook.com/settings?tab=ads',
            'Digital Advertising Alliance: optout.aboutads.info',
          ]} />
        </>
      ),
    },
    {
      id: 'local-storage', label: 'Local Storage',
      content: (
        <>
          <P>In addition to cookies, we use your browser's <strong>local storage</strong> to save your shopping cart contents persistently across sessions. This is separate from cookies and is not transmitted to our servers until you proceed to checkout.</P>
          <P>Local storage data can be cleared through your browser's developer tools or by clearing browsing data.</P>
        </>
      ),
    },
    {
      id: 'updates', label: 'Policy Updates',
      content: (
        <>
          <P>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. The date at the top of this page indicates when it was last updated.</P>
          <P>For questions about our use of cookies, contact: <strong>privacy@itg-soft.tw</strong></P>
          <P>Last updated: May 15, 2026 · Yī Tái Yóuxì Software Company, Taichung City, Taiwan</P>
        </>
      ),
    },
  ]

  return (
    <LegalShell
      title="Cookie Policy"
      lastUpdated="May 15, 2026"
      sections={sections}
      onNav={onNav}
      seo={{
        title: 'Cookie Policy — ITG-SOFT',
        description: 'Information about cookies used on itg-soft.tw — analytics, functional, and marketing cookies. How to manage your preferences.',
        canonical: '/cookies',
      }}
    />
  )
}
