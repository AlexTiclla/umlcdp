# Guía de Configuración - Colaboración en Tiempo Real

## 🚀 Fase 2 Implementada: Sistema Colaborativo

Se ha implementado completamente la **Fase 2** del plan de implementación que incluye:

### ✅ Funcionalidades Implementadas

1. **Vista de Gestión de Proyectos** (`src/projects.html`)
   - CRUD completo de proyectos
   - Búsqueda y filtros
   - Vista de colaboradores
   - Interfaz moderna y responsive

2. **Colaboración en Tiempo Real**
   - Socket.io configurado en backend y frontend
   - Sincronización de elementos de diagrama
   - Sistema de bloqueo de elementos
   - Indicadores visuales de usuarios activos

3. **Flujo de Navegación Actualizado**
   - Login/Signup → Gestión de Proyectos → Editor
   - Opción de "skip login" para modo offline
   - Navegación fluida entre vistas

4. **Indicadores de Colaboración**
   - Panel de usuarios activos
   - Elementos bloqueados visualmente
   - Notificaciones de cambios en tiempo real
   - Cursor compartido (preparado)

## 🛠️ Configuración e Instalación

### 1. Backend (umlcdp-backend)

```bash
cd umlcdp-backend
npm install
npm start
```

El servidor correrá en `http://localhost:3001`

### 2. Frontend (umlcdp)

```bash
cd umlcdp
npm install
npm run dev
```

El frontend correrá en `http://localhost:3000`

### 3. Base de Datos

Asegúrate de tener configurado Supabase o PostgreSQL según el archivo `.env` del backend.

## 🧪 Cómo Probar la Colaboración

### Escenario 1: Dos Usuarios en el Mismo Proyecto

1. **Abrir dos pestañas del navegador**
   - Pestaña A: `http://localhost:3000`
   - Pestaña B: `http://localhost:3000`

2. **Autenticarse en ambas pestañas**
   - Usar diferentes usuarios demo o crear usuarios nuevos
   - Ambos deben ir a Login → Proyectos

3. **Crear/Abrir el mismo proyecto**
   - Usuario A crea un proyecto
   - Usuario A invita a Usuario B al proyecto
   - Ambos abren el mismo proyecto

4. **Probar sincronización en tiempo real**
   - Usuario A agrega una clase UML
   - Usuario B debería ver la clase inmediatamente
   - Viceversa para cualquier cambio

### Escenario 2: Bloqueo de Elementos

1. **Usuario A selecciona un elemento**
   - El elemento se bloquea automáticamente
   - Usuario B ve el elemento con borde rojo y etiqueta

2. **Usuario B intenta editar**
   - No puede modificar el elemento bloqueado
   - Debe esperar a que Usuario A termine

3. **Usuario A libera el elemento**
   - Automáticamente al deseleccionar
   - Usuario B puede ahora editarlo

### Escenario 3: Modo Offline

1. **Abrir editor sin autenticarse**
   - Click en "Continuar sin iniciar sesión"
   - Crear diagramas localmente
   - Los cambios no se sincronizan

## 📁 Estructura de Archivos Nuevos

```
umlcdp/
├── src/
│   └── projects.html          # Vista de gestión de proyectos
├── js/
│   ├── socket-manager.js      # Cliente Socket.io
│   └── collaboration.js       # Lógica de colaboración
└── COLLABORATION_SETUP.md     # Esta guía
```

## 🔧 APIs Implementadas

### Proyectos
- `GET /api/projects` - Listar proyectos del usuario
- `POST /api/projects` - Crear nuevo proyecto
- `GET /api/projects/:id` - Obtener proyecto específico
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Colaboración Socket.io
- `diagram:join` - Unirse a un diagrama
- `diagram:leave` - Salir de un diagrama
- `diagram:element:add` - Agregar elemento
- `diagram:element:update` - Actualizar elemento
- `diagram:element:delete` - Eliminar elemento
- `element:lock` / `element:unlock` - Bloquear/desbloquear elemento

## 🐛 Solución de Problemas

### Backend no se conecta
```bash
# Verificar que el puerto 3001 esté libre
netstat -an | grep 3001
```

### Socket.io no funciona
```bash
# Verificar logs del backend
npm start
# Buscar mensajes de "Socket.io configurado"
```

### Problemas de CORS
- Verificar configuración en `umlcdp-backend/server.js`
- Asegurar que CORS permite `http://localhost:3000`

## 🔄 Próximos Pasos (Fase 3)

1. **Generación de Código Spring Boot**
   - Parser de diagrama UML
   - Generador de entidades JPA
   - Controladores REST automáticos

2. **Integración con Supabase**
   - Esquemas automáticos
   - Migración de datos
   - Validaciones de BD

3. **Inteligencia Artificial**
   - Panel de IA
   - Chat de consultas
   - Modo agente

## 📝 Notas de Desarrollo

- **Autenticación**: JWT con refresh tokens
- **Base de Datos**: Supabase (PostgreSQL)
- **Tiempo Real**: Socket.io con salas por diagrama
- **Frontend**: Vanilla JS + Tailwind CSS
- **Backend**: Node.js + Express + Sequelize

## 🧑‍💻 Comandos de Desarrollo

```bash
# Resetear base de datos
cd umlcdp-backend && npm run db:reset

# Sembrar datos de prueba
npm run seed

# Modo desarrollo con auto-reload
npm run dev
```

---

**Estado**: ✅ Fase 2 Completada  
**Próxima Fase**: Generación de Código Spring Boot  
**Fecha**: Septiembre 2024
