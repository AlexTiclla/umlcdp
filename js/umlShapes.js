const UMLShapes = {
    createClass: function(position, name = 'Class') {
        // Calculate minimum width based on text length
        const calculateWidth = (texts) => {
            const textLengths = texts.map(text => text.length * 8); // Approximate width per character
            return Math.max(...textLengths, 150); // Minimum width of 150px
        };

        // Calculate height based on number of items
        const calculateHeight = (attrs, methods) => {
            const totalItems = attrs.length + methods.length;
            const headerHeight = 40;
            const itemHeight = 20;
            return headerHeight + (totalItems * itemHeight);
        };

        const defaultAttrs = ['+attribute1: type', '-attribute2: type'];
        const defaultMethods = ['+method1(): returnType', '-method2(param: type): returnType'];

        // Calculate initial size
        const width = calculateWidth([name, ...defaultAttrs, ...defaultMethods]);
        const height = calculateHeight(defaultAttrs, defaultMethods);

        return new joint.shapes.uml.Class({
            position: position,
            size: { width: width, height: height },
            name: name,
            attributes: defaultAttrs,
            methods: defaultMethods,
            attrs: {
                '.uml-class-name-rect': {
                    fill: '#ffffff',
                    stroke: '#6366f1',
                    'stroke-width': 2
                },
                '.uml-class-attrs-rect': {
                    fill: '#ffffff',
                    stroke: '#6366f1',
                    'stroke-width': 2
                },
                '.uml-class-methods-rect': {
                    fill: '#ffffff',
                    stroke: '#6366f1',
                    'stroke-width': 2
                },
                '.uml-class-name-text': {
                    'font-family': 'JetBrains Mono',
                    'font-size': 12,
                    'font-weight': 500,
                    'fill': '#1e293b',
                    'ref-x': 0.5,
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    'x-alignment': 'middle'
                },
                '.uml-class-attrs-text': {
                    'font-family': 'JetBrains Mono',
                    'font-size': 11,
                    'fill': '#475569',
                    'ref-x': 5,
                    'ref-y': 5
                },
                '.uml-class-methods-text': {
                    'font-family': 'JetBrains Mono',
                    'font-size': 11,
                    'fill': '#475569',
                    'ref-x': 5,
                    'ref-y': 5
                }
            }
        });
    },

    createInterface: function(position, name = 'Interface') {
        // Calculate size based on methods only
        const calculateWidth = (texts) => {
            const textLengths = texts.map(text => text.length * 8);
            return Math.max(...textLengths, 150);
        };

        const calculateHeight = (methods) => {
            const headerHeight = 40;
            const itemHeight = 20;
            return headerHeight + (methods.length * itemHeight);
        };

        const defaultMethods = ['+method1(): returnType', '+method2(param: type): returnType'];

        // Calculate initial size
        const width = calculateWidth([name, ...defaultMethods]);
        const height = calculateHeight(defaultMethods);

        const interfaceClass = new joint.shapes.uml.Class({
            position: position,
            size: { width: width, height: height },
            name: `<<interface>>\n${name}`,
            methods: defaultMethods,
            attributes: [],
            attrs: {
                '.uml-class-name-rect': {
                    fill: '#818cf8',
                    stroke: '#4f46e5',
                    'stroke-width': 2,
                    'stroke-dasharray': '0'
                },
                '.uml-class-attrs-rect': {
                    display: 'none'
                },
                '.uml-class-methods-rect': {
                    fill: '#eef2ff',
                    stroke: '#4f46e5',
                    'stroke-width': 2
                },
                '.uml-class-name-text': {
                    'font-family': 'JetBrains Mono',
                    'font-size': 12,
                    'font-weight': 600,
                    'fill': '#ffffff',
                    'ref-x': 0.5,
                    'ref-y': 0.5,
                    'y-alignment': 'middle',
                    'x-alignment': 'middle'
                },
                '.uml-class-methods-text': {
                    'font-family': 'JetBrains Mono',
                    'font-size': 11,
                    'fill': '#312e81',
                    'ref-x': 5,
                    'ref-y': 5
                }
            }
        });

        return interfaceClass;
    },

    createAbstractClass: function(position, name = 'Abstract') {
        const abstractClass = this.createClass(position, `<<abstract>>\n${name}`);
        abstractClass.attr({
            '.uml-class-name-rect': {
                fill: '#c084fc',
                stroke: '#9333ea',
                'stroke-width': 2
            },
            '.uml-class-attrs-rect': {
                fill: '#faf5ff',
                stroke: '#9333ea'
            },
            '.uml-class-methods-rect': {
                fill: '#faf5ff',
                stroke: '#9333ea'
            },
            '.uml-class-name-text': {
                'font-style': 'italic',
                'fill': '#ffffff',
                'font-weight': 600
            },
            '.uml-class-attrs-text, .uml-class-methods-text': {
                'fill': '#581c87'
            }
        });
        return abstractClass;
    }
}; 