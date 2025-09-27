/**
 * Módulo de persistencia para el editor UML
 * Maneja guardado local, sincronización con backend y autoguardado
 */

// Configuración de variables de entorno para persistencia
const PERSISTENCE_CONFIG = {
    AUTO_SAVE_INTERVAL: 30000,
    MAX_LOCAL_DIAGRAMS: 10,
    LOCAL_STORAGE_PREFIX: 'uml_diagram_',
    DEFAULT_EXPORT_FORMAT: 'json',
    SUPPORTED_EXPORT_FORMATS: ['json', 'png', 'svg'],
    NOTIFICATION_DURATION_SUCCESS: 3000,
    NOTIFICATION_DURATION_WARNING: 4000,
    NOTIFICATION_DURATION_ERROR: 5000,
    NOTIFICATION_DURATION_INFO: 2000,
    MAX_FILE_SIZE: 10485760,
    ALLOWED_FILE_TYPES: ['json', 'png', 'svg'],
    DEBUG_MODE: false
};

class UMLPersistence {
    constructor() {
        this.autoSaveInterval = null;
        this.autoSaveDelay = PERSISTENCE_CONFIG.AUTO_SAVE_INTERVAL;
        this.isOnline = navigator.onLine;
        this.pendingChanges = [];
        this.config = PERSISTENCE_CONFIG;
        
        // Escuchar cambios de conectividad
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Escuchar antes de cerrar la página
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
        
        if (this.config.DEBUG_MODE) {
            console.log('UMLPersistence initialized with config:', this.config);
        }
    }

    // Métodos de autoguardado
    startAutoSave(graph, projectId = null, diagramId = null) {
        this.stopAutoSave();
        
        this.autoSaveInterval = setInterval(() => {
            this.autoSave(graph, projectId, diagramId);
        }, this.autoSaveDelay);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    async autoSave(graph, projectId = null, diagramId = null) {
        try {
            const diagramData = this.extractDiagramData(graph);
            
            // Guardar localmente siempre
            this.saveToLocalStorage(diagramData);
            
            // Si hay conexión y proyecto/diagrama, sincronizar con backend
            if (this.isOnline && projectId && diagramId && window.umlAPI.isAuthenticated()) {
                await this.syncToBackend(projectId, diagramId, diagramData);
            } else if (this.isOnline && projectId && diagramId) {
                // Agregar a cambios pendientes si no hay autenticación
                this.pendingChanges.push({ projectId, diagramId, data: diagramData });
            }
            
            this.showAutoSaveNotification();
        } catch (error) {
            console.error('Error en autoguardado:', error);
            this.showErrorNotification('Error en autoguardado');
        }
    }

    // Métodos de guardado manual
    async saveDiagram(graph, projectId, diagramId, diagramName) {
        try {
            const diagramData = this.extractDiagramData(graph);
            
            // Guardar localmente
            this.saveToLocalStorage(diagramData);
            
            // Guardar en backend si está disponible
            if (this.isOnline && window.umlAPI.isAuthenticated()) {
                if (diagramId) {
                    await window.umlAPI.updateDiagram(projectId, diagramId, {
                        name: diagramName,
                        content: diagramData,
                        lastModified: new Date().toISOString()
                    });
                } else {
                    const result = await window.umlAPI.saveDiagram(projectId, {
                        name: diagramName,
                        content: diagramData,
                        metadata: {
                            created: new Date().toISOString(),
                            version: '1.0'
                        }
                    });
                    return result;
                }
                
                this.showSuccessNotification('Diagrama guardado exitosamente');
            } else {
                this.showWarningNotification('Guardado local. Se sincronizará cuando haya conexión.');
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error guardando diagrama:', error);
            this.showErrorNotification('Error guardando diagrama');
            throw error;
        }
    }

    // Métodos de carga
    async loadDiagram(projectId, diagramId) {
        try {
            let diagramData = null;
            
            // Intentar cargar desde backend primero
            if (this.isOnline && window.umlAPI.isAuthenticated()) {
                try {
                    const result = await window.umlAPI.getDiagram(projectId, diagramId);
                    diagramData = result.content;
                } catch (backendError) {
                    console.warn('Error cargando desde backend, usando versión local:', backendError);
                }
            }
            
            // Si no se pudo cargar desde backend, usar versión local
            if (!diagramData) {
                diagramData = this.loadFromLocalStorage();
            }
            
            if (diagramData) {
                return this.restoreDiagramData(diagramData);
            }
            
            return null;
        } catch (error) {
            console.error('Error cargando diagrama:', error);
            this.showErrorNotification('Error cargando diagrama');
            throw error;
        }
    }

    // Métodos de exportación
    async exportDiagram(graph, format = null) {
        try {
            const exportFormat = format || this.config.DEFAULT_EXPORT_FORMAT;
            
            if (!this.config.SUPPORTED_EXPORT_FORMATS.includes(exportFormat)) {
                throw new Error(`Formato no soportado: ${exportFormat}. Formatos soportados: ${this.config.SUPPORTED_EXPORT_FORMATS.join(', ')}`);
            }
            
            const diagramData = this.extractDiagramData(graph);
            
            switch (exportFormat) {
                case 'json':
                    return this.exportAsJSON(diagramData);
                case 'png':
                    return this.exportAsPNG();
                case 'svg':
                    return this.exportAsSVG();
                default:
                    throw new Error(`Formato no implementado: ${exportFormat}`);
            }
        } catch (error) {
            console.error('Error exportando diagrama:', error);
            this.showErrorNotification('Error exportando diagrama');
            throw error;
        }
    }

    // Métodos de sincronización
    async syncPendingChanges() {
        if (!this.isOnline || !window.umlAPI.isAuthenticated() || this.pendingChanges.length === 0) {
            return;
        }
        
        try {
            for (const change of this.pendingChanges) {
                await window.umlAPI.updateDiagram(change.projectId, change.diagramId, {
                    content: change.data,
                    lastModified: new Date().toISOString()
                });
            }
            
            this.pendingChanges = [];
            this.showSuccessNotification('Cambios sincronizados');
        } catch (error) {
            console.error('Error sincronizando cambios:', error);
            this.showErrorNotification('Error sincronizando cambios');
        }
    }

    // Métodos auxiliares
    extractDiagramData(graph) {
        return {
            elements: graph.getElements().map(element => ({
                id: element.id,
                type: element.get('type'),
                name: element.get('name'),
                attributes: element.get('attributes') || [],
                methods: element.get('methods') || [],
                position: element.get('position'),
                size: element.get('size')
            })),
            links: graph.getLinks().map(link => ({
                id: link.id,
                type: link.get('type'),
                source: link.getSourceElement().id,
                target: link.getTargetElement().id,
                labels: link.labels() || []
            })),
            metadata: {
                version: '1.0',
                lastModified: new Date().toISOString(),
                elementsCount: graph.getElements().length,
                linksCount: graph.getLinks().length
            }
        };
    }

    restoreDiagramData(diagramData) {
        return {
            elements: diagramData.elements || [],
            links: diagramData.links || [],
            metadata: diagramData.metadata || {}
        };
    }

    saveToLocalStorage(data) {
        try {
            const key = `${this.config.LOCAL_STORAGE_PREFIX}${Date.now()}`;
            localStorage.setItem(key, JSON.stringify(data));
            
            // Mantener solo los últimos N diagramas según configuración
            this.cleanupLocalStorage();
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.config.LOCAL_STORAGE_PREFIX));
            if (keys.length > 0) {
                const latestKey = keys.sort().pop();
                return JSON.parse(localStorage.getItem(latestKey));
            }
        } catch (error) {
            console.error('Error cargando desde localStorage:', error);
        }
        return null;
    }

