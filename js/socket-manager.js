/**
 * Socket Manager - Gestión de comunicación en tiempo real
 * Maneja la conexión WebSocket para colaboración en tiempo real
 */

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentDiagramId = null;
    this.connectedUsers = [];
    this.eventListeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  /**
   * Conectar al servidor Socket.io
   */
  async connect() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No hay token de autenticación para Socket.io');
        return false;
      }

      // Importar Socket.io client
      if (!window.io) {
        await this.loadSocketIOClient();
      }

      // Obtener URL del socket desde configuración centralizada
      const socketUrl = window.appConfig?.getSocketUrl() || 'http://localhost:3001';
      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      this.setupEventHandlers();
      
      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          console.log('✅ Conectado a Socket.io');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.emit('socketConnected');
          resolve(true);
        });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión Socket.io:', error);
        this.isConnected = false;
        this.emit('socketError', error);
        
        // Si es error de JWT, intentar renovar token
        if (error.message.includes('jwt expired') || error.message.includes('Token inválido')) {
          console.log('🔄 Token JWT expirado, intentando renovar...');
          this.handleTokenExpired();
        }
        
        resolve(false);
      });
      });

    } catch (error) {
      console.error('Error conectando Socket.io:', error);
      return false;
    }
  }

  /**
   * Cargar cliente Socket.io dinámicamente
   */
  async loadSocketIOClient() {
    return new Promise((resolve, reject) => {
      if (window.io) {
        console.log('✅ Socket.io ya está cargado');
        resolve();
        return;
      }

      console.log('🔄 Cargando Socket.io client...');
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
      script.onload = () => {
        console.log('✅ Socket.io client cargado exitosamente');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Error cargando Socket.io client');
        reject(new Error('Error cargando Socket.io client'));
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Configurar manejadores de eventos de Socket.io
   */
  setupEventHandlers() {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Desconectado de Socket.io:', reason);
      this.isConnected = false;
      this.emit('socketDisconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Reconexión manual requerida
        this.handleReconnection();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconectado a Socket.io después de', attemptNumber, 'intentos');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('socketReconnected');
      
      // Volver a unirse al diagrama actual si existe
      if (this.currentDiagramId) {
        this.joinDiagram(this.currentDiagramId);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Error de reconexión:', error);
      this.emit('socketReconnectError', error);
    });

    // Eventos de usuarios - Compatibles con backend mejorado
    this.socket.on('userJoined', (data) => {
      console.log('👤 Usuario se unió:', data.user.username || data.user.firstName);
      this.emit('userJoined', data);
    });

    this.socket.on('userLeft', (data) => {
      console.log('👤 Usuario salió:', data.user.username || data.user.firstName);
      this.emit('userLeft', data);
    });

    this.socket.on('usersUpdated', (users) => {
      console.log('👥 Usuarios conectados:', users);
      this.connectedUsers = users;
      this.emit('usersUpdated', users);
    });

    // Eventos de elementos del diagrama - Compatible con backend mejorado
    this.socket.on('elementAdded', (data) => {
      console.log('➕ Elemento agregado por:', data.user.username || data.user.firstName);
      this.emit('elementAdded', data);
    });

    this.socket.on('elementUpdated', (data) => {
      console.log('✏️ Elemento actualizado por:', data.user.username || data.user.firstName);
      this.emit('elementUpdated', data);
    });

    this.socket.on('elementDeleted', (data) => {
      console.log('🗑️ Elemento eliminado por:', data.user.username || data.user.firstName);
      this.emit('elementDeleted', data);
    });

    // Eventos de bloqueo - Compatible con backend mejorado
    this.socket.on('elementLocked', (data) => {
      console.log('🔒 Elemento bloqueado por:', data.user.username || data.user.firstName);
      this.emit('elementLocked', data);
    });

    this.socket.on('elementUnlocked', (data) => {
      console.log('🔓 Elemento desbloqueado por:', data.user.username || data.user.firstName);
      this.emit('elementUnlocked', data);
    });

    this.socket.on('elementLockSuccess', (data) => {
      console.log('✅ Elemento bloqueado exitosamente:', data.elementId);
      this.emit('elementLockSuccess', data);
    });

    this.socket.on('elementLockFailed', (data) => {
      console.log('❌ Error bloqueando elemento:', data.reason);
      this.emit('elementLockFailed', data);
    });

    this.socket.on('lockedElements', (elements) => {
      console.log('🔒 Elementos bloqueados recibidos:', Object.keys(elements).length);
      this.emit('lockedElements', elements);
    });

    // Eventos de cursor - Compatible con backend mejorado
    this.socket.on('cursorMoved', (data) => {
      this.emit('cursorMoved', data);
    });

    // Eventos de confirmación
    this.socket.on('elementAddedConfirm', (data) => {
      console.log('✅ Confirmación de elemento agregado:', data.elementId);
      this.emit('elementAddedConfirm', data);
    });

    this.socket.on('elementUpdatedConfirm', (data) => {
      console.log('✅ Confirmación de elemento actualizado:', data.elementId);
      this.emit('elementUpdatedConfirm', data);
    });

    this.socket.on('elementDeletedConfirm', (data) => {
      console.log('✅ Confirmación de elemento eliminado:', data.elementId);
      this.emit('elementDeletedConfirm', data);
    });

    // Eventos de error
    this.socket.on('error', (error) => {
      console.error('❌ Error del servidor:', error);
      this.emit('serverError', error);
    });

    // Eventos de ping/pong para mantener conexión
    this.socket.on('pong', () => {
      // Respuesta al ping
    });
  }

  /**
   * Manejar token JWT expirado
   */
  async handleTokenExpired() {
    try {
      console.log('🔄 Intentando renovar token JWT...');
      
      if (window.api && window.api.refreshAccessToken) {
        const refreshed = await window.api.refreshAccessToken();
        if (refreshed) {
          console.log('✅ Token renovado exitosamente');
          // Reconectar con el nuevo token
          await this.connect();
        } else {
          console.log('❌ No se pudo renovar el token, redirigiendo a login');
          window.location.href = 'src/login.html';
        }
      } else {
        console.log('❌ API client no disponible, redirigiendo a login');
        window.location.href = 'src/login.html';
      }
    } catch (error) {
      console.error('Error renovando token:', error);
      window.location.href = 'src/login.html';
    }
  }

  /**
   * Manejar reconexión automática
   */
  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo número de intentos de reconexión alcanzado');
      this.emit('socketReconnectFailed');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Backoff exponencial
    console.log(`🔄 Intentando reconectar en ${delay}ms...`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Unirse a un diagrama
   */
  joinDiagram(diagramId) {
    if (!this.isConnected) {
      console.warn('No conectado a Socket.io');
      return;
    }

    if (this.currentDiagramId && this.currentDiagramId !== diagramId) {
      this.leaveDiagram(this.currentDiagramId);
    }

    this.currentDiagramId = diagramId;
    this.socket.emit('diagram:join', diagramId);
    console.log('📊 Unido al diagrama:', diagramId);
  }

  /**
   * Salir de un diagrama
   */
  leaveDiagram(diagramId = null) {
    if (!this.isConnected) return;

    const targetDiagramId = diagramId || this.currentDiagramId;
    if (targetDiagramId) {
      this.socket.emit('diagram:leave', targetDiagramId);
      console.log('📊 Salido del diagrama:', targetDiagramId);
      
      if (targetDiagramId === this.currentDiagramId) {
        this.currentDiagramId = null;
        this.connectedUsers = [];
      }
    }
  }

  /**
   * Agregar elemento al diagrama
   */
  addElement(element) {
    if (!this.isConnected || !this.currentDiagramId) return;

    this.socket.emit('diagram:element:add', {
      diagramId: this.currentDiagramId,
      element: element
    });
  }

  /**
   * Actualizar elemento del diagrama
   */
  updateElement(elementId, changes) {
    if (!this.isConnected || !this.currentDiagramId) return;

    this.socket.emit('diagram:element:update', {
      diagramId: this.currentDiagramId,
      elementId: elementId,
      changes: changes
    });
  }

  /**
   * Eliminar elemento del diagrama
   */
  deleteElement(elementId) {
    if (!this.isConnected || !this.currentDiagramId) return;

    this.socket.emit('diagram:element:delete', {
      diagramId: this.currentDiagramId,
      elementId: elementId
    });
  }

  /**
   * Bloquear elemento
   */
  lockElement(elementId) {
    if (!this.isConnected || !this.currentDiagramId) return;

    this.socket.emit('element:lock', {
      diagramId: this.currentDiagramId,
      elementId: elementId
    });
  }

  /**
   * Desbloquear elemento
   */
  unlockElement(elementId) {
    if (!this.isConnected || !this.currentDiagramId) return;

    this.socket.emit('element:unlock', {
      diagramId: this.currentDiagramId,
      elementId: elementId
    });
  }

  /**
   * Mover cursor
   */
  moveCursor(position) {
    if (!this.isConnected || !this.currentDiagramId) return;

    // Throttle cursor movement para evitar spam
    if (!this.cursorThrottle) {
      this.cursorThrottle = true;
      
      this.socket.emit('cursor:move', {
        diagramId: this.currentDiagramId,
        position: position
      });

      setTimeout(() => {
        this.cursorThrottle = false;
      }, 100); // 100ms throttle
    }
  }

  /**
   * Desconectar
   */
  disconnect() {
    if (this.socket) {
      if (this.currentDiagramId) {
        this.leaveDiagram();
      }
      
      this.stopPingInterval();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentDiagramId = null;
      this.connectedUsers = [];
      console.log('🔌 Desconectado de Socket.io');
    }
  }

  /**
   * Agregar listener de evento
   */
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remover listener de evento
   */
  off(event, callback = null) {
    if (!this.eventListeners[event]) return;

    if (callback) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    } else {
      delete this.eventListeners[event];
    }
  }

  /**
   * Emitir evento interno
   */
  emit(event, data = null) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en event listener ${event}:`, error);
        }
      });
    }
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      currentDiagram: this.currentDiagramId,
      connectedUsers: this.connectedUsers,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Verificar si está conectado
   */
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  /**
   * Enviar ping para mantener conexión
   */
  ping() {
    if (this.isConnected && this.socket) {
      this.socket.emit('ping');
    }
  }

  /**
   * Iniciar ping automático cada 30 segundos
   */
  startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.ping();
    }, 30000);
  }

  /**
   * Detener ping automático
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Crear instancia global
window.socketManager = new SocketManager();

// Auto-conectar si hay token de autenticación
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Esperar un poco para asegurar que la página esté cargada
    setTimeout(() => {
      window.socketManager.connect();
    }, 1000);
  }
});

// Desconectar al cerrar la página
window.addEventListener('beforeunload', () => {
  if (window.socketManager) {
    window.socketManager.disconnect();
  }
});