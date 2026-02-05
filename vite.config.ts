import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api/celestrak': {
        target: 'https://celestrak.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/celestrak/, ''),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add proper headers to bypass blocking
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'text/plain,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.5');
            proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
            proxyReq.setHeader('Sec-Fetch-Dest', 'empty');
            proxyReq.setHeader('Sec-Fetch-Mode', 'cors');
            proxyReq.setHeader('Sec-Fetch-Site', 'cross-site');
            proxyReq.setHeader('Cache-Control', 'max-age=0');
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        },
      },
      '/api/celestrak-com': {
        target: 'https://www.celestrak.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/celestrak-com/, ''),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            proxyReq.setHeader('Accept', 'text/plain,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.5');
            proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
            proxyReq.setHeader('Sec-Fetch-Dest', 'empty');
            proxyReq.setHeader('Sec-Fetch-Mode', 'cors');
            proxyReq.setHeader('Sec-Fetch-Site', 'cross-site');
            proxyReq.setHeader('Cache-Control', 'max-age=0');
          });
        },
      },
      // Alternative TLE sources
      '/api/tle-update': {
        target: 'https://tle-update.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tle-update/, ''),
        secure: true,
      },
      '/api/sat-db': {
        target: 'https://sat-db.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sat-db/, ''),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
