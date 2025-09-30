# Variables de Entorno - Frontend

Este documento explica cómo configurar y usar las variables de entorno en el frontend del editor UML.

## Configuración

### Archivos de Variables de Entorno

- **`.env`** - Variables para desarrollo local
- **`.env.production`** - Variables para producción (Vercel)

### Variables Disponibles

#### URLs del Backend
```bash
# URL base del API del backend
VITE_API_BASE_URL=http://localhost:3001/api

# URL del servidor de Socket.io
VITE_SOCKET_URL=http://localhost:3001
```

#### Configuración de la Aplicación
```bash
# Información de la aplicación
VITE_APP_NAME=UML Class Diagram Editor
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Editor moderno de diagramas UML de clases
```

#### Configuración de Autenticación
```bash
# Clave para almacenar el token JWT
VITE_JWT_STORAGE_KEY=uml_token

# Umbral para renovar token (en milisegundos)
VITE_AUTH_REFRESH_THRESHOLD=300000
```

#### Configuración de Persistencia
```bash
# Intervalo de auto-guardado (en milisegundos)
VITE_AUTO_SAVE_INTERVAL=30000

# Máximo número de diagramas locales
VITE_MAX_LOCAL_DIAGRAMS=10

# Prefijo para localStorage
VITE_LOCAL_STORAGE_PREFIX=uml_diagram_
```

#### Configuración de Exportación
```bash
# Formato de exportación por defecto
VITE_DEFAULT_EXPORT_FORMAT=json

# Formatos soportados (separados por comas)
VITE_SUPPORTED_EXPORT_FORMATS=json,png,svg,java,python,php
```

#### Configuración de Colaboración
```bash
# Habilitar colaboración en tiempo real
VITE_COLLABORATION_ENABLED=true

# Número máximo de intentos de reconexión
VITE_SOCKET_RECONNECT_ATTEMPTS=5

# Delay entre intentos de reconexión (en milisegundos)
VITE_SOCKET_RECONNECT_DELAY=1000
```

#### Configuración de Notificaciones
```bash
# Duración de notificaciones por tipo (en milisegundos)
VITE_NOTIFICATION_DURATION_SUCCESS=3000
VITE_NOTIFICATION_DURATION_WARNING=4000
VITE_NOTIFICATION_DURATION_ERROR=5000
VITE_NOTIFICATION_DURATION_INFO=2000
```

#### Configuración de UI
```bash
# Tema por defecto
VITE_DEFAULT_THEME=light

# Tamaño de la cuadrícula
VITE_GRID_SIZE=10

# Límites de zoom
VITE_ZOOM_MIN=0.2
VITE_ZOOM_MAX=3.0
```

#### Configuración de Desarrollo
```bash
# Modo debug
VITE_DEBUG_MODE=false

# Nivel de logging
VITE_LOG_LEVEL=info

# Habilitar hot reload
VITE_ENABLE_HOT_RELOAD=true
```

#### Configuración de CORS
```bash
# Origen permitido para CORS
VITE_CORS_ORIGIN=http://localhost:3000

# Habilitar credenciales en CORS
VITE_CORS_CREDENTIALS=true
```

#### Configuración de Archivos
```bash
# Tamaño máximo de archivo (en bytes)
VITE_MAX_FILE_SIZE=10485760

# Tipos de archivo permitidos (separados por comas)
VITE_ALLOWED_FILE_TYPES=json,png,svg
```

#### Configuración de Seguridad
```bash
# Habilitar HTTPS
VITE_ENABLE_HTTPS=false

# Timeout de sesión (en milisegundos)
VITE_SESSION_TIMEOUT=3600000
```

## Uso en el Código

### Acceso Directo a Variables de Entorno

```javascript
// Acceso directo (no recomendado)
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

### Uso de la Clase de Configuración (Recomendado)

```javascript
// Acceso a través de la clase de configuración
const apiUrl = window.appConfig.getApiBaseUrl();
const socketUrl = window.appConfig.getSocketUrl();

// Verificar si está en modo debug
if (window.appConfig.isDebugMode()) {
    console.log('Modo debug activado');
}

// Obtener duración de notificación
const duration = window.appConfig.getNotificationDuration('success');

// Obtener configuración completa
const config = window.appConfig.getAll();
```

### Métodos Disponibles en AppConfig

```javascript
// Obtener valor específico
const value = window.appConfig.get('key.subkey', defaultValue);

// Obtener URL base del API
const apiUrl = window.appConfig.getApiBaseUrl();

// Obtener URL del socket
const socketUrl = window.appConfig.getSocketUrl();

// Verificar modo debug
const isDebug = window.appConfig.isDebugMode();

// Verificar si la colaboración está habilitada
const collaborationEnabled = window.appConfig.isCollaborationEnabled();

// Obtener duración de notificación por tipo
const duration = window.appConfig.getNotificationDuration('success');

// Obtener configuración completa
const allConfig = window.appConfig.getAll();

// Log de configuración (solo en modo debug)
window.appConfig.logConfig();
```

## Configuración para Diferentes Entornos

### Desarrollo Local
```bash
# .env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_DEBUG_MODE=true
VITE_ENABLE_HOT_RELOAD=true
VITE_ENABLE_HTTPS=false
```

### Producción (Vercel)
```bash
# .env.production
VITE_API_BASE_URL=https://tu-backend-url.vercel.app/api
VITE_SOCKET_URL=https://tu-backend-url.vercel.app
VITE_DEBUG_MODE=false
VITE_ENABLE_HOT_RELOAD=false
VITE_ENABLE_HTTPS=true
VITE_CORS_ORIGIN=https://tu-frontend-url.vercel.app
```

## Archivos Modificados

Los siguientes archivos han sido actualizados para usar variables de entorno:

1. **`js/config.js`** - Nueva clase de configuración centralizada
2. **`js/api.js`** - Usa `window.appConfig.getApiBaseUrl()`
3. **`js/codeGenerator.js`** - Usa `window.appConfig.getApiBaseUrl()`
4. **`js/socket-manager.js`** - Usa `window.appConfig.getSocketUrl()`
5. **`index.html`** - Incluye el script de configuración

## Beneficios

1. **Configuración Centralizada**: Todas las variables están en un solo lugar
2. **Fácil Cambio de Entorno**: Solo cambiar las variables de entorno
3. **Fallbacks Seguros**: Valores por defecto si las variables no están definidas
4. **Type Safety**: Validación de tipos y valores
5. **Debugging**: Logs automáticos en modo debug
6. **Mantenibilidad**: Código más limpio y fácil de mantener

## Notas Importantes

- Todas las variables de entorno del frontend deben empezar con `VITE_`
- Las variables se cargan automáticamente desde `.env` y `.env.production`
- El archivo `config.js` debe cargarse antes que los otros scripts
- Los fallbacks aseguran que la aplicación funcione incluso sin variables de entorno
- En modo debug, se muestran logs de configuración en la consola
