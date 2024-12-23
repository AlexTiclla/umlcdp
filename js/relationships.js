const Relationships = {
    createAssociation: function(source, target) {
        return new joint.dia.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: {
                '.connection': { stroke: '#6366f1', 'stroke-width': 1.5 }
            },
            labels: [
                {
                    position: 0.1,
                    attrs: { 
                        text: { 
                            text: '1', 
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
                            text: '1', 
                            fill: '#475569',
                            'font-family': 'JetBrains Mono',
                            'font-size': 11
                        } 
                    }
                }
            ]
        });
    },

    createNavigableAssociation: function(source, target) {
        return new joint.dia.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: {
                '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z', fill: '#6366f1' },
                '.connection': { stroke: '#6366f1', 'stroke-width': 1.5 }
            },
            labels: [
                {
                    position: 0.1,
                    attrs: { 
                        text: { 
                            text: '1', 
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
                            text: '1', 
                            fill: '#475569',
                            'font-family': 'JetBrains Mono',
                            'font-size': 11
                        } 
                    }
                }
            ]
        });
    },

    createInheritance: function(source, target) {
        return new joint.dia.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: {
                '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: '#fff' },
                '.connection': { stroke: '#000', 'stroke-width': 1 }
            },
            type: 'uml.Inheritance'
        });
    },

    createImplementation: function(source, target) {
        return new joint.dia.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: {
                '.marker-target': { d: 'M 20 0 L 0 10 L 20 20 z', fill: '#fff' },
                '.connection': { stroke: '#000', 'stroke-width': 1, 'stroke-dasharray': '5,5' }
            },
            type: 'uml.Implementation'
        });
    },

    createComposition: function(source, target) {
        return new joint.dia.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: {
                '.marker-target': { d: 'M 0 0 L 10 5 L 0 10 L -10 5 z', fill: '#000' },
                '.connection': { stroke: '#000', 'stroke-width': 1 }
            }
        });
    },

    createAggregation: function(source, target) {
        return new joint.dia.Link({
            source: { id: source.id },
            target: { id: target.id },
            attrs: {
                '.marker-target': { d: 'M 0 0 L 10 5 L 0 10 L -10 5 z', fill: '#fff' },
                '.connection': { stroke: '#000', 'stroke-width': 1 }
            }
        });
    }
}; 