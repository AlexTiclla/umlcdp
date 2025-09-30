/**
 * Configuración de la aplicación
 * Centraliza el manejo de variables de entorno y configuración
 */

class AppConfig {
  constructor() {
    // Función para obtener variables de entorno de manera compatible
    const getEnvVar = (key, defaultValue) => {
      // Buscar en window (cargado por env-loader.js)
      if (typeof window !== 'undefined' && window[key]) {
        return window[key];
      }
      
      // Fallback a valores por defecto
      return defaultValue;
    };

    // Variables de entorno con fallbacks para desarrollo
    this.config = {
      // URLs del backend
      apiBaseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3001/api'),
      socketUrl: getEnvVar('VITE_SOCKET_URL', 'http://localhost:3001'),
      
      // Configuración de la aplicación
      appName: getEnvVar('VITE_APP_NAME', 'UML Class Diagram Editor'),
      appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
      appDescription: getEnvVar('VITE_APP_DESCRIPTION', 'Editor moderno de diagramas UML de clases'),
      
      // Configuración de autenticación
      jwtStorageKey: getEnvVar('VITE_JWT_STORAGE_KEY', 'uml_token'),
      authRefreshThreshold: parseInt(getEnvVar('VITE_AUTH_REFRESH_THRESHOLD', '300000')),
      
      // Configuración de persistencia
      autoSaveInterval: parseInt(getEnvVar('VITE_AUTO_SAVE_INTERVAL', '30000')),
      maxLocalDiagrams: parseInt(getEnvVar('VITE_MAX_LOCAL_DIAGRAMS', '10')),
      localStoragePrefix: getEnvVar('VITE_LOCAL_STORAGE_PREFIX', 'uml_diagram_'),
      
      // Configuración de exportación
      defaultExportFormat: getEnvVar('VITE_DEFAULT_EXPORT_FORMAT', 'json'),
      supportedExportFormats: getEnvVar('VITE_SUPPORTED_EXPORT_FORMATS', 'json,png,svg').split(','),
      
      // Configuración de colaboración
      collaborationEnabled: getEnvVar('VITE_COLLABORATION_ENABLED', 'true') === 'true',
      socketReconnectAttempts: parseInt(getEnvVar('VITE_SOCKET_RECONNECT_ATTEMPTS', '5')),
      socketReconnectDelay: parseInt(getEnvVar('VITE_SOCKET_RECONNECT_DELAY', '1000')),
      
      // Configuración de notificaciones
      notificationDuration: {
        success: parseInt(getEnvVar('VITE_NOTIFICATION_DURATION_SUCCESS', '3000')),
        warning: parseInt(getEnvVar('VITE_NOTIFICATION_DURATION_WARNING', '4000')),
        error: parseInt(getEnvVar('VITE_NOTIFICATION_DURATION_ERROR', '5000')),
        info: parseInt(getEnvVar('VITE_NOTIFICATION_DURATION_INFO', '2000'))
      },
      
      // Configuración de UI
      defaultTheme: getEnvVar('VITE_DEFAULT_THEME', 'light'),
      gridSize: parseInt(getEnvVar('VITE_GRID_SIZE', '10')),
      zoomMin: parseFloat(getEnvVar('VITE_ZOOM_MIN', '0.2')),
      zoomMax: parseFloat(getEnvVar('VITE_ZOOM_MAX', '3.0')),
      
      // Configuración de desarrollo
      debugMode: getEnvVar('VITE_DEBUG_MODE', 'false') === 'true',
      logLevel: getEnvVar('VITE_LOG_LEVEL', 'info'),
      enableHotReload: getEnvVar('VITE_ENABLE_HOT_RELOAD', 'true') === 'true',
      
      // Configuración de CORS
      corsOrigin: getEnvVar('VITE_CORS_ORIGIN', 'http://localhost:3000'),
      corsCredentials: getEnvVar('VITE_CORS_CREDENTIALS', 'true') === 'true',
      
      // Configuración de archivos
      maxFileSize: parseInt(getEnvVar('VITE_MAX_FILE_SIZE', '10485760')),
      allowedFileTypes: getEnvVar('VITE_ALLOWED_FILE_TYPES', 'json,png,svg').split(','),
      
      // Configuración de seguridad
      enableHttps: getEnvVar('VITE_ENABLE_HTTPS', 'false') === 'true',
      sessionTimeout: parseInt(getEnvVar('VITE_SESSION_TIMEOUT', '3600000'))
    };
  }

  /**
   * Obtener valor de configuración
   * @param {string} key - Clave de configuración
   * @param {*} defaultValue - Valor por defecto si no existe
   * @returns {*} Valor de configuración
   */
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Obtener URL base del API
   * @returns {string} URL base del API
   */
  getApiBaseUrl() {
    return this.config.apiBaseUrl;
  }

  /**
   * Obtener URL del socket
   * @returns {string} URL del socket
   */
  getSocketUrl() {
    return this.config.socketUrl;
  }

  /**
   * Verificar si está en modo debug
   * @returns {boolean} True si está en modo debug
   */
  isDebugMode() {
    return this.config.debugMode;
  }

  /**
   * Verificar si la colaboración está habilitada
   * @returns {boolean} True si la colaboración está habilitada
   */
  isCollaborationEnabled() {
    return this.config.collaborationEnabled;
  }

  /**
   * Obtener duración de notificación por tipo
   * @param {string} type - Tipo de notificación (success, warning, error, info)
   * @returns {number} Duración en milisegundos
   */
  getNotificationDuration(type) {
    return this.config.notificationDuration[type] || this.config.notificationDuration.info;
  }

  /**
   * Obtener configuración completa
   * @returns {object} Configuración completa
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Log de configuración (solo en modo debug)
   */
  logConfig() {
    if (this.isDebugMode()) {
      console.log('🔧 Configuración de la aplicación:', this.config);
      console.log('🌐 URLs detectadas:', {
        apiBaseUrl: this.config.apiBaseUrl,
        socketUrl: this.config.socketUrl,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
        isProduction: typeof window !== 'undefined' && 
          (window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' && 
           !window.location.hostname.includes('localhost'))
      });
    }
  }
}

// Crear instancia global
window.appConfig = new AppConfig();

// Log de configuración en modo debug
if (window.appConfig.isDebugMode()) {
  window.appConfig.logConfig();
}

// Log temporal para debugging en producción
console.log('🔧 Configuración cargada:', {
  apiBaseUrl: window.appConfig.getApiBaseUrl(),
  socketUrl: window.appConfig.getSocketUrl(),
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
  isProduction: typeof window !== 'undefined' && 
    (window.location.hostname !== 'localhost' && 
     window.location.hostname !== '127.0.0.1' && 
     !window.location.hostname.includes('localhost'))
});

// Exportar también como módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = AppConfig;
}