    cleanupLocalStorage() {
        try {
            const keys = Object.keys(localStorage)
                .filter(key => key.startsWith(this.config.LOCAL_STORAGE_PREFIX))
                .sort()
                .slice(0, -this.config.MAX_LOCAL_DIAGRAMS); // Mantener los últimos N diagramas según configuración
            
            keys.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Error limpiando localStorage:', error);
        }
    }

    // Métodos de exportación
    exportAsJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uml_diagram_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    exportAsPNG() {
        // Reutilizar la función existente de main.js
        if (typeof saveScreenshot === 'function') {
            saveScreenshot();
        } else {
            throw new Error('Función de exportación PNG no disponible');
        }
    }

    exportAsSVG() {
        const paperElement = document.getElementById('paper');
        const svgElement = paperElement.querySelector('svg');
        
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `uml_diagram_${new Date().toISOString().split('T')[0]}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    // Handlers de eventos
    handleOnline() {
        this.isOnline = true;
        this.showSuccessNotification('Conexión restaurada');
        this.syncPendingChanges();
    }

    handleOffline() {
        this.isOnline = false;
        this.showWarningNotification('Sin conexión. Los cambios se guardarán localmente.');
    }

    handleBeforeUnload(event) {
        if (this.pendingChanges.length > 0) {
            event.preventDefault();
            event.returnValue = 'Hay cambios sin guardar. ¿Estás seguro de que quieres salir?';
        }
    }

    // Métodos de notificación
    showAutoSaveNotification() {
        // Notificación discreta para autoguardado
        this.showNotification('Autoguardado completado', 'info', this.config.NOTIFICATION_DURATION_INFO);
    }

    showSuccessNotification(message) {
        this.showNotification(message, 'success', this.config.NOTIFICATION_DURATION_SUCCESS);
    }

    showWarningNotification(message) {
        this.showNotification(message, 'warning', this.config.NOTIFICATION_DURATION_WARNING);
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error', this.config.NOTIFICATION_DURATION_ERROR);
    }

    showNotification(message, type = 'info', duration = 3000) {
        // Reutilizar la función existente si está disponible
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Crear instancia global
window.umlPersistence = new UMLPersistence();

// Exportar para uso en módulos
if (typeof module !== "undefined" && module.exports) {
    module.exports = UMLPersistence;
}
