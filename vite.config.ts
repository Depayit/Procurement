import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg', 'icon-maskable.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: 'procuresync-enterprise-app',
          name: 'ProcureSync Enterprise - ระบบจัดซื้อและบริหารคลังพัสดุ',
          short_name: 'ProcureSync',
          description: 'ระบบจัดซื้อและบริหารคลังพัสดุก่อสร้าง (ProcureSync) ครบวงจร: ขอซื้อ (PR), สั่งซื้อ (PO), ตรวจรับ, คลังสินค้า และสแกน QR Code',
          theme_color: '#4F46E5',
          background_color: '#F8FAFC',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          lang: 'th',
          dir: 'ltr',
          categories: ['business', 'productivity', 'utilities'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
          shortcuts: [
            {
              name: 'ระบบขอซื้อ (New PR)',
              short_name: 'ขอซื้อ PR',
              description: 'เปิดใบขอซื้อพัสดุและวัสดุก่อสร้างใหม่',
              url: '/pr',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'สแกนคลังสินค้า (Scan QR)',
              short_name: 'สแกนคลัง',
              description: 'เปิดกล้องสแกน QR Code ตรวจสอบและเบิกจ่ายสต็อก',
              url: '/inventory',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'ระบบจัดซื้อ (PO)',
              short_name: 'จัดซื้อ PO',
              description: 'ออกใบสั่งซื้อและตรวจรับสินค้าหน้างาน',
              url: '/po',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'คู่มือการใช้งาน (Manual)',
              short_name: 'คู่มือระบบ',
              description: 'คู่มือมาตรฐานการปฏิบัติงานและผังเชื่อมโยงระบบ',
              url: '/manual',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webmanifest}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('html-to-image')) {
                return 'vendor-docs';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('xlsx')) {
                return 'vendor-sheet';
              }
              if (id.includes('html5-qrcode') || id.includes('qrcode')) {
                return 'vendor-scanner';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-core';
              }
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
