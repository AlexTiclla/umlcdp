const CodeGenerator = {
    // Common type mappings for different languages
    typeMap: {
        java: {
            'String': 'String',
            'int': 'int',
            'float': 'float',
            'double': 'double',
            'boolean': 'boolean',
            'void': 'void',
            'List': 'List',
            'Map': 'Map'
        },
        python: {
            'String': 'str',
            'int': 'int',
            'float': 'float',
            'double': 'float',
            'boolean': 'bool',
            'void': 'None',
            'List': 'list',
            'Map': 'dict'
        },
        php: {
            'String': 'string',
            'int': 'int',
            'float': 'float',
            'double': 'float',
            'boolean': 'bool',
            'void': 'void',
            'List': 'array',
            'Map': 'array'
        }
    },

    // Parse visibility symbol to language-specific keyword
    parseVisibility: function(symbol, language) {
        const visibilityMap = {
            java: {
                '+': 'public',
                '-': 'private',
                '#': 'protected',
                '~': 'package'
            },
            python: {
                '+': '',
                '-': '__',
                '#': '_',
                '~': ''
            },
            php: {
                '+': 'public',
                '-': 'private',
                '#': 'protected',
                '~': 'public'
            }
        };
        return visibilityMap[language][symbol] || '';
    },

    // Parse a method string into its components
    parseMethod: function(methodStr) {
        const match = methodStr.match(/^([+\-#~])?(\w+)\((.*)\)(?:\s*:\s*(.+))?$/);
        if (!match) return null;

        return {
            visibility: match[1] || '+',
            name: match[2],
            parameters: match[3].split(',').filter(p => p.trim()).map(p => {
                const [name, type] = p.trim().split(':').map(s => s.trim());
                return { name, type };
            }),
            returnType: match[4]?.trim() || 'void'
        };
    },

    // Parse an attribute string into its components
    parseAttribute: function(attrStr) {
        const match = attrStr.match(/^([+\-#~])?(\w+)(?:\s*:\s*(.+))?$/);
        if (!match) return null;

        return {
            visibility: match[1] || '+',
            name: match[2],
            type: match[3]?.trim() || 'String'
        };
    },

    // Generate code for a specific language
    generateCode: function(graph, language) {
        let code = '';
        const elements = graph.getElements();
        const relationships = graph.getLinks();

        // Add language-specific imports/headers
        code += this.generateHeader(language);

        // Generate code for each class/interface
        elements.forEach(element => {
            const name = element.get('name').replace(/<<interface>>\n|<<abstract>>\n/, '');
            const isInterface = element.get('name').includes('<<interface>>');
            const isAbstract = element.get('name').includes('<<abstract>>');
            const attributes = element.get('attributes') || [];
            const methods = element.get('methods') || [];

            // Find relationships for this class
            const classRelationships = relationships.filter(r => 
                r.getSourceElement().id === element.id || 
                r.getTargetElement().id === element.id
            );

            code += this.generateClass(
                name,
                isInterface,
                isAbstract,
                attributes,
                methods,
                classRelationships,
                language,
                elements
            );
            code += '\n\n';
        });

        return code;
    },

    generateHeader: function(language) {
        switch (language) {
            case 'java':
                return 'import java.util.*;\n\n';
            case 'python':
                return 'from typing import List, Dict, Optional\n\n';
            case 'php':
                return '<?php\n\n';
            default:
                return '';
        }
    },

    generateClass: function(name, isInterface, isAbstract, attributes, methods, relationships, language, elements) {
        switch (language) {
            case 'java':
                return this.generateJavaClass(name, isInterface, isAbstract, attributes, methods, relationships, elements);
            case 'python':
                return this.generatePythonClass(name, isInterface, isAbstract, attributes, methods, relationships, elements);
            case 'php':
                return this.generatePhpClass(name, isInterface, isAbstract, attributes, methods, relationships, elements);
            default:
                return '';
        }
    },

    // Parse multiplicity string into min and max values
    parseMultiplicity: function(multiplicity) {
        if (!multiplicity) return { min: 1, max: 1 };
        
        if (multiplicity === '*') return { min: 0, max: Infinity };
        if (multiplicity === '0..*' || multiplicity === '0..n') return { min: 0, max: Infinity };
        if (multiplicity === '1..*' || multiplicity === '1..n') return { min: 1, max: Infinity };
        
        const range = multiplicity.split('..');
        if (range.length === 2) {
            return {
                min: parseInt(range[0]),
                max: range[1] === '*' ? Infinity : parseInt(range[1])
            };
        }
        
        return { min: parseInt(multiplicity), max: parseInt(multiplicity) };
    },

    // Get appropriate collection type based on multiplicity
    getCollectionType: function(language, multiplicity) {
        const { min, max } = this.parseMultiplicity(multiplicity);
        
        if (max === 1) {
            return null; // Single reference
        }

        switch (language) {
            case 'java':
                return max === Infinity ? 'List' : 'Set';
            case 'python':
                return max === Infinity ? 'list' : 'set';
            case 'php':
                return 'array';
            default:
                return 'List';
        }
    },

    // Process relationships to generate appropriate attributes and methods
    processRelationships: function(element, relationships, elements, language) {
        let code = '';
        const processedRelationships = new Set();

        relationships.forEach(rel => {
            if (processedRelationships.has(rel.id)) return;
            processedRelationships.add(rel.id);

            const relType = rel.get('type');
            if (relType === 'uml.Association' || relType === 'uml.Composition' || relType === 'uml.Aggregation') {
                const source = rel.getSourceElement();
                const target = rel.getTargetElement();
                const labels = rel.labels() || [];
                
                // Get multiplicities
                const sourceMulti = labels[0]?.attrs?.text?.text || '1';
                const targetMulti = labels[1]?.attrs?.text?.text || '1';

                // Process based on which end of the relationship this element is
                if (source.id === element.id) {
                    const targetName = target.get('name').replace(/<<interface>>\n|<<abstract>>\n/, '');
                    const collectionType = this.getCollectionType(language, targetMulti);
                    
                    if (collectionType) {
                        switch (language) {
                            case 'java':
                                code += `    private ${collectionType}<${targetName}> ${this.camelCase(targetName)}s;\n`;
                                break;
                            case 'python':
                                code += `        self._${this.snakeCase(targetName)}s: ${collectionType}[${targetName}] = ${collectionType}()\n`;
                                break;
                            case 'php':
                                code += `    private array $${this.camelCase(targetName)}s;\n`;
                                break;
                        }
                    } else {
                        switch (language) {
                            case 'java':
                                code += `    private ${targetName} ${this.camelCase(targetName)};\n`;
                                break;
                            case 'python':
                                code += `        self._${this.snakeCase(targetName)}: Optional[${targetName}] = None\n`;
                                break;
                            case 'php':
                                code += `    private ?${targetName} $${this.camelCase(targetName)};\n`;
                                break;
                        }
                    }
                }
            }
        });

        return code;
    },

    // Helper function to convert to camelCase
    camelCase: function(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    },

    // Helper function to convert to snake_case
    snakeCase: function(str) {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
    },

    generateJavaClass: function(name, isInterface, isAbstract, attributes, methods, relationships, elements) {
        let code = '';
        
        // Generate class declaration
        if (isInterface) {
            code += `public interface ${name} `;
        } else {
            code += `public ${isAbstract ? 'abstract ' : ''}class ${name} `;
        }

        // Add inheritance and implementation
        const currentElement = elements.find(e => e.get('name').includes(name));
        const inheritance = relationships.filter(r => {
            // Check both source and target for inheritance relationships
            return (r.getSourceElement().id === currentElement.id || r.getTargetElement().id === currentElement.id) &&
                   (r.get('type') === 'uml.Inheritance' || r.get('type') === 'uml.Implementation');
        });

        // Find parent classes (where current class is the source)
        const extends_ = inheritance
            .filter(r => r.get('type') === 'uml.Inheritance' && r.getSourceElement().id === currentElement.id)
            .map(r => r.getTargetElement().get('name').replace(/<<interface>>\n|<<abstract>>\n/, ''));

        // Find interfaces to implement (where current class is the source)
        const implements_ = inheritance
            .filter(r => r.get('type') === 'uml.Implementation' && r.getSourceElement().id === currentElement.id)
            .map(r => r.getTargetElement().get('name').replace(/<<interface>>\n|<<abstract>>\n/, ''));

        if (extends_.length > 0) {
            code += `extends ${extends_[0]} `;  // Java only supports single inheritance
        }
        if (implements_.length > 0) {
            code += `implements ${implements_.join(', ')} `;
        }

        code += '{\n';

        // Generate attributes from relationships
        if (!isInterface) {
            code += this.processRelationships(
                elements.find(e => e.get('name').includes(name)),
                relationships,
                elements,
                'java'
            );
        }

        // Generate regular attributes
        if (!isInterface) {
            attributes.forEach(attr => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const visibility = this.parseVisibility(parsed.visibility, 'java');
                    const type = this.typeMap.java[parsed.type] || parsed.type;
                    code += `    ${visibility} ${type} ${parsed.name};\n`;
                }
            });
            if (attributes.length > 0) code += '\n';
        }

        // Generate methods
        methods.forEach(method => {
            const parsed = this.parseMethod(method);
            if (parsed) {
                const visibility = this.parseVisibility(parsed.visibility, 'java');
                const returnType = this.typeMap.java[parsed.returnType] || parsed.returnType;
                const params = parsed.parameters.map(p => 
                    `${this.typeMap.java[p.type] || p.type} ${p.name}`
                ).join(', ');

                if (isInterface || isAbstract) {
                    code += `    ${visibility} ${returnType} ${parsed.name}(${params});\n`;
                } else {
                    code += `    ${visibility} ${returnType} ${parsed.name}(${params}) {\n        // TODO: Implement method\n    }\n`;
                }
            }
        });

        code += '}';
        return code;
    },

    generatePythonClass: function(name, isInterface, isAbstract, attributes, methods, relationships, elements) {
        let code = '';
        
        // Add imports for abstract base classes and typing
        if (isInterface || isAbstract) {
            code += 'from abc import ABC, abstractmethod\n';
        }
        code += 'from typing import List, Set, Dict, Optional\n\n';

        // Generate class declaration
        code += `class ${name}`;

        // Add inheritance and implementation
        const currentElement = elements.find(e => e.get('name').includes(name));
        const inheritance = relationships.filter(r => {
            // Check both source and target for inheritance relationships
            return (r.getSourceElement().id === currentElement.id || r.getTargetElement().id === currentElement.id) &&
                   (r.get('type') === 'uml.Inheritance' || r.get('type') === 'uml.Implementation');
        });

        // In Python, both inheritance and implementation are handled through inheritance
        const parents = inheritance
            .filter(r => r.getSourceElement().id === currentElement.id)
            .map(r => r.getTargetElement().get('name').replace(/<<interface>>\n|<<abstract>>\n/, ''));

        if (isInterface || isAbstract) {
            parents.push('ABC');
        }

        if (parents.length > 0) {
            code += `(${parents.join(', ')})`;
        }

        code += ':\n';

        // Add docstring
        code += '    """' + name + ' ' + (isInterface ? 'interface' : 'class') + '."""\n\n';

        // Generate constructor with attributes
        if (!isInterface) {
            code += '    def __init__(self';
            attributes.forEach(attr => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const type = this.typeMap.python[parsed.type] || parsed.type;
                    code += `, ${parsed.name}: ${type}`;
                }
            });
            code += '):\n';
            
            // Initialize relationship attributes
            code += this.processRelationships(
                elements.find(e => e.get('name').includes(name)),
                relationships,
                elements,
                'python'
            );
            
            // Initialize regular attributes
            attributes.forEach(attr => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const visibility = this.parseVisibility(parsed.visibility, 'python');
                    code += `        self.${visibility}${parsed.name} = ${parsed.name}\n`;
                }
            });
            code += '\n';
        }

        // Generate methods
        methods.forEach(method => {
            const parsed = this.parseMethod(method);
            if (parsed) {
                const visibility = this.parseVisibility(parsed.visibility, 'python');
                const returnType = this.typeMap.python[parsed.returnType] || parsed.returnType;
                const params = parsed.parameters.map(p => 
                    `${p.name}: ${this.typeMap.python[p.type] || p.type}`
                ).join(', ');

                code += `    ${isInterface || isAbstract ? '@abstractmethod\n' : ''}`;
                code += `    def ${visibility}${parsed.name}(self${params ? ', ' + params : ''}) -> ${returnType}:\n`;
                if (!isInterface && !isAbstract) {
                    code += '        # TODO: Implement method\n        pass\n';
                } else {
                    code += '        pass\n';
                }
                code += '\n';
            }
        });

        return code;
    },

    generatePhpClass: function(name, isInterface, isAbstract, attributes, methods, relationships, elements) {
        let code = '';
        
        // Generate class declaration
        if (isInterface) {
            code += `interface ${name} `;
        } else {
            code += `${isAbstract ? 'abstract ' : ''}class ${name} `;
        }

        // Add inheritance and implementation
        const currentElement = elements.find(e => e.get('name').includes(name));
        const inheritance = relationships.filter(r => {
            // Check both source and target for inheritance relationships
            return (r.getSourceElement().id === currentElement.id || r.getTargetElement().id === currentElement.id) &&
                   (r.get('type') === 'uml.Inheritance' || r.get('type') === 'uml.Implementation');
        });

        // Find parent class (where current class is the source)
        const extends_ = inheritance
            .filter(r => r.get('type') === 'uml.Inheritance' && r.getSourceElement().id === currentElement.id)
            .map(r => r.getTargetElement().get('name').replace(/<<interface>>\n|<<abstract>>\n/, ''));

        // Find interfaces to implement (where current class is the source)
        const implements_ = inheritance
            .filter(r => r.get('type') === 'uml.Implementation' && r.getSourceElement().id === currentElement.id)
            .map(r => r.getTargetElement().get('name').replace(/<<interface>>\n|<<abstract>>\n/, ''));

        if (extends_.length > 0) {
            code += `extends ${extends_[0]} `; // PHP only supports single inheritance
        }
        if (implements_.length > 0) {
            code += `implements ${implements_.join(', ')} `;
        }

        code += '\n{\n';

        // Generate attributes from relationships
        if (!isInterface) {
            code += this.processRelationships(
                elements.find(e => e.get('name').includes(name)),
                relationships,
                elements,
                'php'
            );
        }

        // Generate regular attributes
        if (!isInterface) {
            attributes.forEach(attr => {
                const parsed = this.parseAttribute(attr);
                if (parsed) {
                    const visibility = this.parseVisibility(parsed.visibility, 'php');
                    const type = this.typeMap.php[parsed.type] || parsed.type;
                    code += `    ${visibility} ${type} $${parsed.name};\n`;
                }
            });
            if (attributes.length > 0) code += '\n';
        }

        // Generate methods
        methods.forEach(method => {
            const parsed = this.parseMethod(method);
            if (parsed) {
                const visibility = this.parseVisibility(parsed.visibility, 'php');
                const returnType = this.typeMap.php[parsed.returnType] || parsed.returnType;
                const params = parsed.parameters.map(p => 
                    `${this.typeMap.php[p.type] || p.type} $${p.name}`
                ).join(', ');

                if (isInterface || isAbstract) {
                    code += `    ${visibility} function ${parsed.name}(${params}): ${returnType};\n`;
                } else {
                    code += `    ${visibility} function ${parsed.name}(${params}): ${returnType}\n    {\n        // TODO: Implement method\n    }\n`;
                }
            }
        });

        code += '}\n';
        return code;
    }
};

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeGenerator;
} 