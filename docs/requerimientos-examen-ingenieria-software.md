# Requerimientos del Examen - Ingeniería de Software 1

## Información del Proyecto

**Nombre del Proyecto:** Herramienta de Diseño de Base de Datos Colaborativa con IA  
**Materia:** Ingeniería de Software 1  
**Tecnologías Base:** Frontend existente (HTML, CSS, JavaScript, JointJS, Tailwind CSS)  
**Repositorio Base:** Fork del proyecto UML Class Diagram Editor

## Descripción General

Desarrollar una herramienta de diseño de base de datos colaborativa que permita a múltiples usuarios trabajar simultáneamente en el diseño de diagramas UML de clases, con capacidades de generación automática de código backend completo en Spring Boot, integración con bases de datos mediante ORM, y funcionalidades de Inteligencia Artificial para asistencia y automatización.

## Requerimientos Funcionales

### 1. Herramienta Colaborativa en Tiempo Real

#### 1.1 Backend en Node.js
- **RF-001:** Implementar servidor backend en Node.js con Express.js
- **RF-002:** Integrar Socket.io para comunicación en tiempo real
- **RF-003:** Sincronizar cambios de diagramas entre múltiples usuarios conectados
- **RF-004:** Gestionar sesiones de usuarios y control de acceso a proyectos
- **RF-005:** Persistir diagramas en base de datos para recuperación posterior

#### 1.2 Funcionalidades Colaborativas
- **RF-006:** Permitir que múltiples usuarios editen el mismo diagrama simultáneamente
- **RF-007:** Mostrar indicadores visuales de usuarios activos en el diagrama
- **RF-008:** Implementar sistema de bloqueo de elementos para evitar conflictos
- **RF-009:** Sincronizar en tiempo real: creación, edición y eliminación de elementos
- **RF-010:** Sincronizar en tiempo real: creación y edición de relaciones entre clases

### 2. Generación de Backend Completo en Spring Boot

#### 2.1 Arquitectura del Backend Generado
- **RF-011:** Generar estructura completa de proyecto Spring Boot
- **RF-012:** Crear entidades JPA basadas en las clases del diagrama UML
- **RF-013:** Generar repositorios JPA para cada entidad
- **RF-014:** Crear controladores REST con operaciones CRUD completas
- **RF-015:** Implementar servicios de negocio para cada entidad
- **RF-016:** Generar DTOs (Data Transfer Objects) para todas las entidades

#### 2.2 Operaciones CRUD
- **RF-017:** Implementar operaciones Create (POST) para todas las entidades
- **RF-018:** Implementar operaciones Read (GET) con paginación y filtros
- **RF-019:** Implementar operaciones Update (PUT/PATCH) para todas las entidades
- **RF-020:** Implementar operaciones Delete (DELETE) con validaciones de integridad
- **RF-021:** Generar validaciones de datos usando Bean Validation
- **RF-022:** Implementar manejo de errores y respuestas HTTP apropiadas

#### 2.3 Relaciones y Mapeos
- **RF-023:** Mapear relaciones UML a anotaciones JPA (@OneToOne, @OneToMany, @ManyToOne, @ManyToMany)
- **RF-024:** Generar claves foráneas apropiadas basadas en las relaciones del diagrama
- **RF-025:** Implementar cascadas de persistencia según el tipo de relación UML
- **RF-026:** Generar consultas personalizadas para relaciones complejas

### 3. Integración con Base de Datos y ORM

#### 3.1 Configuración de Base de Datos
- **RF-027:** Integrar Supabase como base de datos principal
- **RF-028:** Configurar conexión a base de datos PostgreSQL de Supabase
- **RF-029:** Generar scripts de migración automática de esquema
- **RF-030:** Implementar inicialización automática de tablas al ejecutar el backend

#### 3.2 Mapeo ORM
- **RF-031:** Generar entidades JPA con anotaciones completas (@Entity, @Table, @Column)
- **RF-032:** Mapear tipos de datos UML a tipos de datos de base de datos
- **RF-033:** Implementar generación automática de esquema de base de datos
- **RF-034:** Crear índices automáticos para claves primarias y foráneas
- **RF-035:** Generar constraints de base de datos basados en validaciones UML

### 4. Integración con Inteligencia Artificial

#### 4.1 Panel de IA
- **RF-036:** Crear panel lateral dedicado para funcionalidades de IA
- **RF-037:** Implementar chat de consultas donde usuarios puedan hacer preguntas sobre el diagrama
- **RF-038:** Permitir solicitar correcciones y mejoras al diagrama mediante texto natural
- **RF-039:** Mostrar sugerencias automáticas de optimización del diseño

