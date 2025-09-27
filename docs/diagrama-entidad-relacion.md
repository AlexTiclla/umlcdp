# Diagrama de Entidad-Relación - Herramienta de Diseño de Base de Datos Colaborativa con IA

## Información del Proyecto
- **Proyecto:** Herramienta de Diseño de Base de Datos Colaborativa con IA
- **Base de Datos:** Supabase (PostgreSQL)
- **Fecha:** Septiembre 2025

---

## Descripción del Modelo de Datos

Este diagrama representa la estructura de base de datos necesaria para soportar todas las funcionalidades requeridas en el examen de Ingeniería de Software 1, incluyendo:

1. **Gestión de usuarios y autenticación**
2. **Proyectos colaborativos**
3. **Diagramas UML con versionado**
4. **Sincronización en tiempo real**
5. **Integración con IA**
6. **Generación de código Spring Boot**

---

## Entidades Principales

### 1. **users** - Usuarios del Sistema
- **Propósito:** Gestionar usuarios, autenticación y roles
- **Características:** Sistema de roles (Admin, Editor, Viewer)
- **Seguridad:** Encriptación de contraseñas, JWT tokens

### 2. **projects** - Proyectos Colaborativos
- **Propósito:** Contenedores de diagramas UML
- **Características:** Colaboración en tiempo real, control de acceso
- **Funcionalidades:** Invitaciones, permisos, historial

### 3. **diagrams** - Diagramas UML
- **Propósito:** Almacenar diagramas de clases UML
- **Características:** Versionado, sincronización en tiempo real
- **Contenido:** Estructura completa del diagrama (elementos, relaciones, metadatos)

### 4. **project_members** - Miembros de Proyecto
- **Propósito:** Gestionar colaboradores y permisos
- **Características:** Roles por proyecto, invitaciones
- **Funcionalidades:** Control de acceso granular

### 5. **diagram_versions** - Versiones de Diagramas
- **Propósito:** Historial y versionado de diagramas
- **Características:** Rollback, comparación, auditoría
- **Funcionalidades:** Autoguardado, cambios incrementales

### 6. **collaboration_sessions** - Sesiones de Colaboración
- **Propósito:** Gestionar sesiones activas de usuarios
- **Características:** Tiempo real, locks de elementos
- **Funcionalidades:** Indicadores de usuarios activos

### 7. **ai_interactions** - Interacciones con IA
- **Propósito:** Registrar consultas y respuestas de IA
- **Características:** Cache, análisis de patrones
- **Funcionalidades:** Sugerencias, validaciones automáticas

### 8. **generated_code** - Código Generado
- **Propósito:** Almacenar código Spring Boot generado
- **Características:** Versionado, validación
- **Funcionalidades:** Descarga, comparación de versiones

### 9. **diagram_elements** - Elementos del Diagrama
- **Propósito:** Almacenar elementos individuales del diagrama
- **Características:** Metadatos, posiciones, propiedades
- **Funcionalidades:** Sincronización granular, locks

### 10. **diagram_relationships** - Relaciones del Diagrama
- **Propósito:** Almacenar relaciones entre elementos
- **Características:** Tipos UML, multiplicidades
- **Funcionalidades:** Validación, generación de código

---

## Atributos Detallados

### **users**
- `id` (UUID, PK): Identificador único
- `email` (VARCHAR, UNIQUE): Email del usuario
- `password_hash` (VARCHAR): Hash de la contraseña
- `username` (VARCHAR, UNIQUE): Nombre de usuario
- `first_name` (VARCHAR): Nombre
- `last_name` (VARCHAR): Apellido
- `role` (ENUM): 'admin', 'editor', 'viewer'
- `avatar_url` (VARCHAR): URL del avatar
- `is_active` (BOOLEAN): Estado activo
- `email_verified` (BOOLEAN): Email verificado
- `last_login` (TIMESTAMP): Último acceso
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

### **projects**
- `id` (UUID, PK): Identificador único
- `name` (VARCHAR): Nombre del proyecto
- `description` (TEXT): Descripción
- `owner_id` (UUID, FK): Propietario del proyecto
- `is_public` (BOOLEAN): Visibilidad pública
- `settings` (JSONB): Configuraciones del proyecto
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

### **diagrams**
- `id` (UUID, PK): Identificador único
- `project_id` (UUID, FK): Proyecto al que pertenece
- `name` (VARCHAR): Nombre del diagrama
- `description` (TEXT): Descripción
- `content` (JSONB): Contenido completo del diagrama
- `is_active` (BOOLEAN): Diagrama activo
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

