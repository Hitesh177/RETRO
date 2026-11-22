import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { StoreProvider } from './context/StoreContext'
import { AuthProvider } from './context/AuthContext'
import { Header, Footer } from './components/Layout'
import HomePage from './pages/HomePage'
import ListingPage from './pages/ListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'
import DevelopersPage from './pages/DevelopersPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminPage from './pages/AdminPage'
import { PrivacyPolicyPage, TermsPage, ShippingPolicyPage, CookiePolicyPage } from './pages/LegalPages'
import ClientsPage from './pages/ClientsPage'

// Maps page IDs (used by onNav calls throughout the app) to URL paths
const PAGE_TO_PATH = {
  home:       '/',
  listing:    '/games',
  detail:     (slug) => `/games/${slug}`,
  cart:       '/cart',
  checkout:   '/checkout',
  account:    '/account',
  blog:       '/blog',
  blogPost:   (slug) => `/blog/${slug}`,
  about:      '/about',
  faq:        '/faq',
  developers: '/developers',
  contact:    '/contact',
  admin:      '/admin',
  privacy:    '/privacy',
  terms:      '/terms',
  shipping:   '/shipping',
  cookies:    '/cookies',
  clients:    '/clients',
}

function useOnNav() {
  const navigate = useNavigate()
  return function onNav(pageId, slug = null) {
    const pathOrFn = PAGE_TO_PATH[pageId]
    if (!pathOrFn) return
    const path = typeof pathOrFn === 'function' ? pathOrFn(slug) : pathOrFn
    navigate(path)
    window.scrollTo(0, 0)
  }
}

// Wraps a page component with the shared Header/Footer shell.
// Reads :slug from URL params and passes it as a prop — no page component changes needed.
function WithLayout({ page, Component }) {
  const onNav = useOnNav()
  const { slug } = useParams()

  if (page === 'admin') {
    return <Component onNav={onNav} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header current={page} onNav={onNav} />
      <main style={{ flex: 1 }}>
        <Component onNav={onNav} slug={slug || null} />
      </main>
      <Footer onNav={onNav} />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"           element={<WithLayout page="home"       Component={HomePage} />} />
      <Route path="/games"      element={<WithLayout page="listing"    Component={ListingPage} />} />
      <Route path="/games/:slug" element={<WithLayout page="detail"   Component={ProductDetailPage} />} />
      <Route path="/cart"       element={<WithLayout page="cart"       Component={CartPage} />} />
      <Route path="/checkout"   element={<WithLayout page="checkout"   Component={CheckoutPage} />} />
      <Route path="/account"    element={<WithLayout page="account"    Component={AccountPage} />} />
      <Route path="/blog"       element={<WithLayout page="blog"       Component={BlogPage} />} />
      <Route path="/blog/:slug" element={<WithLayout page="blogPost"   Component={BlogPostPage} />} />
      <Route path="/about"      element={<WithLayout page="about"      Component={AboutPage} />} />
      <Route path="/faq"        element={<WithLayout page="faq"        Component={FAQPage} />} />
      <Route path="/developers" element={<WithLayout page="developers" Component={DevelopersPage} />} />
      <Route path="/contact"    element={<WithLayout page="contact"    Component={ContactPage} />} />
      <Route path="/admin"      element={<WithLayout page="admin"      Component={AdminPage} />} />
      <Route path="/privacy"    element={<WithLayout page="privacy"    Component={PrivacyPolicyPage} />} />
      <Route path="/terms"      element={<WithLayout page="terms"      Component={TermsPage} />} />
      <Route path="/shipping"   element={<WithLayout page="shipping"   Component={ShippingPolicyPage} />} />
      <Route path="/cookies"    element={<WithLayout page="cookies"    Component={CookiePolicyPage} />} />
      <Route path="/clients"    element={<WithLayout page="clients"    Component={ClientsPage} />} />
      <Route path="*"           element={<WithLayout page="404"        Component={NotFoundPage} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  )
}