#### 4.2 Modo Agente
- **RF-040:** Implementar modo agente que permita a la IA realizar cambios automáticos en el diagrama
- **RF-041:** Permitir comandos de voz o texto para modificar elementos del diagrama
- **RF-042:** Implementar análisis automático de patrones de diseño y sugerir mejoras
- **RF-043:** Generar documentación automática del diagrama basada en IA
- **RF-044:** Implementar validación automática de buenas prácticas de diseño UML

#### 4.3 Funcionalidades Avanzadas de IA
- **RF-045:** Generar código de prueba unitario automáticamente
- **RF-046:** Sugerir refactorizaciones basadas en análisis del código generado
- **RF-047:** Implementar detección automática de code smells en el diseño
- **RF-048:** Generar diagramas de secuencia basados en el diagrama de clases

### 5. Mejoras al Frontend Existente

#### 5.1 Funcionalidades Colaborativas
- **RF-049:** Mostrar lista de usuarios conectados al proyecto
- **RF-050:** Implementar indicadores visuales de elementos siendo editados por otros usuarios
- **RF-051:** Agregar historial de cambios con posibilidad de revertir
- **RF-052:** Implementar sistema de comentarios en elementos del diagrama

#### 5.2 Interfaz de Usuario
- **RF-053:** Mejorar la interfaz para mostrar el panel de IA
- **RF-054:** Agregar notificaciones en tiempo real de cambios colaborativos
- **RF-055:** Implementar modo de vista previa del código generado
- **RF-056:** Agregar opciones de exportación de proyectos completos

## Requerimientos No Funcionales

### 6. Rendimiento y Escalabilidad

#### 6.1 Rendimiento
- **RNF-001:** La aplicación debe soportar al menos 50 usuarios simultáneos por proyecto
- **RNF-002:** Los cambios colaborativos deben sincronizarse en menos de 500ms
- **RNF-003:** La generación de código debe completarse en menos de 10 segundos
- **RNF-004:** La interfaz debe mantener 60 FPS durante la edición de diagramas

#### 6.2 Escalabilidad
- **RNF-005:** El sistema debe ser escalable horizontalmente
- **RNF-006:** Implementar cache para optimizar consultas frecuentes
- **RNF-007:** Usar Redis para gestión de sesiones y cache distribuido

### 7. Seguridad

#### 7.1 Autenticación y Autorización
- **RNF-008:** Implementar autenticación JWT para usuarios
- **RNF-009:** Sistema de roles: Admin, Editor, Viewer
- **RNF-010:** Control de acceso a nivel de proyecto
- **RNF-011:** Validación de entrada para prevenir inyecciones

#### 7.2 Protección de Datos
- **RNF-012:** Encriptar datos sensibles en tránsito y en reposo
- **RNF-013:** Implementar HTTPS obligatorio
- **RNF-014:** Validar y sanitizar todas las entradas de usuario

### 8. Usabilidad

#### 8.1 Experiencia de Usuario
- **RNF-015:** Interfaz intuitiva que no requiera capacitación previa
- **RNF-016:** Soporte para atajos de teclado para operaciones frecuentes
- **RNF-017:** Interfaz responsive para dispositivos móviles y tablets
- **RNF-018:** Soporte para múltiples idiomas (español e inglés)

#### 8.2 Accesibilidad
- **RNF-019:** Cumplir con estándares WCAG 2.1 AA
- **RNF-020:** Soporte para lectores de pantalla
- **RNF-021:** Navegación por teclado completa

### 9. Confiabilidad

#### 9.1 Disponibilidad
- **RNF-022:** Tiempo de actividad del 99.5%
- **RNF-023:** Implementar sistema de respaldo automático
- **RNF-024:** Recuperación automática de fallos de conexión

#### 9.2 Integridad de Datos
- **RNF-025:** Implementar transacciones para operaciones críticas
- **RNF-026:** Sistema de versionado para diagramas
- **RNF-027:** Validación de integridad referencial

## Requerimientos Técnicos

### 10. Tecnologías y Herramientas

#### 10.1 Backend
- **RT-001:** Node.js 18+ con Express.js
- **RT-002:** Socket.io para comunicación en tiempo real
- **RT-003:** Spring Boot 3.x para backend generado
- **RT-004:** Spring Data JPA para ORM
- **RT-005:** PostgreSQL como base de datos principal
- **RT-006:** Supabase como plataforma de base de datos

#### 10.2 Frontend
- **RT-007:** Mantener la base actual: HTML5, CSS3, JavaScript ES6+
- **RT-008:** JointJS para manipulación de diagramas
- **RT-009:** Tailwind CSS para estilos
- **RT-010:** Socket.io-client para comunicación en tiempo real

