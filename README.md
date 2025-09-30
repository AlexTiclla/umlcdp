# UML Class Diagram Editor

Una herramienta moderna y colaborativa para el diseño de diagramas UML de clases, construida con JavaScript vanilla, JointJS y Tailwind CSS. Incluye generación automática de código Spring Boot e integración con Inteligencia Artificial.

## Características

- **Editor UML Visual**: Crea y edita diagramas UML de clases con una interfaz intuitiva
- **Colaboración en Tiempo Real**: Múltiples usuarios pueden trabajar en el mismo diagrama simultáneamente
- **Generación de Código**: Genera código backend Spring Boot completo desde tus diagramas UML
- **Integración con IA**: Obtén sugerencias inteligentes y generación automática de código
- **Autenticación**: Sistema de usuarios con roles (Admin, Editor, Viewer)
- **UI Moderna**: Construida con Tailwind CSS para un diseño limpio y responsivo

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficos**: JointJS para manipulación de diagramas
- **Estilos**: Tailwind CSS
- **Herramienta de Build**: Vite
- **Backend**: Node.js con Express (en desarrollo)
- **Base de Datos**: Supabase (PostgreSQL)
- **Tiempo Real**: Socket.io (en desarrollo)
- **Autenticación**: Sistema mock con localStorage

## Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd uml-class-diagram-editor
```

2. Instala las dependencias:
```bash
npm install
```

3. Construye el CSS:
```bash
npm run build:css
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre tu navegador y navega a `http://localhost:3000`

## Uso

### Usuarios Demo

Para probar la aplicación, puedes usar estos usuarios demo:

| Email | Contraseña | Rol | Descripción |
|-------|------------|-----|-------------|
| `admin@umleditor.com` | `admin123` | Admin | Administrador completo |
| `editor@umleditor.com` | `editor123` | Editor | Puede crear y editar |
| `viewer@umleditor.com` | `viewer123` | Viewer | Solo visualización |
| `demo@umleditor.com` | `demo123` | Editor | Usuario demo |

### Creando Diagramas

1. **Inicia Sesión**: Ve a la página de login y usa uno de los usuarios demo
2. **Agregar Clases**: Haz clic en la herramienta "Class" y haz clic en el canvas para agregar una nueva clase
3. **Agregar Interfaces**: Usa la herramienta "Interface" para agregar interfaces
4. **Agregar Relaciones**: Selecciona una herramienta de relación y conecta dos elementos
5. **Editar Elementos**: Haz doble clic en cualquier elemento para editar sus propiedades

### Herramientas Disponibles

- **Elementos**:
  - Clase
  - Interfaz  
  - Clase Abstracta

- **Relaciones**:
  - Asociación
  - Asociación Navegable
  - Herencia
  - Implementación
  - Composición
  - Agregación

### Atajos de Teclado

- `Ctrl/Cmd + S`: Guardar diagrama como imagen
- `Ctrl/Cmd + A`: Seleccionar todos los elementos
- `Ctrl/Cmd + Z`: Deshacer última acción
- `Delete`: Eliminar elementos seleccionados

## Estructura del Proyecto

```
umlcdp/
├── css/
│   ├── src/
│   │   ├── styles.css      # Tailwind CSS fuente
│   │   └── auth-styles.css # Estilos de autenticación
│   └── styles.css          # CSS compilado
├── js/
│   ├── main.js             # Lógica principal de la aplicación
│   ├── umlShapes.js        # Definiciones de formas UML
│   ├── relationships.js    # Definiciones de relaciones
│   ├── codeGenerator.js    # Lógica de generación de código
│   ├── persistence.js      # Persistencia de datos
│   ├── api.js              # Comunicación con API
│   ├── auth-manager.js     # Gestor de autenticación
│   └── auth-script.js      # Scripts de autenticación
├── src/
│   ├── login.html          # Página de login
│   ├── signup.html         # Página de registro
│   └── demo-users.html     # Página de usuarios demo
├── docs/
│   ├── requerimientos-examen-ingenieria-software.md
│   ├── plan-implementacion-detallado.md
│   └── diagrama-entidad-relacion.md
├── index.html              # Aplicación principal
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Desarrollo

### Construir para Producción

```bash
npm run build
```

### Observar Cambios de CSS

```bash
npm run watch
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Funcionalidades en Desarrollo

- [ ] Colaboración en tiempo real con Socket.io
- [ ] Generación de código Spring Boot
- [ ] Integración con Supabase
- [ ] Panel de Inteligencia Artificial
- [ ] Sincronización de elementos individuales
- [ ] Sistema de versionado de diagramas

## Contribuir

1. Fork el repositorio
2. Crea una rama de feature
3. Haz tus cambios
4. Ejecuta tests y linting
5. Envía un pull request

## Licencia

ISC License

## Autor

Hassan AIT MOUSSA