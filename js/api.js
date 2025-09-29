/**
 * API Client - Cliente para comunicación con el backend
 * Maneja autenticación, peticiones HTTP y manejo de errores
 */

class APIClient {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.token = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Realizar petición HTTP
   * @param {string} endpoint - Endpoint de la API
   * @param {object} options - Opciones de la petición
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Agregar token de autorización si existe
    if (this.token && !options.skipAuth) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    // Log para depuración
    console.log(`API Request: ${options.method || 'GET'} ${url}`, {
      headers: config.headers,
      body: config.body ? JSON.parse(config.body) : undefined
    });

    try {
      const response = await fetch(url, config);
      
      // Intentar parsear la respuesta como JSON
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Si no es JSON, obtener como texto
        data = { text: await response.text() };
      }
      
      // Log de respuesta
      console.log(`API Response: ${response.status} ${response.statusText}`, {
        data: data,
        url: url,
        method: options.method || 'GET'
      });

      if (!response.ok) {
        // Intentar renovar token si es 401
        if (response.status === 401 && this.refreshToken && !options.skipRefresh) {
          console.log('Token expirado, intentando renovar...');
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            console.log('Token renovado exitosamente, reintentando petición...');
            // Reintentar petición original
            return this.request(endpoint, { ...options, skipRefresh: true });
          } else {
            // Token inválido, cerrar sesión
            console.log('No se pudo renovar el token, cerrando sesión...');
            this.handleAuthError();
            throw new Error('Sesión expirada');
          }
        }

        throw new APIError(data.message || data.error || 'Error en la petición', response.status, data);
      }

      return data;

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      console.error('Error de red:', error);
      throw new APIError('Error de conexión con el servidor', 0, { originalError: error });
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Renovar token de acceso
   */
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const response = await this.post('/auth/refresh', {
        refreshToken: this.refreshToken
      }, { skipAuth: true, skipRefresh: true });

      if (response.success) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        return true;
      }

      return false;

    } catch (error) {
      console.error('Error renovando token:', error);
      return false;
    }
  }

  /**
   * Establecer tokens de autenticación
   */
  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    
    if (accessToken) {
      localStorage.setItem('authToken', accessToken);
    } else {
      localStorage.removeItem('authToken');
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Limpiar tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Manejar error de autenticación
   */
  handleAuthError() {
    this.clearTokens();
    localStorage.removeItem('userData');
    
    // Redirigir a login si no está ya ahí
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/src/login.html';
    }
  }

  // === MÉTODOS DE AUTENTICACIÓN ===

  /**
   * Iniciar sesión
   */
  async login(email, password, remember = false) {
    const response = await this.post('/auth/login', {
      email,
      password,
      remember
    }, { skipAuth: true });

    if (response.success) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      if (remember) {
        localStorage.setItem('rememberUser', 'true');
        localStorage.setItem('savedEmail', email);
      }
    }

    return response;
  }

  /**
   * Registrar usuario
   */
  async register(userData) {
    // Generar username si no se proporciona
    if (!userData.username) {
      userData.username = userData.email.split('@')[0];
    }

    const response = await this.post('/auth/register', userData, { skipAuth: true });

    if (response.success) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.clearTokens();
      localStorage.removeItem('userData');
    }
  }

  /**
   * Obtener perfil actual
   */
  async getProfile() {
    return this.get('/auth/profile');
  }

  /**
   * Actualizar perfil
   */
  async updateProfile(updates) {
    return this.put('/auth/profile', updates);
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    return this.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  // === MÉTODOS DE PROYECTOS ===

  /**
   * Obtener proyectos
   */
  async getProjects(params = {}) {
    return this.get('/projects', params);
  }

  /**
   * Obtener proyecto específico
   */
  async getProject(id) {
    return this.get(`/projects/${id}`);
  }

  /**
   * Crear proyecto
   */
  async createProject(projectData) {
    return this.post('/projects', projectData);
  }

  /**
   * Actualizar proyecto
   */
  async updateProject(id, updates) {
    return this.put(`/projects/${id}`, updates);
  }

  /**
   * Eliminar proyecto
   */
  async deleteProject(id) {
    return this.delete(`/projects/${id}`);
  }

  /**
   * Invitar miembro al proyecto
   */
  async inviteProjectMember(projectId, email, role = 'viewer') {
    return this.post(`/projects/${projectId}/members`, { email, role });
  }

  /**
   * Remover miembro del proyecto
   */
  async removeProjectMember(projectId, userId) {
    return this.delete(`/projects/${projectId}/members/${userId}`);
  }

  // === MÉTODOS DE DIAGRAMAS ===

  /**
   * Obtener diagramas de un proyecto
   */
  async getDiagrams(projectId, params = {}) {
    return this.get(`/projects/${projectId}/diagrams`, params);
  }

  /**
   * Obtener diagrama específico
   */
  async getDiagram(diagramId) {
    return this.get(`/diagrams/${diagramId}`);
  }

  /**
   * Crear diagrama
   */
  async createDiagram(projectId, diagramData) {
    return this.post(`/projects/${projectId}/diagrams`, diagramData);
  }

  /**
   * Actualizar diagrama
   */
  async updateDiagram(diagramId, updates) {
    return this.put(`/diagrams/${diagramId}`, updates);
  }

  /**
   * Eliminar diagrama
   */
  async deleteDiagram(diagramId) {
    return this.delete(`/diagrams/${diagramId}`);
  }

  /**
   * Actualización rápida de diagrama (para debugging)
   */
  async quickUpdateDiagram(diagramId, content) {
    return this.request('PATCH', `/diagrams/${diagramId}/quick-update`, { content });
  }
}

/**
 * Clase de error personalizada para API
 */
class APIError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Crear instancia global
window.apiClient = new APIClient();

// Exportar también como 'api' para compatibilidad
window.api = window.apiClient;