#### 10.3 IA y Servicios Externos
- **RT-011:** Integración con OpenAI API o similar
- **RT-012:** Implementar rate limiting para APIs de IA
- **RT-013:** Cache de respuestas de IA para optimizar costos

#### 10.4 DevOps y Despliegue
- **RT-014:** Docker para containerización
- **RT-015:** Docker Compose para desarrollo local
- **RT-016:** CI/CD con GitHub Actions
- **RT-017:** Despliegue en plataforma cloud (Heroku, Vercel, o similar)

### 11. Estructura del Proyecto Generado

#### 11.1 Estructura Spring Boot
```
src/main/java/com/example/project/
├── controller/
│   ├── {Entity}Controller.java
│   └── GlobalExceptionHandler.java
├── service/
│   ├── {Entity}Service.java
│   └── impl/
│       └── {Entity}ServiceImpl.java
├── repository/
│   └── {Entity}Repository.java
├── entity/
│   └── {Entity}.java
├── dto/
│   ├── {Entity}DTO.java
│   ├── Create{Entity}DTO.java
│   └── Update{Entity}DTO.java
├── config/
│   ├── DatabaseConfig.java
│   └── SecurityConfig.java
└── Application.java
```

#### 11.2 Archivos de Configuración
- **RT-018:** application.properties con configuración de base de datos
- **RT-019:** pom.xml con todas las dependencias necesarias
- **RT-020:** README.md con instrucciones de instalación y ejecución
- **RT-021:** Dockerfile para containerización

## Criterios de Aceptación

### 12. Funcionalidades Core
- **CA-001:** Múltiples usuarios pueden editar el mismo diagrama simultáneamente sin conflictos
- **CA-002:** El sistema genera código Spring Boot completo y funcional
- **CA-003:** El backend generado se conecta exitosamente a Supabase
- **CA-004:** La IA responde consultas y puede modificar el diagrama automáticamente
- **CA-005:** Los cambios se sincronizan en tiempo real entre todos los usuarios

### 13. Calidad del Código
- **CA-006:** Código generado sigue convenciones de Spring Boot
- **CA-007:** Implementación de todas las operaciones CRUD
- **CA-008:** Validaciones apropiadas en entidades y DTOs
- **CA-009:** Manejo de errores consistente y informativo

### 14. Documentación
- **CA-010:** Documentación completa de la API generada
- **CA-011:** Instrucciones claras de instalación y configuración
- **CA-012:** Ejemplos de uso de todas las funcionalidades
- **CA-013:** Diagramas de arquitectura del sistema

## Entregables

### 15. Código Fuente
- **ENT-001:** Código fuente completo del frontend mejorado
- **ENT-002:** Código fuente del backend Node.js con Socket.io
- **ENT-003:** Generador de código Spring Boot
- **ENT-004:** Integración con servicios de IA
- **ENT-005:** Scripts de configuración y despliegue

### 16. Documentación
- **ENT-006:** Documentación técnica completa
- **ENT-007:** Manual de usuario
- **ENT-008:** Guía de instalación y configuración
- **ENT-009:** Presentación del proyecto (máximo 20 minutos)

### 17. Demostración
- **ENT-010:** Demo en vivo de todas las funcionalidades
- **ENT-011:** Casos de uso reales con múltiples usuarios
- **ENT-012:** Generación y ejecución de backend completo
- **ENT-013:** Funcionalidades de IA en acción

## Cronograma Sugerido

### Semana 1-2: Análisis y Diseño
- Análisis detallado de requerimientos
- Diseño de arquitectura del sistema
- Configuración del entorno de desarrollo

### Semana 3-4: Backend Colaborativo
- Implementación del servidor Node.js
- Integración de Socket.io
- Sistema de autenticación y autorización

### Semana 5-6: Generación de Código Spring Boot
- Desarrollo del generador de código
- Implementación de operaciones CRUD
- Integración con Supabase

### Semana 7-8: Integración de IA
- Implementación del panel de IA
- Integración con servicios de IA
- Modo agente para modificaciones automáticas

### Semana 9-10: Testing y Documentación
- Pruebas integrales del sistema
- Documentación técnica y de usuario
- Preparación de la presentación

## Notas Adicionales

- El proyecto debe mantener la funcionalidad existente del editor UML
- Se debe priorizar la experiencia de usuario colaborativa
- La generación de código debe ser robusta y manejar casos edge
- La integración con IA debe ser intuitiva y útil
- El sistema debe ser escalable para uso en producción

---

**Fecha de Creación:** [Fecha actual]  
**Versión:** 1.0  
**Autor:** [Nombre del estudiante]  
**Materia:** Ingeniería de Software 1
