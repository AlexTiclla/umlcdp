/**
 * Collaboration Manager - Gestiona la colaboración en tiempo real en el editor UML
 */

class CollaborationManager {
    constructor() {
        this.graph = null;
        this.paper = null;
        this.currentProjectId = null;
        this.currentDiagramId = null;
        this.isInitialized = false;
        this.lockedElements = new Set();
        this.remoteCursors = new Map();
        this.collaborators = new Map();
        this.isLocalChange = false;
        
        this.init();
    }

    async init() {
        try {
            // Verificar autenticación
            await this.checkAuthentication();
            
            // Obtener información del proyecto actual
            await this.loadCurrentProject();
            
            // Inicializar Socket.io si hay proyecto
            if (this.currentProjectId) {
                await this.initializeSocket();
            }
            
            // Configurar eventos del diagrama
            this.setupDiagramEvents();
            
            // Configurar UI de colaboración
            this.setupCollaborationUI();
            
            this.isInitialized = true;
            console.log('✅ Collaboration Manager inicializado');
            
        } catch (error) {
            console.error('Error inicializando Collaboration Manager:', error);
        }
    }

    async checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
            this.showSkipLoginOption();
            return;
        }
        
        try {
            this.currentUser = JSON.parse(userData);
            this.updateAuthenticatedUI();
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.showSkipLoginOption();
        }
    }

    async loadCurrentProject() {
        this.currentProjectId = localStorage.getItem('currentProjectId');
        
        if (!this.currentProjectId) {
            console.log('No hay proyecto actual seleccionado');
            return;
        }

        try {
            if (window.api && this.currentUser) {
                const response = await window.api.getProject(this.currentProjectId);
                if (response.success) {
                    this.currentProject = response.data;
                    console.log('Proyecto cargado:', this.currentProject.name);
                    
                    // Obtener o crear diagrama principal
                    await this.loadMainDiagram();
                    
                    // Actualizar título de la página
                    document.title = `${this.currentProject.name} - UML Editor`;
                }
            }
        } catch (error) {
            console.error('Error cargando proyecto:', error);
        }
    }

    async loadMainDiagram() {
        try {
            if (!this.currentProject) return;
            
            const response = await window.api.getDiagrams(this.currentProjectId);
            
            if (response.success && response.data.diagrams.length > 0) {
                // Usar el primer diagrama o crear uno nuevo
                this.currentDiagramId = response.data.diagrams[0].id;
                this.currentDiagram = response.data.diagrams[0];
                
                // Cargar contenido del diagrama si existe
                if (this.currentDiagram.content) {
                    this.loadDiagramContent(this.currentDiagram.content);
                }
                
                // 🔥 CONECTAR AL SOCKET DEL DIAGRAMA
                if (window.socketManager && window.socketManager.isSocketConnected()) {
                    console.log(`📊 Conectando al diagrama: ${this.currentDiagramId}`);
                    window.socketManager.joinDiagram(this.currentDiagramId);
                } else {
                    console.warn('⚠️ Socket no conectado, reintentando en 2 segundos...');
                    setTimeout(() => {
                        if (window.socketManager && window.socketManager.isSocketConnected()) {
                            window.socketManager.joinDiagram(this.currentDiagramId);
                        }
                    }, 2000);
                }
            } else {
                // Crear diagrama por defecto
                await this.createDefaultDiagram();
            }
        } catch (error) {
            console.error('Error cargando diagrama:', error);
        }
    }

    async createDefaultDiagram() {
        try {
            const diagramData = {
                name: 'Diagrama Principal',
                description: 'Diagrama principal del proyecto',
                content: JSON.stringify({ cells: [] })
            };
            
            const response = await window.api.createDiagram(this.currentProjectId, diagramData);
            
            if (response.success) {
                this.currentDiagramId = response.data.id;
                this.currentDiagram = response.data;
                console.log('Diagrama creado:', this.currentDiagram.name);
                
                // 🔥 CONECTAR AL SOCKET DEL DIAGRAMA RECIÉN CREADO
                if (window.socketManager && window.socketManager.isSocketConnected()) {
                    console.log(`📊 Conectando al diagrama recién creado: ${this.currentDiagramId}`);
                    window.socketManager.joinDiagram(this.currentDiagramId);
                } else {
                    console.warn('⚠️ Socket no conectado para diagrama nuevo, reintentando...');
                    setTimeout(() => {
                        if (window.socketManager && window.socketManager.isSocketConnected()) {
                            window.socketManager.joinDiagram(this.currentDiagramId);
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Error creando diagrama:', error);
        }
    }

    loadDiagramContent(content) {
        try {
            if (!this.graph) return;
            
            const diagramData = JSON.parse(content);
            this.isLocalChange = true;
            this.graph.fromJSON(diagramData);
            this.isLocalChange = false;
            
            console.log('Contenido del diagrama cargado');
        } catch (error) {
            console.error('Error cargando contenido del diagrama:', error);
        }
    }

    async initializeSocket() {
        if (!window.socketManager) {
            console.warn('❌ Socket Manager no disponible');
            return;
        }

        console.log('🔄 Inicializando Socket.io...');

        // Conectar socket si no está conectado
        if (!window.socketManager.isSocketConnected()) {
            console.log('🔄 Conectando a Socket.io...');
            const connected = await window.socketManager.connect();
            if (!connected) {
                console.error('❌ No se pudo conectar a Socket.io');
                return;
            }
        }

        // Unirse al diagrama
        if (this.currentDiagramId) {
            console.log(`📊 Uniéndose al diagrama: ${this.currentDiagramId}`);
            window.socketManager.joinDiagram(this.currentDiagramId);
        } else {
            console.warn('⚠️ No hay diagrama actual para unirse');
        }

        // Configurar eventos de colaboración
        this.setupSocketEvents();
        console.log('✅ Socket.io inicializado correctamente');
    }

    setupSocketEvents() {
        if (!window.socketManager) return;

        // Eventos de usuarios con logs de debugging
        window.socketManager.on('usersUpdated', (users) => {
            console.log('👥 USERS UPDATED evento recibido:', users);
            this.updateCollaboratorsList(users);
        });

        window.socketManager.on('userJoined', (data) => {
            console.log('👤 USER JOINED evento recibido:', data);
            this.showUserNotification(`${data.user.firstName} se unió al proyecto`, 'info');
        });

        window.socketManager.on('userLeft', (data) => {
            console.log('👤 USER LEFT evento recibido:', data);
            this.showUserNotification(`${data.user.firstName} salió del proyecto`, 'info');
        });

        // Eventos de elementos
        window.socketManager.on('elementAdded', (data) => {
            this.handleRemoteElementAdd(data);
        });

        window.socketManager.on('elementUpdated', (data) => {
            this.handleRemoteElementUpdate(data);
        });

        window.socketManager.on('elementDeleted', (data) => {
            this.handleRemoteElementDelete(data);
        });

        // Eventos de bloqueo
        window.socketManager.on('elementLocked', (data) => {
            this.handleElementLocked(data);
        });

        window.socketManager.on('elementUnlocked', (data) => {
            this.handleElementUnlocked(data);
        });

        // Eventos de cursor
        window.socketManager.on('cursorMoved', (data) => {
            this.handleRemoteCursor(data);
        });
    }

    setupDiagramEvents() {
        // Esperar a que el graph esté disponible
        const checkGraph = () => {
            if (window.graph && window.paper) {
                this.graph = window.graph;
                this.paper = window.paper;
                this.attachDiagramEventListeners();
            } else {
                setTimeout(checkGraph, 100);
            }
        };
        checkGraph();
    }

    attachDiagramEventListeners() {
        if (!this.graph || !this.paper) {
            console.warn('❌ Graph o Paper no disponibles aún');
            return;
        }

        console.log('🔥 Configurando event listeners del diagrama...');

        // Eventos de cambios en el grafo
        this.graph.on('add', (cell) => {
            console.log('📊 GRAPH ADD evento:', cell.id, 'isLocalChange:', this.isLocalChange, 'currentUser:', !!this.currentUser);
            if (!this.isLocalChange && this.currentUser) {
                this.handleLocalElementAdd(cell);
            }
        });

        this.graph.on('change', (cell, opt) => {
            console.log('📊 GRAPH CHANGE evento:', cell.id, 'isLocalChange:', this.isLocalChange, 'currentUser:', !!this.currentUser);
            if (!this.isLocalChange && this.currentUser) {
                this.handleLocalElementUpdate(cell, opt);
            }
        });

        this.graph.on('remove', (cell) => {
            console.log('📊 GRAPH REMOVE evento:', cell.id, 'isLocalChange:', this.isLocalChange, 'currentUser:', !!this.currentUser);
            if (!this.isLocalChange && this.currentUser) {
                this.handleLocalElementDelete(cell);
            }
        });

        // Eventos del paper
        this.paper.on('element:pointerdown', (elementView, evt) => {
            if (this.currentUser) {
                this.handleElementSelect(elementView.model);
            }
        });

        this.paper.on('element:pointerup', (elementView, evt) => {
            if (this.currentUser) {
                this.handleElementDeselect(elementView.model);
            }
        });

        // Eventos de mouse para cursor compartido
        this.paper.on('blank:pointermove', (evt) => {
            if (this.currentUser && window.socketManager && window.socketManager.isSocketConnected()) {
                const position = { x: evt.offsetX, y: evt.offsetY };
                window.socketManager.moveCursor(position);
            }
        });

        console.log('Eventos del diagrama configurados');
    }

    handleLocalElementAdd(cell) {
        const isLink = cell.isLink();
        const elementType = isLink ? 'relación' : 'elemento';
        console.log(`🚀 LOCAL ADD detectado: ${elementType}`, cell.id, cell.get('type'));
        
        const element = this.serializeElement(cell);
        if (window.socketManager && window.socketManager.isSocketConnected()) {
            console.log(`📤 Enviando ${elementType} via socket:`, element);
            window.socketManager.addElement(element);
        } else {
            console.warn(`❌ Socket no conectado para enviar ${elementType}`);
        }
        this.saveDiagram();
    }

    handleLocalElementUpdate(cell, opt) {
        console.log('🚀 LOCAL UPDATE detectado:', cell.id, opt);
        const changes = this.getElementChanges(cell, opt);
        if (window.socketManager && window.socketManager.isSocketConnected()) {
            console.log('📤 Enviando actualización via socket:', cell.id, changes);
            window.socketManager.updateElement(cell.id, changes);
        } else {
            console.warn('❌ Socket no conectado para actualizar elemento');
        }
        this.saveDiagram();
    }

    handleLocalElementDelete(cell) {
        console.log('🚀 LOCAL DELETE detectado:', cell.id);
        if (window.socketManager && window.socketManager.isSocketConnected()) {
            console.log('📤 Enviando eliminación via socket:', cell.id);
            window.socketManager.deleteElement(cell.id);
        } else {
            console.warn('❌ Socket no conectado para eliminar elemento');
        }
        this.saveDiagram();
    }

    handleRemoteElementAdd(data) {
        console.log('📥 REMOTE ADD recibido:', data);
        if (!this.graph) return;
        
        this.isLocalChange = true;
        try {
            const cell = this.deserializeElement(data.element);
            if (cell) {
                this.graph.addCell(cell);
                
                const elementType = data.element.isLink ? 'relación' : 'elemento';
                this.showElementNotification(`${data.user.firstName} agregó una ${elementType}`, 'info');
                console.log(`✅ ${elementType} remoto agregado correctamente`);
            } else {
                console.warn('No se pudo deserializar el elemento remoto');
            }
        } catch (error) {
            console.error('Error agregando elemento remoto:', error);
        } finally {
            this.isLocalChange = false;
        }
    }

    handleRemoteElementUpdate(data) {
        console.log('📥 REMOTE UPDATE recibido:', data);
        if (!this.graph) return;
        
        const cell = this.graph.getCell(data.elementId);
        if (cell) {
            this.isLocalChange = true;
            try {
                this.applyElementChanges(cell, data.changes);
                this.showElementNotification(`${data.user.firstName} actualizó un elemento`, 'info');
                console.log('✅ Elemento remoto actualizado correctamente');
            } catch (error) {
                console.error('Error actualizando elemento remoto:', error);
            } finally {
                this.isLocalChange = false;
            }
        } else {
            console.warn('❌ Elemento no encontrado para actualizar:', data.elementId);
        }
    }

    handleRemoteElementDelete(data) {
        console.log('📥 REMOTE DELETE recibido:', data);
        if (!this.graph) return;
        
        const cell = this.graph.getCell(data.elementId);
        if (cell) {
            this.isLocalChange = true;
            try {
                cell.remove();
                this.showElementNotification(`${data.user.firstName} eliminó un elemento`, 'info');
                console.log('✅ Elemento remoto eliminado correctamente');
            } catch (error) {
                console.error('Error eliminando elemento remoto:', error);
            } finally {
                this.isLocalChange = false;
            }
        } else {
            console.warn('❌ Elemento no encontrado para eliminar:', data.elementId);
        }
    }

    handleElementLocked(data) {
        this.lockedElements.add(data.elementId);
        this.updateElementLockUI(data.elementId, true, data.user);
    }

    handleElementUnlocked(data) {
        this.lockedElements.delete(data.elementId);
        this.updateElementLockUI(data.elementId, false);
    }

    handleElementSelect(element) {
        if (this.lockedElements.has(element.id)) {
            return; // Elemento bloqueado
        }
        
        if (window.socketManager) {
            window.socketManager.lockElement(element.id);
        }
    }

    handleElementDeselect(element) {
        if (window.socketManager) {
            window.socketManager.unlockElement(element.id);
        }
    }

    updateElementLockUI(elementId, isLocked, user = null) {
        if (!this.paper) return;
        
        const element = this.graph.getCell(elementId);
        if (!element) return;
        
        const elementView = this.paper.findViewByModel(element);
        if (!elementView) return;
        
        if (isLocked && user) {
            // Agregar indicador visual de bloqueo
            elementView.el.classList.add('element-locked');
            elementView.el.setAttribute('data-locked-by', user.firstName);
        } else {
            // Remover indicador visual
            elementView.el.classList.remove('element-locked');
            elementView.el.removeAttribute('data-locked-by');
        }
    }

    updateCollaboratorsList(users) {
        console.log('🔄 Actualizando lista de colaboradores...');
        console.log('📝 Usuarios recibidos:', users);
        console.log('📝 Usuario actual:', this.currentUser);

        const collaboratorsList = document.getElementById('collaboratorsList');
        const noCollaborators = document.getElementById('noCollaborators');
        const collaboratorsPanel = document.getElementById('collaboratorsPanel');
        
        if (!collaboratorsList || !this.currentUser) {
            console.warn('❌ No se encontró elemento colaboratorsList o usuario actual');
            return;
        }
        
        // Filtrar usuario actual
        const otherUsers = users.filter(user => user.id !== this.currentUser.id);
        console.log('📝 Otros usuarios (sin incluir actual):', otherUsers);
        
        if (otherUsers.length === 0) {
            console.log('📝 Mostrando "Solo tú estás trabajando..."');
            collaboratorsList.innerHTML = '';
            noCollaborators.style.display = 'block';
        } else {
            console.log('📝 Mostrando lista de colaboradores:', otherUsers.length);
            noCollaborators.style.display = 'none';
            collaboratorsList.innerHTML = otherUsers.map(user => `
                <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <div class="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span class="text-xs font-medium text-indigo-600">
                            ${(user.firstName || 'U')[0]}${(user.lastName || '')[0]}
                        </span>
                    </div>
                    <span class="text-sm text-gray-700">${user.firstName} ${user.lastName}</span>
                    <div class="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                </div>
            `).join('');
        }
        
        // Mostrar panel si está autenticado
        if (this.currentUser) {
            collaboratorsPanel.classList.remove('hidden');
        }
    }

    setupCollaborationUI() {
        // Configurar botón de skip login
        const skipLoginBtn = document.getElementById('skipLoginBtn');
        if (skipLoginBtn) {
            skipLoginBtn.addEventListener('click', () => {
                this.handleSkipLogin();
            });
        }

        // Configurar botón de volver a proyectos
        const backToProjectsBtn = document.getElementById('headerBackToProjectsBtn');
        if (backToProjectsBtn) {
            backToProjectsBtn.addEventListener('click', () => {
                this.goBackToProjects();
            });
        }

        // 🔍 AGREGAR BOTÓN DE DEBUG
        this.addDebugButton();
    }

    addDebugButton() {
        // Crear botón de debug en la esquina superior derecha
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = '🔍 Debug Sockets';
        debugBtn.className = 'fixed top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded shadow-lg z-50';
        debugBtn.onclick = () => this.showDebugInfo();
        document.body.appendChild(debugBtn);
    }

    showDebugInfo() {
        const info = {
            'Usuario Actual': this.currentUser?.username || 'No autenticado',
            'Proyecto ID': this.currentProjectId,
            'Diagrama ID': this.currentDiagramId,
            'Socket Conectado': window.socketManager?.isSocketConnected() || false,
            'Socket Manager Existe': !!window.socketManager,
            'Diagrama Actual en Socket': window.socketManager?.currentDiagramId,
            'Usuarios Conectados': window.socketManager?.connectedUsers?.length || 0,
            'Graph Disponible': !!this.graph,
            'Paper Disponible': !!this.paper,
            'isInitialized': this.isInitialized,
            'window.graph': !!window.graph,
            'window.paper': !!window.paper
        };

        console.log('🔍 DEBUG INFORMACIÓN:', info);
        
        // Probar si los eventos funcionan
        if (this.graph) {
            console.log('🔥 Probando event listener del graph...');
            // Agregar un elemento de prueba muy rápido
            const testCell = new joint.shapes.basic.Rect({
                position: { x: 10, y: 10 },
                size: { width: 50, height: 30 }
            });
            this.graph.addCell(testCell);
            setTimeout(() => {
                testCell.remove();
            }, 100);
        }
        
        // Mostrar en una alerta también
        const infoText = Object.entries(info)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        
        alert(`🔍 DEBUG INFORMACIÓN:\n\n${infoText}`);
    }

    handleSkipLogin() {
        // Ocultar prompt de login
        const loginPrompt = document.getElementById('loginPrompt');
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
        }
        
        // Mostrar mensaje de modo offline
        this.showUserNotification('Trabajando en modo offline - Los cambios no se guardarán', 'warning');
    }

    goBackToProjects() {
        // Limpiar proyecto actual y volver a proyectos
        localStorage.removeItem('currentProjectId');
        window.location.href = 'src/projects.html';
    }

    updateAuthenticatedUI() {
        const loginPrompt = document.getElementById('loginPrompt');
        const authHeader = document.getElementById('authHeader');
        const userInfoHeader = document.getElementById('userInfoHeader');
        
        if (this.currentUser && loginPrompt && authHeader && userInfoHeader) {
            const fullName = `${this.currentUser.firstName || this.currentUser.first_name} ${this.currentUser.lastName || this.currentUser.last_name}`;
            userInfoHeader.textContent = `${fullName} (${this.currentUser.role})`;
            
            loginPrompt.style.display = 'none';
            authHeader.style.display = 'block';
        }
    }

    showSkipLoginOption() {
        const loginPrompt = document.getElementById('loginPrompt');
        if (loginPrompt) {
            loginPrompt.style.display = 'block';
        }
    }

    async saveDiagram() {
        if (!this.currentDiagramId || !this.graph || !this.currentUser) return;
        
        try {
            // Debounce saves
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(async () => {
                const content = JSON.stringify(this.graph.toJSON());
                const response = await window.api.updateDiagram(this.currentDiagramId, { content });
                
                if (response.success) {
                    console.log('Diagrama guardado automáticamente');
                } else {
                    console.error('Error guardando diagrama:', response.message);
                }
            }, 2000); // Guardar después de 2 segundos de inactividad
            
        } catch (error) {
            console.error('Error en saveDiagram:', error);
        }
    }

    serializeElement(cell) {
        const serialized = {
            id: cell.id,
            type: cell.get('type'),
            attributes: cell.toJSON()
        };

        // Si es un link/relación, agregar información específica
        if (cell.isLink()) {
            serialized.isLink = true;
            serialized.source = cell.get('source');
            serialized.target = cell.get('target');
            serialized.linkType = this.getLinkType(cell);
        }

        return serialized;
    }

    deserializeElement(elementData) {
        // Si es un link/relación, recrearlo usando Relationships
        if (elementData.isLink) {
            return this.deserializeLink(elementData);
        }

        // Crear el elemento basado en el tipo
        if (elementData.type === 'uml.Class') {
            return new joint.shapes.uml.Class(elementData.attributes);
        } else if (elementData.type === 'uml.Interface') {
            return new joint.shapes.uml.Interface(elementData.attributes);
        } else if (elementData.type === 'uml.Abstract') {
            return new joint.shapes.uml.Abstract(elementData.attributes);
        }
        
        // Por defecto
        return new joint.shapes.basic.Rect(elementData.attributes);
    }

    getElementChanges(cell, opt) {
        return {
            position: cell.get('position'),
            size: cell.get('size'),
            attributes: cell.get('attrs'),
            // Agregar otros cambios relevantes
        };
    }

    applyElementChanges(cell, changes) {
        if (changes.position) {
            cell.set('position', changes.position);
        }
        if (changes.size) {
            cell.set('size', changes.size);
        }
        if (changes.attributes) {
            cell.set('attrs', changes.attributes);
        }
    }

    getLinkType(cell) {
        // Determinar el tipo de relación basándose en los atributos del link
        const attrs = cell.get('attrs');
        const type = cell.get('type');
        
        if (type === 'uml.NavigableAssociation') {
            return 'navigableAssociation';
        } else if (type === 'uml.Inheritance') {
            return 'inheritance';
        } else if (type === 'uml.Implementation') {
            return 'implementation';
        } else if (attrs['.marker-target'] && attrs['.marker-target'].fill === '#000') {
            return 'composition';
        } else if (attrs['.marker-target'] && attrs['.marker-target'].fill === '#fff') {
            return 'aggregation';
        } else {
            return 'association';
        }
    }

    deserializeLink(linkData) {
        // Obtener elementos fuente y destino del graph
        const sourceElement = this.graph.getCell(linkData.source.id);
        const targetElement = this.graph.getCell(linkData.target.id);
        
        if (!sourceElement || !targetElement) {
            console.warn('No se pudieron encontrar los elementos fuente o destino para la relación');
            return null;
        }

        // Recrear la relación usando Relationships según el tipo
        let relationship;
        switch (linkData.linkType) {
            case 'association':
                relationship = Relationships.createAssociation(sourceElement, targetElement);
                break;
            case 'navigableAssociation':
                relationship = Relationships.createNavigableAssociation(sourceElement, targetElement);
                break;
            case 'inheritance':
                relationship = Relationships.createInheritance(sourceElement, targetElement);
                break;
            case 'implementation':
                relationship = Relationships.createImplementation(sourceElement, targetElement);
                break;
            case 'composition':
                relationship = Relationships.createComposition(sourceElement, targetElement);
                break;
            case 'aggregation':
                relationship = Relationships.createAggregation(sourceElement, targetElement);
                break;
            default:
                relationship = Relationships.createAssociation(sourceElement, targetElement);
        }

        // Aplicar atributos específicos si existen
        if (linkData.attributes) {
            relationship.set('attrs', linkData.attributes.attrs);
            if (linkData.attributes.labels) {
                relationship.set('labels', linkData.attributes.labels);
            }
        }

        return relationship;
    }

    showUserNotification(message, type = 'info') {
        this.showNotification(message, type, 3000);
    }

    showElementNotification(message, type = 'info') {
        this.showNotification(message, type, 2000);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-3 rounded-lg shadow-lg z-50 text-white ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-yellow-500' : 
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    destroy() {
        if (window.socketManager) {
            window.socketManager.disconnect();
        }
        
        this.lockedElements.clear();
        this.remoteCursors.clear();
        this.collaborators.clear();
        
        console.log('Collaboration Manager destruido');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que los scripts principales se carguen
    setTimeout(() => {
        window.collaborationManager = new CollaborationManager();
    }, 500);
});

// Limpiar al cerrar
window.addEventListener('beforeunload', () => {
    if (window.collaborationManager) {
        window.collaborationManager.destroy();
    }
});
