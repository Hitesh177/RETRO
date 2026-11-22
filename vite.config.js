import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

function localCheckoutApi() {
  return {
    name: 'local-checkout-api',
    configureServer(server) {
      server.middlewares.use('/api/checkout', async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (!['/quote', '/coupon', '/create', '/capture', '/status', '/webhook'].includes(path)) return next()
        try {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          req.body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
          const { default: handler } = await server.ssrLoadModule(`/api/checkout${path}.js`)
          res.status = code => { res.statusCode = code; return res }
          res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)) }
          await handler(req, res)
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: error.message }))
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_WEBHOOK_ID', 'PAYPAL_ENV', 'SITE_URL']) {
    if (!process.env[key] && env[key]) process.env[key] = env[key]
  }
  return {
  plugins: [
    react(),
    localCheckoutApi(),

    // Gzip for all text assets (served by Vercel/Netlify/Nginx as fallback)
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // only compress files > 1KB
    }),

    // Brotli (better compression ratio, preferred by modern browsers)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],

  build: {
    // Target modern browsers (smaller bundle, fewer polyfills)
    target: 'es2020',

    // Raise chunk warning limit slightly (retro audio/sprites can be large)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor chunks for better long-term caching
        manualChunks: {
          react:    ['react', 'react-dom'],
          helmet:   ['react-helmet-async'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },

    // Minification
    minify: 'esbuild',

    // Generate sourcemaps for error monitoring (Sentry etc.)
    // Set to false in production if bundle size is a concern
    sourcemap: false,

    // Inline assets smaller than 4KB (saves HTTP requests)
    assetsInlineLimit: 4096,
  },

  // Asset filename hashing for cache-busting
  // (Vite does this by default; config here for explicitness)
  server: {
    port: 5173,
    host: true,
    historyApiFallback: true,
  },
  }
})
