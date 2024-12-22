# UML Class Diagram Editor

A modern, web-based UML Class Diagram editor built with JointJS and Tailwind CSS. Create, edit, and generate code from your UML class diagrams with an intuitive user interface.

## Features

- **Element Creation**
  - Create Classes, Interfaces, and Abstract Classes
  - Drag and drop or click-to-place elements
  - Edit class names, attributes, and methods

- **Relationships**
  - Association
  - Inheritance
  - Implementation
  - Composition
  - Aggregation
  - Edit relationship multiplicities

- **Code Generation**
  - Generate code in multiple languages:
    - Java
    - Python
    - PHP
  - Copy generated code to clipboard
  - Download generated code files

- **Navigation**
  - Pan around the diagram by clicking and dragging
  - Zoom in/out using Ctrl + Mouse Wheel
  - Select all elements with Ctrl+A
  - Save diagram as PNG with Ctrl+S

## Getting Started

### Prerequisites

- Node.js and npm installed on your system

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start using the editor by opening `index.html` in your web browser

## Usage Guide

### Creating Elements

1. Click on the desired element type in the sidebar (Class, Interface, or Abstract Class)
2. Click on the canvas to place the element, or drag and drop from the sidebar
3. Double-click an element to edit its properties:
   - Change the name
   - Add/edit attributes (for classes)
   - Add/edit methods

### Creating Relationships

1. Click on the desired relationship type in the sidebar
2. Click on the source element
3. Click on the target element to create the relationship
4. Double-click the relationship line to edit multiplicities

### Code Generation

1. Click the "Generate Code" button
2. Select your target programming language
3. Review the generated code
4. Choose to:
   - Copy code to clipboard
   - Download as a file
   - Go back to select a different language

### Navigation Tips

- **Pan**: Click and drag on empty space to move around the diagram
- **Zoom**: Use Ctrl + Mouse Wheel to zoom in/out
- **Select All**: Press Ctrl+A to select all elements
- **Delete**: Select element(s) and press Delete key
- **Save**: Press Ctrl+S to save the diagram as PNG

### Element Properties

- **Classes**
  - Can have attributes and methods
  - Support public (+), private (-), and protected (#) members
  - Example attribute: `+name: String`
  - Example method: `+getName(): String`

- **Interfaces**
  - Only contain method signatures
  - All methods are public
  - No attributes

- **Abstract Classes**
  - Similar to regular classes
  - Can have abstract methods
  - Can have regular methods and attributes

### Relationship Types

- **Association**: Basic relationship between classes
- **Inheritance**: "is-a" relationship (extends)
- **Implementation**: Class implementing an interface
- **Composition**: Strong "has-a" relationship
- **Aggregation**: Weak "has-a" relationship

## Keyboard Shortcuts

- `Ctrl + A`: Select all elements
- `Ctrl + S`: Save diagram as PNG
- `Delete`: Remove selected element(s)
- `Esc`: Cancel current operation/close modal

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 