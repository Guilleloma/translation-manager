# Soporte Multilenguaje

## Descripción General

El sistema de gestión de traducciones soporta completamente 6 idiomas:

- Español (es)
- Inglés (en)
- Portugués (pt)
- Francés (fr)
- Italiano (it)
- Alemán (de)

Toda la aplicación ha sido actualizada para trabajar con estos idiomas, desde la interfaz de usuario hasta el almacenamiento y la exportación de datos.

## Estados de Traducción

Los copys pueden tener uno de los siguientes estados:

| Estado | Código | Descripción | Color |
|--------|--------|-------------|-------|
| No asignado | `not_assigned` | Copy pendiente que no ha sido asignado a ningún traductor | Amarillo |
| Asignado | `assigned` | Copy asignado a un traductor pero pendiente de traducir | Azul |
| Traducido | `translated` | Copy que ya ha sido traducido | Verde |

> **Nota**: En versiones anteriores se utilizaban estados adicionales como "revisado" y "aprobado", que ahora han sido simplificados en un único estado "traducido" para facilitar el flujo de trabajo.

## Flujo de Trabajo

1. **Creación**: Los nuevos copys se crean con estado `not_assigned` por defecto.
2. **Asignación**: Un administrador asigna el copy a un traductor, cambiando su estado a `assigned`.
3. **Traducción**: El traductor completa la traducción y guarda el copy, cambiando su estado a `translated`.

## Componentes Actualizados

### Formularios

- **CopyForm**: Soporta la selección de cualquiera de los 6 idiomas y muestra placeholders dinámicos según el idioma seleccionado.
- **BulkImportForm**: Permite la importación masiva de copys en cualquiera de los idiomas soportados.

### Vistas

- **CopyTableView**: Muestra todos los idiomas disponibles con sus nombres completos.
- **CopyTable**: Utiliza los nuevos colores y estados para los badges de estado.

### Notificaciones

- **TaskNotification**: Actualizado para mostrar solo tareas con estado distinto a `translated`.

## Cómo Probar

### Crear un nuevo copy en diferentes idiomas

1. En la página principal, selecciona un idioma en el formulario de creación.
2. Introduce un slug (ej: "button.save") y texto en el idioma correspondiente.
3. Guarda el copy y verifica que se crea con estado `not_assigned`.
4. Repite el proceso seleccionando diferentes idiomas.

### Asignar y traducir

1. Inicia sesión como administrador.
2. Asigna un copy a un traductor.
3. Inicia sesión como traductor.
4. Accede a tus tareas asignadas y traduce el copy.
5. Verifica que el estado cambia de `assigned` a `translated`.

### Exportar a diferentes idiomas

1. En la página principal, selecciona un idioma o "Todos" en el selector de exportación.
2. Haz clic en "Exportar JSON".
3. Verifica que el archivo JSON generado contiene las traducciones en el idioma seleccionado.

## Futuras Mejoras

- Integración con servicios de traducción automática para sugerir traducciones.
- Estadísticas por idioma para evaluar el progreso de traducción.
- Validación contextual específica por idioma para detectar inconsistencias.
