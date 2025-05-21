# Sprint 11.1: Seguridad y Mejoras de UX

## Objetivos del Sprint

Este sprint se enfoca en mejorar la seguridad de la aplicación y la experiencia de usuario, especialmente en operaciones críticas o irreversibles.

## Backlog de Tareas

### 1. Restricción de operaciones para usuarios no autenticados

- **Descripción**: Actualmente, los usuarios no autenticados pueden ver la lista de copys pero no deberían poder editar ni eliminar elementos de ninguna manera.
- **Tareas**:
  - Implementar verificación de autenticación en todas las operaciones de edición
  - Implementar verificación de autenticación en todas las operaciones de eliminación
  - Deshabilitar visualmente los botones de edición/eliminación para usuarios no autenticados
  - Mostrar mensaje informativo cuando un usuario no autenticado intente realizar estas acciones
  - Redirigir a la página de login cuando sea necesario

### 2. Confirmación doble para acciones irreversibles

- **Descripción**: Las acciones irreversibles como eliminar un copy deben requerir una confirmación adicional para prevenir eliminaciones accidentales.
- **Tareas**:
  - Implementar modal de confirmación para la eliminación de copys
  - Diseñar UI clara que indique la irreversibilidad de la acción
  - Incluir información del elemento a eliminar en el modal de confirmación
  - Implementar botón de cancelación con estilo menos prominente que el de confirmación
  - Añadir animación o efecto visual que enfatice la gravedad de la acción

### 3. Mejoras de feedback visual

- **Descripción**: Mejorar el feedback visual para todas las acciones críticas en la aplicación.
- **Tareas**:
  - Implementar notificaciones toast para confirmar acciones completadas
  - Añadir indicadores de carga durante operaciones asíncronas
  - Mejorar los mensajes de error para ser más descriptivos y útiles
  - Implementar estados visuales para botones (hover, active, disabled)

## Criterios de Aceptación

### Para restricción de operaciones:
- Ningún usuario no autenticado puede editar o eliminar copys
- Los botones de edición/eliminación aparecen deshabilitados para usuarios no autenticados
- Se muestra un mensaje claro cuando un usuario no autenticado intenta realizar estas acciones
- La redirección a login funciona correctamente cuando es necesario

### Para confirmación doble:
- Todas las acciones de eliminación muestran un modal de confirmación
- El modal muestra claramente qué elemento se va a eliminar
- El usuario debe confirmar explícitamente antes de que se complete la acción
- Existe una opción clara para cancelar la acción

### Para mejoras de feedback:
- Todas las acciones críticas muestran notificaciones de éxito/error
- Los indicadores de carga aparecen durante operaciones asíncronas
- Los mensajes de error son claros y ayudan a resolver el problema

## Guía de Pruebas

### Acceso a la funcionalidad
1. Cerrar sesión si está autenticado
2. Navegar a la sección principal de copys
3. Intentar editar o eliminar un copy

### Pasos de prueba para restricción de operaciones
1. **Verificación visual**
   - Comprobar que los botones de edición/eliminación aparecen deshabilitados
   - Verificar que al pasar el cursor sobre ellos se muestra un tooltip explicativo

2. **Intento de acceso directo**
   - Intentar acceder directamente a la URL de edición de un copy
   - Verificar que se redirige a la página de login

### Pasos de prueba para confirmación doble
1. **Eliminación de copy**
   - Iniciar sesión como administrador (admin@example.com / admin123)
   - Navegar a la sección principal de copys
   - Hacer clic en el botón "Eliminar" para un copy
   - Verificar que aparece un modal de confirmación
   - Comprobar que el modal muestra información del copy a eliminar
   - Hacer clic en "Cancelar" y verificar que no se elimina el copy
   - Hacer clic en "Eliminar" nuevamente y luego en "Confirmar" en el modal
   - Verificar que el copy se elimina correctamente

### Comportamiento esperado
- Los usuarios no autenticados no pueden realizar acciones de edición/eliminación
- Todas las acciones irreversibles requieren confirmación explícita
- Se proporciona feedback visual claro para todas las acciones

### Notas técnicas
- La verificación de autenticación debe implementarse tanto en el frontend como en el backend
- Los modales de confirmación deben ser accesibles (navegables por teclado)
- Se debe mantener un registro de todas las acciones de eliminación en el historial
