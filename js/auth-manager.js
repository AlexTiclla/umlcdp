/**
 * Sistema de Autenticación Real
 * Gestiona usuarios, sesiones y autenticación con backend
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.apiClient = null;
        this.init();
    }

    /**
     * Cargar usuario desde localStorage si existe token válido
     */
    loadStoredUser() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('userData');
            }
        }
        return null;
    }

    /**
     * Inicializar el API client
     */
    initApiClient() {
        if (window.apiClient) {
            this.apiClient = window.apiClient;
            return true;
        }
        return false;
    }

    /**
     * Inicializar el sistema de autenticación
     */
    init() {
        // Intentar inicializar el API client
        if (!this.initApiClient()) {
            // Si no está disponible, esperar un poco y reintentar
            setTimeout(() => {
                this.initApiClient();
            }, 100);
        }

        // Verificar si hay sesión activa
        const token = localStorage.getItem('authToken');
        if (token) {
            this.currentUser = this.loadStoredUser();
            if (this.currentUser) {
                // Solo validar sesión si el API client está disponible
                if (this.apiClient) {
                    this.validateSession();
                } else {
                    console.log('⚠️ API Client no disponible, usando datos almacenados');
                }
            }
        }

        // Configurar listeners para cambios de autenticación
        this.setupAuthListeners();
    }

    /**
     * Configurar listeners de autenticación
     */
    setupAuthListeners() {
        // Escuchar cambios en localStorage (para múltiples pestañas)
        window.addEventListener('storage', (e) => {
            if (e.key === 'authToken' && !e.newValue) {
                this.logout();
            }
        });

        // Escuchar antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            if (this.currentUser) {
                this.updateLastLogin();
            }
        });
    }

    /**
     * Validar sesión actual
     */
    async validateSession() {
        try {
            const response = await this.apiClient.getProfile();
            if (response.success) {
                this.currentUser = response.data.user;
                localStorage.setItem('userData', JSON.stringify(this.currentUser));
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Error validando sesión:', error);
            this.logout();
        }
    }

    /**
     * Iniciar sesión
     */
    async login(email, password, remember = false) {
        try {
            // Verificar si el API client está disponible
            if (!this.apiClient) {
                if (!this.initApiClient()) {
                    throw new Error('API Client no disponible. Intenta recargar la página.');
                }
            }

            const response = await this.apiClient.login(email, password, remember);
            
            if (response.success) {
                this.currentUser = response.data.user;
                
                // Disparar evento de login
                this.dispatchAuthEvent('login', this.currentUser);

                return {
                    success: true,
                    user: this.currentUser,
                    message: 'Inicio de sesión exitoso'
                };
            } else {
                throw new Error(response.message || 'Error en el login');
            }

        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Registrar nuevo usuario
     */
    async register(userData) {
        try {
            // Verificar si el API client está disponible
            if (!this.apiClient) {
                if (!this.initApiClient()) {
                    throw new Error('API Client no disponible. Intenta recargar la página.');
                }
            }

            const response = await this.apiClient.register(userData);
            
            if (response.success) {
                this.currentUser = response.data.user;
                
                // Disparar evento de registro
                this.dispatchAuthEvent('register', this.currentUser);

                return {
                    success: true,
                    message: response.message || 'Cuenta creada exitosamente',
                    user: this.currentUser
                };
            } else {
                throw new Error(response.message || 'Error en el registro');
            }

        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    /**
     * Cerrar sesión
     */
    async logout() {
        try {
            if (this.apiClient) {
                await this.apiClient.logout();
            } else {
                console.log('⚠️ API Client no disponible, limpiando datos localmente');
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            this.currentUser = null;
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            
            // Disparar evento de logout
            this.dispatchAuthEvent('logout', null);
        }
    }

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
        const hasToken = localStorage.getItem('authToken') !== null;
        const hasUserData = localStorage.getItem('userData') !== null;
        
        // Si tenemos datos almacenados pero no en memoria, cargarlos
        if (hasToken && hasUserData && !this.currentUser) {
            this.currentUser = this.loadStoredUser();
        }
        
        return this.currentUser !== null && hasToken;
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verificar permisos de usuario
     */
    hasPermission(permission) {
        if (!this.currentUser) return false;

        const rolePermissions = {
            admin: ['read', 'write', 'delete', 'manage_users', 'manage_projects'],
            editor: ['read', 'write'],
            viewer: ['read']
        };

        return rolePermissions[this.currentUser.role]?.includes(permission) || false;
    }

    /**
     * Verificar si es propietario de un proyecto
     */
    isProjectOwner(projectOwnerId) {
        return this.currentUser && this.currentUser.id === projectOwnerId;
    }

    /**
     * Validar datos de registro
     */
    validateRegistrationData(userData) {
        if (!userData.firstName?.trim()) {
            throw new Error('El nombre es requerido');
        }
        if (!userData.lastName?.trim()) {
            throw new Error('El apellido es requerido');
        }
        if (!userData.email?.trim()) {
            throw new Error('El email es requerido');
        }
        if (!this.isValidEmail(userData.email)) {
            throw new Error('El email no es válido');
        }
        if (!userData.password?.trim()) {
            throw new Error('La contraseña es requerida');
        }
        if (userData.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Las contraseñas no coinciden');
        }
    }

    /**
     * Validar email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Generar token mock
     */
    generateMockToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            iat: Date.now(),
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        };
        
        return btoa(JSON.stringify(payload));
    }

    /**
     * Sanitizar datos de usuario (remover información sensible)
     */
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    /**
     * Actualizar último login
     */
    updateLastLogin() {
        if (this.currentUser) {
            this.currentUser.last_login = new Date().toISOString();
            this.currentUser.updated_at = new Date().toISOString();
            
            // Actualizar en la lista de usuarios
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = this.currentUser;
                localStorage.setItem('mockUsers', JSON.stringify(this.users));
                localStorage.setItem('userData', JSON.stringify(this.currentUser));
            }
        }
    }

    /**
     * Simular envío de email de verificación
     */
    simulateEmailVerification(user) {
        console.log(`📧 Email de verificación enviado a: ${user.email}`);
        console.log(`🔗 Link de verificación: https://umleditor.com/verify?token=${user.id}`);
        
        // En un entorno real, aquí se enviaría un email real
        // Por ahora, simulamos que el usuario hace clic en el link
        setTimeout(() => {
            this.verifyEmail(user.id);
        }, 2000);
    }

    /**
     * Verificar email (simulado)
     */
    verifyEmail(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].email_verified = true;
            this.users[userIndex].updated_at = new Date().toISOString();
            localStorage.setItem('mockUsers', JSON.stringify(this.users));
            
            console.log(`✅ Email verificado para usuario: ${this.users[userIndex].email}`);
        }
    }

    /**
     * Disparar evento de autenticación
     */
    dispatchAuthEvent(type, user) {
        const event = new CustomEvent('authChange', {
            detail: { type, user }
        });
        window.dispatchEvent(event);
    }

    /**
     * Obtener usuarios para administración (solo admin)
     */
    getAllUsers() {
        if (!this.hasPermission('manage_users')) {
            throw new Error('No tienes permisos para ver todos los usuarios');
        }
        return this.users.map(user => this.sanitizeUser(user));
    }

    /**
     * Actualizar perfil de usuario
     */
    updateProfile(updates) {
        if (!this.currentUser) {
            throw new Error('Usuario no autenticado');
        }

        const allowedUpdates = ['first_name', 'last_name', 'username', 'avatar_url'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        // Actualizar usuario actual
        Object.assign(this.currentUser, filteredUpdates);
        this.currentUser.updated_at = new Date().toISOString();

        // Actualizar en la lista de usuarios
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('mockUsers', JSON.stringify(this.users));
            localStorage.setItem('userData', JSON.stringify(this.currentUser));
        }

        return this.sanitizeUser(this.currentUser);
    }
}

// Crear instancia global
window.authManager = new AuthManager();

// Exportar para uso en módulos
if (typeof module !== "undefined" && module.exports) {
    module.exports = AuthManager;
}
