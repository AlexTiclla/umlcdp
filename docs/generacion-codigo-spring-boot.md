# Generación de Código Spring Boot - Documentación

## Descripción

La nueva funcionalidad de generación de código Spring Boot permite crear proyectos completos de backend a partir de diagramas UML de clases. Esta característica genera un proyecto Spring Boot completamente funcional con JPA, endpoints CRUD, y configuración para Supabase.

## Características Implementadas

### ✅ Funcionalidades Core
- **Generación de entidades JPA** con anotaciones completas
- **Repositorios JPA** con consultas personalizadas
- **Servicios de negocio** con lógica CRUD completa
- **Controladores REST** con documentación Swagger
- **DTOs** para crear, actualizar y transferir datos
- **Mappers** con MapStruct para conversión entre entidades y DTOs
- **Configuración automática** de application.properties y pom.xml
- **Descarga como ZIP** del proyecto completo

### ✅ Configuración Incluida
- **Spring Boot 3.2.0** con Java 17
- **Spring Data JPA** para persistencia
- **PostgreSQL** con configuración Supabase
- **MapStruct** para mapeo de objetos
- **Swagger/OpenAPI** para documentación automática
- **Spring Boot DevTools** para desarrollo
- **Validación Bean Validation** en entidades y DTOs

### ✅ Estructura del Proyecto Generado
```
src/main/java/com/example/generated/
├── entity/          # Entidades JPA
├── dto/             # Data Transfer Objects
├── repository/      # Repositorios JPA
├── service/         # Servicios de negocio
├── controller/      # Controladores REST
├── mapper/          # Mappers MapStruct
├── config/          # Configuraciones
└── exception/       # Manejo de excepciones
```

## Cómo Usar la Funcionalidad

### 1. Crear un Diagrama UML
- Diseña tu diagrama de clases con las entidades que necesites
- Agrega atributos con tipos de datos (String, int, boolean, etc.)
- Define relaciones entre entidades si es necesario

### 2. Generar el Backend
1. Haz clic en el botón **"Generate Code"** en la barra lateral
2. Selecciona **"Spring Boot Backend"** (opción verde con 🚀)
3. Configura los parámetros del proyecto:
   - **Nombre del proyecto**: Nombre de tu aplicación
   - **Paquete base**: Paquete Java (ej: com.example.miapp)
4. Haz clic en **"Generar Proyecto"**

### 3. Descargar el Proyecto
1. Espera a que se complete la generación
2. Se abrirá un modal con el resumen del proyecto generado
3. Haz clic en **"📦 Descargar Proyecto ZIP"**
4. Extrae el archivo ZIP en tu directorio de trabajo

### 4. Ejecutar el Proyecto
```bash
# Navegar al directorio del proyecto
cd nombre-del-proyecto

# Compilar
mvn clean compile

# Ejecutar
mvn spring-boot:run
```

### 5. Acceder a la Aplicación
- **API**: `http://localhost:8080/api`
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **API Docs**: `http://localhost:8080/api/api-docs`

## Endpoints Generados Automáticamente

Para cada entidad del diagrama, se generan los siguientes endpoints:

### CRUD Básico
- `POST /api/{entidad}s` - Crear nueva instancia
- `GET /api/{entidad}s/{id}` - Obtener por ID
- `GET /api/{entidad}s` - Listar con paginación
- `GET /api/{entidad}s/all` - Listar todo sin paginación
- `PUT /api/{entidad}s/{id}` - Actualizar
- `DELETE /api/{entidad}s/{id}` - Eliminar

### Endpoints Adicionales
- `GET /api/{entidad}s/{id}/exists` - Verificar existencia
- `GET /api/{entidad}s/count` - Contar registros

## Configuración de Base de Datos

El proyecto generado incluye configuración para Supabase:

```properties
# application.properties
spring.datasource.url=jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:5432/postgres
spring.datasource.username=postgres.mdiskyofmgaestlwoidk
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
```

## Tecnologías Utilizadas

### Backend Generado
- **Spring Boot 3.2.0**
- **Spring Data JPA**
- **PostgreSQL**
- **MapStruct**
- **Swagger/OpenAPI**
- **Bean Validation**

### Frontend (Generador)
- **JavaScript ES6+**
- **Fetch API** para comunicación con backend
- **Modales dinámicos** para configuración y descarga

## Características Técnicas

### Validaciones
- Validación automática con Bean Validation
- Mensajes de error personalizados
- Manejo global de excepciones

### Documentación
- Swagger/OpenAPI automático
- Descripción de todos los endpoints
- Ejemplos de uso incluidos

### Arquitectura
- Patrón Repository
- Separación por capas (Controller → Service → Repository)
- DTOs para transferencia de datos
- Mappers automáticos

### Base de Datos
- Creación automática de tablas
- Auditoría (created_at, updated_at)
- Relaciones JPA configuradas
- Índices automáticos

## Ejemplo de Uso

### 1. Crear una entidad "Usuario" en el diagrama:
```
Clase: Usuario
Atributos:
- nombre: String
- email: String
- edad: int
```

### 2. Se genera automáticamente:
- `Usuario.java` (Entidad JPA)
- `UsuarioDTO.java` (DTO principal)
- `CreateUsuarioDTO.java` (DTO para creación)
- `UpdateUsuarioDTO.java` (DTO para actualización)
- `UsuarioRepository.java` (Repositorio JPA)
- `UsuarioService.java` (Interfaz del servicio)
- `UsuarioServiceImpl.java` (Implementación del servicio)
- `UsuarioController.java` (Controlador REST)
- `UsuarioMapper.java` (Mapper MapStruct)

### 3. Endpoints disponibles:
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios` - Listar usuarios
- `GET /api/usuarios/{id}` - Obtener usuario por ID
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario

## Limitaciones Actuales

1. **Relaciones complejas**: Las relaciones entre entidades se generan de forma básica
2. **Validaciones personalizadas**: Solo se incluyen validaciones básicas
3. **Autenticación**: No se incluye sistema de autenticación automático
4. **Tests**: Los tests unitarios no se generan automáticamente

## Futuras Mejoras

- [ ] Generación de tests unitarios automáticos
- [ ] Soporte para relaciones más complejas
- [ ] Configuración de seguridad automática
- [ ] Generación de documentación adicional
- [ ] Soporte para otros tipos de base de datos

## Troubleshooting

### Error: "Diagrama no encontrado"
- Asegúrate de tener elementos en tu diagrama UML
- Verifica que el backend esté corriendo en el puerto 3001

### Error: "Error de conexión a la base de datos"
- Verifica las credenciales de Supabase en application.properties
- Asegúrate de que la base de datos esté accesible

### Error: "Archivo ZIP corrupto"
- Intenta generar el proyecto nuevamente
- Verifica que el backend tenga permisos de escritura

---

**Fecha de creación**: Septiembre 2024  
**Versión**: 1.0  
**Autor**: UML Code Generator Team
