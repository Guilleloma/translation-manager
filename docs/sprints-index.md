# Índice de Sprints - Translation Manager

Este documento sirve como índice centralizado de todos los sprints del proyecto Translation Manager, organizados cronológicamente y con una breve descripción de cada uno.

## Sprint Actual

### Sprint 12: Correcciones de Historial y Etiquetas 👷
- **Archivo**: [sprint-12-history-tags-fixes.md](./sprint-12-history-tags-fixes.md)
- **Descripción**: Solución de problemas con el historial de cambios y el sistema de etiquetado.
- **Características principales**:
  - Corrección del texto "(Texto Sugerido)" en el historial de cambios
  - Solución al problema de etiquetas que no se guardaban en la base de datos
  - Mejora del feedback visual al añadir/eliminar etiquetas
  - Implementación de logs detallados para debugging
  - Tests unitarios para validar las correcciones

## Sprints Completados

### Sprint 10: Flujo de revisión y feedback ✅
- **Archivo**: [sprint-10-testing.md](./sprint-10-testing.md)
- **Descripción**: Implementación de estados de traducción mejorados, sistema de comentarios, etiquetas, historial de cambios y roles de usuario.
- **Características principales**:
  - Estados de traducción con transiciones controladas por rol
  - Sistema de comentarios para feedback
  - Etiquetado de traducciones
  - Historial de cambios detallado
  - Sistema de roles y permisos

### Sprint 11: Mejoras de Consistencia UI ✅
- **Archivo**: [sprint-11-ui-consistency.md](./sprint-11-ui-consistency.md)
- **Descripción**: Mejoras en la consistencia visual y experiencia de usuario en toda la aplicación.
- **Características principales**:
  - Estandarización de estados y colores
  - Mejora del selector de roles
  - Estandarización de la visualización de idiomas
  - Componentes reutilizables para estados, roles e idiomas

### Sprint 11.1: Seguridad y Mejoras de UX ✅
- **Archivo**: [sprint-11.1-security.md](./sprint-11.1-security.md)
- **Descripción**: Mejoras en la seguridad de la aplicación y la experiencia de usuario en operaciones críticas.
- **Características principales**:
  - Restricción de operaciones para usuarios no autenticados
  - Confirmación doble para acciones irreversibles
  - Mejoras de feedback visual

### Sprint 11.2: Corrección de Persistencia de Sesión ✅
- **Archivo**: [sprint-11.2-session-fix.md](./sprint-11.2-session-fix.md)
- **Descripción**: Corrección del bug crítico que causaba deslogueo al refrescar la página.
- **Características principales**:
  - Mejora en la persistencia de sesión
  - Optimización del almacenamiento en localStorage
  - Pruebas automatizadas para verificar la persistencia

### Sprint 16: Exportación a Google Sheets ✅
- **Archivo**: [sprint-16-sheets-export.md](./sprint-16-sheets-export.md)
- **Descripción**: Implementación de exportación en formato compatible con Google Sheets.
- **Características principales**:
  - Estructura con columnas por idioma
  - Exportación directa a archivo CSV

### Sprint 22: Mejoras de UX en la Tabla de Copys y Asignación ✅
- **Archivo**: [sprint-22-ux-improvements.md](./sprint-22-ux-improvements.md)
- **Descripción**: Mejoras en la experiencia de usuario para la tabla de copys y el proceso de asignación.
- **Características principales**:
  - Tabla de copys con columna de acciones fija
  - Scroll horizontal siempre visible
  - Feedback visual en asignación de copys

### Sprint 23: Administración de Base de Datos ✅
- **Archivo**: [sprint-23-db-management.md](./sprint-23-db-management.md)
- **Descripción**: Implementación de funcionalidades para administrar la base de datos directamente desde el panel de administración.
- **Características principales**:
  - Eliminación de todos los copys desde el panel de administración
  - Confirmación con múltiples advertencias para operaciones destructivas
  - Feedback detallado sobre el resultado de las operaciones
  - Preservación de la base de datos de usuarios

## Sprints Planificados

### Sprint 15: Traducción automática con OpenAI ⏳
- **Descripción**: Integración con OpenAI para sugerir traducciones automáticas.
- **Características planificadas**:
  - Integración backend proxy seguro para OpenAI
  - Botón de sugerir traducción automática
  - Configuración de parámetros para ajustar traducciones

### Sprint 20: API pública para integraciones ⏳
- **Descripción**: Desarrollo de una API pública para integraciones con otros sistemas.
- **Características planificadas**:
  - Endpoints RESTful para CRUD de traducciones
  - Autenticación y autorización para API
  - Documentación OpenAPI/Swagger
  - Webhooks para notificaciones de cambios

## Convenciones para la Documentación de Sprints

Para mantener la coherencia en la documentación de sprints, se seguirán estas convenciones:

1. **Nomenclatura de archivos**:
   - Formato: `sprint-[número]-[descripción-breve].md`
   - Ejemplo: `sprint-10-testing.md`

2. **Estructura del documento**:
   - Título: `# Sprint [número]: [Título descriptivo]`
   - Objetivos/Descripción
   - Backlog de tareas
   - Implementación
   - Guía de pruebas
   - Comportamiento esperado
   - Notas técnicas

3. **Numeración de sprints**:
   - Sprints principales: números enteros (10, 11, 12...)
   - Sub-sprints o correcciones: decimales (11.1, 11.2...)

4. **Actualización del índice**:
   - Cada nuevo sprint debe añadirse a este índice
   - Mantener el orden cronológico
   - Incluir enlaces a los archivos correspondientes

5. **Actualización del README.md**:
   - La sección de sprints en el README.md debe mantenerse sincronizada con este índice
