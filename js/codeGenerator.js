const CodeGenerator = {
    typeMap: {
        java: {
            String: "String",
            int: "int",
            float: "float",
            double: "double",
            boolean: "boolean",
            void: "void",
            List: "List",
            Map: "Map",
        },
        python: {
            String: "str",
            int: "int",
            float: "float",
            double: "float",
            boolean: "bool",
            void: "None",
            List: "list",
            Map: "dict",
        },
        php: {
            String: "string",
            int: "int",
            float: "float",
            double: "float",
            boolean: "bool",
            void: "void",
            List: "array",
            Map: "array",
        },
    },

    parseVisibility: function (symbol, language) {
        const visibilityMap = {
            java: {
                "+": "public",
                "-": "private",
                "#": "protected",
                "~": "package",
            },
            python: {
                "+": "",
                "-": "__",
                "#": "_",
                "~": "",
            },
            php: {
                "+": "public",
                "-": "private",
                "#": "protected",
                "~": "public",
            },
        };
        return visibilityMap[language][symbol] || "";
    },

    parseMethod: function (methodStr) {
        const match = methodStr.match(
            /^([+\-#~])?(\w+)\((.*)\)(?:\s*:\s*(.+))?$/
        );
        if (!match) return null;

        return {
            visibility: match[1] || "+",
            name: match[2],
            parameters: match[3]
                .split(",")
                .filter((p) => p.trim())
                .map((p) => {
                    const [name, type] = p
                        .trim()
                        .split(":")
                        .map((s) => s.trim());
                    return { name, type };
                }),
            returnType: match[4]?.trim() || "void",
        };
    },

    parseAttribute: function (attrStr) {
        const match = attrStr.match(/^([+\-#~])?(\w+)(?:\s*:\s*(.+))?$/);
        if (!match) return null;

        return {
            visibility: match[1] || "+",
            name: match[2],
            type: match[3]?.trim() || "String",
        };
    },

    generateCode: function (graph, language) {
        // Si es Spring Boot, usar el nuevo generador del backend
        if (language === 'spring-boot') {
            return this.generateSpringBootProject(graph);
        }
        
        let code = "";
        const elements = graph.getElements();
        const relationships = graph.getLinks();

        code += this.generateHeader(language);

        const inheritanceMap = new Map();
        relationships.forEach((rel) => {
            if (
                rel.get("type") === "uml.Inheritance" ||
                rel.get("type") === "uml.Implementation"
            ) {
                const source = rel.getSourceElement();
                const target = rel.getTargetElement();
                if (!inheritanceMap.has(source.id)) {
                    inheritanceMap.set(source.id, {
                        extends: [],
                        implements: [],
                    });
                }
                if (rel.get("type") === "uml.Inheritance") {
                    inheritanceMap.get(source.id).extends.push(target.id);
                } else {
                    inheritanceMap.get(source.id).implements.push(target.id);
                }
            }
        });

        elements.forEach((element) => {
            const name = element
                .get("name")
                .replace(/<<interface>>\n|<<abstract>>\n/, "");
            const isInterface = element.get("name").includes("<<interface>>");
            const isAbstract = element.get("name").includes("<<abstract>>");
            const attributes = element.get("attributes") || [];
            const methods = element.get("methods") || [];

            const inheritance = inheritanceMap.get(element.id) || {
                extends: [],
                implements: [],
            };
            const parentClasses = inheritance.extends.map((id) => {
                const parent = elements.find((e) => e.id === id);
                return parent
                    .get("name")
                    .replace(/<<interface>>\n|<<abstract>>\n/, "");
            });
            const interfaces = inheritance.implements.map((id) => {
                const iface = elements.find((e) => e.id === id);
                return iface
                    .get("name")
                    .replace(/<<interface>>\n|<<abstract>>\n/, "");
            });

            code += this.generateClass(
                name,
                isInterface,
                isAbstract,
                attributes,
                methods,
                relationships,
                language,
                elements,
                parentClasses,
                interfaces
            );
            code += "\n\n";
        });

        return code;
    },

    generateHeader: function (language) {
        switch (language) {
            case "java":
                return "import java.util.*;\n\n";
            case "python":
                return "from typing import List, Dict, Optional\n\n";
            case "php":
                return "<?php\n\n";
            default:
                return "";
        }
    },

    generateClass: function (
        name,
        isInterface,
        isAbstract,
        attributes,
        methods,
        relationships,
        language,
        elements,
        parentClasses,
        interfaces
    ) {
        switch (language) {
            case "java":
                return this.generateJavaClass(
                    name,
                    isInterface,
                    isAbstract,
                    attributes,
                    methods,
                    relationships,
                    elements,
                    parentClasses,
                    interfaces
                );
            case "python":
                return this.generatePythonClass(
                    name,
                    isInterface,
                    isAbstract,
                    attributes,
                    methods,
                    relationships,
                    elements,
                    parentClasses,
                    interfaces
                );
            case "php":
                return this.generatePhpClass(
                    name,
                    isInterface,
                    isAbstract,
                    attributes,
                    methods,
                    relationships,
                    elements,
                    parentClasses,
                    interfaces
                );
            default:
                return "";
        }
    },

    parseMultiplicity: function (multiplicity) {
        if (!multiplicity) return { min: 1, max: 1 };

        if (multiplicity === "*") return { min: 0, max: Infinity };
        if (multiplicity === "0..*" || multiplicity === "0..n")
            return { min: 0, max: Infinity };
        if (multiplicity === "1..*" || multiplicity === "1..n")
            return { min: 1, max: Infinity };

        const range = multiplicity.split("..");
        if (range.length === 2) {
            return {
                min: parseInt(range[0]),
                max: range[1] === "*" ? Infinity : parseInt(range[1]),
            };
        }

        return { min: parseInt(multiplicity), max: parseInt(multiplicity) };
    },

    getCollectionType: function (language, multiplicity) {
        const { min, max } = this.parseMultiplicity(multiplicity);

        if (max === 1) {
            return null; // Single reference
        }

        switch (language) {
            case "java":
                return max === Infinity ? "List" : "Set";
            case "python":
                return max === Infinity ? "list" : "set";
            case "php":
                return "array";
            default:
                return "List";
        }
    },

    processRelationships: function (
        element,
        relationships,
        elements,
        language
    ) {
        let code = "";
        const processedRelationships = new Set();

        relationships.forEach((rel) => {
            if (processedRelationships.has(rel.id)) return;
            processedRelationships.add(rel.id);

            const relType = rel.get("type");
            const isNavigable =
                rel.get("type") === "uml.NavigableAssociation" ||
                (relType === "uml.Association" && rel.attr(".marker-target"));

            if (
                relType === "uml.Association" ||
                relType === "uml.NavigableAssociation" ||
                relType === "uml.Composition" ||
                relType === "uml.Aggregation"
            ) {
                const source = rel.getSourceElement();
                const target = rel.getTargetElement();
                const labels = rel.labels() || [];

                // Get multiplicities
                const sourceMulti = labels[0]?.attrs?.text?.text || "1";
                const targetMulti = labels[1]?.attrs?.text?.text || "1";

                // Process based on which end of the relationship this element is
                if (source.id === element.id && isNavigable) {
                    const targetName = target
                        .get("name")
                        .replace(/<<interface>>\n|<<abstract>>\n/, "");
                    const collectionType = this.getCollectionType(
                        language,
                        targetMulti
                    );

                    if (collectionType) {
                        switch (language) {
                            case "java":
                                code += `    private ${collectionType}<${targetName}> ${this.camelCase(
                                    targetName
                                )}s;\n`;
                                break;
                            case "python":
                                code += `        self._${this.snakeCase(
                                    targetName
                                )}s: ${collectionType}[${targetName}] = ${collectionType}()\n`;
                                break;
                            case "php":
                                code += `    private array $${this.camelCase(
                                    targetName
                                )}s;\n`;
                                break;
                        }
                    } else {
                        switch (language) {
                            case "java":
                                code += `    private ${targetName} ${this.camelCase(
                                    targetName
                                )};\n`;
                                break;
                            case "python":
                                code += `        self._${this.snakeCase(
                                    targetName
                                )}: Optional[${targetName}] = None\n`;
                                break;
                            case "php":
                                code += `    private ?${targetName} $${this.camelCase(
                                    targetName
                                )};\n`;
                                break;
                        }
                    }
                }
            }
        });

        return code;
    },

    camelCase: function (str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    },

    snakeCase: function (str) {
        return str
            .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
            .replace(/^_/, "");
    },

    generateJavaClass: function (
        name,
        isInterface,
        isAbstract,
        attributes,
        methods,
        relationships,
        elements,
        parentClasses,
        interfaces
    ) {
        let code = "";

        if (isInterface) {
            code += `public interface ${name} `;
        } else {
            code += `public ${isAbstract ? "abstract " : ""}class ${name} `;
        }

        // Add inheritance
        if (parentClasses.length > 0) {
            code += `extends ${parentClasses[0]} `; // Java only supports single inheritance
        }
        if (interfaces.length > 0) {
            code += `implements ${interfaces.join(", ")} `;
        }

        code += "{\n";

        if (!isInterface) {
            code += this.processRelationships(
                elements.find((e) => e.get("name").includes(name)),
                relationships,
                elements,
                "java"
            );
        }

        if (!isInterface) {
            attributes.forEach((attr) => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const visibility = this.parseVisibility(
                        parsed.visibility,
                        "java"
                    );
                    const type = this.typeMap.java[parsed.type] || parsed.type;
                    code += `    ${visibility} ${type} ${parsed.name};\n`;
                }
            });
            if (attributes.length > 0) code += "\n";
        }

        methods.forEach((method) => {
            const parsed = this.parseMethod(method);
            if (parsed) {
                const visibility = this.parseVisibility(
                    parsed.visibility,
                    "java"
                );
                const returnType =
                    this.typeMap.java[parsed.returnType] || parsed.returnType;
                const params = parsed.parameters
                    .map(
                        (p) =>
                            `${this.typeMap.java[p.type] || p.type} ${p.name}`
                    )
                    .join(", ");

                if (isInterface || isAbstract) {
                    code += `    ${visibility} ${returnType} ${parsed.name}(${params});\n`;
                } else {
                    code += `    ${visibility} ${returnType} ${parsed.name}(${params}) {\n        // TODO: Implement method\n    }\n`;
                }
            }
        });

        code += "}";
        return code;
    },

    generatePythonClass: function (
        name,
        isInterface,
        isAbstract,
        attributes,
        methods,
        relationships,
        elements,
        parentClasses,
        interfaces
    ) {
        let code = "";

        if (isInterface || isAbstract) {
            code += "from abc import ABC, abstractmethod\n";
        }
        code += "from typing import List, Set, Dict, Optional\n\n";

        code += `class ${name}`;

        const allParents = [...parentClasses, ...interfaces];
        if (isInterface || isAbstract) {
            allParents.push("ABC");
        }

        if (allParents.length > 0) {
            code += `(${allParents.join(", ")})`;
        }

        code += ":\n";

        code +=
            '    """' +
            name +
            " " +
            (isInterface ? "interface" : "class") +
            '."""\n\n';

        if (!isInterface) {
            code += "    def __init__(self";
            attributes.forEach((attr) => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const type =
                        this.typeMap.python[parsed.type] || parsed.type;
                    code += `, ${parsed.name}: ${type}`;
                }
            });
            code += "):\n";

            code += this.processRelationships(
                elements.find((e) => e.get("name").includes(name)),
                relationships,
                elements,
                "python"
            );

            attributes.forEach((attr) => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const visibility = this.parseVisibility(
                        parsed.visibility,
                        "python"
                    );
                    code += `        self.${visibility}${parsed.name} = ${parsed.name}\n`;
                }
            });
            code += "\n";
        }

        methods.forEach((method) => {
            const parsed = this.parseMethod(method);
            if (parsed) {
                const visibility = this.parseVisibility(
                    parsed.visibility,
                    "python"
                );
                const returnType =
                    this.typeMap.python[parsed.returnType] || parsed.returnType;
                const params = parsed.parameters
                    .map(
                        (p) =>
                            `${p.name}: ${
                                this.typeMap.python[p.type] || p.type
                            }`
                    )
                    .join(", ");

                code += `    ${
                    isInterface || isAbstract ? "@abstractmethod\n" : ""
                }`;
                code += `    def ${visibility}${parsed.name}(self${
                    params ? ", " + params : ""
                }) -> ${returnType}:\n`;
                if (!isInterface && !isAbstract) {
                    code += "        # TODO: Implement method\n        pass\n";
                } else {
                    code += "        pass\n";
                }
                code += "\n";
            }
        });

        return code;
    },

    generatePhpClass: function (
        name,
        isInterface,
        isAbstract,
        attributes,
        methods,
        relationships,
        elements,
        parentClasses,
        interfaces
    ) {
        let code = "";

        if (isInterface) {
            code += `interface ${name} `;
        } else {
            code += `${isAbstract ? "abstract " : ""}class ${name} `;
        }

        if (parentClasses.length > 0) {
            code += `extends ${parentClasses[0]} `; // PHP only supports single inheritance
        }
        if (interfaces.length > 0) {
            code += `implements ${interfaces.join(", ")} `;
        }

        code += "\n{\n";

        if (!isInterface) {
            code += this.processRelationships(
                elements.find((e) => e.get("name").includes(name)),
                relationships,
                elements,
                "php"
            );
        }

        if (!isInterface) {
            attributes.forEach((attr) => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const visibility = this.parseVisibility(
                        parsed.visibility,
                        "php"
                    );
                    const type = this.typeMap.php[parsed.type] || parsed.type;
                    code += `    ${visibility} ${type} $${parsed.name};\n`;
                }
            });
            if (attributes.length > 0) code += "\n";
        }

        methods.forEach((method) => {
            const parsed = this.parseMethod(method);
            if (parsed) {
                const visibility = this.parseVisibility(
                    parsed.visibility,
                    "php"
                );
                const returnType =
                    this.typeMap.php[parsed.returnType] || parsed.returnType;
                const params = parsed.parameters
                    .map(
                        (p) =>
                            `${this.typeMap.php[p.type] || p.type} $${p.name}`
                    )
                    .join(", ");

                if (isInterface || isAbstract) {
                    code += `    ${visibility} function ${parsed.name}(${params}): ${returnType};\n`;
                } else {
                    code += `    ${visibility} function ${parsed.name}(${params}): ${returnType}\n    {\n        // TODO: Implement method\n    }\n`;
                }
            }
        });

        code += "}\n";
        return code;
    },

    /**
     * Genera proyecto completo de Spring Boot
     */
    generateSpringBootProject: async function(graph) {
        try {
            // Verificar autenticación
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                this.showNotification('Debes iniciar sesión para generar código Spring Boot', 'error');
                throw new Error('Usuario no autenticado');
            }

            // Asegurar que exista un proyecto y un diagrama
            try {
                this.showNotification('Guardando diagrama...', 'info');
                
                // Usar el helper para asegurar que existe un proyecto y diagrama
                const { projectId, diagramId } = await window.projectHelper.ensureProjectAndDiagram(graph);
                
                console.log('Proyecto y diagrama asegurados:', { projectId, diagramId });
                this.showNotification('Diagrama guardado exitosamente', 'success');
                
            } catch (saveError) {
                console.error('Error guardando diagrama:', saveError);
                this.showNotification('Error guardando el diagrama: ' + saveError.message, 'error');
                throw new Error('Error guardando el diagrama: ' + saveError.message);
            }

            // Obtener elementos y relaciones del diagrama
            const elements = graph.getElements();
            const relationships = graph.getLinks();

            // Preparar datos del diagrama para enviar al backend
            const diagramData = {
                cells: []
            };

            // Agregar elementos al diagrama
            elements.forEach(element => {
                diagramData.cells.push({
                    id: element.id,
                    type: 'uml.Class',
                    name: element.get('name'),
                    attributes: element.get('attributes') || [],
                    methods: element.get('methods') || []
                });
            });

            // Agregar relaciones al diagrama
            relationships.forEach(relationship => {
                diagramData.cells.push({
                    id: relationship.id,
                    type: relationship.get('type'),
                    source: {
                        id: relationship.getSourceElement().id
                    },
                    target: {
                        id: relationship.getTargetElement().id
                    },
                    labels: relationship.labels()
                });
            });

            // Configuración del proyecto
            const projectConfig = {
                projectName: this.getProjectName(),
                packageName: this.getPackageName(),
                databaseConfig: this.getDatabaseConfig()
            };

            // Mostrar modal de configuración
            const userConfig = await this.showSpringBootConfigModal(projectConfig);
            if (!userConfig) {
                return "Generación cancelada por el usuario";
            }

            // Llamar al API del backend para generar el código
            const response = await this.callBackendGenerator(diagramData, userConfig);
            
            if (response.success) {
                // Mostrar modal de descarga
                this.showDownloadModal(response);
                return "Proyecto Spring Boot generado exitosamente. ¡Revisa el modal de descarga!";
            } else {
                throw new Error(response.error || 'Error desconocido al generar el proyecto');
            }

        } catch (error) {
            console.error('Error generando proyecto Spring Boot:', error);
            return "Error al generar proyecto Spring Boot: " + error.message;
        }
    },

    /**
     * Obtiene el nombre del proyecto actual
     */
    getProjectName: function() {
        // Intentar obtener desde el contexto del proyecto actual
        return localStorage.getItem('currentProjectName') || 'generated-project';
    },

    /**
     * Obtiene el nombre del paquete base
     */
    getPackageName: function() {
        return 'com.example.generated';
    },

    /**
     * Obtiene la configuración de base de datos
     */
    getDatabaseConfig: function() {
        return {
            host: 'aws-1-us-east-2.pooler.supabase.com',
            port: 5432,
            database: 'postgres',
            username: 'postgres.mdiskyofmgaestlwoidk',
            password: 'postgres'
        };
    },

    /**
     * Muestra modal de configuración para Spring Boot
     */
    showSpringBootConfigModal: function(defaultConfig) {
        return new Promise((resolve) => {
            // Crear modal HTML
            const modalHTML = `
                <div id="springBootConfigModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 w-96 max-w-full">
                        <h3 class="text-lg font-semibold mb-4">Configuración del Proyecto Spring Boot</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
                                <input id="projectName" type="text" value="${defaultConfig.projectName}" 
                                       class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Paquete Base</label>
                                <input id="packageName" type="text" value="${defaultConfig.packageName}" 
                                       class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            </div>
                            
                            <div class="bg-gray-50 p-3 rounded-md">
                                <h4 class="text-sm font-medium text-gray-700 mb-2">Configuración de Base de Datos</h4>
                                <p class="text-xs text-gray-500">Se usará la configuración de Supabase del proyecto actual</p>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-6">
                            <button id="cancelBtn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                Cancelar
                            </button>
                            <button id="generateBtn" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                Generar Proyecto
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Agregar modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Event listeners
            document.getElementById('cancelBtn').addEventListener('click', () => {
                document.getElementById('springBootConfigModal').remove();
                resolve(null);
            });

            document.getElementById('generateBtn').addEventListener('click', () => {
                const config = {
                    projectName: document.getElementById('projectName').value.trim(),
                    packageName: document.getElementById('packageName').value.trim(),
                    databaseConfig: defaultConfig.databaseConfig
                };

                if (!config.projectName || !config.packageName) {
                    alert('Por favor completa todos los campos requeridos');
                    return;
                }

                document.getElementById('springBootConfigModal').remove();
                resolve(config);
            });
        });
    },

    /**
     * Llama al backend para generar el código
     */
    callBackendGenerator: async function(diagramData, config) {
        try {
            // Asegurar que exista un proyecto y diagrama antes de continuar
            const { diagramId } = await window.projectHelper.ensureProjectAndDiagram(window.graph);
            
            console.log('ID del diagrama para generar código:', diagramId);
            
            // Si aún no hay ID de diagrama, mostrar error (no debería ocurrir)
            if (!diagramId) {
                this.showNotification('Error interno: No se pudo obtener el ID del diagrama', 'error');
                throw new Error('Error interno: No se pudo obtener el ID del diagrama');
            }

            const response = await fetch(`http://localhost:3001/api/code-generation/diagrams/${diagramId}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    language: 'spring-boot',
                    projectName: config.projectName,
                    packageName: config.packageName,
                    databaseConfig: config.databaseConfig,
                    diagramContent: diagramData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Error del servidor: ${response.status}`);
            }

            if (!data.success) {
                throw new Error(data.error || 'Error desconocido al generar código');
            }

            return data;

        } catch (error) {
            console.error('Error llamando al backend:', error);
            throw error;
        }
    },

    /**
     * Muestra modal de descarga del proyecto generado
     */
    showDownloadModal: function(response) {
        const modalHTML = `
            <div id="downloadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 w-96 max-w-full">
                    <div class="text-center">
                        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        
                        <h3 class="text-lg font-semibold mb-2">¡Proyecto Generado Exitosamente!</h3>
                        <p class="text-gray-600 mb-4">Tu proyecto Spring Boot está listo para descargar</p>
                        
                        <div class="bg-gray-50 p-3 rounded-md mb-4">
                            <div class="text-sm text-gray-700">
                                <p><strong>Archivos generados:</strong> ${response.fileCount}</p>
                                <p><strong>Estructura:</strong> ${response.structure.entities?.length || 0} entidades</p>
                            </div>
                        </div>
                        
                        <div class="space-y-3">
                            <button id="downloadBtn" class="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                                📦 Descargar Proyecto ZIP
                            </button>
                            
                            <button id="viewDetailsBtn" class="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100">
                                👁️ Ver Detalles del Proyecto
                            </button>
                        </div>
                        
                        <button id="closeModalBtn" class="mt-4 text-sm text-gray-500 hover:text-gray-700">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listeners
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadProject(response.generatedCodeId);
        });

        document.getElementById('viewDetailsBtn').addEventListener('click', () => {
            this.viewProjectDetails(response.generatedCodeId);
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.getElementById('downloadModal').remove();
        });
    },

    /**
     * Descarga el proyecto generado
     */
    downloadProject: function(generatedCodeId) {
        // Obtener token de autenticación
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            this.showNotification('No estás autenticado. Por favor, inicia sesión.', 'error');
            return;
        }
        
        // Crear URL con token en la consulta
        const downloadUrl = `http://localhost:3001/api/code-generation/${generatedCodeId}/download?token=${authToken}`;
        
        console.log('Iniciando descarga desde URL:', downloadUrl);
        
        // Crear iframe oculto para descargar sin perder la sesión actual
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = downloadUrl;
        document.body.appendChild(iframe);
        
        // Mostrar notificación
        this.showNotification('Descarga iniciada', 'success');
        
        // Eliminar el iframe después de un tiempo
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 5000);
    },

    /**
     * Muestra detalles del proyecto generado
     */
    viewProjectDetails: function(generatedCodeId) {
        // Obtener token de autenticación
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
            this.showNotification('No estás autenticado. Por favor, inicia sesión.', 'error');
            return;
        }
        
        // Crear URL con token en la consulta
        const detailsUrl = `http://localhost:3001/api/code-generation/${generatedCodeId}?token=${authToken}`;
        
        console.log('Abriendo detalles del proyecto:', detailsUrl);
        
        // Abrir nueva ventana con detalles del proyecto
        window.open(detailsUrl, '_blank');
    },

    /**
     * Muestra notificación al usuario
     */
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// Export the module
if (typeof module !== "undefined" && module.exports) {
    module.exports = CodeGenerator;
}
