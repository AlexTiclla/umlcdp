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
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/login.html'),
        signup: resolve(__dirname, 'src/signup.html'),
        profile: resolve(__dirname, 'src/profile.html'),
        projects: resolve(__dirname, 'src/projects.html'),
        settings: resolve(__dirname, 'src/settings.html'),
        'edit-profile': resolve(__dirname, 'src/edit-profile.html'),
        'demo-users': resolve(__dirname, 'src/demo-users.html')
      },
      output: {
        manualChunks: {
          vendor: ['jointjs', 'jquery', 'lodash', 'backbone'],
          socket: ['socket.io-client']
        }
      },
      external: [
        '/assets/auth-manager.js',
        '/assets/socket-manager.js',
        '/assets/umlShapes.js',
        '/assets/relationships.js',
        '/assets/codeGenerator.js',
        '/assets/api.js',
        '/assets/persistence.js',
        '/assets/projectHelper.js',
        '/assets/collaboration.js',
        '/assets/ai-assistant.js',
        '/assets/main.js'
      ]
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
    'import.meta.env.VITE_LOG_LEVEL': JSON.stringify(process.env.VITE_LOG_LEVEL || 'info'),
    
    // También hacer las variables disponibles globalmente en window para compatibilidad
    'window.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:3001/api'),
    'window.VITE_SOCKET_URL': JSON.stringify(process.env.VITE_SOCKET_URL || 'http://localhost:3001'),
    'window.VITE_JWT_STORAGE_KEY': JSON.stringify(process.env.VITE_JWT_STORAGE_KEY || 'uml_token'),
    'window.VITE_AUTH_REFRESH_THRESHOLD': JSON.stringify(process.env.VITE_AUTH_REFRESH_THRESHOLD || '300000'),
    'window.VITE_AUTO_SAVE_INTERVAL': JSON.stringify(process.env.VITE_AUTO_SAVE_INTERVAL || '30000'),
    'window.VITE_MAX_LOCAL_DIAGRAMS': JSON.stringify(process.env.VITE_MAX_LOCAL_DIAGRAMS || '10'),
    'window.VITE_LOCAL_STORAGE_PREFIX': JSON.stringify(process.env.VITE_LOCAL_STORAGE_PREFIX || 'uml_diagram_'),
    'window.VITE_DEFAULT_EXPORT_FORMAT': JSON.stringify(process.env.VITE_DEFAULT_EXPORT_FORMAT || 'json'),
    'window.VITE_SUPPORTED_EXPORT_FORMATS': JSON.stringify(process.env.VITE_SUPPORTED_EXPORT_FORMATS || 'json,png,svg'),
    'window.VITE_COLLABORATION_ENABLED': JSON.stringify(process.env.VITE_COLLABORATION_ENABLED || 'true'),
    'window.VITE_DEBUG_MODE': JSON.stringify(process.env.VITE_DEBUG_MODE || 'false'),
    'window.VITE_LOG_LEVEL': JSON.stringify(process.env.VITE_LOG_LEVEL || 'info')
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
    },
    // Plugin para copiar archivos estáticos
    {
      name: 'copy-static-assets',
      generateBundle(options, bundle) {
        // Copiar archivos JS del directorio js/ al directorio assets/
        const fs = require('fs');
        const path = require('path');
        
        const jsDir = path.resolve(__dirname, 'js');
        const cssDir = path.resolve(__dirname, 'css');
        const assetsDir = path.resolve(__dirname, 'dist/assets');
        
        // Crear directorio assets si no existe
        if (!fs.existsSync(assetsDir)) {
          fs.mkdirSync(assetsDir, { recursive: true });
        }
        
        // Copiar archivos JS
        if (fs.existsSync(jsDir)) {
          const files = fs.readdirSync(jsDir);
          files.forEach(file => {
            if (file.endsWith('.js')) {
              const sourcePath = path.join(jsDir, file);
              const destPath = path.join(assetsDir, file);
              fs.copyFileSync(sourcePath, destPath);
            }
          });
        }
        
        // Copiar archivos CSS
        const cssFiles = ['styles.css', 'src/auth-styles.css'];
        cssFiles.forEach(cssFile => {
          const sourcePath = path.join(cssDir, cssFile);
          const fileName = path.basename(cssFile);
          if (fs.existsSync(sourcePath)) {
            const destPath = path.join(assetsDir, fileName);
            fs.copyFileSync(sourcePath, destPath);
          }
        });
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
