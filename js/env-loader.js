/**
 * Cargador de Variables de Entorno
 * Se ejecuta antes que config.js para asegurar que las variables estén disponibles
 */

(function() {
  'use strict';
  
  // Función para cargar variables de entorno desde el servidor
  function loadEnvVars() {
    // En desarrollo, las variables se cargan desde .env
    // En producción, se inyectan en tiempo de build
    
    // Detectar si estamos en producción
    const isProduction = typeof window !== 'undefined' && 
      (window.location.hostname !== 'localhost' && 
       window.location.hostname !== '127.0.0.1' && 
       !window.location.hostname.includes('localhost'));
    
    if (isProduction) {
      // En producción, usar URLs del backend desplegado
      window.VITE_API_BASE_URL = 'https://umlcdp-backend.onrender.com/api';
      window.VITE_SOCKET_URL = 'https://umlcdp-backend.onrender.com';
      window.VITE_DEBUG_MODE = 'true'; // Habilitar debug temporalmente
    } else {
      // En desarrollo, usar URLs locales
      window.VITE_API_BASE_URL = 'http://localhost:3001/api';
      window.VITE_SOCKET_URL = 'http://localhost:3001';
      window.VITE_DEBUG_MODE = 'false';
    }
    
    // Configuraciones adicionales
    window.VITE_APP_NAME = 'UML Class Diagram Editor';
    window.VITE_APP_VERSION = '1.0.0';
    window.VITE_COLLABORATION_ENABLED = 'true';
    window.VITE_JWT_STORAGE_KEY = 'uml_token';
    window.VITE_AUTH_REFRESH_THRESHOLD = '300000';
    window.VITE_AUTO_SAVE_INTERVAL = '30000';
    window.VITE_MAX_LOCAL_DIAGRAMS = '10';
    window.VITE_LOCAL_STORAGE_PREFIX = 'uml_diagram_';
    window.VITE_DEFAULT_EXPORT_FORMAT = 'json';
    window.VITE_SUPPORTED_EXPORT_FORMATS = 'json,png,svg,java,python,php';
    window.VITE_SOCKET_RECONNECT_ATTEMPTS = '5';
    window.VITE_SOCKET_RECONNECT_DELAY = '1000';
    window.VITE_NOTIFICATION_DURATION_SUCCESS = '3000';
    window.VITE_NOTIFICATION_DURATION_WARNING = '4000';
    window.VITE_NOTIFICATION_DURATION_ERROR = '5000';
    window.VITE_NOTIFICATION_DURATION_INFO = '2000';
    window.VITE_DEFAULT_THEME = 'light';
    window.VITE_GRID_SIZE = '10';
    window.VITE_ZOOM_MIN = '0.2';
    window.VITE_ZOOM_MAX = '3.0';
    window.VITE_LOG_LEVEL = 'info';
    window.VITE_ENABLE_HOT_RELOAD = 'true';
    window.VITE_CORS_ORIGIN = isProduction ? 'https://umlcdp-oi6y.vercel.app' : 'http://localhost:3000';
    window.VITE_CORS_CREDENTIALS = 'true';
    window.VITE_MAX_FILE_SIZE = '10485760';
    window.VITE_ALLOWED_FILE_TYPES = 'json,png,svg';
    window.VITE_ENABLE_HTTPS = isProduction ? 'true' : 'false';
    window.VITE_SESSION_TIMEOUT = '3600000';
    
    // Log de configuración cargada
    console.log('🔧 Variables de entorno cargadas:', {
      apiBaseUrl: window.VITE_API_BASE_URL,
      socketUrl: window.VITE_SOCKET_URL,
      isProduction: isProduction,
      hostname: window.location.hostname
    });
  }
  
  // Cargar variables cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEnvVars);
  } else {
    loadEnvVars();
  }
})();
