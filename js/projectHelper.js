/**
 * Funciones auxiliares para gestión de proyectos y diagramas
 */

const ProjectHelper = {
    /**
     * Asegura que exista un proyecto y un diagrama activo
     * @param {Object} graph - Instancia del grafo JointJS
     * @returns {Promise<{projectId: string, diagramId: string}>}
     */
    async ensureProjectAndDiagram(graph) {
        try {
            console.log('Verificando proyecto y diagrama activo...');
            
            // Verificar autenticación
            if (!window.apiClient || !window.apiClient.token) {
                throw new Error('Usuario no autenticado');
            }
            
            let projectId = localStorage.getItem('currentProjectId');
            let diagramId = localStorage.getItem('currentDiagramId');
            
            console.log('Estado inicial:', { projectId, diagramId });
            
            // Si no hay proyecto, crear uno
            if (!projectId) {
                console.log('Creando proyecto predeterminado...');
                const projectResult = await window.apiClient.createProject({
                    name: 'Proyecto UML',
                    description: 'Proyecto creado automáticamente para generación de código',
                    is_public: false
                });
                
                if (projectResult && projectResult.data && projectResult.data.id) {
                    projectId = projectResult.data.id;
                    localStorage.setItem('currentProjectId', projectId);
                    console.log('Proyecto creado:', projectId);
                } else {
                    throw new Error('Error al crear proyecto');
                }
            }
            
            // Si no hay diagrama, crear uno
            if (!diagramId) {
                console.log('Creando diagrama predeterminado...');
                
                // Extraer datos del diagrama
                const diagramData = this.extractDiagramData(graph);
                
                console.log('Creando nuevo diagrama con datos:', {
                    projectId,
                    diagramData: JSON.stringify(diagramData).substring(0, 100) + '...'
                });
                
                const diagramResult = await window.apiClient.createDiagram(projectId, {
                    name: 'Diagrama UML',
                    description: 'Diagrama creado automáticamente para generación de código',
                    content: diagramData
                });
                
                console.log('Resultado de crear diagrama:', diagramResult);
                
                if (diagramResult && diagramResult.data && diagramResult.data.id) {
                    diagramId = diagramResult.data.id;
                    localStorage.setItem('currentDiagramId', diagramId);
                    console.log('Diagrama creado:', diagramId);
                } else {
                    throw new Error('Error al crear diagrama');
                }
            } else {
                // Si ya hay diagrama, actualizarlo
                console.log('Actualizando diagrama existente...');
                
                // Extraer datos del diagrama
                const diagramData = this.extractDiagramData(graph);
                
                console.log('Actualizando diagrama existente:', {
                    diagramId,
                    diagramData: JSON.stringify(diagramData).substring(0, 100) + '...'
                });
                
                const updateResult = await window.apiClient.updateDiagram(diagramId, {
                    content: diagramData,
                    lastModified: new Date().toISOString()
                });
                
                console.log('Resultado de actualizar diagrama:', updateResult);
                
                console.log('Diagrama actualizado:', diagramId);
            }
            
            return { projectId, diagramId };
            
        } catch (error) {
            console.error('Error en ensureProjectAndDiagram:', error);
            throw error;
        }
    },
    
    /**
     * Extrae los datos del diagrama del grafo JointJS
     * @param {Object} graph - Instancia del grafo JointJS
     * @returns {Object} - Datos del diagrama
     */
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
};

// Exportar para uso en módulos
if (typeof module !== "undefined" && module.exports) {
    module.exports = ProjectHelper;
}

// Crear instancia global
window.projectHelper = ProjectHelper;