### **project_members**
- `id` (UUID, PK): Identificador único
- `project_id` (UUID, FK): Proyecto
- `user_id` (UUID, FK): Usuario
- `role` (ENUM): 'owner', 'editor', 'viewer'
- `permissions` (JSONB): Permisos específicos
- `invited_by` (UUID, FK): Quien invitó
- `invited_at` (TIMESTAMP): Fecha de invitación
- `joined_at` (TIMESTAMP): Fecha de unión
- `status` (ENUM): 'pending', 'accepted', 'declined'

### **diagram_versions**
- `id` (UUID, PK): Identificador único
- `diagram_id` (UUID, FK): Diagrama
- `version_number` (INTEGER): Número de versión
- `content` (JSONB): Contenido de la versión
- `changes_summary` (TEXT): Resumen de cambios
- `created_by` (UUID, FK): Usuario que creó la versión
- `created_at` (TIMESTAMP): Fecha de creación

### **collaboration_sessions**
- `id` (UUID, PK): Identificador único
- `user_id` (UUID, FK): Usuario
- `diagram_id` (UUID, FK): Diagrama
- `session_token` (VARCHAR): Token de sesión
- `is_active` (BOOLEAN): Sesión activa
- `last_activity` (TIMESTAMP): Última actividad
- `locked_elements` (JSONB): Elementos bloqueados
- `cursor_position` (JSONB): Posición del cursor
- `created_at` (TIMESTAMP): Fecha de creación

### **ai_interactions**
- `id` (UUID, PK): Identificador único
- `user_id` (UUID, FK): Usuario
- `diagram_id` (UUID, FK): Diagrama
- `interaction_type` (ENUM): 'question', 'suggestion', 'validation'
- `prompt` (TEXT): Prompt enviado
- `response` (TEXT): Respuesta de IA
- `context` (JSONB): Contexto del diagrama
- `confidence_score` (FLOAT): Puntuación de confianza
- `created_at` (TIMESTAMP): Fecha de creación

### **generated_code**
- `id` (UUID, PK): Identificador único
- `diagram_id` (UUID, FK): Diagrama origen
- `version` (VARCHAR): Versión del código
- `language` (VARCHAR): Lenguaje generado
- `code_structure` (JSONB): Estructura del código
- `files` (JSONB): Archivos generados
- `is_valid` (BOOLEAN): Código válido
- `compilation_errors` (TEXT): Errores de compilación
- `created_at` (TIMESTAMP): Fecha de creación

### **diagram_elements**
- `id` (UUID, PK): Identificador único
- `diagram_id` (UUID, FK): Diagrama
- `element_id` (VARCHAR): ID del elemento en el diagrama
- `element_type` (ENUM): 'class', 'interface', 'abstract_class'
- `name` (VARCHAR): Nombre del elemento
- `attributes` (JSONB): Atributos del elemento
- `methods` (JSONB): Métodos del elemento
- `position` (JSONB): Posición (x, y)
- `size` (JSONB): Tamaño (width, height)
- `properties` (JSONB): Propiedades adicionales
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

### **diagram_relationships**
- `id` (UUID, PK): Identificador único
- `diagram_id` (UUID, FK): Diagrama
- `relationship_id` (VARCHAR): ID de la relación
- `source_element_id` (VARCHAR): Elemento origen
- `target_element_id` (VARCHAR): Elemento destino
- `relationship_type` (ENUM): 'association', 'inheritance', 'implementation', 'composition', 'aggregation'
- `source_multiplicity` (VARCHAR): Multiplicidad origen
- `target_multiplicity` (VARCHAR): Multiplicidad destino
- `properties` (JSONB): Propiedades adicionales
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de actualización

---

## Relaciones Principales

### **1. users ↔ projects (1:N)**
- Un usuario puede ser propietario de múltiples proyectos
- Un proyecto tiene un solo propietario

### **2. projects ↔ diagrams (1:N)**
- Un proyecto puede contener múltiples diagramas
- Un diagrama pertenece a un solo proyecto

### **3. users ↔ project_members (1:N)**
- Un usuario puede ser miembro de múltiples proyectos
- Un miembro pertenece a un solo usuario

### **4. projects ↔ project_members (1:N)**
- Un proyecto puede tener múltiples miembros
- Un miembro pertenece a un solo proyecto

### **5. diagrams ↔ diagram_versions (1:N)**
- Un diagrama puede tener múltiples versiones
- Una versión pertenece a un solo diagrama

### **6. diagrams ↔ collaboration_sessions (1:N)**
- Un diagrama puede tener múltiples sesiones activas
- Una sesión pertenece a un solo diagrama

