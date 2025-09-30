// AI Assistant Module - Integración con Gemini Pro
class AIAssistant {
    constructor() {
        this.currentMode = 'ask'; // 'ask' o 'agent'
        this.isProcessing = false;
        this.conversationHistory = [];
        this.apiEndpoint = '/api/ai/chat';
        
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        // Referencias a elementos del DOM
        this.aiPanel = document.getElementById('aiPanel');
        this.openBtn = document.getElementById('openAiPanel');
        this.closeBtn = document.getElementById('closeAiPanel');
        this.askModeBtn = document.getElementById('askModeBtn');
        this.agentModeBtn = document.getElementById('agentModeBtn');
        this.modeDescription = document.getElementById('modeDescription');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendChatBtn');
        this.aiStatus = document.getElementById('aiStatus');
        this.inputCounter = document.getElementById('inputCounter');

        // Debug: Verificar que los elementos existen
        console.log('🔍 AI Assistant - Elementos encontrados:', {
            aiPanel: !!this.aiPanel,
            openBtn: !!this.openBtn,
            closeBtn: !!this.closeBtn,
            askModeBtn: !!this.askModeBtn,
            agentModeBtn: !!this.agentModeBtn,
            chatInput: !!this.chatInput,
            sendBtn: !!this.sendBtn
        });

        if (!this.aiPanel) {
            console.error('❌ Panel de IA no encontrado');
            return;
        }

        if (!this.openBtn) {
            console.error('❌ Botón de abrir panel no encontrado');
            return;
        }

        // Configurar contador de caracteres
        this.updateInputCounter();
    }

