/**
 * Configuración de la aplicación
 * Centraliza el manejo de variables de entorno y configuración
 */

class AppConfig {
  constructor() {
    // Variables de entorno con fallbacks para desarrollo
    this.config = {
      // URLs del backend
      apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001/api',
      socketUrl: import.meta.env?.VITE_SOCKET_URL || 'http://localhost:3001',
      
      // Configuración de la aplicación
      appName: import.meta.env?.VITE_APP_NAME || 'UML Class Diagram Editor',
      appVersion: import.meta.env?.VITE_APP_VERSION || '1.0.0',
      appDescription: import.meta.env?.VITE_APP_DESCRIPTION || 'Editor moderno de diagramas UML de clases',
      
      // Configuración de autenticación
      jwtStorageKey: import.meta.env?.VITE_JWT_STORAGE_KEY || 'uml_token',
      authRefreshThreshold: parseInt(import.meta.env?.VITE_AUTH_REFRESH_THRESHOLD || '300000'),
      
      // Configuración de persistencia
      autoSaveInterval: parseInt(import.meta.env?.VITE_AUTO_SAVE_INTERVAL || '30000'),
      maxLocalDiagrams: parseInt(import.meta.env?.VITE_MAX_LOCAL_DIAGRAMS || '10'),
      localStoragePrefix: import.meta.env?.VITE_LOCAL_STORAGE_PREFIX || 'uml_diagram_',
      
      // Configuración de exportación
      defaultExportFormat: import.meta.env?.VITE_DEFAULT_EXPORT_FORMAT || 'json',
      supportedExportFormats: (import.meta.env?.VITE_SUPPORTED_EXPORT_FORMATS || 'json,png,svg').split(','),
      
      // Configuración de colaboración
      collaborationEnabled: import.meta.env?.VITE_COLLABORATION_ENABLED === 'true',
      socketReconnectAttempts: parseInt(import.meta.env?.VITE_SOCKET_RECONNECT_ATTEMPTS || '5'),
      socketReconnectDelay: parseInt(import.meta.env?.VITE_SOCKET_RECONNECT_DELAY || '1000'),
      
      // Configuración de notificaciones
      notificationDuration: {
        success: parseInt(import.meta.env?.VITE_NOTIFICATION_DURATION_SUCCESS || '3000'),
        warning: parseInt(import.meta.env?.VITE_NOTIFICATION_DURATION_WARNING || '4000'),
        error: parseInt(import.meta.env?.VITE_NOTIFICATION_DURATION_ERROR || '5000'),
        info: parseInt(import.meta.env?.VITE_NOTIFICATION_DURATION_INFO || '2000')
      },
      
      // Configuración de UI
      defaultTheme: import.meta.env?.VITE_DEFAULT_THEME || 'light',
      gridSize: parseInt(import.meta.env?.VITE_GRID_SIZE || '10'),
      zoomMin: parseFloat(import.meta.env?.VITE_ZOOM_MIN || '0.2'),
      zoomMax: parseFloat(import.meta.env?.VITE_ZOOM_MAX || '3.0'),
      
      // Configuración de desarrollo
      debugMode: import.meta.env?.VITE_DEBUG_MODE === 'true',
      logLevel: import.meta.env?.VITE_LOG_LEVEL || 'info',
      enableHotReload: import.meta.env?.VITE_ENABLE_HOT_RELOAD === 'true',
      
      // Configuración de CORS
      corsOrigin: import.meta.env?.VITE_CORS_ORIGIN || 'http://localhost:3000',
      corsCredentials: import.meta.env?.VITE_CORS_CREDENTIALS === 'true',
      
      // Configuración de archivos
      maxFileSize: parseInt(import.meta.env?.VITE_MAX_FILE_SIZE || '10485760'),
      allowedFileTypes: (import.meta.env?.VITE_ALLOWED_FILE_TYPES || 'json,png,svg').split(','),
      
      // Configuración de seguridad
      enableHttps: import.meta.env?.VITE_ENABLE_HTTPS === 'true',
      sessionTimeout: parseInt(import.meta.env?.VITE_SESSION_TIMEOUT || '3600000')
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
    }
  }
}

// Crear instancia global
window.appConfig = new AppConfig();

// Log de configuración en modo debug
if (window.appConfig.isDebugMode()) {
  window.appConfig.logConfig();
}

// Exportar también como módulo
if (typeof module !== "undefined" && module.exports) {
  module.exports = AppConfig;
}
