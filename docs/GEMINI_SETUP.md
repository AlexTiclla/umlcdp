# Configuración de Google Gemini Pro API

## Obtener la API Key de Google Gemini Pro

### Paso 1: Acceder a Google AI Studio
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear una API Key
1. Haz clic en "Create API Key"
2. Selecciona un proyecto existente o crea uno nuevo
3. Copia la API key generada

### Paso 3: Configurar en el proyecto
1. Abre el archivo `.env` en la carpeta `umlcdp-backend`
2. Reemplaza `your-gemini-pro-api-key-here` con tu API key real:
   ```
   GEMINI_API_KEY=AIzaSyC-tu-api-key-aqui
   ```

### Paso 4: Instalar dependencias
```bash
cd umlcdp-backend
npm install
```

## Características de Gemini Pro

### Limitaciones gratuitas
- **Solicitudes por minuto (RPM):** 60
- **Tokens por minuto (TPM):** 32,000
- **Solicitudes por día (RPD):** 1,500

### Precios (si excedes el límite gratuito)
- **Input:** $0.50 por 1 millón de tokens
- **Output:** $1.50 por 1 millón de tokens

## Funcionalidades implementadas

### Modo Ask
- Análisis de diagramas UML
- Sugerencias de mejoras de diseño
- Explicación de conceptos UML
- Validación de buenas prácticas

### Modo Agent
- Creación automática de diagramas
- Interpretación de comandos en lenguaje natural
- Generación de clases, interfaces y relaciones
- Análisis de dominios de negocio

## Ejemplos de uso

### Modo Ask
```
Usuario: "¿Está bien diseñado mi diagrama de clases?"
IA: Analiza el diagrama actual y proporciona sugerencias específicas
```

### Modo Agent
```
Usuario: "Crear una base de datos para un sistema de inscripción de estudiantes con cursos, profesores y calificaciones"
IA: Crea automáticamente las clases Estudiante, Curso, Profesor, Calificacion con sus relaciones apropiadas
```

## Solución de problemas

### Error: "API key not configured"
- Verifica que la variable `GEMINI_API_KEY` esté configurada en el archivo `.env`
- Reinicia el servidor después de cambiar el `.env`

### Error: "API quota exceeded"
- Has alcanzado el límite de solicitudes por minuto/día
- Espera o considera actualizar a un plan de pago

### Error: "Invalid API key"
- Verifica que la API key sea correcta
- Asegúrate de que el proyecto tenga habilitada la API de Gemini

## Monitoreo de uso
- Puedes ver tu uso en [Google Cloud Console](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)
- El endpoint `/api/ai/health` te indica si el servicio está disponible

## Seguridad
- **NUNCA** subas tu API key al repositorio
- Mantén el archivo `.env` en `.gitignore`
- Considera usar variables de entorno en producción
