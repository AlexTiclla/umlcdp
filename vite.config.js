import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true
      }
    }
  },

  // Configuración de build
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Deshabilitar sourcemaps en producción para mejor rendimiento
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['jointjs', 'jquery', 'lodash', 'backbone'],
          socket: ['socket.io-client']
        }
      }
    }
  },

  // Configuración de variables de entorno
  define: {
    // Hacer que las variables de entorno estén disponibles en el cliente
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'),
    'import.meta.env.VITE_SOCKET_URL': JSON.stringify(process.env.VITE_SOCKET_URL || 'http://localhost:3001'),
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

  // Configuración de plugins
  plugins: [
    // Plugin personalizado para cargar variables de entorno
    {
      name: 'env-loader',
      configResolved(config) {
        // Cargar variables de entorno desde .env
        require('dotenv').config()
      }
    }
  ],

  // Configuración de optimización
  optimizeDeps: {
    include: ['jointjs', 'jquery', 'lodash', 'backbone']
  },

  // Configuración de CSS
  css: {
    postcss: './postcss.config.js'
  }
})
