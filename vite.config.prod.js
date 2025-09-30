import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Configuración específica para producción
  base: '/',
  
  // Configuración de build optimizada para Vercel
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['jointjs', 'jquery', 'lodash', 'backbone'],
          socket: ['socket.io-client']
        },
        assetFileNames: (assetInfo) => {
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js'
      }
    }
  },

  // Configuración de variables de entorno para producción
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'https://tu-backend-url.vercel.app/api'),
    'import.meta.env.VITE_SOCKET_URL': JSON.stringify(process.env.VITE_SOCKET_URL || 'https://tu-backend-url.vercel.app'),
    'import.meta.env.VITE_JWT_STORAGE_KEY': JSON.stringify(process.env.VITE_JWT_STORAGE_KEY || 'uml_token'),
    'import.meta.env.VITE_AUTH_REFRESH_THRESHOLD': JSON.stringify(process.env.VITE_AUTH_REFRESH_THRESHOLD || '300000'),
    'import.meta.env.VITE_AUTO_SAVE_INTERVAL': JSON.stringify(process.env.VITE_AUTO_SAVE_INTERVAL || '30000'),
    'import.meta.env.VITE_MAX_LOCAL_DIAGRAMS': JSON.stringify(process.env.VITE_MAX_LOCAL_DIAGRAMS || '10'),
    'import.meta.env.VITE_LOCAL_STORAGE_PREFIX': JSON.stringify(process.env.VITE_LOCAL_STORAGE_PREFIX || 'uml_diagram_'),
    'import.meta.env.VITE_DEFAULT_EXPORT_FORMAT': JSON.stringify(process.env.VITE_DEFAULT_EXPORT_FORMAT || 'json'),
    'import.meta.env.VITE_SUPPORTED_EXPORT_FORMATS': JSON.stringify(process.env.VITE_SUPPORTED_EXPORT_FORMATS || 'json,png,svg'),
    'import.meta.env.VITE_COLLABORATION_ENABLED': JSON.stringify(process.env.VITE_COLLABORATION_ENABLED || 'true'),
    'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(process.env.VITE_DEBUG_MODE || 'false'),
    'import.meta.env.VITE_LOG_LEVEL': JSON.stringify(process.env.VITE_LOG_LEVEL || 'info')
  },

  // Configuración de optimización
  optimizeDeps: {
    include: ['jointjs', 'jquery', 'lodash', 'backbone']
  },

  // Configuración de CSS
  css: {
    postcss: './postcss.config.js'
  }
})
