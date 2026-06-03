import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * ============================================================
 * CareerLink OS™ — Vite Config
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

export default defineConfig({
  base: '/',

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name:             'CareerLink OS™',
        short_name:       'CareerLink',
        description:      'Job Search Compliance Dashboard + Jobseeker Activity PWA. Powered by 4P3X Intelligent AI.',
        theme_color:      '#090e1c',
        background_color: '#050810',
        display:          'standalone',
        orientation:      'any',
        scope:            '/',
        start_url:        '/#/jobseeker-app',
        categories:       ['business', 'productivity'],
        icons: [
          {
            src:     'icons/icon-192x192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'maskable any',
          },
          {
            src:     'icons/icon-512x512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable any',
          },
        ],
        shortcuts: [
          {
            name:        'Jobseeker App',
            short_name:  'Jobseeker',
            url:         '/#/jobseeker-app',
            description: 'Open the CareerLink Jobseeker App',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name:        'Coach Dashboard',
            short_name:  'Dashboard',
            url:         '/#/dashboard',
            description: 'Open the CareerLink Coach Dashboard',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler:    'CacheFirst',
            options: {
              cacheName:  'careerlinkos-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },

      devOptions: {
        enabled: true,
        type:    'module',
      },
    }),
  ],

  resolve: {
    extensions: ['.jsx', '.js', '.ts', '.tsx'],
  },

  server: {
    port: 3000,
    host: true,
  },

  build: {
    outDir:    'dist',
    sourcemap: false,
    minify:    'esbuild',
    target:    'es2020',
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui':       ['lucide-react', 'clsx'],
          'vendor-state':    ['zustand'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts':   ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },

  optimizeDeps: {
    include: ['recharts', 'zustand', '@supabase/supabase-js'],
  },
})