### **7. diagrams ↔ ai_interactions (1:N)**
- Un diagrama puede tener múltiples interacciones con IA
- Una interacción pertenece a un solo diagrama

### **8. diagrams ↔ generated_code (1:N)**
- Un diagrama puede generar múltiples versiones de código
- Un código generado pertenece a un solo diagrama

### **9. diagrams ↔ diagram_elements (1:N)**
- Un diagrama contiene múltiples elementos
- Un elemento pertenece a un solo diagrama

### **10. diagrams ↔ diagram_relationships (1:N)**
- Un diagrama contiene múltiples relaciones
- Una relación pertenece a un solo diagrama

---

## Índices Recomendados

### **Índices de Rendimiento**
```sql
-- Índices para consultas frecuentes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_diagrams_project_id ON diagrams(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_diagram_versions_diagram_id ON diagram_versions(diagram_id);
CREATE INDEX idx_collaboration_sessions_diagram_id ON collaboration_sessions(diagram_id);
CREATE INDEX idx_ai_interactions_diagram_id ON ai_interactions(diagram_id);
CREATE INDEX idx_diagram_elements_diagram_id ON diagram_elements(diagram_id);
CREATE INDEX idx_diagram_relationships_diagram_id ON diagram_relationships(diagram_id);

-- Índices para búsquedas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_diagrams_name ON diagrams(name);

-- Índices para tiempo real
CREATE INDEX idx_collaboration_sessions_active ON collaboration_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_diagrams_active ON diagrams(is_active) WHERE is_active = true;
```

### **Índices JSONB**
```sql
-- Índices para consultas en contenido JSON
CREATE INDEX idx_diagrams_content_gin ON diagrams USING GIN(content);
CREATE INDEX idx_diagram_elements_attributes_gin ON diagram_elements USING GIN(attributes);
CREATE INDEX idx_diagram_elements_methods_gin ON diagram_elements USING GIN(methods);
CREATE INDEX idx_ai_interactions_context_gin ON ai_interactions USING GIN(context);
```

---

## Políticas de Seguridad (RLS)

### **Row Level Security**
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagram_relationships ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- Los usuarios solo pueden ver sus propios datos
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden ver proyectos donde son miembros
CREATE POLICY "Users can view projects they belong to" ON projects FOR SELECT 
USING (id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));

-- Los usuarios pueden ver diagramas de proyectos donde son miembros
CREATE POLICY "Users can view diagrams of their projects" ON diagrams FOR SELECT 
USING (project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()));
```

---

## Triggers y Funciones

### **Triggers de Auditoría**
```sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagrams_updated_at BEFORE UPDATE ON diagrams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Triggers de Versionado**
```sql
-- Función para crear versión automática
CREATE OR REPLACE FUNCTION create_diagram_version()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO diagram_versions (diagram_id, version_number, content, changes_summary, created_by)
    VALUES (NEW.id, 
            (SELECT COALESCE(MAX(version_number), 0) + 1 FROM diagram_versions WHERE diagram_id = NEW.id),
            NEW.content, 
            'Auto-saved version', 
            NEW.updated_by);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para versionado automático
CREATE TRIGGER create_diagram_version_trigger 
AFTER UPDATE ON diagrams 
FOR EACH ROW 
WHEN (OLD.content IS DISTINCT FROM NEW.content)
EXECUTE FUNCTION create_diagram_version();
```

---

## Consideraciones de Escalabilidad

### **Particionamiento**
- **diagram_versions**: Particionar por fecha (mensual)
- **ai_interactions**: Particionar por fecha (semanal)
- **collaboration_sessions**: Particionar por diagram_id (hash)

### **Archivado**
- Mover versiones antiguas a almacenamiento frío
- Comprimir contenido JSON de versiones antiguas
- Limpiar sesiones inactivas automáticamente

### **Cache**
- Cache de diagramas activos en Redis
- Cache de respuestas de IA frecuentes
- Cache de código generado reciente

---

## Métricas de Monitoreo

### **Métricas de Rendimiento**
- Tiempo de respuesta de consultas
- Uso de memoria y CPU
- Latencia de sincronización en tiempo real
- Tiempo de generación de código

### **Métricas de Negocio**
- Número de usuarios activos
- Diagramas creados por día
- Interacciones con IA por usuario
- Código generado exitosamente

---

**Fecha de Creación:** Septiembre 2024  
**Versión:** 1.0  
**Base de Datos:** Supabase (PostgreSQL)  
**Autor:** [Tu nombre]