    setupEventListeners() {
        // Panel toggle
        this.openBtn.addEventListener('click', () => this.openPanel());
        this.closeBtn.addEventListener('click', () => this.closePanel());

        // Mode switching
        this.askModeBtn.addEventListener('click', () => this.switchMode('ask'));
        this.agentModeBtn.addEventListener('click', () => this.switchMode('agent'));

        // Chat functionality
        this.chatInput.addEventListener('input', () => this.handleInputChange());
        this.chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Cerrar panel con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPanelOpen()) {
                this.closePanel();
            }
        });
    }

    openPanel() {
        this.aiPanel.classList.remove('translate-x-full');
        this.aiPanel.classList.add('open');
        this.openBtn.style.display = 'none';
        
        // Focus en el input después de la animación
        setTimeout(() => {
            this.chatInput.focus();
        }, 300);
    }

    closePanel() {
        this.aiPanel.classList.add('translate-x-full');
        this.aiPanel.classList.remove('open');
        this.openBtn.style.display = 'flex';
    }

    isPanelOpen() {
        return this.aiPanel.classList.contains('open');
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update button states
        if (mode === 'ask') {
            this.askModeBtn.classList.add('bg-white', 'text-indigo-600', 'shadow-sm');
            this.askModeBtn.classList.remove('text-gray-600', 'hover:text-indigo-600');
            this.agentModeBtn.classList.remove('bg-white', 'text-indigo-600', 'shadow-sm');
            this.agentModeBtn.classList.add('text-gray-600', 'hover:text-indigo-600');
            
            this.modeDescription.innerHTML = '<p><strong>Ask Mode:</strong> Make questions about your diagram, get suggestions and explanations.</p>';
            this.chatInput.placeholder = 'Ask me about your UML diagram...';
        } else {
            this.agentModeBtn.classList.add('bg-white', 'text-indigo-600', 'shadow-sm');
            this.agentModeBtn.classList.remove('text-gray-600', 'hover:text-indigo-600');
            this.askModeBtn.classList.remove('bg-white', 'text-indigo-600', 'shadow-sm');
            this.askModeBtn.classList.add('text-gray-600', 'hover:text-indigo-600');
            
            this.modeDescription.innerHTML = '<p><strong>Agent Mode:</strong> I can create and modify your diagram automatically. Tell me what you want to build!</p>';
            this.chatInput.placeholder = 'Tell me what diagram to create (e.g., "Create a student enrollment system")...';
        }
        
        // Agregar mensaje informativo sobre el cambio de modo
        this.addSystemMessage(`Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`);
    }

    handleInputChange() {
        const text = this.chatInput.value;
        const length = text.length;
        const maxLength = 500;
        
        // Update counter
        this.inputCounter.textContent = `${length}/${maxLength}`;
        
        // Update counter color based on length
        if (length > maxLength * 0.8) {
            this.inputCounter.classList.add('text-orange-500');
        } else {
            this.inputCounter.classList.remove('text-orange-500');
        }
        
        // Enable/disable send button
        this.sendBtn.disabled = length === 0 || length > maxLength || this.isProcessing;
    }

    updateInputCounter() {
        this.handleInputChange();
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendBtn.disabled) {
                this.sendMessage();
            }
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isProcessing) return;

        // Add user message to chat
        this.addUserMessage(message);
        
        // Clear input
        this.chatInput.value = '';
        this.updateInputCounter();
        
        // Set processing state
        this.setProcessingState(true);
        
        try {
            // Get current diagram data
            const diagramData = this.getDiagramData();
            
            // Send to AI
            const response = await this.callAI(message, diagramData);
            
            // Process response based on mode
            if (this.currentMode === 'agent' && response.actions) {
                await this.executeAgentActions(response.actions);
            }
            
            // Add AI response to chat
            this.addAIMessage(response.message || response.text);
            
        } catch (error) {
            console.error('Error communicating with AI:', error);
            this.addErrorMessage('Sorry, I encountered an error. Please try again.');
        } finally {
            this.setProcessingState(false);
        }
    }

    addUserMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'flex gap-3 justify-end';
        messageEl.innerHTML = `
            <div class="flex-1 max-w-xs">
                <div class="bg-indigo-600 text-white rounded-lg px-4 py-3">
                    <p class="text-sm">${this.escapeHtml(message)}</p>
                </div>
                <div class="text-xs text-gray-500 mt-1 text-right">${new Date().toLocaleTimeString()}</div>
            </div>
            <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-indigo-600 text-sm">👤</span>
            </div>
        `;
        
        this.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
    }

    addAIMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'flex gap-3';
        messageEl.innerHTML = `
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-purple-600 text-sm">🤖</span>
            </div>
            <div class="flex-1">
                <div class="bg-gray-100 rounded-lg px-4 py-3">
                    <p class="text-sm text-gray-800">${this.formatMessage(message)}</p>
                </div>
                <div class="text-xs text-gray-500 mt-1">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
    }

    addSystemMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'flex justify-center';
        messageEl.innerHTML = `
            <div class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                ${this.escapeHtml(message)}
            </div>
        `;
        
        this.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
    }

    addErrorMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'flex gap-3';
        messageEl.innerHTML = `
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-red-600 text-sm">⚠️</span>
            </div>
            <div class="flex-1">
                <div class="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p class="text-sm text-red-800">${this.escapeHtml(message)}</p>
                </div>
                <div class="text-xs text-gray-500 mt-1">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageEl);
        this.scrollToBottom();
    }

    setProcessingState(isProcessing) {
        this.isProcessing = isProcessing;
        this.sendBtn.disabled = isProcessing || this.chatInput.value.trim().length === 0;
        
        if (isProcessing) {
            this.aiStatus.classList.remove('hidden');
        } else {
            this.aiStatus.classList.add('hidden');
        }
    }

    async callAI(message, diagramData) {
        try {
            const result = await window.apiClient.sendAIMessage(
                message,
                this.currentMode,
                diagramData,
                this.conversationHistory.slice(-10) // Últimos 10 mensajes
            );
            
            // Update conversation history
            this.conversationHistory.push({
                user: message,
                ai: result.message || result.text,
                timestamp: new Date().toISOString()
            });

            return result;
        } catch (error) {
            console.error('Error calling AI:', error);
            throw error;
        }
    }

    getDiagramData() {
        if (!window.graph) return null;

        const elements = window.graph.getElements().map(element => ({
            id: element.id,
            type: element.get('type'),
            name: element.get('name'),
            attributes: element.get('attributes') || [],
            methods: element.get('methods') || [],
            position: element.get('position'),
            size: element.get('size')
        }));

        const links = window.graph.getLinks().map(link => ({
            id: link.id,
            source: link.get('source'),
            target: link.get('target'),
            type: link.get('type'),
            labels: link.labels()
        }));

        return {
            elements,
            links,
            elementCount: elements.length,
            linkCount: links.length
        };
    }

    async executeAgentActions(actions) {
        if (!Array.isArray(actions)) return;

        for (const action of actions) {
            try {
                await this.executeAction(action);
                // Small delay between actions for better UX
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error('Error executing action:', error);
            }
        }
    }

    async executeAction(action) {
        switch (action.type) {
            case 'create_class':
                this.createClass(action.data);
                break;
            case 'create_interface':
                this.createInterface(action.data);
                break;
            case 'create_abstract_class':
                this.createAbstractClass(action.data);
                break;
            case 'create_relationship':
                this.createRelationship(action.data);
                break;
            case 'modify_element':
                this.modifyElement(action.data);
                break;
            case 'delete_element':
                this.deleteElement(action.data);
                break;
            default:
                console.warn('Unknown action type:', action.type);
        }
    }

    createClass(data) {
        const position = data.position || this.getNextPosition();
        const classShape = UMLShapes.createClass(position, data.name || 'NewClass');
        
        if (data.attributes) {
            classShape.set('attributes', data.attributes);
        }
        if (data.methods) {
            classShape.set('methods', data.methods);
        }
        
        // Recalcular tamaño si es necesario
        if (data.attributes || data.methods) {
            const width = this.calculateWidth([data.name, ...(data.attributes || []), ...(data.methods || [])]);
            const height = this.calculateHeight(data.attributes || [], data.methods || []);
            classShape.resize(width, height);
        }
        
        window.graph.addCell(classShape);
        
        // Highlight the new element
        setTimeout(() => {
            const view = window.paper.findViewByModel(classShape);
            if (view) {
                view.highlight();
                setTimeout(() => view.unhighlight(), 2000);
            }
        }, 100);
    }

    createInterface(data) {
        const position = data.position || this.getNextPosition();
        const interfaceShape = UMLShapes.createInterface(position, data.name || 'NewInterface');
        
        if (data.methods) {
            interfaceShape.set('methods', data.methods);
        }
        
        window.graph.addCell(interfaceShape);
        
        // Highlight the new element
        setTimeout(() => {
            const view = window.paper.findViewByModel(interfaceShape);
            if (view) {
                view.highlight();
                setTimeout(() => view.unhighlight(), 2000);
            }
        }, 100);
    }

    createAbstractClass(data) {
        const position = data.position || this.getNextPosition();
        const abstractShape = UMLShapes.createAbstractClass(position, data.name || 'NewAbstract');
        
        if (data.attributes) {
            abstractShape.set('attributes', data.attributes);
        }
        if (data.methods) {
            abstractShape.set('methods', data.methods);
        }
        
        window.graph.addCell(abstractShape);
        
        // Highlight the new element
        setTimeout(() => {
            const view = window.paper.findViewByModel(abstractShape);
            if (view) {
                view.highlight();
                setTimeout(() => view.unhighlight(), 2000);
            }
        }, 100);
    }

    createRelationship(data) {
        console.log('🤖 Creating relationship:', data);
        
        // Si se proporcionan nombres en lugar de IDs, buscar por nombre
        let sourceElement, targetElement;
        
        if (data.sourceId) {
            sourceElement = window.graph.getCell(data.sourceId);
        } else if (data.sourceName) {
            sourceElement = this.findElementByName(data.sourceName);
        }
        
        if (data.targetId) {
            targetElement = window.graph.getCell(data.targetId);
        } else if (data.targetName) {
            targetElement = this.findElementByName(data.targetName);
        }
        
        if (!sourceElement || !targetElement) {
            console.warn('❌ Source or target element not found for relationship', {
                sourceId: data.sourceId,
                sourceName: data.sourceName,
                targetId: data.targetId,
                targetName: data.targetName,
                availableElements: window.graph.getElements().map(el => el.get('name'))
            });
            return;
        }

        console.log('✅ Found elements:', {
            source: sourceElement.get('name'),
            target: targetElement.get('name'),
            sourceId: sourceElement.id,
            targetId: targetElement.id
        });

        let relationship;
        switch (data.type) {
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
                console.warn('❌ Unknown relationship type:', data.type);
                return;
        }

        if (relationship) {
            console.log('✅ Relationship created:', relationship);
            
            // Set multiplicities if provided
            if (data.sourceMultiplicity || data.targetMultiplicity) {
                relationship.labels([
                    {
                        position: 0.1,
                        attrs: {
                            text: {
                                text: data.sourceMultiplicity || '1',
                                fill: '#475569',
                                'font-family': 'JetBrains Mono',
                                'font-size': 11
                            }
                        }
                    },
                    {
                        position: 0.9,
                        attrs: {
                            text: {
                                text: data.targetMultiplicity || '1',
                                fill: '#475569',
                                'font-family': 'JetBrains Mono',
                                'font-size': 11
                            }
                        }
                    }
                ]);
            }
            
            // Add to graph
            window.graph.addCell(relationship);
            
            // Force paper to re-render
            window.paper.render();
            
            console.log('✅ Relationship added to graph. Total links:', window.graph.getLinks().length);
            
            // Highlight the relationship
            setTimeout(() => {
                const linkView = window.paper.findViewByModel(relationship);
                if (linkView) {
                    linkView.highlight();
                    setTimeout(() => linkView.unhighlight(), 2000);
                }
            }, 100);
        } else {
            console.error('❌ Failed to create relationship');
        }
    }

    findElementByName(name) {
        const elements = window.graph.getElements();
        console.log('🔍 Searching for element:', name);
        console.log('📋 Available elements:', elements.map(el => el.get('name')));
        
        const found = elements.find(element => {
            const elementName = element.get('name');
            if (!elementName) return false;
            
            // Limpiar nombre de prefijos como <<interface>> o <<abstract>>
            const cleanName = elementName.replace(/<<.*?>>\n/, '').trim();
            const matches = cleanName.toLowerCase() === name.toLowerCase();
            
            if (matches) {
                console.log('✅ Found element:', { original: elementName, clean: cleanName, id: element.id });
            }
            
            return matches;
        });
        
        if (!found) {
            console.warn('❌ Element not found:', name);
        }
        
        return found;
    }

    modifyElement(data) {
        const element = window.graph.getCell(data.id);
        if (!element) return;

        if (data.name) element.set('name', data.name);
        if (data.attributes) element.set('attributes', data.attributes);
        if (data.methods) element.set('methods', data.methods);
        
        // Recalcular tamaño si es necesario
        if (data.attributes || data.methods) {
            const width = this.calculateWidth([data.name || element.get('name'), ...(data.attributes || []), ...(data.methods || [])]);
            const height = this.calculateHeight(data.attributes || [], data.methods || []);
            element.resize(width, height);
        }
    }

    deleteElement(data) {
        const element = window.graph.getCell(data.id);
        if (element) {
            element.remove();
        }
    }

    getNextPosition() {
        const elements = window.graph.getElements();
        const positions = elements.map(el => el.get('position'));
        
        // Simple positioning algorithm - arrange in grid
        const gridSize = 300;
        const cols = 4;
        const currentCount = elements.length;
        
        const col = currentCount % cols;
        const row = Math.floor(currentCount / cols);
        
        return {
            x: 100 + (col * gridSize),
            y: 100 + (row * 200)
        };
    }

    calculateWidth(texts) {
        const textLengths = texts.map(text => (text || '').length * 8);
        return Math.max(...textLengths, 150);
    }

    calculateHeight(attributes, methods) {
        const totalItems = (attributes || []).length + (methods || []).length;
        const headerHeight = 40;
        const itemHeight = 20;
        return headerHeight + totalItems * itemHeight;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatMessage(message) {
        // Simple formatting for AI messages
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Public methods for external access
    isOpen() {
        return this.isPanelOpen();
    }

    open() {
        this.openPanel();
    }

    close() {
        this.closePanel();
    }

    getCurrentMode() {
        return this.currentMode;
    }

    setMode(mode) {
        if (mode === 'ask' || mode === 'agent') {
            this.switchMode(mode);
        }
    }

    // Función de prueba para debug
    testPanel() {
        console.log('🧪 Probando panel de IA...');
        console.log('Panel element:', this.aiPanel);
        console.log('Panel classes:', this.aiPanel?.className);
        console.log('Open button:', this.openBtn);
        
        if (this.aiPanel) {
            console.log('Panel computed style:', window.getComputedStyle(this.aiPanel));
            console.log('Panel transform:', window.getComputedStyle(this.aiPanel).transform);
        }
        
        // Forzar apertura del panel
        this.openPanel();
        console.log('Panel abierto forzadamente');
    }
}

// Initialize AI Assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.aiAssistant = new AIAssistant();
    console.log('✅ AI Assistant initialized');
    
    // Exponer función de prueba globalmente
    window.testAIPanel = () => window.aiAssistant.testPanel();
    
    // Función de prueba para relaciones
    window.testRelationshipCreation = () => {
        console.log('🧪 Testing relationship creation...');
        
        // Crear dos clases de prueba si no existen
        const existingElements = window.graph.getElements();
        if (existingElements.length < 2) {
            console.log('Creating test classes...');
            const class1 = UMLShapes.createClass({ x: 100, y: 100 }, 'TestClass1');
            const class2 = UMLShapes.createClass({ x: 300, y: 100 }, 'TestClass2');
            
            window.graph.addCell(class1);
            window.graph.addCell(class2);
            
            console.log('Test classes created');
        }
        
        // Probar creación de relación
        const relationshipData = {
            type: 'association',
            sourceName: 'TestClass1',
            targetName: 'TestClass2',
            sourceMultiplicity: '1',
            targetMultiplicity: '1'
        };
        
        console.log('Creating test relationship...');
        window.aiAssistant.createRelationship(relationshipData);
        
        console.log('Test completed. Check the diagram for the relationship.');
    };
    
    console.log('💡 Usa testAIPanel() en la consola para probar el panel');
    console.log('💡 Usa testRelationshipCreation() en la consola para probar las relaciones');
});
